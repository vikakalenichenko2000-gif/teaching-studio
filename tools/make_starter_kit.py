#!/usr/bin/env python3
"""Збирає архів Teaching Studio для колеги: уся система без особистих даних.

    python3 tools/make_starter_kit.py            # без ваших уроків/матеріалів
    python3 tools/make_starter_kit.py --with-materials   # разом з уроками (teaching/, ReadyTo/lessons …)

Результат: starter-kit/dist/Lingo-Teaching-Studio-Kit.zip
Запускайте після кожного важливого оновлення системи, щоб колеги отримали свіжу версію.
"""
import datetime
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "starter-kit", "dist")
WITH_MATERIALS = "--with-materials" in sys.argv
TODAY = datetime.date.today().isoformat()

EXCLUDE_EXACT = {
    "tools/make_starter_kit.py",
    "ReadyTo/platform-guide/screenshots/create-lesson-dialog.png",  # видно імена учнів
    "ReadyTo/platform-guide/screenshots/lesson-editor.webp",
}
EXCLUDE_PREFIX = ("starter-kit/", "shared/inbox/", "textbooks/")
MATERIAL_DIRS = ("teaching/", "ReadyTo/lessons/", "ReadyTo/exercises/", "ReadyTo/drafts/")
DATED = re.compile(r"(^|/)\d{4}-\d{2}-\d{2}_")

PREFERENCES = """# Уподобання викладача

> Шкільні налаштування Lingo English School (перенесені від колеги). Позначене ❓ — уточнити у вас під час першого запуску.
> Якщо у вас щось інакше — скажіть Claude, і він змінить.

## Загальне
- Школа: **Lingo English School** — додавати назву на матеріали.
- Мова інструкцій для викладача: українська.
- Мова матеріалів для учнів: **англійська**.
- Як звертатися до викладача: ❓

## Учні та рівні (школа загалом)
- Вік учнів школи: **від 5 років до 11 класу**, онлайн і офлайн; групові, індивідуальні, парні заняття.
- Рівні: від **Starter** до **B1–B2**.
- Є діти, які ще не читають, і старші, які читають — враховувати.
- Мої учні (класи, рівні, формат): ❓ → `shared/students.md`
- Підручники: ❓ → `shared/textbooks.md`. Підручник — джерело матеріалу; вправи й пояснення — власні.

## Уроки (стандарт школи)
- Тривалість: **60 хвилин**.
- Обов'язкова структура кожного уроку:
  1. **Warming up.**
  2. **Лексика** — нова або повторення, через **різні ігри**.
  3. **Граматичні структури.**
  4. **Тексти на закріплення** — для тих, хто читає (для нечитаючих — усна/ігрова альтернатива).
  5. **Міні-тест 5–7 хвилин** — закріплення всього уроку.
- Підходить мені без змін: ❓

## Презентації
- **Google Slides** (Canva — допустимо). Технічно: .pptx → Google Drive → Google Slides.
- Бренд: `shared/brand-guide.md` (бузковий + світло-оливковий, темно-синій текст, котик, Lingo Coins).

## Мотивація
- **Lingo Coins** — до 5 коїнів за урок (офлайн; онлайн — планується). `shared/lingo-coins.md`.

## Інтерактивні платформи
- Wordwall (Standard чи Pro?): ❓ · Quizlet: ❓ · Baamboozle: ❓
- ReadyTo (акаунт школи Lingo Eng School): ❓
"""

STUDENTS = """# Учні та групи

> Без зайвих персональних даних: достатньо назви групи/імені, віку, рівня, цілей, особливостей.

| Група / учень | Вік / клас | Рівень | Підручник | Формат | Читає? | Особливості |
|---|---|---|---|---|---|---|
| ❓ | | | | | | |
"""

PENDING = f"""# Очікують підтвердження

| Дата | Побажання / гіпотеза | Джерело | Статус |
|---|---|---|---|
| {TODAY} | Персоналізація під нового викладача (перший запуск) | starter kit | ❓ |
"""

CHANGELOG = f"""# Журнал змін пам'яті

- {TODAY} — Отримано Teaching Studio (starter kit Lingo English School): інструкції, довідники ReadyTo/Wordwall/Quizlet/Baamboozle, бренд, шаблони, команди. Особисті дані попереднього викладача прибрано.
"""

