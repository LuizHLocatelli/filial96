import urllib.request
import urllib.parse
import re
import time

brands = [
    "Acer Brasil", "Arno Brasil", "Asus Brasil", "Apple Brasil",
    "Britânia Eletrodomésticos", "Philco Brasil", "Electrolux Brasil",
    "LG Brasil", "Samsung Brasil", "Mondial Eletrodomésticos", "Motorola Brasil"
]

for brand in brands:
    query = urllib.parse.quote(f"telefone SAC suporte {brand}")
    url = f"https://html.duckduckgo.com/html/?q={query}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
        urls = re.findall(r'<a class="result__url" href="([^"]+)">([^<]+)</a>', html, re.IGNORECASE | re.DOTALL)
        print(f"=== {brand} ===")
        for i in range(min(3, len(snippets))):
            clean_snippet = re.sub(r'<[^>]+>', '', snippets[i]).strip()
            # fix duckduckgo url redirects
            url_match = urls[i][1].strip() if i < len(urls) else "N/A"
            print(f"- {clean_snippet}")
            print(f"  Source: {url_match}")
    except Exception as e:
        print(f"Error for {brand}: {e}")
    time.sleep(1)

