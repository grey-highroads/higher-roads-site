# Visual Product World Builder

**Current version: v6.5** — see the decisions log's Version History for what's changed and the versioning convention.

A structured brand-intake and prompt-generation tool for creating reusable visual product worlds for CPG and beverage clients.

This document covers the stable concepts and terminology behind the tool — the things that shouldn't change often. For the exact current schema, pipeline, and field names, see the **implementation spec**. For what's been decided (and explicitly rejected) and why, see the **decisions log**. For what's being considered next, see the **roadmap**.

---

## Core concept

Most AI image workflows fail because they start with a visual request before defining the brand system. This tool starts with structured inputs instead: what the product is, who it's for, what commercial job the visuals need to do, which assets are locked vs. editable vs. inspiration vs. avoid, and what visual territory the brand should own versus stay away from.

The output is not a single prompt. It's a reusable visual product world: a set of persistent rules (world bible, strict world, expanded world, asset preservation rules, forbidden drift) plus a set of scene-level prompts that operate within those rules. The goal is that future work for the same brand — a new SKU, a new channel, a new campaign — can pull from the approved world logic rather than starting over.

---

## Key terms

**Visual Product World** — the reusable visual system for a product: materials, lighting, environments, ingredient behavior, audience cues, composition rules, and avoidances. Defines how the product shows up across imagery, motion, retail, social, and ecommerce.

**Asset Preservation Layer** — the per-asset rule set defining what's locked (must be preserved exactly), partially editable, fully editable, inspiration-only, or to be avoided. Every uploaded asset gets its own rules; nothing collapses into one global mode.

**World Bible** — the stable strategic and visual rules governing the whole product world (core idea, visual/sensory/composition/lighting/material/emotional rules, forbidden territories).

**Strict World** — the most controlled, ownable version of the world. Used for hero visuals, launch images, and other high-stakes assets where accuracy matters most.

**Expanded World** — a controlled extension of the approved world into additional environments, materials, and occasions, without breaking what makes the world recognizable.

**World Zone** — a reusable creative territory within the product world. A zone defines persistent rules (commercial job, primary environment, approved/forbidden props, material and lighting range) — it is not itself a single prompt. There are exactly six zones, always generated in this order: Signature Product World, Ingredient Intelligence, Benefit State, Performance Ritual, Retail Precision, Motion Protocol.

**Scene** — a specific execution within a World Zone: one occasion, one prompt, its own negative prompt and drift risks. Example: within the Benefit State zone, a scene might show a single person in a calm morning setting, with `scene_driver: people` and `people_present: partial_figures` — driven by audience and emotional state rather than the product itself. MVP generates one scene per zone (six scenes total).

**Scene Driver** — the primary force defining a scene: product, ingredient, environment, people, motion, or retail. Each of the six zones has a default driver, so a generated World Board naturally includes a mix rather than six product-or-ingredient stills.

**World Board** — the generated set of scenes shown to a client for alignment on mood, world, audience, and direction. Not final production art — packaging, typography, and proportions may be approximate unless locked source assets were supplied (the tool surfaces this as a disclaimer automatically when relevant).

**Production Contract** — a client-derived (not model-generated) summary stating the locked-asset policy, scene generation strategy, product fidelity requirement, and which regions of each scene are acceptable vs. unacceptable to drift, compiled from every scene's production-handoff fields.

**Forbidden Drift** — project-specific ways the world can go wrong over time: category confusion, visual sameness, cliché, sterility, weak audience translation, packaging errors.

---

## Primary users

**Internal creative team** — the current and only user of the deployed tool. The Higher Roads team completes the intake (informed by conversations with the client, brand materials, etc.), optionally uploads assets, reviews the generated analysis and asset rules, and generates/saves the prompt suite. The tool sits behind a single shared internal password.

**Future engineers or architects** — anyone extending the tool should preserve the separation between brand truth (intake), world logic (bible/strict/expanded), and scene execution (zones/scenes/prompts). These are different layers with different lifespans — world logic should be stable across SKUs; scene execution varies.

A client-facing intake variant (clients completing their own intake directly) has been discussed but does not exist — see the roadmap.

---

## Sharing this with external collaborators

If you're picking this up as context for a related build (e.g. a downstream Comfy/production workflow app), read in this order:

1. **This README** — concepts and terminology.
2. **Implementation spec** — the exact output schema (including per-scene production-handoff fields like `render_mode`, `protected_regions`, `mask_requirements`, `required_assets`), the three-call generation pipeline, asset role taxonomy, and the Notion property schema. This is the authoritative source for field names and shapes.
3. **Decisions log** — why things are shaped the way they are, and what was explicitly considered and rejected. Worth a skim so you don't propose something that's already been ruled out.
4. **Roadmap** — what's being considered next; useful for knowing what *might* change under you.
5. **Sample output (JSON / Markdown)** — a representative full suite for one project, generated via the tool's "Load sample output" Dev Tools button. Use this as a concrete reference for what real output looks like, alongside the schema in the implementation spec.

---

## Where to look for more

- **Implementation spec** — exact schema for every pipeline call, asset taxonomy, mode logic, Notion properties, and a list of things that are *not* currently built (even if they're described elsewhere).
- **Decisions log** — what was decided, what was considered and rejected, and why, plus the version history. Check here before re-proposing something that sounds like a good idea — it may already have been weighed.
- **Roadmap** — unbuilt ideas that are plausibly worth doing, not yet prioritized.
