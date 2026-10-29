"""Build website/index.html from src/template.html, and the blog from src/blog/.

Placeholders:
  {{ui:name}}           inline UI icon (stroke icons, currentColor)
  {{si:slug}}           inline brand icon from Simple Icons, in brand colour
  {{tile:slug:Label}}   tech stack tile: brand icon + label

Run: python3 website/src/build.py
"""

from __future__ import annotations

import base64
import hashlib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "index.html"
HEADERS = HERE.parent / "vercel.json"
ICONS = json.loads((HERE / "brand-icons.json").read_text())

# Stroke icons, 24x24, drawn for this site.
UI = {
    "shield": '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
    "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "arrow": '<path d="M7 17 17 7M9 7h8v8"/>',
    "download": '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',
    "linkedin": '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
    "radar": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 18 6"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    "check": '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>',
    "pin": '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
    "award": '<circle cx="12" cy="9" r="6"/><path d="m8.5 14 -1.5 7 5-3 5 3-1.5-7"/>',
    "cap": '<path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z"/><path d="M6.5 11v5c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2v-5M21.5 9v6"/>',
    "siren": '<path d="M6 18v-6a6 6 0 0 1 12 0v6"/><path d="M4 18h16v3H4zM12 3V1.5M4.2 6.2 3 5M19.8 6.2 21 5"/>',
    "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    "bug": '<rect x="7" y="8" width="10" height="12" rx="5"/><path d="M9 8V6a3 3 0 0 1 6 0v2M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2M12 11v9"/>',
    "cpu": '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
    "external": '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    "send": '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z"/>',
    "network": '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2h12v2"/>',
}

DARK_FALLBACK = "#E6E9EF"


def luminance(hex_colour: str) -> float:
    r, g, b = (int(hex_colour[i:i + 2], 16) / 255 for i in (0, 2, 4))
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in (r, g, b)]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ui(name: str) -> str:
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{UI[name]}</svg>')


USED: set[str] = set()


def si(slug: str) -> str:
    """Reference a brand icon; its path is emitted once in a hidden sprite."""
    USED.add(slug)
    return f'<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#si-{slug}"/></svg>'


def sprite() -> str:
    symbols = []
    for slug in sorted(USED):
        icon = ICONS[slug]
        # Brand colours that vanish on a near-black background get a light fill.
        colour = f'#{icon["hex"]}' if luminance(icon["hex"]) > 0.1 else DARK_FALLBACK
        symbols.append(f'<symbol id="si-{slug}" viewBox="0 0 24 24"><path fill="{colour}" d="{icon["path"]}"/></symbol>')
    return f'<svg width="0" height="0" style="position:absolute" aria-hidden="true">{"".join(symbols)}</svg>'


MONO = {"Kaspersky": "Ka", "PowerShell": "PS", "Wazuh": "Wz", "OpenCTI": "CTI", "ANY.RUN": "AR", "TheHive": "TH", "Sysinternals": "Si",
        "Volatility": "Vol", "Nessus": "Ns", "OpenVAS": "OV", "GLPI": "GL", "MISP": "MI", "Impacket": "Im", "BloodHound": "BH"}


def monogram(label: str) -> str:
    if label in MONO:
        return f'<span class="mono" aria-hidden="true">{MONO[label]}</span>'
    words = [w for w in label.replace("-", " ").split() if w[0].isalnum()]
    letters = (words[0][0] + (words[1][0] if len(words) > 1 else words[0][1])) if words else "?"
    return f'<span class="mono" aria-hidden="true">{letters[0].upper()}{letters[1].lower() if len(words) == 1 else letters[1].upper()}</span>'


def tile(slug: str, label: str) -> str:
    """slug 'ad' = generic network icon, 'mono' = two-letter monogram (no brand icon exists)."""
    if slug == "ad":
        glyph = ui("network")
    elif slug == "mono":
        glyph = monogram(label)
    else:
        glyph = si(slug)
    return f'<li><span class="logo-tile">{glyph}</span>{label}</li>'


def build() -> str:
    html = (HERE / "template.html").read_text(encoding="utf-8")
    html = re.sub(r"\{\{tile:([a-z0-9]+):([^}]+)\}\}", lambda m: tile(m.group(1), m.group(2)), html)
    html = re.sub(r"\{\{si:([a-z0-9]+)\}\}", lambda m: si(m.group(1)), html)
    html = re.sub(r"\{\{ui:([a-z]+)\}\}", lambda m: ui(m.group(1)), html)
    html = html.replace("<body>\n", "<body>\n" + sprite() + "\n", 1)
    left = re.findall(r"\{\{[^}]+\}\}", html)
    if left:
        raise SystemExit(f"unresolved placeholders: {left}")
    OUT.write_text(html, encoding="utf-8")
    HEADERS.write_text(json.dumps(vercel_config(html), indent=2) + "\n", encoding="utf-8")
    return str(OUT)


SITE = "https://rayenskhiri.online"
BLOG_SRC = HERE / "blog"
BLOG_OUT = HERE.parent / "blog"


