"""
BC Heat Pump Hub — CSV → directory.json migration script
Converts bc_contractors_master.csv to the DirectoryListing schema used by the Next.js site.
"""

import csv
import json
import re
import shutil
from pathlib import Path

SCRIPT_DIR  = Path(__file__).parent
CSV_PATH    = SCRIPT_DIR / "bc_contractors_master.csv"
OUTPUT_PATH = SCRIPT_DIR.parent / "src" / "data" / "directory.json"
ARCHIVE_PATH = SCRIPT_DIR / "directory_tsbc_archive.json"

# ── Region lookup ──────────────────────────────────────────────────────────
CITY_TO_REGION: dict[str, str] = {
    # Lower Mainland
    "Vancouver":      "Lower Mainland",
    "Surrey":         "Lower Mainland",
    "Burnaby":        "Lower Mainland",
    "Richmond":       "Lower Mainland",
    "Coquitlam":      "Lower Mainland",
    "Langley":        "Lower Mainland",
    "Abbotsford":     "Lower Mainland",
    "North Vancouver":"Lower Mainland",
    "West Vancouver": "Lower Mainland",
    "New Westminster":"Lower Mainland",
    "Maple Ridge":    "Lower Mainland",
    "Port Coquitlam": "Lower Mainland",
    "Delta":          "Lower Mainland",
    "Chilliwack":     "Lower Mainland",
    "Pitt Meadows":   "Lower Mainland",
    "Mission":        "Lower Mainland",
    "Agassiz":        "Lower Mainland",
    # Vancouver Island
    "Victoria":       "Vancouver Island",
    "Nanaimo":        "Vancouver Island",
    "Sidney":         "Vancouver Island",
    "Sooke":          "Vancouver Island",
    "Ladysmith":      "Vancouver Island",
    "Courtenay":      "Vancouver Island",
    "Campbell River": "Vancouver Island",
    # Interior
    "Kelowna":         "Interior",
    "Kamloops":        "Interior",
    "Prince George":   "Interior",
    "Vernon":          "Interior",
    "Penticton":       "Interior",
    "Salmon Arm":      "Interior",
    "Kaleden":         "Interior",
    "Okanagan Falls":  "Interior",
    "West Kelowna":    "Interior",
}

# ── Services mapping ───────────────────────────────────────────────────────
SERVICE_MAP = {
    "Heat Pumps":  "heat_pumps",
    "Gas Backup":  "hybrid",
    "Hydronics":   "boilers",
    "Air-to-Water":"air_to_water",
    "VRF":         "heat_pumps",   # VRF is a commercial heat pump type
}


def slugify(name: str) -> str:
    """Convert company name to URL-safe slug."""
    s = name.lower()
    s = re.sub(r"[''']", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def map_services(services_str: str) -> list[str]:
    """Convert CSV Services string to list of ServiceType values (deduplicated)."""
    seen: set[str] = set()
    result: list[str] = []
    for part in services_str.split(","):
        part = part.strip()
        mapped = SERVICE_MAP.get(part)
        if mapped and mapped not in seen:
            seen.add(mapped)
            result.append(mapped)
    return result


def extract_tsbc_license(notes: str, prefix: str) -> str:
    """Extract a TSBC licence number (e.g. LGA0003114) from notes text."""
    pattern = re.compile(rf"\b({prefix}\d+)\b", re.IGNORECASE)
    match = pattern.search(notes)
    return match.group(1).upper() if match else ""


def build_notes(row: dict) -> str:
    """Build the notes field from CSV columns."""
    parts = []
    if row.get("Service_Area_Cities", "").strip():
        parts.append(f"Service area: {row['Service_Area_Cities'].strip()}.")
    if row.get("Notes", "").strip():
        parts.append(row["Notes"].strip())
    return " ".join(parts)


def main() -> None:
    # Archive existing directory.json
    if OUTPUT_PATH.exists():
        shutil.copy(OUTPUT_PATH, ARCHIVE_PATH)
        print(f"Archived existing directory.json -> {ARCHIVE_PATH.name}")

    # Read CSV
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    print(f"Read {len(rows)} rows from CSV")

    listings: list[dict] = []
    slug_counts: dict[str, int] = {}

    for row in rows:
        company_name = row["Company_Name"].strip()
        if not company_name:
            continue

        # Slug (deduplicate)
        base_slug = slugify(company_name)
        slug_counts[base_slug] = slug_counts.get(base_slug, 0) + 1
        count = slug_counts[base_slug]
        slug = base_slug if count == 1 else f"{base_slug}-{count}"

        city = row["City"].strip()
        region = CITY_TO_REGION.get(city, "Lower Mainland")

        # Website — strip protocol prefix for consistency with existing schema
        website = row["Website"].strip()
        website = re.sub(r"^https?://", "", website)

        notes = build_notes(row)
        services = map_services(row.get("Services", ""))

        # Brands
        brands_raw = row.get("Brands_Installed", "").strip()
        brands = [b.strip() for b in brands_raw.split(",") if b.strip()] if brands_raw else []

        # TSBC
        tsbc_verified = "TSBC" in notes
        tsbc_gas      = extract_tsbc_license(notes, "LGA")
        tsbc_fsr      = extract_tsbc_license(notes, "LRA")
        tsbc_elec     = extract_tsbc_license(notes, "LEL")

        listing: dict = {
            "company_name": company_name,
            "slug": slug,
            "website": website,
            "phone": row["Phone"].strip(),
            "city": city,
            "region": region,
            "province": "BC",
            "services": services,
            "emergency_service": "unknown",
            "brands_supported": brands,
            "notes": notes,
            "source_urls": [],
            "tsbc_verified": tsbc_verified,
            "tsbc_fsr_license": tsbc_fsr,
            "tsbc_gas_license": tsbc_gas,
            "tsbc_electrical_license": tsbc_elec,
            "tsbc_license_status": "active" if tsbc_verified else "unknown",
            "tsbc_enforcement_actions": 0,
            "tsbc_last_verified": "2026-02-21" if tsbc_verified else "",
        }

        listings.append(listing)

    # Write output
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(listings, f, indent=2, ensure_ascii=False)

    print(f"Written {len(listings)} listings -> {OUTPUT_PATH}")

    # Summary by region/city
    from collections import Counter
    cities = Counter(l["city"] for l in listings)
    regions = Counter(l["region"] for l in listings)
    print("\nBy region:")
    for region, count in sorted(regions.items()):
        print(f"  {region}: {count}")
    print("\nTop cities:")
    for city, count in cities.most_common(10):
        print(f"  {city}: {count}")


if __name__ == "__main__":
    main()
