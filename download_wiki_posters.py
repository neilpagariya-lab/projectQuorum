import os
import json
import urllib.request
import urllib.parse
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
POSTERS_DIR = "public/posters"
os.makedirs(POSTERS_DIR, exist_ok=True)

# Read titles from movies.ts
with open("src/data/movies.ts", "r") as f:
    content = f.read()

import re
matches = re.findall(r"id: '([^']+)', title: '([^']+)'", content)

def get_wiki_image(title):
    search_query = urllib.parse.quote(title + " film")
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={search_query}&utf8=&format=json"
    
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            if not data['query']['search']: return None
            page_title = data['query']['search'][0]['title']
            
        page_query = urllib.parse.quote(page_title)
        img_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={page_query}&prop=pageimages&format=json&pithumbsize=500"
        
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            pages = data['query']['pages']
            page_id = list(pages.keys())[0]
            if 'thumbnail' in pages[page_id]:
                return pages[page_id]['thumbnail']['source']
    except Exception as e:
        print(f"Error finding {title}: {e}")
    return None

for key, title in matches:
    filepath = os.path.join(POSTERS_DIR, f"{key}.jpg")
    if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
        continue # Already downloaded successfully
        
    print(f"Fetching {title}...")
    img_url = get_wiki_image(title)
    if img_url:
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
                out_file.write(response.read())
            print(f" -> Downloaded {title}")
        except Exception as e:
            print(f" -> Failed to download image for {title}: {e}")
    else:
        print(f" -> No image found for {title}")

print("Done.")
