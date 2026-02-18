/**
 * TSBC Contractor Discovery Script
 *
 * Discovers contractors in TSBC database by city/location
 * Extracts full contractor details for directory population
 *
 * Usage:
 *   node scripts/discover-tsbc-contractors.js Vancouver
 *   node scripts/discover-tsbc-contractors.js --all
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TSBC_SEARCH_URL = 'https://www.technicalsafetybc.ca/regulatory-resources/find-a-licensed-contractor/';

// Major BC cities to search
const BC_CITIES = [
  'Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Coquitlam',
  'Victoria', 'Nanaimo', 'Kamloops', 'Kelowna', 'Prince George',
  'Abbotsford', 'Langley', 'Delta', 'North Vancouver', 'West Vancouver',
  'Chilliwack', 'Vernon', 'Penticton', 'Campbell River', 'Courtenay'
];

/**
 * Search for contractors by city
 */
async function discoverContractorsByCity(city, browser = null) {
  console.log(`\n🔍 Discovering contractors in ${city}...`);

  const shouldCloseBrowser = !browser;
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Navigate to TSBC search page
    await page.goto(TSBC_SEARCH_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find city input field (typically labeled "City 1", "City 2", etc.)
    const cityInputSelectors = [
      'input[placeholder*="City" i]',
      'input[name*="city" i]',
      'input[id*="city" i]',
      'input[aria-label*="city" i]'
    ];

    let cityInput = null;
    for (const selector of cityInputSelectors) {
      try {
        const inputs = await page.$$(selector);
        if (inputs.length > 0) {
          cityInput = inputs[0]; // Use first city input
          console.log(`Found city input: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!cityInput) {
      console.log('❌ Could not find city input field');
      await page.screenshot({ path: `scripts/tsbc-search-debug.png` });
      return [];
    }

    // Type city name
    await cityInput.type(city);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Click "Find a contractor" button
    const buttonSelectors = [
      'button:has-text("Find a contractor")',
      'button[type="submit"]',
      'input[type="submit"]'
    ];

    let submitButton = null;
    for (const selector of buttonSelectors) {
      try {
        submitButton = await page.$(selector);
        if (submitButton) {
          console.log(`Found submit button: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (submitButton) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
        submitButton.click()
      ]);
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      await cityInput.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Take screenshot of results
    await page.screenshot({
      path: `scripts/tsbc-results-${city}.png`,
      fullPage: true
    });
    console.log(`Screenshot saved: tsbc-results-${city}.png`);

    // Extract contractor list from results page
    const contractors = await extractContractorsList(page, city);
    console.log(`Found ${contractors.length} contractors in ${city}`);

    // For each contractor, visit their detail page to get full info
    const detailedContractors = [];
    for (let i = 0; i < contractors.length; i++) {
      const contractor = contractors[i];
      console.log(`[${i + 1}/${contractors.length}] Getting details for: ${contractor.name}`);

      if (contractor.detailUrl) {
        const details = await getContractorDetails(page, contractor.detailUrl, contractor);
        detailedContractors.push(details);

        // Be respectful - wait between requests
        if (i < contractors.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } else {
        detailedContractors.push(contractor);
      }
    }

    return detailedContractors;

  } catch (error) {
    console.error(`Error discovering contractors in ${city}:`, error.message);
    return [];
  } finally {
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
  }
}

/**
 * Extract list of contractors from search results page
 */
async function extractContractorsList(page, city) {
  try {
    const pageText = await page.evaluate(() => document.body.innerText);

    // Check for no results
    if (pageText.toLowerCase().includes('no results') ||
        pageText.toLowerCase().includes('no contractors match')) {
      console.log('No contractors found');
      return [];
    }

    // Extract contractor links and basic info from results list
    const contractors = await page.evaluate(() => {
      const results = [];

      // Look for contractor links (typically in a results list)
      // This will need to be adjusted based on actual TSBC results page structure
      const links = document.querySelectorAll('a[href*="contractor"], a[href*="license"], h3 a, h4 a');

      links.forEach(link => {
        const text = link.innerText.trim();
        const href = link.href;

        // Skip navigation links, just get contractor profile links
        if (text && href && !href.includes('#') && text.length > 3) {
          results.push({
            name: text,
            detailUrl: href
          });
        }
      });

      // If no links found, try to extract from text content
      if (results.length === 0) {
        // Parse contractor names from list format
        const bodyText = document.body.innerText;
        const namePattern = /^([A-Z][A-Za-z0-9\s&.,'-]+(?:Ltd|Inc|Corp|Company|Solutions|Services|Mechanical|Plumbing|Heating|HVAC|Contractors?))/gm;
        let match;

        while ((match = namePattern.exec(bodyText)) !== null) {
          const name = match[1].trim();
          if (name.length > 5 && !name.includes('\n')) {
            results.push({
              name: name,
              detailUrl: null
            });
          }
        }
      }

      return results;
    });

    // Remove duplicates
    const unique = [];
    const seen = new Set();

    contractors.forEach(c => {
      const key = c.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    });

    return unique;

  } catch (error) {
    console.error('Error extracting contractors list:', error);
    return [];
  }
}

/**
 * Get detailed information for a specific contractor
 */
async function getContractorDetails(page, url, basicInfo) {
  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract detailed contractor data (reuse logic from verify-tsbc-license.js)
    const details = await page.evaluate(() => {
      const result = {
        contractor_name: '',
        city: '',
        email: '',
        phone: '',
        licenses: [],
        enforcement_actions: 0,
        overdue_non_compliances: 0
      };

      // Extract contractor name
      const nameElement = document.querySelector('h1, h2');
      if (nameElement) {
        result.contractor_name = nameElement.innerText.trim();
      }

      // Extract city
      const cityMatch = document.body.innerText.match(/City:\s*([^\n]+)/i);
      if (cityMatch) {
        result.city = cityMatch[1].trim();
      }

      // Extract email
      const emailMatch = document.body.innerText.match(/Email:\s*([^\s]+)/i);
      if (emailMatch) {
        result.email = emailMatch[1].trim();
      }

      // Extract phone
      const phoneMatch = document.body.innerText.match(/Office:\s*([^\n]+)/i);
      if (phoneMatch) {
        result.phone = phoneMatch[1].trim();
      }

      // Extract enforcement actions
      const enforcementMatch = document.body.innerText.match(/Enforcement Actions:\s*(\d+)/i);
      if (enforcementMatch) {
        result.enforcement_actions = parseInt(enforcementMatch[1]);
      }

      // Extract overdue non-compliances
      const nonComplianceMatch = document.body.innerText.match(/Overdue Non-Compliances:\s*(\d+)/i);
      if (nonComplianceMatch) {
        result.overdue_non_compliances = parseInt(nonComplianceMatch[1]);
      }

      // Extract all licenses
      const licensePattern = /([A-Za-z, ]+)\s*-\s*([A-Z]{2,4}\d+)/g;
      let match;
      while ((match = licensePattern.exec(document.body.innerText)) !== null) {
        const licenseType = match[1].trim();
        const licenseNum = match[2].trim();

        const licenseIndex = match.index;
        const contextText = document.body.innerText.substring(licenseIndex, licenseIndex + 500);
        const expiryMatch = contextText.match(/Expiry Date:\s*(\d{4}-\d{2}-\d{2})/i);
        const statusMatch = contextText.match(/Licence Status:\s*(Active|Expired|Suspended)/i);

        result.licenses.push({
          type: licenseType,
          number: licenseNum,
          expiry_date: expiryMatch ? expiryMatch[1] : null,
          status: statusMatch ? statusMatch[1].toLowerCase() : 'unknown'
        });
      }

      return result;
    });

    return {
      ...basicInfo,
      ...details
    };

  } catch (error) {
    console.error(`Error getting details for ${basicInfo.name}:`, error.message);
    return basicInfo;
  }
}

/**
 * Format contractor data for directory.json
 */
function formatForDirectory(contractor, region) {
  // Generate slug from company name
  const slug = contractor.contractor_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Determine services based on licenses
  const services = [];
  contractor.licenses.forEach(license => {
    const type = license.type.toLowerCase();
    if (type.includes('gas')) services.push('boilers');
    if (type.includes('refrigeration') || type.includes('hvac')) {
      services.push('heat_pumps');
    }
    if (type.includes('boiler')) services.push('boilers');
  });

  // Find FSR license (refrigeration - typically for heat pumps)
  const fsrLicense = contractor.licenses.find(l =>
    l.type.toLowerCase().includes('refrigeration') ||
    l.type.toLowerCase().includes('boiler, pressure vessel')
  );

  // Find Gas license
  const gasLicense = contractor.licenses.find(l =>
    l.type.toLowerCase().includes('gas')
  );

  return {
    company_name: contractor.contractor_name,
    slug: slug,
    website: '', // Need to get from elsewhere
    phone: contractor.phone || '',
    city: contractor.city || '',
    region: region,
    province: 'BC',
    services: [...new Set(services)],
    emergency_service: 'unknown',
    brands_supported: [],
    notes: '',
    source_urls: contractor.detailUrl ? [contractor.detailUrl] : [],
    tsbc_verified: true,
    tsbc_fsr_license: fsrLicense?.number || '',
    tsbc_gas_license: gasLicense?.number || '',
    tsbc_license_status: fsrLicense?.status || 'unknown',
    tsbc_license_expiry: fsrLicense?.expiry_date || null,
    tsbc_enforcement_actions: contractor.enforcement_actions || 0,
    tsbc_last_verified: new Date().toISOString().split('T')[0]
  };
}

/**
 * Determine region from city name
 */
function getRegionForCity(city) {
  const lowerCity = city.toLowerCase();

  // Lower Mainland
  if (['vancouver', 'surrey', 'burnaby', 'richmond', 'coquitlam', 'langley',
       'delta', 'north vancouver', 'west vancouver', 'new westminster',
       'port moody', 'port coquitlam', 'maple ridge', 'pitt meadows',
       'white rock', 'abbotsford', 'chilliwack', 'mission'].includes(lowerCity)) {
    return 'Lower Mainland';
  }

  // Vancouver Island
  if (['victoria', 'nanaimo', 'courtenay', 'campbell river', 'port alberni',
       'parksville', 'qualicum beach', 'duncan', 'ladysmith', 'comox'].includes(lowerCity)) {
    return 'Vancouver Island';
  }

  // Interior
  if (['kelowna', 'kamloops', 'vernon', 'penticton', 'west kelowna',
       'salmon arm', 'revelstoke', 'cranbrook', 'trail', 'nelson',
       'castlegar', 'rossland'].includes(lowerCity)) {
    return 'Interior';
  }

  // Northern BC
  if (['prince george', 'quesnel', 'williams lake', 'fort st. john',
       'dawson creek', 'terrace', 'prince rupert', 'fort nelson'].includes(lowerCity)) {
    return 'Northern BC';
  }

  return 'Interior'; // Default
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📖 TSBC Contractor Discovery Tool\n');
    console.log('Usage:');
    console.log('  node scripts/discover-tsbc-contractors.js <city>');
    console.log('  node scripts/discover-tsbc-contractors.js --all\n');
    console.log('Examples:');
    console.log('  node scripts/discover-tsbc-contractors.js Vancouver');
    console.log('  node scripts/discover-tsbc-contractors.js "North Vancouver"');
    console.log('  node scripts/discover-tsbc-contractors.js --all');
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let allContractors = [];

  try {
    if (args[0] === '--all') {
      console.log(`\n🌐 Discovering contractors in ${BC_CITIES.length} cities...\n`);

      for (let i = 0; i < BC_CITIES.length; i++) {
        const city = BC_CITIES[i];
        console.log(`\n[${i + 1}/${BC_CITIES.length}] Processing ${city}...`);

        const contractors = await discoverContractorsByCity(city, browser);
        allContractors.push(...contractors);

        // Longer delay between cities
        if (i < BC_CITIES.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    } else {
      const city = args.join(' ');
      const contractors = await discoverContractorsByCity(city, browser);
      allContractors = contractors;
    }

    // Format for directory
    const formatted = allContractors.map(c => {
      const region = getRegionForCity(c.city || args[0]);
      return formatForDirectory(c, region);
    });

    // Remove duplicates by company name
    const uniqueFormatted = [];
    const seenNames = new Set();

    formatted.forEach(c => {
      const key = c.company_name.toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        uniqueFormatted.push(c);
      }
    });

    // Save results
    const outputFile = 'scripts/discovered-contractors.json';
    fs.writeFileSync(outputFile, JSON.stringify(uniqueFormatted, null, 2));

    console.log(`\n✅ Discovery complete!`);
    console.log(`📄 Results saved to: ${outputFile}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Total contractors discovered: ${allContractors.length}`);
    console.log(`   Unique contractors: ${uniqueFormatted.length}`);
    console.log(`   With TSBC verification: ${uniqueFormatted.filter(c => c.tsbc_verified).length}`);
    console.log(`   With FSR licenses: ${uniqueFormatted.filter(c => c.tsbc_fsr_license).length}`);
    console.log(`   With Gas licenses: ${uniqueFormatted.filter(c => c.tsbc_gas_license).length}`);

  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { discoverContractorsByCity, formatForDirectory };
