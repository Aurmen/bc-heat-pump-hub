/**
 * TSBC Contractor Scraper
 *
 * Attempts to scrape contractor data from Technical Safety BC website.
 * Use responsibly and check their terms of service.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const TSBC_SEARCH_URL = 'https://www.technicalsafetybc.ca/regulatory-resources/find-a-licensed-contractor/';

// Cities to search for contractors
const TARGET_CITIES = [
  'Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Coquitlam',
  'Victoria', 'Nanaimo', 'Kelowna', 'Kamloops', 'Prince George'
];

async function scrapeContractorsByCity(city) {
  console.log(`\n🔍 Searching for contractors in ${city}...`);

  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    const page = await browser.newPage();

    // Go to TSBC search page
    await page.goto(TSBC_SEARCH_URL, { waitUntil: 'networkidle2' });

    console.log('Page loaded. Attempting to fill search form...');

    // Wait for search form to load
    await page.waitForSelector('input, form', { timeout: 10000 });

    // Take screenshot to see what we're working with
    await page.screenshot({ path: `scripts/tsbc-page-${city}.png` });
    console.log(`Screenshot saved: tsbc-page-${city}.png`);

    // Get page HTML to analyze structure
    const html = await page.content();
    fs.writeFileSync(`scripts/tsbc-html-${city}.html`, html);
    console.log(`HTML saved: tsbc-html-${city}.html`);

    // Try to find and fill search inputs
    // Note: We need to inspect the actual page to find correct selectors

    // Look for input fields
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} input fields`);

    // Look for buttons
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);

    // Try to find city input and search button
    // This is a placeholder - we'll need to update selectors after inspecting the page

    return [];
  } catch (error) {
    console.error(`Error scraping ${city}:`, error.message);
    return [];
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 Starting TSBC contractor scraper...\n');
  console.log('This will attempt to scrape contractor data from TSBC.');
  console.log('First run will be exploratory - capturing page structure.\n');

  const allContractors = [];

  // Start with just one city to test
  const testCity = TARGET_CITIES[0];
  const contractors = await scrapeContractorsByCity(testCity);
  allContractors.push(...contractors);

  console.log(`\n✅ Scraping complete!`);
  console.log(`Total contractors found: ${allContractors.length}`);

  // Save results
  const outputFile = 'scripts/tsbc-contractors.json';
  fs.writeFileSync(outputFile, JSON.stringify(allContractors, null, 2));
  console.log(`\n📄 Results saved to: ${outputFile}`);
  console.log('\nNext steps:');
  console.log('1. Check the screenshot and HTML file to understand page structure');
  console.log('2. Update selectors in this script');
  console.log('3. Run again to extract actual data');
}

main().catch(console.error);
