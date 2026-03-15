const https = require('https');

function search(query) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams({ q: query }).toString();
    const options = {
      hostname: 'lite.duckduckgo.com',
      port: 443,
      path: '/lite/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  const brands = [
    "Fischer SAC telefone Brasil",
    "Midea Springer Carrier Comfee SAC telefone Brasil",
    "Panasonic Brasil SAC telefone",
    "Lenoxx SAC telefone Brasil",
    "Gradiente SAC telefone Brasil",
    "Intelbras SAC telefone Brasil",
    "Karcher Brasil SAC telefone",
    "Colormaq SAC telefone Brasil"
  ];

  for (const brand of brands) {
    console.log(`\n--- Searching: ${brand} ---`);
    const html = await search(brand);
    // Simple regex to extract text inside class "result-snippet"
    const snippets = html.match(/<td class='result-snippet'[^>]*>(.*?)<\/td>/g);
    if (snippets) {
      snippets.slice(0, 3).forEach(s => {
        console.log(s.replace(/<[^>]+>/g, '').trim());
      });
    } else {
      console.log("No snippets found");
    }
    // Extract phones like 0800... or 4004... or (XX) ...
    const phones = html.match(/(?:0800[\s-]?\d{3}[\s-]?\d{4})|(?:400[34][\s-]?\d{4})|(?:\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4})/g);
    if (phones) {
      console.log("Phones found:", [...new Set(phones)]);
    }
  }
}

run();
