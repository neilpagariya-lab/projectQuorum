import os
import re
import urllib.request
import ssl

# Disable SSL verification to fix macOS Python certificate issues
ssl._create_default_https_context = ssl._create_unverified_context

POSTERS_DIR = "public/posters"
os.makedirs(POSTERS_DIR, exist_ok=True)

with open("src/data/posters.ts", "r") as f:
    content = f.read()

matches = re.findall(r"'([^']+)': `\$\{T\}/([^`]+)`", content)
base_url = "https://image.tmdb.org/t/p/w500/"

for key, img_path in matches:
    url = base_url + img_path
    filepath = os.path.join(POSTERS_DIR, f"{key}.jpg")
    if not os.path.exists(filepath):
        print(f"Downloading {key}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
                out_file.write(response.read())
        except Exception as e:
            print(f"Failed to download {key}: {e}")

print("Done downloading posters.")
