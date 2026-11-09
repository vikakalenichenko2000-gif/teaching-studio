#!/usr/bin/env python3
"""Перевірка тексту для «Імпорт зі списку (кілька вправ)» у ReadyTo.

Правила взято з офіційної документації:
https://readyto.net/docs/lesson-blocks/bulk-import  (розділ «Повна розмітка синтаксису»)

Валідатор ловить типові помилки ДО вставлення. Остаточна перевірка — кнопка
«Перевірити» в самому ReadyTo.

Використання:
    python3 ReadyTo/tools/check_import.py шлях/до/файлу.txt
    python3 ReadyTo/tools/check_import.py - < файл.txt
Код виходу: 0 — помилок немає (попередження можливі), 1 — є помилки.
"""
import re
import sys

TYPES = ["Text", "Vocabulary", "GapFill", "DropDown", "DragWords", "MultipleChoice",
         "TrueFalse", "Table", "Matching", "Unscramble", "SortSentences", "ColumnSort",
         "FlipCards", "Writing", "HiddenText", "TeacherNote"]
TEXT_STYLES = {"tip", "info", "warning"}
TEXT_MODES = {"text", "dialogue"}
FORBIDDEN_HINTS = ["перший варіант", "first option is correct", "first answer is correct"]
BRACKET = re.compile(r"\[([^\[\]]*)\]")


class Block:
    def __init__(self, btype, title, mod, line_no):
        self.type, self.title, self.mod, self.line = btype, title, mod, line_no
        self.lines = []  # (line_no, text) — вміст, без +/++ рядків
        self.errors, self.warnings = [], []

    def err(self, n, msg):
        self.errors.append((n, msg))

    def warn(self, n, msg):
        self.warnings.append((n, msg))


def parse(text):
    blocks, cur, pre = [], None, []
    lines = text.replace("\r\n", "\n").split("\n")
    # прибрати рамку блоку коду, якщо скопійовано разом із ```
    for i, raw in enumerate(lines, 1):
        line = raw.rstrip()
        if line.strip().startswith("```"):
            continue
        if line.startswith("#"):
            m = re.match(r"#\s*([A-Za-z]+)\s*(?::(.*))?$", line)
            if not m:
                pre.append((i, f"Рядок з # не розпізнано як заголовок блоку: {line!r}"))
                continue
            btype, rest = m.group(1), (m.group(2) or "").strip()
            mod = None
            if "|" in rest:
                title, mod = rest.split("|", 1)
                title, mod = title.strip(), mod.strip()
            else:
                title = rest
            if cur and cur.lines and cur.lines[-1][1].strip() != "":
                cur.warn(i, "Перед новим блоком немає порожнього рядка (документація: «Між блоками ставте порожній рядок»).")
            cur = Block(btype, title, mod, i)
            blocks.append(cur)
            if btype not in TYPES:
                close = [t for t in TYPES if t.lower() == btype.lower()]
                hint = f" Можливо, {close[0]}?" if close else ""
                cur.err(i, f"Невідомий тип блоку «{btype}».{hint} Доступні: {', '.join(TYPES)}.")
            continue
        if cur is None:
            if line.strip():
                pre.append((i, "Текст до першого блоку буде проігноровано або спричинить помилку — почніть з рядка #Тип: Заголовок."))
            continue
        cur.lines.append((i, line))
    return blocks, pre


def content(block):
    """Вміст блоку без рядків +опис / ++опціональний текст на початку."""
    out, head = [], True
    for n, t in block.lines:
        if head and (t.startswith("++") or t.startswith("+")):
            continue
        if head and t.strip() == "":
            continue
        head = False
        out.append((n, t))
    while out and out[-1][1].strip() == "":
        out.pop()
    return out


def groups(lines):
    gs, g = [], []
    for n, t in lines:
        if t.strip() == "":
            if g:
                gs.append(g)
                g = []
        else:
            g.append((n, t))
    if g:
        gs.append(g)
    return gs


def join_angles(lines):
    """Об'єднує багаторядкові <...> в один логічний рядок."""
    out, buf, start, depth = [], "", None, 0
    for n, t in lines:
        if depth == 0:
            buf, start = t, n
        else:
            buf += "\n" + t
        depth += t.count("<") - t.count(">")
        if depth <= 0:
            out.append((start, buf))
            depth = 0
    if depth > 0:
        out.append((start, buf))
    return out


def check_brackets(b, n, t):
    if t.count("[") != t.count("]"):
        b.err(n, "Непарні квадратні дужки [ ].")
        return []
    items = BRACKET.findall(t)
    for it in items:
        if it.strip() == "":
            b.err(n, "Порожні дужки [ ].")
    return items


