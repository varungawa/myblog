#!/usr/bin/env python3
"""Build sutras/index.html (the whole CargoShakti Sutras, as a companion to the novel) from source/cargoshakti-sutras.docx.
Run: python3 tools/build_sutras.py   (needs python-docx). The output is committed; CI does not need python-docx."""
import html, re, pathlib
import docx
from docx.table import Table
from docx.text.paragraph import Paragraph

ROOT = pathlib.Path(__file__).resolve().parent.parent
d = docx.Document(ROOT / "source" / "cargoshakti-sutras.docx")
esc = lambda s: html.escape(s, quote=False)
LANG = {"python", "scss", "mathematica", "solidity", "css", "javascript", "json", "sql", "text", "bash"}
BOX = re.compile(r"[┌└│├┬┴─▶◀▼↓↑═╔╗╚╝]|^\s{2,}\S|^(def |return|if |elif |else:|mapping\(|function |class |import |POST |\+-|\|)|^\s*[\w\[\]'\"]+\s*[:=]\s*[\w\[{(\"']|\)\s*$|^\s*#")
clean = lambda t: t.replace("​", "")
ids = {}
def slug(t):
    s = re.sub(r"[^a-z0-9]+", "-", re.sub(r"^[^\w]+", "", t.lower())).strip("-")[:40] or "s"
    ids[s] = ids.get(s, 0) + 1
    return s if ids[s] == 1 else f"{s}-{ids[s]}"

out, toc, code, i_tab = [], [], [], 0
def flush():
    global code
    if code:
        out.append("<pre>" + esc("\n".join(code)) + "</pre>")
        code = []

def eq(t):
    t = clean(t)
    if "\\" in t:
        t = t[: t.index("\\")]
    return t

