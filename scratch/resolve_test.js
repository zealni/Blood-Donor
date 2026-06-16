const https = require('https');

function resolveUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(res.headers.location);
      } else {
        resolve(url);
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function test() {
  const shortUrl = 'https://maps.app.goo.gl/xscD1cN6yKwfhtZp7';
  console.log('Resolving:', shortUrl);
  try {
    const longUrl = await resolveUrl(shortUrl);
    console.log('Long URL:', longUrl);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