def esc(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def read_post(path: Path) -> dict:
    """A post is HTML with a JSON block in a leading <!--meta ... --> comment."""
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--meta\s*(\{.*?\})\s*-->\s*", raw, re.S)
    if not m:
        raise SystemExit(f"{path.name}: missing <!--meta {{...}} --> block")
    meta = json.loads(m.group(1))
    meta["body"] = raw[m.end():]
    return meta


def page(title: str, og_title: str, desc: str, url: str, image: str, content: str,
         og_type: str = "website", extra_meta: str = "", blog_current: bool = False) -> str:
    html = (BLOG_SRC / "layout.html").read_text(encoding="utf-8")
    for key, val in {"%%TITLE%%": esc(title), "%%OGTITLE%%": esc(og_title), "%%DESC%%": esc(desc),
                     "%%URL%%": url, "%%IMAGE%%": image, "%%TYPE%%": og_type, "%%EXTRAMETA%%": extra_meta,
                     "%%BLOGCURRENT%%": ' aria-current="page"' if blog_current else "",
                     "%%CONTENT%%": content}.items():
        html = html.replace(key, val)
    html = re.sub(r"\{\{ui:([a-z]+)\}\}", lambda m: ui(m.group(1)), html)
    left = re.findall(r"\{\{[^}]+\}\}|%%[A-Z]+%%", html)
    if left:
        raise SystemExit(f"blog: unresolved placeholders: {left}")
    return html


def build_blog() -> list[str]:
    posts = sorted((read_post(p) for p in (BLOG_SRC / "posts").glob("*.html")),
                   key=lambda p: p["date"], reverse=True)
    written = []
    for p in posts:
        url = f"{SITE}/blog/{p['slug']}/"
        image = f"{SITE}/blog/{p['slug']}/og.png" if (BLOG_OUT / p["slug"] / "og.png").exists() else f"{SITE}/og.png"
        tags = "".join(f'<span class="tagx">#{esc(t)}</span>' for t in p["tags"])
        content = (
            f'<header class="article-head"><div class="wrap"><div class="inner">'
            f'<a class="back" href="/blog/">&larr; All posts</a>'
            + (f'<div><a class="badge" href="{p["verify"]}">{{{{ui:award}}}}{esc(p["badge"])}</a></div>' if p.get("verify") else f'<div><span class="badge">{{{{ui:award}}}}{esc(p["badge"])}</span></div>')
            + f'<h1>{esc(p["title"])}</h1><p class="lede">{esc(p["description"])}</p>'
            f'<div class="meta"><span>Rayen Skhiri</span><span><time datetime="{p["date"]}">{p["date_human"]}</time></span>'
            f'<span>{p["read"]}</span>{tags}</div></div></div></header>'
            f'<div class="wrap"><article class="article">{p["body"]}'
            f'<div class="end"><p><b>Thanks for reading.</b> Questions about the CRTP or Active Directory security? I reply within a day.</p>'
            f'<div class="acts"><a class="btn btn-primary btn-sm" href="https://linkedin.com/in/rayen-skhiri">Message me on LinkedIn {{{{ui:arrow}}}}</a>'
            f'<a class="btn btn-ghost btn-sm" href="/blog/">More posts</a></div></div></article></div>'
        )
        extra = (f'<meta property="article:published_time" content="{p["date"]}">\n'
                 f'<meta property="article:author" content="Rayen Skhiri">\n')
        out = BLOG_OUT / p["slug"] / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page(f'{p["title"]} | Rayen Skhiri', p["title"], p["description"], url, image,
                            content, "article", extra), encoding="utf-8")
        written.append(str(out))
    cards = "".join(
        f'<li><a class="post-card" href="/blog/{p["slug"]}/"><div class="meta"><time datetime="{p["date"]}">{p["date_human"]}</time>'
        f'<span>{p["read"]}</span></div><h2>{esc(p["title"])}</h2><p>{esc(p["description"])}</p>'
        f'<span class="more">Read the post {{{{ui:arrow}}}}</span></a></li>' for p in posts)
    index = (f'<div class="wrap"><div class="page-head"><p class="eyebrow">// blog <b>· notes from the SOC and the lab</b></p>'
             f'<h1 class="title">Blog</h1><p class="sub">What I learn defending a 24/7 SOC and attacking labs to stay sharp: '
             f'certifications, detections and the tools I build.</p></div><ul class="posts">{cards}</ul></div>')
    out = BLOG_OUT / "index.html"
    out.write_text(page("Blog | Rayen Skhiri", "Blog | Rayen Skhiri",
                        "Notes from a SOC analyst: certifications, Active Directory security, detections and open tools.",
                        f"{SITE}/blog/", f"{SITE}/og.png", index, blog_current=True), encoding="utf-8")
    written.append(str(out))
    return written


def script_hashes(html: str) -> list[str]:
    """CSP hashes for every inline script, so only these exact scripts can run."""
    hashes = []
    for m in re.finditer(r"<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script>", html, re.S):
        if "application/ld+json" in m.group(1):
            continue
        digest = hashlib.sha256(m.group(2).encode("utf-8")).digest()
        hashes.append("'sha256-" + base64.b64encode(digest).decode() + "'")
    return hashes


def vercel_config(html: str) -> dict:
    csp = "; ".join([
        "default-src 'self'",
        "script-src 'self' https://detections.rayenskhiri.online " + " ".join(script_hashes(html)),
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src https://fonts.gstatic.com",
        "img-src 'self' data:",
        "connect-src 'self' https://threatwatch.rayenskhiri.online https://detections.rayenskhiri.online",
        "base-uri 'none'",
        "form-action 'self' mailto:",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
    ])
    return {"headers": [
        {"source": "/(.*)", "headers": [
            {"key": "Content-Security-Policy", "value": csp},
            {"key": "X-Content-Type-Options", "value": "nosniff"},
            {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
            {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=()"},
            {"key": "Cross-Origin-Opener-Policy", "value": "same-origin"},
            {"key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains"},
        ]},
        {"source": "/data/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=600, must-revalidate"}]},
    ]}


if __name__ == "__main__":
    print("wrote", build())
    for path in build_blog():
        print("wrote", path)
