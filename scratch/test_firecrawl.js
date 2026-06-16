const apiKey = 'fc-3a88ac3c9ad84d418e79f3eee5b7b228';

async function testFirecrawl() {
  console.log('Sending scrape request to Firecrawl for https://example.com ...');
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://example.com',
        formats: ['markdown']
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('\n=== FIRECRAWL SCRAPE SUCCESS ===');
      console.log('Title:', data.data.metadata?.title || 'No title');
      console.log('Markdown snippet:\n');
      console.log(data.data.markdown ? data.data.markdown.substring(0, 500) + '...' : 'No markdown returned');
      console.log('=================================\n');
    } else {
      console.error('Firecrawl API Error:', data);
    }
  } catch (error) {
    console.error('Request Exception:', error);
  }
}

testFirecrawl();