GAMES_PREFS = """# Уподобання щодо інтерактивних ігор (Wordwall / Quizlet / Baamboozle)

> Лише підтверджені побажання. Невідоме — ❓.

- Тарифи: Wordwall ❓ · Quizlet ❓ · Baamboozle ❓
- Мова матеріалів: **англійська** (стандарт школи).
- Quizlet: **слово — переклад** (українською), переклад **одним словом, якщо можливо, без синонімів** (стандарт школи; ❓ підтвердити).
- Для тих, хто не читає: більше картинок, аудіо, простих шаблонів (Open the box, Spin the wheel, Match up з картинками).
- Кількість елементів: Wordwall 10–15 · Quizlet 15–25 · Baamboozle 16–24 (❓)
- Улюблені шаблони Wordwall: ❓
- Формат видачі: готовий до копіювання блок у чаті + файл у відповідній папці.
"""

OVERRIDES = {
    "shared/preferences.md": PREFERENCES,
    "shared/students.md": STUDENTS,
    "shared/pending-confirmation.md": PENDING,
    "shared/changelog.md": CHANGELOG,
    "shared/interactive-game-preferences.md": GAMES_PREFS,
}


def tracked_files():
    out = subprocess.check_output(["git", "-C", ROOT, "ls-files", "-z"]).decode("utf-8")
    return [p for p in out.split("\0") if p]


def keep(path):
    if path in EXCLUDE_EXACT or path.startswith(EXCLUDE_PREFIX):
        return False
    if not WITH_MATERIALS and path.startswith(MATERIAL_DIRS) and DATED.search(path):
        return False
    return True


def sanitize(path, text):
    if path == "CLAUDE.md":
        text = re.sub(r"- \*\*Зберігання:\*\*.*",
                      "- **Зберігання:** система лежить у вашому приватному GitHub-репозиторії (назву впише Claude під час першого запуску). Після кожної завершеної зміни зроби commit і push у `main`.",
                      text)
    text = text.replace("https://quizlet.com/ua/1206489076/unit-8-flash-cards/", "https://quizlet.com/…/назва-набору/")
    text = text.replace("vikakalenichenko2000-gif/teaching-studio", "<ваш-логін>/teaching-studio")
    return text


def main():
    stage_root = tempfile.mkdtemp()
    stage = os.path.join(stage_root, "teaching-studio")
    n = 0
    for p in tracked_files():
        if not keep(p):
            continue
        src, dst = os.path.join(ROOT, p), os.path.join(stage, p)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if p in OVERRIDES:
            open(dst, "w", encoding="utf-8").write(OVERRIDES[p])
        elif p.endswith((".md", ".txt", ".py")):
            open(dst, "w", encoding="utf-8").write(sanitize(p, open(src, encoding="utf-8").read()))
        else:
            shutil.copy2(src, dst)
        n += 1
    for name in ("ПОЧНИ-ТУТ.md", "ПРОМПТ-ПЕРШИЙ-ЗАПУСК.txt"):
        shutil.copy2(os.path.join(ROOT, "starter-kit", name), os.path.join(stage, name))
        n += 1
    for d in ("shared/inbox", "textbooks"):
        os.makedirs(os.path.join(stage, d), exist_ok=True)
    open(os.path.join(stage, "shared/inbox/.gitkeep"), "w").close()
    # перевірка: жодних особистих слідів
    leaks = []
    for dp, _, fs in os.walk(stage):
        for f in fs:
            fp = os.path.join(dp, f)
            if f.endswith((".md", ".txt", ".py")):
                t = open(fp, encoding="utf-8").read()
                for bad in ("vikakalenichenko", "1206489076", "@gmail.com"):
                    if bad in t:
                        leaks.append((os.path.relpath(fp, stage), bad))
    if leaks:
        print("ЗУПИНЕНО: знайдено особисті дані:", leaks)
        sys.exit(1)
    os.makedirs(DIST, exist_ok=True)
    zpath = os.path.join(DIST, "Lingo-Teaching-Studio-Kit.zip")
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for dp, _, fs in os.walk(stage):
            for f in fs:
                fp = os.path.join(dp, f)
                z.write(fp, os.path.relpath(fp, stage_root))
    shutil.rmtree(stage_root)
    print(f"Файлів: {n} · архів: {zpath} · {os.path.getsize(zpath) // 1024} КБ")


if __name__ == "__main__":
    main()
