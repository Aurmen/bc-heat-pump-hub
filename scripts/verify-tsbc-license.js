/**
 * TSBC License Verification Script
 *
 * Verifies contractor licenses against Technical Safety BC database.
 * Extracts: license status, expiry date, enforcement actions, specializations
 *
 * Usage:
 *   node scripts/verify-tsbc-license.js <license-number>
 *   node scripts/verify-tsbc-license.js --batch <file.json>
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const TSBC_SEARCH_URL = 'https://www.technicalsafetybc.ca/regulatory-resources/find-a-licensed-contractor/';

/**
 * Verify a single license number
 */
async function verifyLicense(licenseNumber, browser = null) {
  console.log(`\n🔍 Verifying license: ${licenseNumber}`);

  const shouldCloseBrowser = !browser;
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true, // Set to false to debug
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  try {
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    await page.goto(TSBC_SEARCH_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Try to find and interact with the search interface
    // Note: We need to inspect the actual page structure
    // This is a template - selectors need to be updated based on actual TSBC site

    // Look for license number input field specifically
    // Based on TSBC website structure
    const searchInputSelectors = [
      'input[placeholder*="license" i]',
      'input[placeholder*="licence" i]',
      'input[name*="license" i]',
      'input[name*="licence" i]',
      'input[id*="license" i]',
      'input[id*="licence" i]',
      'input[aria-label*="license" i]',
      'input[aria-label*="licence" i]'
    ];

    let searchInput = null;
    for (const selector of searchInputSelectors) {
      try {
        searchInput = await page.$(selector);
        if (searchInput) {
          console.log(`Found search input: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!searchInput) {
      console.log('❌ Could not find search input');
      await page.screenshot({ path: 'scripts/tsbc-debug.png' });
      return {
        license_number: licenseNumber,
        verified: false,
        error: 'Search interface not found',
        timestamp: new Date().toISOString()
      };
    }

    // Type the license number
    await searchInput.type(licenseNumber);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Look for "Find a contractor" submit button
    const buttonSelectors = [
      'button:has-text("Find a contractor")',
      'button:has-text("Find")',
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Search")'
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
      console.log('Clicking submit button...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
        submitButton.click()
      ]);
      // Extra wait for results to render
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log('No submit button found, trying Enter key...');
      await searchInput.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Take screenshot of results for debugging
    await page.screenshot({
      path: `scripts/tsbc-result-${licenseNumber}.png`,
      fullPage: true
    });
    console.log(`Screenshot saved: tsbc-result-${licenseNumber}.png`);

    // Extract results
    const results = await extractLicenseData(page, licenseNumber);

    return results;

  } catch (error) {
    console.error(`Error verifying ${licenseNumber}:`, error.message);
    return {
      license_number: licenseNumber,
      verified: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
  }
}

/**
 * Extract license data from TSBC results page
 * Based on actual TSBC contractor page structure
 */
async function extractLicenseData(page, licenseNumber) {
  try {
    // Check if we got results or "no results found"
    const pageText = await page.evaluate(() => document.body.innerText);

    if (pageText.toLowerCase().includes('no results') ||
        pageText.toLowerCase().includes('not found') ||
        pageText.toLowerCase().includes('no contractors match')) {
      return {
        license_number: licenseNumber,
        verified: false,
        status: 'not_found',
        timestamp: new Date().toISOString()
      };
    }

    // Extract structured data from TSBC results page
    const data = await page.evaluate(() => {
      const result = {
        contractor_name: '',
        city: '',
        email: '',
        phone: '',
        licenses: [],
        enforcement_actions: 0,
        overdue_non_compliances: 0
      };

      // Extract contractor name (first h1 or main heading)
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

      // Extract all licenses (looking for patterns like "Gas - LGA0105692")
      const licensePattern = /([A-Za-z, ]+)\s*-\s*([A-Z]{2,4}\d+)/g;
      let match;
      while ((match = licensePattern.exec(document.body.innerText)) !== null) {
        const licenseType = match[1].trim();
        const licenseNum = match[2].trim();

        // Try to find expiry date nearby
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

    // Find the specific license we searched for
    const searchedLicense = data.licenses.find(l => l.number === licenseNumber);

    return {
      license_number: licenseNumber,
      verified: true,
      contractor_name: data.contractor_name,
      city: data.city,
      email: data.email,
      phone: data.phone,
      license_type: searchedLicense?.type || '',
      license_status: searchedLicense?.status || 'active',
      expiry_date: searchedLicense?.expiry_date || null,
      all_licenses: data.licenses,
      enforcement_actions: data.enforcement_actions,
      overdue_non_compliances: data.overdue_non_compliances,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error extracting data:', error);
    return {
      license_number: licenseNumber,
      verified: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Batch verify multiple licenses
 */
async function batchVerify(licenses) {
  console.log(`\n📋 Batch verifying ${licenses.length} licenses...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  for (let i = 0; i < licenses.length; i++) {
    const license = licenses[i];
    console.log(`[${i + 1}/${licenses.length}] Processing: ${license}`);

    const result = await verifyLicense(license, browser);
    results.push(result);

    // Add delay between requests to be respectful
    if (i < licenses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  await browser.close();

  return results;
}

/**
 * Verify contractors from directory
 */
async function verifyDirectory() {
  console.log('\n🏢 Verifying contractors from directory...\n');

  const directoryPath = './src/data/directory.json';
  if (!fs.existsSync(directoryPath)) {
    console.error('❌ Directory file not found');
    return;
  }

  const directory = JSON.parse(fs.readFileSync(directoryPath, 'utf8'));

  // Extract all FSR licenses
  const licensesToVerify = [];
  const contractorMap = new Map();

  directory.forEach(contractor => {
    if (contractor.tsbc_fsr_license) {
      licensesToVerify.push(contractor.tsbc_fsr_license);
      contractorMap.set(contractor.tsbc_fsr_license, contractor);
    }
  });

  console.log(`Found ${licensesToVerify.length} FSR licenses to verify\n`);

  if (licensesToVerify.length === 0) {
    console.log('No licenses to verify');
    return;
  }

  // Verify all licenses
  const results = await batchVerify(licensesToVerify);

  // Update directory with verification results
  const updatedDirectory = directory.map(contractor => {
    if (contractor.tsbc_fsr_license) {
      const verification = results.find(r => r.license_number === contractor.tsbc_fsr_license);
      if (verification) {
        return {
          ...contractor,
          tsbc_verified: verification.verified,
          tsbc_license_status: verification.license_status || contractor.tsbc_license_status,
          tsbc_license_expiry: verification.expiry_date || contractor.tsbc_license_expiry,
          tsbc_enforcement_actions: verification.enforcement_actions ?? contractor.tsbc_enforcement_actions,
          tsbc_last_verified: verification.timestamp
        };
      }
    }
    return contractor;
  });

  // Save results
  const outputFile = 'scripts/tsbc-verification-results.json';
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\n✅ Verification complete!`);
  console.log(`📄 Results saved to: ${outputFile}`);

  // Show summary
  const verified = results.filter(r => r.verified).length;
  const active = results.filter(r => r.license_status === 'active').length;
  const expired = results.filter(r => r.license_status === 'expired').length;

  console.log(`\n📊 Summary:`);
  console.log(`   Total licenses: ${results.length}`);
  console.log(`   Verified: ${verified}`);
  console.log(`   Active: ${active}`);
  console.log(`   Expired: ${expired}`);
  console.log(`   Not found: ${results.length - verified}`);
}

// Main CLI handler
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📖 TSBC License Verification Tool\n');
    console.log('Usage:');
    console.log('  node scripts/verify-tsbc-license.js <license-number>');
    console.log('  node scripts/verify-tsbc-license.js --batch <license1> <license2> ...');
    console.log('  node scripts/verify-tsbc-license.js --directory\n');
    console.log('Examples:');
    console.log('  node scripts/verify-tsbc-license.js FSR-A-12345');
    console.log('  node scripts/verify-tsbc-license.js --batch FSR-A-12345 FSR-A-23456');
    console.log('  node scripts/verify-tsbc-license.js --directory');
    return;
  }

  if (args[0] === '--directory') {
    await verifyDirectory();
  } else if (args[0] === '--batch') {
    const licenses = args.slice(1);
    const results = await batchVerify(licenses);
    console.log('\n📄 Results:', JSON.stringify(results, null, 2));
  } else {
    const result = await verifyLicense(args[0]);
    console.log('\n📄 Result:', JSON.stringify(result, null, 2));
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifyLicense, batchVerify, verifyDirectory };
