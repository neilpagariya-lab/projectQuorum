import json
import urllib.request
import urllib.parse
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

movies_file = "src/data/movies.ts"
with open(movies_file, "r") as f:
    content = f.read()

# Find all movies
movie_titles = re.findall(r"title:\s*'([^']+)'", content)

url_map = {}
for title in movie_titles:
    query = urllib.parse.quote(title)
    url = f"https://itunes.apple.com/search?term={query}&entity=movie&limit=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data['resultCount'] > 0:
                artwork = data['results'][0]['artworkUrl100']
                # Change to 600x600 for better quality
                high_res = artwork.replace('100x100bb.jpg', '600x900bb.jpg')
                url_map[title] = high_res
            else:
                url_map[title] = 'https://placehold.co/600x900/1a1a1a/ffffff?text=' + urllib.parse.quote(title)
    except Exception as e:
        print(f"Failed for {title}: {e}")
        url_map[title] = 'https://placehold.co/600x900/1a1a1a/ffffff?text=' + urllib.parse.quote(title)

def replace_poster(match):
    full_match = match.group(0)
    title = match.group(1)
    if title in url_map:
        new_poster = url_map[title]
        # Replace the poster emoji with the url
        # Check if it was an emoji or already a url
        return re.sub(r"poster:\s*'[^']+'", f"poster: '{new_poster}'", full_match)
    return full_match

# Update the content
new_content = re.sub(r"title:\s*'([^']+)'.*?poster:\s*'[^']+'", replace_poster, content, flags=re.DOTALL)

with open(movies_file, "w") as f:
    f.write(new_content)

print("Done updating posters.")
