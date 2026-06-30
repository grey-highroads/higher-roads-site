# Riggg Factory Scene POC v4

This version proves the next UX direction.

What it proves:

- The factory image works as an overview map.
- Clicking a concept changes the visual scene by zooming and reframing the factory.
- Each concept updates a reusable card.
- Users save concepts to a tray.
- Users copy the current card or a saved brief.
- Content lives in static JSON served with the page.

Run locally with:

python3 -m http.server 8000

Then open:

http://localhost:8000

Deploy by uploading these to GitHub Pages or a Higher Roads route:

assets/
content/
index.html
main.js
README.md
styles.css

Suggested Higher Roads path:

labs/riggg-factory/

Next production step:

Replace the zoomed single-image detail scenes with five dedicated scene renders for Produce, Package, Publish, Prove, and Preserve.
