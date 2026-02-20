/**
 * Debug script to inspect TSBC form structure
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const TSBC_SEARCH_URL = 'https://www.technicalsafetybc.ca/regulatory-resources/find-a-licensed-contractor/';

async function debugForm() {
  console.log('🔍 Inspecting TSBC form structure...\n');

  const browser = await puppeteer.launch({
    headless: false, // Run visible so we can see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    await page.goto(TSBC_SEARCH_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Save full HTML
    const html = await page.content();
    fs.writeFileSync('scripts/tsbc-form.html', html);
    console.log('✅ Saved HTML to: scripts/tsbc-form.html');

    // Extract all buttons and inputs
    const formElements = await page.evaluate(() => {
      const result = {
        buttons: [],
        inputs: [],
        labels: [],
        technologyElements: []
      };

      // Find all buttons
      document.querySelectorAll('button').forEach(btn => {
        result.buttons.push({
          text: btn.innerText.trim(),
          id: btn.id,
          className: btn.className,
          type: btn.type,
          value: btn.value
        });
      });

      // Find all inputs
      document.querySelectorAll('input').forEach(input => {
        result.inputs.push({
          type: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          value: input.value,
          className: input.className
        });
      });

      // Find all labels
      document.querySelectorAll('label').forEach(label => {
        result.labels.push({
          text: label.innerText.trim(),
          htmlFor: label.htmlFor,
          className: label.className
        });
      });

      // Find elements containing "refrigeration" or "technology"
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const text = el.innerText || el.textContent || '';
        if (text.toLowerCase().includes('refrigeration') ||
            text.toLowerCase().includes('technology')) {
          result.technologyElements.push({
            tag: el.tagName,
            text: text.substring(0, 100),
            id: el.id,
            className: el.className
          });
        }
      });

      return result;
    });

    // Save form elements
    fs.writeFileSync(
      'scripts/tsbc-form-elements.json',
      JSON.stringify(formElements, null, 2)
    );
    console.log('✅ Saved form elements to: scripts/tsbc-form-elements.json');

    console.log('\n📊 Form Analysis:');
    console.log(`   Buttons: ${formElements.buttons.length}`);
    console.log(`   Inputs: ${formElements.inputs.length}`);
    console.log(`   Labels: ${formElements.labels.length}`);
    console.log(`   Technology-related elements: ${formElements.technologyElements.length}`);

    console.log('\n🔘 Technology Buttons:');
    formElements.buttons
      .filter(btn => btn.text.toLowerCase().includes('refrigeration') ||
                     btn.text.toLowerCase().includes('electrical') ||
                     btn.text.toLowerCase().includes('gas'))
      .forEach(btn => {
        console.log(`   - "${btn.text}"`);
        console.log(`     ID: ${btn.id}, Class: ${btn.className}`);
      });

    // Wait 10 seconds so you can inspect the page
    console.log('\n⏳ Browser will stay open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } finally {
    await browser.close();
  }
}

debugForm().catch(console.error);