body = d.element.body
seen_code_label = False
for el in body.iterchildren():
    tag = el.tag.split("}")[1]
    if tag == "tbl":
        flush()
        tb = Table(el, d)
        rows = [[clean(c.text).strip() for c in r.cells] for r in tb.rows]
        if not rows:
            continue
        h = "".join(f"<th>{esc(c)}</th>" for c in rows[0])
        b = "".join("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
        out.append(f'<div class="tw"><table><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table></div>')
        continue
    if tag != "p":
        continue
    p = Paragraph(el, d)
    raw = clean(p.text)
    t = raw.strip()
    st = p.style.name if p.style is not None else ""
    if t == "CargoShakti Sutras":
        continue
    if st.startswith("Heading") and t:
        flush()
        lvl = int(re.sub(r"\D", "", st) or 2)
        if lvl == 2 and re.match(r"(Introduction|Chapter 1:)", t): lvl = 1
        t = re.sub(r"^[^\w“\"(]+\s*", "", t) if not t[0].isalnum() else t
        if lvl == 1:
            sid = slug(t)
            toc.append((sid, t))
            out.append(f'<h2 id="{sid}">{esc(t)}</h2>')
        else:
            out.append(f"<h{min(lvl + 1, 5)}>{esc(t)}</h{min(lvl + 1, 5)}>")
        seen_code_label = False
        continue
    if not t:
        if code: code.append("")
        continue
    if t == "CopyEdit" or t.lower() in LANG:
        flush(); seen_code_label = True
        continue
    codey = bool(BOX.search(raw)) and (seen_code_label or code or re.search(r"[┌└│├─▶↓]|^\s{2,}\S|^(def |return|mapping\(|function )", raw))
    if codey:
        code.append(raw.rstrip())
        continue
    flush()
    seen_code_label = False
    if "\\text" in t or "\\sum" in t or "\\frac" in t or "\\forall" in t:
        out.append(f'<p class="eq">{esc(eq(t))}</p>')
    elif re.match(r"^(Trader|System)\b[^:]{0,14}:", t):
        who, _, rest = t.partition(":")
        out.append(f'<p class="say {"sys" if who.startswith("System") else "nar"}"><b>{esc(who)}</b> {esc(rest.strip())}</p>')
    elif t.startswith(("“", '"')) and ("–" in t[-60:] or "—" in t[-60:]):
        out.append(f"<blockquote>{esc(t)}</blockquote>")
    else:
        out.append(f"<p>{esc(t)}</p>")
flush()

NAV = '<nav class="nav" aria-label="Site"><a class="brand" href="../">VARUN / STORIES</a><span class="links"><a href="../#play">The story</a><a href="../3ps/">3Ps</a><a href="../history/">HISTORY</a></span></nav>'
tocs = "".join(f'<li><a href="#{s}">{esc(t)}</a></li>' for s, t in toc)
CSS = """:root{--bg:#0e1a2b;--ink:#e9eef6;--mut:#9fb0c8;--gold:#efc17c;--card:#13233a;--line:#26384f}@media(prefers-color-scheme:light){:root[data-x]{}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.65 Georgia,'Times New Roman',serif}
.nav{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--line);font:600 .8rem/1 system-ui,sans-serif;letter-spacing:.12em}.nav a{color:var(--gold);text-decoration:none}.nav .links a{margin-left:16px}
.wrap{max-width:780px;margin:0 auto;padding:28px 16px 80px}.eyebrow{font:600 .75rem/1 system-ui,sans-serif;letter-spacing:.16em;color:var(--gold);text-transform:uppercase}
h1{font-size:2.3rem;line-height:1.15;margin:.4em 0}h2{font-size:1.7rem;margin:2.4em 0 .4em;color:var(--gold);border-top:1px solid var(--line);padding-top:1em}h3{font-size:1.25rem;margin:1.6em 0 .3em}h4,h5{margin:1.3em 0 .2em;color:var(--mut)}
.lede{color:var(--mut)}.toc{columns:2;gap:24px;padding-left:1.1em;font:.95rem/1.7 system-ui,sans-serif}.toc a{color:var(--ink)}@media(max-width:600px){.toc{columns:1}}
blockquote{margin:1em 0;padding:.4em 1em;border-left:3px solid var(--gold);color:#dfe7f3;font-style:italic}
.say{margin:.7em 0;padding:.6em .9em;background:var(--card);border-radius:8px}.say b{display:block;font:700 .72rem/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:.3em}.say.sys{border-left:3px solid #6aa7e6}.say.nar{border-left:3px solid var(--gold)}
pre{overflow-x:auto;background:#0a1420;border:1px solid var(--line);border-radius:8px;padding:12px;font:.82rem/1.5 ui-monospace,Menlo,monospace;color:#cfe0f5}
.tw{overflow-x:auto;margin:1em 0}table{border-collapse:collapse;min-width:100%;font:.9rem/1.45 system-ui,sans-serif}th,td{border:1px solid var(--line);padding:6px 10px;text-align:left;vertical-align:top}th{background:var(--card);color:var(--gold)}
.eq{font:italic 1rem/1.5 ui-monospace,Menlo,monospace;background:#0a1420;padding:8px 12px;border-radius:8px;overflow-x:auto}
.button{display:inline-block;margin:6px 8px 6px 0;padding:10px 16px;border:1px solid var(--gold);border-radius:8px;color:var(--gold);text-decoration:none;font:600 .9rem system-ui,sans-serif}
footer{text-align:center;color:var(--mut);padding:30px 16px;font:.85rem system-ui,sans-serif}footer a{color:var(--gold)}"""
page = f"""<!doctype html>
<!-- Generated by tools/build_sutras.py from source/cargoshakti-sutras.docx. Do not edit by hand. -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0e1a2b"><meta name="description" content="The CargoShakti Sutras: a digital Gita of trade, loss and dharma. The scripture Nanda is carrying through Thus Spake Cargothustra, in full."><title>The CargoShakti Sutras — Varun's Stories</title><style>{CSS}</style></head><body>{NAV}
<main class="wrap"><div class="eyebrow">Companion scripture · Thus Spake Cargothustra</div><h1>The CargoShakti Sutras</h1>
<p class="lede">A digital Gita of trade, loss and dharma. In the novel this is the book Nanda is written from: Nar the trader asks, Narayan the System answers, and every one of the thirteen chapters of the walk is one of these yogas lived rather than studied. The full text follows.</p>
<p><a class="button" href="../#play">Walk with Nanda ↗</a><a class="button" href="../#outline">Read the outline ↗</a></p>
<h3>Contents</h3><ol class="toc">{tocs}</ol>
{''.join(out)}
</main><footer>VARUN / STORIES · <a href="../">Latest story</a> · <a href="../history/">History</a></footer></body></html>
"""
(ROOT / "sutras" / "index.html").write_text(page, encoding="utf-8")
print("wrote sutras/index.html", len(page), "bytes;", len(toc), "chapters")