def check_block(b):
    lines = content(b)
    low = (b.title + " " + " ".join(t for _, t in b.lines if t.startswith("+"))).lower()
    for h in FORBIDDEN_HINTS:
        if h in low:
            b.warn(b.line, "Заголовок/опис бачить учень — не пишіть, як працює формат («перший варіант правильний»).")
    if b.type not in TYPES:
        return
    if not lines and b.type not in ("Text",):
        b.err(b.line, "Блок порожній.")
        return
    T = b.type

    if T in ("GapFill", "DropDown", "DragWords"):
        text_mode = (b.mod or "").lower() in TEXT_MODES
        if b.mod and not text_mode:
            b.warn(b.line, f"Після | у {T} очікується «text» або «dialogue», а не «{b.mod}».")
        total = 0
        for n, t in lines:
            if t.strip() == "":
                if not text_mode:
                    b.warn(n, "Порожній рядок усередині блоку (без | text) — перевірте, чи це не кінець блоку.")
                continue
            if T == "DragWords" and t.startswith("~"):
                continue
            items = check_brackets(b, n, t)
            total += len(items)
            if not items and not text_mode:
                b.err(n, f"У рядку немає пропуску [ ]. Для суцільного тексту допишіть у заголовок «| text». Рядок: {t!r}")
            for it in items:
                opts = [o.strip() for o in it.split("/")]
                if T == "DropDown":
                    if len(opts) < 2:
                        b.err(n, f"DropDown: у дужках мають бути варіанти через /, перший — правильний: [{it}]")
                    if len(set(o.lower() for o in opts)) != len(opts):
                        b.err(n, f"DropDown: варіанти повторюються: [{it}]")
                if T == "DragWords":
                    if "/" in it:
                        b.err(n, f"DragWords: у дужках лише одне слово, без / : [{it}]")
                    if it.strip() == "*":
                        b.err(n, "DragWords: вільний пропуск [*] не підтримується.")
                if T == "GapFill" and "*" in opts and len(opts) > 1:
                    b.warn(n, f"GapFill: [*] разом з іншими варіантами — поведінку перевірте на платформі: [{it}]")
        if total == 0:
            b.err(b.line, "У блоці немає жодного пропуску [ ].")
        if T == "DragWords":
            answers = {it.strip().lower() for _, t in lines for it in BRACKET.findall(t)}
            for n, t in lines:
                if t.startswith("~"):
                    extra = [w.strip() for w in t[1:].split(",") if w.strip()]
                    for w in extra:
                        if w.lower() in answers:
                            b.warn(n, f"Зайве слово «{w}» збігається з правильною відповіддю — воно підійде до пропуску.")

    elif T == "MultipleChoice":
        for g in groups(lines):
            q, opts = g[0], g[1:]
            if q[1].startswith("*"):
                b.err(q[0], "Перший рядок групи — питання; він не може починатися з *.")
            if len(opts) < 2:
                b.err(q[0], f"Питання «{q[1]}» має менше двох варіантів.")
            if not any(t.startswith("*") for _, t in opts):
                b.err(q[0], f"Питання «{q[1]}»: не позначено правильну відповідь зірочкою *.")
            for n, t in opts:
                if re.match(r"^\*?\s*[a-dA-D][\)\.]\s", t):
                    b.warn(n, "Не додавайте a) b) c) — платформа перемішує варіанти.")

    elif T == "TrueFalse":
        labels = [x.strip() for x in b.mod.split("/")] if b.mod else ["True", "False"]
        if len(labels) < 2:
            b.err(b.line, "TrueFalse: потрібно щонайменше дві кнопки (через /).")
        for n, t in lines:
            if not t.strip():
                continue
            if re.search(r"\[(true|false|t|f)\]", t, re.I):
                b.err(n, "TrueFalse: формат [True]/[False] не підтримується — пишіть «твердження | True».")
                continue
            if "|" not in t:
                b.err(n, f"TrueFalse: після твердження має стояти | і відповідь ({' / '.join(labels)}).")
                continue
            ans = t.rsplit("|", 1)[1].strip()
            if ans not in labels:
                b.err(n, f"TrueFalse: відповідь «{ans}» не входить до кнопок {labels}.")

    elif T == "Table":
        ncols = None
        if b.mod:
            ncols = len([c for c in b.mod.split(",") if c.strip()])
            if not 2 <= ncols <= 4:
                b.err(b.line, f"Table: дозволено 2–4 колонки, у заголовку {ncols}.")
        for n, t in lines:
            if not t.strip():
                continue
            cells = [c.strip() for c in t.split(",")]
            if not 2 <= len(cells) <= 4:
                b.err(n, f"Table: у рядку {len(cells)} клітинок (дозволено 2–4). Кому всередині клітинки використовувати не можна.")
            if ncols and len(cells) != ncols:
                b.err(n, f"Table: {len(cells)} клітинок, а в заголовку {ncols} колонок.")
            ncols = ncols or len(cells)
            if any(c == "" for c in cells):
                b.err(n, "Table: порожня клітинка.")

    elif T in ("Matching", "Vocabulary"):
        for n, t in (join_angles(lines) if T == "Vocabulary" else lines):
            if not t.strip():
                continue
            main = t.split("<", 1)[0]
            if " — " not in main:
                if re.search(r"\s[-–]\s", main) or "\t" in main:
                    b.err(n, f"{T}: між парою ставте довге тире з пробілами « — », а не дефіс/таб: {main.strip()!r}")
                else:
                    b.err(n, f"{T}: немає розділювача « — » між елементами пари: {main.strip()!r}")
            elif main.count(" — ") > 1:
                b.warn(n, f"{T}: кілька « — » у рядку — перевірте, де межа пари.")
            if T == "Matching" and "<" in t:
                b.warn(n, "Matching: <...> у документації описано лише для Vocabulary/Unscramble/FlipCards.")
        if T == "Matching":
            rights = [t.split(" — ", 1)[1].strip().lower() for _, t in lines if " — " in t]
            if len(rights) != len(set(rights)):
                b.err(b.line, "Matching: праві елементи повторюються — пари будуть неоднозначні.")

    elif T == "Unscramble":
        logical = join_angles([x for x in lines if x[1].strip()])
        with_hint = [("<" in t) for _, t in logical]
        if any(with_hint) and not all(with_hint):
            b.err(b.line, "Unscramble: якщо є підказка <...> — вона має бути в усіх рядках.")
        for n, t in logical:
            s = t.split("<", 1)[0].strip()
            if len(s.split()) == 1 and "_" not in s:
                b.warn(n, f"Unscramble: одне слово «{s}» — перемішуватимуться літери (так задумано для правопису).")

    elif T == "SortSentences":
        gs = groups(lines)
        for g in gs:
            real = [t for _, t in g if not t.startswith("~") and not t.startswith("=")]
            if len(real) < 2:
                b.err(g[0][0], "SortSentences: у кожному тексті щонайменше два речення.")

    elif T == "ColumnSort":
        gs = groups(lines)
        if len(gs) < 2:
            b.err(b.line, "ColumnSort: мінімум 2 колонки (групи розділяйте порожнім рядком).")
        for g in gs:
            name = g[0][1].strip()
            if len(name) > 34:
                b.err(g[0][0], f"ColumnSort: назва колонки довша за 34 символи ({len(name)}).")
            if len(g) < 2:
                b.err(g[0][0], f"ColumnSort: колонка «{name}» без жодного слова.")
        items = [t.strip().lower() for g in gs for _, t in g[1:]]
        if len(items) != len(set(items)):
            b.warn(b.line, "ColumnSort: однакові елементи в різних колонках — неоднозначно.")

    elif T == "FlipCards":
        logical = join_angles([x for x in lines if x[1].strip()])
        backs = [("<" in t) for _, t in logical]
        if any(backs) and not all(backs):
            b.err(b.line, "FlipCards: якщо хоч одна картка має зворот <...> — його мають мати всі.")

    elif T == "Writing":
        if not any(t.startswith("?") for _, t in lines):
            b.warn(b.line, "Writing: немає жодного питання (рядок, що починається з ?).")

    elif T == "HiddenText":
        cur = None
        for n, t in lines:
            if t.startswith("="):
                if cur is not None and not cur[1]:
                    b.err(cur[0], "HiddenText: під рядком =Напис немає тексту, який відкриється.")
                cur = [n, False]
            elif t.strip():
                if cur is None:
                    b.warn(n, "HiddenText: текст до першого рядка =Напис — перевірте, як його покаже платформа.")
                else:
                    cur[1] = True
        if cur is not None and not cur[1]:
            b.err(cur[0], "HiddenText: під рядком =Напис немає тексту, який відкриється.")
        if cur is None:
            b.err(b.line, "HiddenText: немає жодного рядка =Напис.")

    elif T == "Text":
        if b.mod and b.mod.lower() not in TEXT_STYLES:
            b.err(b.line, f"Text: стиль «{b.mod}» не з документації (tip, info, warning).")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    src = sys.stdin.read() if sys.argv[1] == "-" else open(sys.argv[1], encoding="utf-8").read()
    blocks, pre = parse(src)
    for b in blocks:
        check_block(b)
    nerr = len(pre) + sum(len(b.errors) for b in blocks)
    nwarn = sum(len(b.warnings) for b in blocks)
    for n, m in pre:
        print(f"  ❌ рядок {n}: {m}")
    for b in blocks:
        mark = "❌" if b.errors else ("⚠️" if b.warnings else "✅")
        title = f": {b.title}" if b.title else ""
        print(f"{mark} рядок {b.line} #{b.type}{title}")
        for n, m in b.errors:
            print(f"     ❌ рядок {n}: {m}")
        for n, m in b.warnings:
            print(f"     ⚠️ рядок {n}: {m}")
    print(f"\nБлоків: {len(blocks)} · помилок: {nerr} · попереджень: {nwarn}")
    return 1 if nerr else 0


if __name__ == "__main__":
    sys.exit(main())
