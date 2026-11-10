#!/usr/bin/env python3
"""Кольоровий міні-тест A4 у стилі Lingo English School → PDF.

Використання:
    python3 teaching/tools/make_minitest_pdf.py <test.json> <вихід.pdf> --assets <папка з node_modules>

test.json:
{
  "title": "Mini-test", "subtitle": "Beehive 3 · Unit 2 · In the City",
  "tasks": [
    {"type": "write", "title": "...", "bank": ["..."], "items": [{"emoji": "1f4da", "answer": "library"}]},
    {"type": "circle", "title": "...", "items": [{"text": "Where (are/is) you going?", "answer": "are"}]},
    {"type": "tick", "title": "...", "items": [{"emoji": "1f4da", "text": "He's going to the library.", "answer": true}]}
  ]
}
Картинки: Twemoji (CC BY 4.0), шрифти: Nunito і Playfair Display (OFL) — з npm-пакетів @twemoji/svg, @fontsource/*.
Рендер: Chromium через Playwright (Node).
"""
import base64
import html
import json
import os
import re
import subprocess
import sys
import tempfile

args = sys.argv[1:]
src, out = args[0], args[1]
assets = args[args.index("--assets") + 1]
spec = json.load(open(src, encoding="utf-8"))
NM = os.path.join(assets, "node_modules")


def b64(path, mime):
    return f"data:{mime};base64," + base64.b64encode(open(path, "rb").read()).decode()


def font(face, weight, family):
    faces = []
    for sub in ("latin", "cyrillic"):
        p = os.path.join(NM, "@fontsource", family, "files", f"{family}-{sub}-{weight}-normal.woff2")
        faces.append(f"@font-face{{font-family:'{face}';font-weight:{weight};src:url({b64(p,'font/woff2')}) format('woff2');}}")
    return "".join(faces)


def emoji(code):
    return b64(os.path.join(NM, "@twemoji", "svg", f"{code}.svg"), "image/svg+xml")


FONTS = font("Nunito", 400, "nunito") + font("Nunito", 700, "nunito") + font("Nunito", 800, "nunito") + \
        font("Playfair", 700, "playfair-display") + font("Playfair", 800, "playfair-display")

FLAG = ('<svg class="flag" viewBox="0 0 60 44"><rect width="60" height="44" fill="#1F3A8A"/>'
        '<path d="M0 0L60 44M60 0L0 44" stroke="#fff" stroke-width="9"/><path d="M0 0L60 44M60 0L0 44" stroke="#C8102E" stroke-width="4"/>'
        '<path d="M30 0V44M0 22H60" stroke="#fff" stroke-width="13"/><path d="M30 0V44M0 22H60" stroke="#C8102E" stroke-width="7"/></svg>')

CSS = FONTS + """
@page{size:A4;margin:0}
*{box-sizing:border-box}
:root{--lilac:#E1D4F8;--lilac2:#EEE6FB;--accent:#7C5AA1;--olive:#C4CBA7;--olive-ink:#4E5536;--ink:#152547;--gold:#EDC35F;--line:#CFC1EA}
body{margin:0;font-family:Nunito,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;padding:10mm 12mm 8mm;display:flex;flex-direction:column;gap:4.5mm;overflow:hidden;page-break-after:always;position:relative}
.page:last-child{page-break-after:auto}
header{background:var(--lilac);border-radius:6mm;padding:5mm 6mm;display:grid;grid-template-columns:1fr auto;gap:2mm 6mm;align-items:center;
  background-image:linear-gradient(#d3c3f2 1px,transparent 1px),linear-gradient(90deg,#d3c3f2 1px,transparent 1px);background-size:6mm 6mm}
.brand{display:flex;align-items:center;gap:2mm;font-family:Playfair;font-weight:800;font-size:16pt}
.brand small{font-family:Nunito;font-weight:700;font-size:8pt;margin-left:1mm}
.flag{width:9mm;height:6.6mm;border-radius:1mm}
h1{font-family:Playfair;font-weight:800;font-size:24pt;margin:1mm 0 0;line-height:1.05}
.sub{font-weight:700;font-size:11pt;color:var(--accent)}
.who{display:flex;flex-direction:column;gap:3mm;font-weight:700;font-size:11pt;min-width:62mm}
.who span{display:block;border-bottom:0.4mm solid var(--ink);padding-top:4mm}
.score{grid-column:2;display:flex;gap:2mm;align-items:center;justify-content:flex-end;font-weight:800}
.task{border:0.4mm solid var(--line);border-radius:5mm;padding:4mm 5mm 5mm;display:flex;flex-direction:column;gap:3mm}
.task h2{margin:0;font-size:13pt;font-weight:800;display:flex;align-items:center;gap:2.5mm}
.num{display:inline-flex;align-items:center;justify-content:center;width:7mm;height:7mm;border-radius:50%;background:var(--olive);color:var(--olive-ink);font-size:11pt}
.pts{margin-left:auto;font-size:9pt;color:var(--accent);font-weight:700}
.bank{display:flex;flex-wrap:wrap;gap:2mm}
.bank b{background:var(--lilac2);border:0.3mm solid var(--line);border-radius:10mm;padding:0.8mm 3.5mm;font-size:10.5pt}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}
.card{border-radius:4mm;background:var(--lilac2);padding:2.5mm;display:flex;flex-direction:column;align-items:center;gap:1.5mm}
.card img{width:17mm;height:17mm}
.card .n{align-self:flex-start;font-weight:800;font-size:9pt;color:var(--accent)}
.card .ln{width:100%;border-bottom:0.4mm solid var(--ink);height:6mm}
.circ{display:grid;grid-template-columns:1fr 1fr;gap:3mm 8mm;font-size:12.5pt}
.circ div{display:flex;gap:2mm}
.circ .opt{font-weight:800;color:var(--accent)}
.ticks{display:grid;grid-template-columns:1fr 1fr;gap:3mm 6mm}
.tk{display:grid;grid-template-columns:15mm 1fr 9mm;gap:3mm;align-items:center;background:var(--lilac2);border-radius:4mm;padding:2mm 3mm;font-size:11.5pt}
.tk img{width:14mm;height:14mm}
.box{width:9mm;height:9mm;border:0.5mm solid var(--ink);border-radius:2mm;background:#fff}
.coins{display:flex;gap:2mm;align-items:center;font-weight:800;font-size:10pt}
.coin{width:7mm;height:7mm;border-radius:50%;border:0.5mm solid #c99a2e;background:#fff}
footer{margin-top:auto;display:flex;justify-content:space-between;font-size:7.5pt;color:#6b6f86}
.key h2{font-family:Playfair;font-size:18pt;margin:0}
.key ol{margin:0;padding-left:6mm;font-size:12pt;line-height:1.6}
"""


