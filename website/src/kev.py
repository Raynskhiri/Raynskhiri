"""Build website/data/kev.json from CISA's Known Exploited Vulnerabilities catalog.

Runs daily in GitHub Actions (.github/workflows/kev.yml). Visitors never call
CISA: the site serves this small, validated snapshot from its own origin.

Everything from the feed is treated as untrusted: CVE ids must match the CVE
format, dates must parse, strings are stripped of control characters and
length-capped, and the page escapes all of it again before display.

Run: python3 website/src/kev.py [--input catalog.json]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
OUT = Path(__file__).resolve().parent.parent / "data" / "kev.json"
KEEP = 40
CVE = re.compile(r"^CVE-\d{4}-\d{4,7}$")
CTRL = re.compile(r"[\x00-\x1f\x7f​-‏‪-‮⁦-⁩]")


def clean(value, limit: int) -> str:
    text = CTRL.sub(" ", str(value or "")).strip()
    text = re.sub(r"\s+", " ", text)
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def parse_day(value) -> date | None:
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def build(catalog: dict, today: date) -> dict:
    vulns = catalog.get("vulnerabilities")
    if not isinstance(vulns, list) or len(vulns) < 100:
        raise ValueError("catalog does not look like the KEV feed (missing or tiny 'vulnerabilities' list)")
    rows = []
    for v in vulns:
        if not isinstance(v, dict):
            continue
        cve = str(v.get("cveID", "")).strip()
        added = parse_day(v.get("dateAdded"))
        if not CVE.match(cve) or added is None or added > today + timedelta(days=1):
            continue
        rows.append({
            "cve": cve,
            "vendor": clean(v.get("vendorProject"), 40),
            "product": clean(v.get("product"), 60),
            "name": clean(v.get("vulnerabilityName"), 110),
            "added": added.isoformat(),
            "due": (parse_day(v.get("dueDate")) or added).isoformat(),
            "ransomware": str(v.get("knownRansomwareCampaignUse", "")).strip().lower() == "known",
            "summary": clean(v.get("shortDescription"), 280),
        })
    if len(rows) < 100:
        raise ValueError("too few valid entries after validation")
    rows.sort(key=lambda r: (r["added"], r["cve"]), reverse=True)
    week = (today - timedelta(days=7)).isoformat()
    month = (today - timedelta(days=30)).isoformat()
    return {
        "source": "CISA Known Exploited Vulnerabilities catalog",
        "source_url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
        "catalog_version": clean(catalog.get("catalogVersion"), 20),
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total": len(rows),
        "added_7d": sum(r["added"] >= week for r in rows),
        "added_30d": sum(r["added"] >= month for r in rows),
        "ransomware_total": sum(r["ransomware"] for r in rows),
        "latest": rows[:KEEP],
    }


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", help="read the catalog from a file instead of CISA")
    args = ap.parse_args(argv)
    if args.input:
        raw = Path(args.input).read_bytes()
    else:
        req = urllib.request.Request(URL, headers={"User-Agent": "rayenskhiri.online kev-snapshot"})
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read(20_000_000)
    data = build(json.loads(raw), datetime.now(timezone.utc).date())
    previous = json.loads(OUT.read_text()) if OUT.exists() else {}
    if previous and {k: v for k, v in previous.items() if k != "generated"} == {k: v for k, v in data.items() if k != "generated"}:
        print("KEV unchanged")
        return 0
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"KEV {data['catalog_version']}: {data['total']} entries, {data['added_7d']} added in 7 days")
    return 0


if __name__ == "__main__":
    sys.exit(main())
