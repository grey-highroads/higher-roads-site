# Riggg Factory Fetching POC v3

This version proves the fetching architecture discussed for the Riggg Factory interactive demo.

## What this proves

- The page renders immediately with fallback content.
- A small manifest loads on page open.
- Machine detail is fetched only when a workstation gets clicked.
- Detail JSON is cached in memory after the first click.
- If fetching fails, fallback content keeps the demo working.
- The next likely station can be prefetched quietly after a click.

## File structure

```text
index.html
styles.css
main.js
assets/
  factory-bg.png
content/
  factory-manifest.json
  stages/
    produce.json
    package.json
    publish.json
    prove.json
    preserve.json
```

## Run locally

Because this version uses `fetch()`, open it through a local server instead of double-clicking `index.html`.

From inside this folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Demo script

1. Load the page.
2. Watch the status pill change from fallback to fresh manifest.
3. Click Produce.
4. The panel opens with fallback/loading content, then swaps to fetched detail.
5. Click Produce again.
6. The panel loads from memory cache.
7. Click Show cache.
8. Click Run factory loop to trigger all machine detail loads.

## Architecture decision

This POC uses local JSON files instead of pulling directly from GitHub raw URLs.

For production, the same pattern stays intact:

- Page load fetches a small manifest.
- Click fetches only the selected station detail.
- Fallback copy stays embedded in JavaScript.
- Loaded detail stays cached in memory.
- A GitHub Action or build script can regenerate the JSON from the live repo daily.

## Why not fetch the full repo on page load?

The repo changes often, but the viewer only needs the visible factory map at first. Fetching every obscure concept would add network cost and parsing work for content the viewer might never open.

The manifest plus lazy-detail pattern keeps the page fresh without making the first load heavy.
