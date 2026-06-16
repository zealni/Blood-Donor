const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to website to establish session...');
  await page.goto('https://rs.kemkes.go.id/hospitals', { waitUntil: 'networkidle' });
  
  console.log('Fetching first page of hospitals from API...');
  const result = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/v1/hospitals?page=1&per_page=12');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  console.log('API call success:', result.success);
  if (result.success) {
    console.log('Total data keys:', Object.keys(result.data));
    console.log('Data sample (first item):', JSON.stringify(result.data.data?.[0], null, 2));
    console.log('Pagination metadata:', JSON.stringify(result.data.meta || result.data.pagination || result.data, null, 2));
  } else {
    console.error('Error fetching API:', result.error);
  }

  await browser.close();
}

run().catch(console.error);