def task_html(i, t, key=False):
    pts = len(t["items"])
    head = f'<h2><span class="num">{i}</span>{html.escape(t["title"])}<span class="pts">___ / {pts}</span></h2>'
    if t["type"] == "write":
        bank = '<div class="bank">' + "".join(f"<b>{html.escape(w)}</b>" for w in t["bank"]) + "</div>"
        cards = "".join(f'<div class="card"><span class="n">{n}</span><img src="{emoji(it["emoji"])}" alt=""><div class="ln"></div></div>'
                        for n, it in enumerate(t["items"], 1))
        return f'<section class="task">{head}{bank}<div class="grid">{cards}</div></section>'
    if t["type"] == "circle":
        rows = ""
        for n, it in enumerate(t["items"], 1):
            txt = html.escape(it["text"])
            txt = re.sub(r"\(([^)]*)\)", lambda m: '( <span class="opt">' + m.group(1).replace("/", "</span> / <span class=\"opt\">") + "</span> )", txt)
            rows += f"<div><b>{n}</b><span>{txt}</span></div>"
        return f'<section class="task">{head}<div class="circ">{rows}</div></section>'
    if t["type"] == "tick":
        rows = "".join(f'<div class="tk"><img src="{emoji(it["emoji"])}" alt=""><span><b>{n}</b> {html.escape(it["text"])}</span><div class="box"></div></div>'
                       for n, it in enumerate(t["items"], 1))
        return f'<section class="task">{head}<div class="ticks">{rows}</div></section>'
    raise ValueError(t["type"])


total = sum(len(t["items"]) for t in spec["tasks"])
p1 = f"""<div class="page">
<header>
  <div><div class="brand">{FLAG}lingo<small>english school</small></div>
  <h1>{html.escape(spec.get('title','Mini-test'))}</h1><div class="sub">{html.escape(spec.get('subtitle',''))}</div></div>
  <div class="who"><span>Name:</span><span>Date:</span></div>
</header>
{''.join(task_html(i, t) for i, t in enumerate(spec['tasks'], 1))}
<div style="display:flex;justify-content:space-between;align-items:center">
  <div class="coins">Lingo Coins: {'<span class="coin"></span>' * 5}</div>
  <div style="font-weight:800;font-size:13pt">Score: ____ / {total}</div>
</div>
<footer><span>Lingo English School</span><span>Images: Twemoji, CC BY 4.0</span></footer>
</div>"""

key_items = []
for i, t in enumerate(spec["tasks"], 1):
    if t["type"] == "tick":
        ans = ", ".join(f"{n} {'✔' if it['answer'] else '✘'}" for n, it in enumerate(t["items"], 1))
    else:
        ans = ", ".join(f"{n} {it['answer']}" for n, it in enumerate(t["items"], 1))
    key_items.append(f"<li><b>{html.escape(t['title'])}</b><br>{html.escape(ans)}</li>")
p2 = f"""<div class="page key"><h2>Answer key (для вчителя)</h2><div class="sub">{html.escape(spec.get('subtitle',''))}</div>
<ol>{''.join(key_items)}</ol><footer><span>Lingo English School</span><span>Images: Twemoji, CC BY 4.0</span></footer></div>"""

doc = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{p1}{p2}</body></html>"
tmp = tempfile.mkdtemp()
hp = os.path.join(tmp, "test.html")
open(hp, "w", encoding="utf-8").write(doc)
js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://{hp}');await p.waitForTimeout(300);
await p.pdf({{path:{json.dumps(os.path.abspath(out))},format:'A4',printBackground:true,preferCSSPageSize:true}});
await p.setViewportSize({{width:794,height:1123}});await p.screenshot({{path:{json.dumps(os.path.abspath(out)[:-4] + '_preview.png')},clip:{{x:0,y:0,width:794,height:1123}}}});
await b.close();}})();"""
jp = os.path.join(tmp, "render.js")
open(jp, "w").write(js)
subprocess.check_call(["node", jp])
print("PDF:", out)
