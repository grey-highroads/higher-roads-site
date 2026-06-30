# Riggg Factory Scene POC v4.1

This fixes v4 by embedding concept data directly in `main.js` as fallback.

Clicks work even if `content/concepts.json` fails to load.

## Run on GitHub Pages

Upload these files and folders to the repo root:

assets/
content/
index.html
main.js
README.md
styles.css

Then enable GitHub Pages from main branch root.

## Local preview

Double-clicking index.html should work because concept data is embedded.

For the full JSON override test, run:

python3 -m http.server 8000

Then open:

http://localhost:8000
