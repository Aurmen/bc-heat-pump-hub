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
      headless: true,
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

    // Look for search input (common patterns)
    const searchInputSelectors = [
      'input[name*="license"]',
      'input[name*="number"]',
      'input[id*="search"]',
      'input[type="search"]',
      'input[type="text"]'
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

    // Look for search/submit button
    const buttonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Search")',
      'button:has-text("Find")'
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
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
        submitButton.click()
      ]);
    } else {
      // Try submitting via Enter key
      await searchInput.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

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
 * Extract license data from results page
 */
async function extractLicenseData(page, licenseNumber) {
  try {
    // Check if we got results or "no results found"
    const pageText = await page.evaluate(() => document.body.innerText);

    if (pageText.toLowerCase().includes('no results') ||
        pageText.toLowerCase().includes('not found')) {
      return {
        license_number: licenseNumber,
        verified: false,
        status: 'not_found',
        timestamp: new Date().toISOString()
      };
    }

    // Try to extract license information
    // This will need to be customized based on actual TSBC page structure
    const data = await page.evaluate(() => {
      const result = {
        contractor_name: '',
        license_type: '',
        license_status: 'unknown',
        expiry_date: null,
        specializations: [],
        enforcement_actions: 0
      };

      // Look for common patterns (to be refined)
      const text = document.body.innerText;

      // Try to extract status
      if (text.match(/active|valid|current/i)) {
        result.license_status = 'active';
      } else if (text.match(/expired|inactive/i)) {
        result.license_status = 'expired';
      } else if (text.match(/suspended|revoked/i)) {
        result.license_status = 'suspended';
      }

      // Try to extract contractor name
      const nameMatch = text.match(/(?:contractor|company|business)[\s:]+([^\n]+)/i);
      if (nameMatch) {
        result.contractor_name = nameMatch[1].trim();
      }

      // Try to extract expiry date
      const dateMatch = text.match(/(?:expir(?:y|es?)|valid until)[\s:]+(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i);
      if (dateMatch) {
        result.expiry_date = dateMatch[1];
      }

      return result;
    });

    return {
      license_number: licenseNumber,
      verified: true,
      ...data,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
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
