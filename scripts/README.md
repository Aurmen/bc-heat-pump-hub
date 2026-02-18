# TSBC Scripts

Tools for discovering and verifying contractors against Technical Safety BC database.

## Prerequisites

```bash
npm install puppeteer
```

## Scripts Overview

- **discover-tsbc-contractors.js** - Discover new contractors by city
- **verify-tsbc-license.js** - Verify existing contractor licenses

---

## Discovery - Find New Contractors

### Discover Contractors in a City

```bash
npm run discover-contractors Vancouver
npm run discover-contractors "North Vancouver"
```

This will:
1. Search TSBC for all contractors in the specified city
2. Extract full details for each contractor
3. Format data for directory.json
4. Save to `scripts/discovered-contractors.json`

### Discover Contractors in All Major BC Cities

```bash
npm run discover-contractors --all
```

Searches 20 major BC cities and compiles a comprehensive contractor list.

⚠️ **Note:** This takes 15-30 minutes and makes many requests to TSBC. Use sparingly.

---

## Verification - Check Existing Licenses

### Verify Single License

```bash
node scripts/verify-tsbc-license.js FSR-A-12345
```

### Batch Verify Multiple Licenses

```bash
node scripts/verify-tsbc-license.js --batch FSR-A-12345 FSR-A-23456 FSR-A-34567
```

### Verify All Directory Contractors

Automatically verifies all contractors in `src/data/directory.json`:

```bash
node scripts/verify-tsbc-license.js --directory
```

This will:
1. Extract all FSR licenses from directory
2. Verify each license against TSBC
3. Update contractor records with verification status
4. Save results to `scripts/tsbc-verification-results.json`

## NPM Scripts (shortcuts)

```bash
# Verify single license
npm run verify-license FSR-A-12345

# Verify all directory contractors
npm run verify-directory
```

## Output Format

```json
{
  "license_number": "FSR-A-12345",
  "verified": true,
  "contractor_name": "Example Mechanical Ltd",
  "license_type": "FSR",
  "license_status": "active",
  "expiry_date": "2027-12-31",
  "specializations": ["refrigeration", "HVAC"],
  "enforcement_actions": 0,
  "timestamp": "2026-02-17T12:00:00.000Z"
}
```

## License Status Values

- `active` - License is current and valid
- `expired` - License has expired
- `suspended` - License is suspended
- `not_found` - License number not found in TSBC database
- `unknown` - Could not determine status

## Important Notes

### Rate Limiting

- Script includes 2-second delays between requests
- Be respectful of TSBC's servers
- Don't run batch operations too frequently

### Data Accuracy

- Data is scraped from public TSBC website
- Always verify critical information manually
- Treat as supplementary verification, not sole source of truth

### TSBC Website Changes

If the script stops working:
1. TSBC may have changed their website structure
2. Run the exploratory script to capture current page:
   ```bash
   node scripts/scrape-tsbc.js
   ```
3. Check `scripts/tsbc-page-Vancouver.png` and `tsbc-html-Vancouver.html`
4. Update selectors in `verify-tsbc-license.js`

## Troubleshooting

### "Search interface not found"

The TSBC website structure has changed. Need to update CSS selectors:
1. Visit https://www.technicalsafetybc.ca/regulatory-resources/find-a-licensed-contractor/
2. Inspect the search form
3. Update selectors in `extractLicenseData()` function

### Puppeteer fails to launch

Try running with debugging enabled:
```bash
DEBUG=puppeteer:* node scripts/verify-tsbc-license.js FSR-A-12345
```

### License shows as "not_found" but exists

1. Check license number format (FSR-A-12345 vs FSR A 12345)
2. TSBC search may require exact format
3. Try searching manually on TSBC website first

## Legal & Ethical Use

- This script uses publicly available data from TSBC
- Respect TSBC's terms of service
- Use for verification purposes only
- Do not overwhelm their servers with excessive requests
- Consider using their official API if available

## Future Improvements

- [ ] Add support for Gas Fitter licenses
- [ ] Add support for Electrical licenses
- [ ] Parse enforcement action details
- [ ] Extract contractor specializations
- [ ] Add email notifications for expiring licenses
- [ ] Build caching layer to avoid duplicate lookups
- [ ] Create web dashboard for verification results
