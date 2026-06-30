# Riggg Factory Browser POC v2

A browser proof of concept for turning the Riggg factory render into an interactive explainer.

## What changed in v2

- Five clickable machine hotspots
- Different content for Produce, Package, Publish, Prove, and Preserve
- A factory loop button
- Animated workflow packets moving through the factory
- A score card that updates per stage
- A machine activity meter inside the info panel
- Hover feedback on hotspots
- A gnome scramble button for a playful interaction
- Ambient glow overlays
- Escape key closes the panel

## Run locally

Open `index.html` in a browser.

For a local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Files

- `index.html`: page structure and controls
- `styles.css`: layout, hotspots, panels, motion, responsive behavior
- `main.js`: click states, workflow sequence, score updates
- `assets/factory-bg.png`: Riggg factory render

## Demo script

1. Open the page.
2. Click Produce and show the machine panel.
3. Click Package, Publish, Prove, and Preserve to show how each station explains the repo.
4. Click Run factory loop to show the whole workflow.
5. Click Gnome scramble as a playful proof of animation logic.

## Next steps

- Replace circular hotspots with SVG hit regions matching the actual machines.
- Add sound effects for switches, tubes, and score stamps.
- Split the render into layers for parallax.
- Add small looped sprite animations for gnomes, gauges, lights, and conveyor belts.
- Move stage content into a JSON file for easier editing.
