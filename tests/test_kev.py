import json
from datetime import date

import pytest

import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("kev", Path(__file__).resolve().parents[1] / "website" / "src" / "kev.py")
kev = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kev)

TODAY = date(2026, 10, 23)


def entry(i, **kw):
    e = {"cveID": f"CVE-2026-{1000 + i}", "vendorProject": "Vendor", "product": "Product",
         "vulnerabilityName": "Bug", "dateAdded": "2026-10-01", "dueDate": "2026-10-22",
         "knownRansomwareCampaignUse": "Unknown", "shortDescription": "desc"}
    e.update(kw)
    return e


def catalog(extra=()):
    return {"catalogVersion": "2026.10.23", "vulnerabilities": [entry(i) for i in range(120)] + list(extra)}


def test_sorted_newest_first_and_capped():
    out = kev.build(catalog([entry(999, dateAdded="2026-10-22", cveID="CVE-2026-99999")]), TODAY)
    assert out["latest"][0]["cve"] == "CVE-2026-99999"
    assert len(out["latest"]) == kev.KEEP
    assert out["added_7d"] == 1


def test_hostile_values_are_neutralised():
    bad = entry(1, cveID="CVE-2026-55555", dateAdded="2026-10-22",
                vendorProject="<script>alert(1)</script>‮\x07evil", shortDescription="x" * 5000)
    out = kev.build(catalog([bad]), TODAY)
    row = next(r for r in out["latest"] if r["cve"] == "CVE-2026-55555")
    assert "‮" not in row["vendor"] and "\x07" not in row["vendor"]
    assert len(row["vendor"]) <= 40 and len(row["summary"]) <= 280
    # HTML is kept as text here; the page escapes it on display (see term.js esc()).


def test_invalid_ids_and_future_dates_are_dropped():
    junk = [entry(1, cveID="javascript:alert(1)"), entry(2, cveID="CVE-2026-1"), entry(3, dateAdded="2099-01-01"),
            entry(4, dateAdded="not a date")]
    out = kev.build(catalog(junk), TODAY)
    assert out["total"] == 120


def test_rejects_something_that_is_not_the_feed():
    with pytest.raises(ValueError):
        kev.build({"vulnerabilities": [entry(1)]}, TODAY)


def test_committed_snapshot_is_valid():
    data = json.loads((Path(__file__).resolve().parents[1] / "website" / "data" / "kev.json").read_text())
    assert data["latest"] and all(kev.CVE.match(r["cve"]) for r in data["latest"])


def test_ransomware_list_is_separate():
    rw = entry(7, cveID="CVE-2026-77777", dateAdded="2026-01-01", knownRansomwareCampaignUse="Known")
    out = kev.build(catalog([rw]), TODAY)
    assert [r["cve"] for r in out["ransomware_latest"]] == ["CVE-2026-77777"]
