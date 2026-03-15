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
    "Fischer SAC atendimento telefone Brasil",
    "Midea SAC telefone Brasil suporte",
    "Panasonic Brasil SAC telefone consumidor",
    "Lenoxx SAC telefone Brasil",
    "Gradiente SAC telefone Brasil",
    "Intelbras SAC telefone Brasil",
    "Karcher Brasil SAC telefone suporte",
    "Colormaq SAC telefone Brasil"
  ];

  for (const brand of brands) {
    console.log(`\n--- Searching: ${brand} ---`);
    const html = await search(brand);
    // Find snippets
    const parts = html.split('class="result-snippet">');
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i++) {
        const text = parts[i].split('</td>')[0].replace(/<[^>]+>/g, '').trim();
        console.log("- " + text);
        if (i >= 4) break;
      }
    } else {
        const p2 = html.split('class="result-snippet"');
        if (p2.length > 1) {
            for (let i = 1; i < p2.length; i++) {
                const text = p2[i].split('</td>')[0].split('>').slice(1).join('>').replace(/<[^>]+>/g, '').trim();
                console.log("- " + text);
                if (i >= 4) break;
            }
        }
    }
  }
}

run();
