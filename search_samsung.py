import urllib.request
import urllib.parse
import re

brands = [
    "Samsung suporte tecnico telefone 4004",
    "Electrolux SAC capitais",
    "Apple Brasil 0800 suporte"
]

for brand in brands:
    query = urllib.parse.quote(brand)
    url = f"https://html.duckduckgo.com/html/?q={query}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
        urls = re.findall(r'<a class="result__url" href="([^"]+)">([^<]+)</a>', html, re.IGNORECASE | re.DOTALL)
        print(f"=== {brand} ===")
        for i in range(min(2, len(snippets))):
            clean_snippet = re.sub(r'<[^>]+>', '', snippets[i]).strip()
            url_match = urls[i][1].strip() if i < len(urls) else "N/A"
            print(f"- {clean_snippet}")
            print(f"  Source: {url_match}")
    except Exception as e:
        pass
