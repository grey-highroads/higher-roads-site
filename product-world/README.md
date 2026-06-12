# Visual Product World Builder

A structured brand intake, asset analysis, and prompt generation system for creating reusable visual product worlds.

The app helps creative teams translate brand strategy, product truth, uploaded assets, audience context, sensory cues, and commercial goals into a reusable prompt system for AI-assisted concept generation, high-fidelity World Boards, motion planning, 3D production, retail sell-in, and future SKU expansion.

## What this app does

The Visual Product World Builder turns messy brand inputs into a structured creative system.

It creates:

- Visual Product World Briefs  
- Asset Preservation Layers  
- World Bibles  
- Strict Worlds  
- Expanded Worlds  
- World Zones  
- Scene Prompts  
- Scene Driver Metadata  
- Output Specs  
- Global Negative Prompts  
- Creative Guardrails  
- Forbidden Drift Rules  
- Client Feedback Questions  
- Notion project records for reuse

The app does not treat prompt generation as a one-off task. It treats prompts as an operating layer for a brand’s visual system.

## Core concept

Most AI image workflows fail because they start with a visual request before defining the brand system.

This app starts with structured inputs:

- What is the product?  
- Who is it for?  
- What commercial job must the visuals perform?  
- What assets are locked?  
- What assets are editable?  
- What references should influence the world?  
- What references should be avoided?  
- What visual territory should the brand own?  
- What should stay consistent?  
- What should flex by channel, scene, SKU, or use case?

The output is not a single prompt.

The output is a reusable visual product world.

## Primary users

### Internal creative team

Higher Roads or another studio team uses the app to create strategy-backed prompt suites, World Boards, and production references.

### Client-facing intake users

A brand team completes an intake form and uploads assets. The studio then uses the app output to generate World Boards and production planning materials.

### Future engineers or architects

The app is designed around structured data, modular prompt generation, and reusable project records. Future work should preserve this separation between brand truth, world logic, scene execution, and production mode.

## Primary use cases

- Product world exploration  
- Brand asset analysis  
- High-fidelity World Board generation  
- Client alignment before 3D or animation production  
- Prompt suite generation  
- Packaging-aware concepting  
- Product-accurate visual prompt creation  
- Motion concept planning  
- Retail sell-in visual planning  
- Future SKU expansion  
- Reusing approved world logic from Notion

## Key terms

### Visual Product World

A reusable visual system that defines how a product shows up across imagery, motion, retail, social, ecommerce, and future SKUs.

It includes materials, lighting, environments, ingredients, motion behavior, audience cues, composition rules, and avoidances.

### World Board

A high-fidelity generated concept board that shows how the product could live across scenes, settings, materials, audiences, and motion moments.

A World Board is not final production art. It is used for client alignment.

### Asset Preservation Layer

The rule layer that defines which uploaded assets must be preserved, which can change, which are inspiration-only, which are competitors, and which should be avoided.

### World Bible

The stable strategic and visual rules that govern the whole product world.

### Strict World

The most controlled and ownable version of the product world.

Used for hero visuals, launch images, PDP hero assets, retail sell-in covers, trade show hero visuals, and campaign key art.

### Expanded World

A controlled extension of the approved world into additional environments, occasions, use cases, channels, and future SKU needs.

### World Zone

A reusable creative territory inside the product world.

A zone is not a single prompt. A zone can contain many scenes.

Examples:

- Signature Product World  
- Ingredient Intelligence World  
- Benefit State World  
- Performance Ritual World  
- Retail Precision World  
- Motion Protocol World  
- People-Led Occasion World  
- Outdoor Social Adventure World

### Scene

A specific execution inside a World Zone.

Example:

World Zone: People-Led Occasion World

Scenes:

- Rooftop First Round  
- Back Patio Before Dinner  
- Listening Lounge Kickoff  
- Hotel Balcony Arrival  
- Desert Firepit Pass-Around

### Scene Driver

The primary force defining a scene.

Supported scene drivers:

- product  
- ingredient  
- environment  
- people  
- motion  
- retail

A healthy World Board should include a balanced scene mix rather than only product and ingredient stills.

### Forbidden Drift

Project-specific ways the product world can go wrong over time.

Forbidden Drift helps prevent category confusion, visual sameness, cliché, clinical sterility, weak audience translation, or packaging errors.

## Product workflow

### 1\. Create project

User creates a new project with:

- Client name  
- Project name  
- Product name  
- Category  
- SKU or flavor  
- Commercial goal  
- Output intent

### 2\. Complete intake

The user completes a structured intake across sections:

- Business context  
- Product truth  
- Audience  
- Occasion  
- Brand state  
- Visual territory  
- Sensory inputs  
- Product and packaging rules  
- Asset system  
- Competitive filter  
- Approval constraints

### 3\. Upload assets

The user uploads brand and reference assets.

Each uploaded asset receives its own role and ruleset.

The app must never collapse all uploaded assets into one global rule.

### 4\. Analyze assets

The app extracts structured context from each asset.

Examples:

- Brand name  
- Product name  
- Colors  
- Typography notes  
- Logo notes  
- Packaging format  
- Label hierarchy  
- Claims  
- Visual motifs  
- Material cues  
- Lighting cues  
- Avoid traits  
- Editable elements  
- Locked elements  
- Accuracy risks

### 5\. Generate project asset context

The app compiles all asset analyses into a project-level asset context.

This context informs the prompt suite while preserving asset-specific rules.

### 6\. Generate prompt suite

The app generates a structured output that includes:

- Asset Preservation Layer  
- World Brief  
- World Bible  
- Strict World  
- Expanded World  
- World Zones  
- Scenes inside zones  
- Master World Prompt  
- Scene Prompts  
- Output Specs  
- Global Negative Prompt  
- Creative Guardrails  
- Forbidden Drift  
- Suggested First Asset Set  
- Client Feedback Questions

### 7\. Review and export

The user reviews, edits, copies, regenerates, exports, or saves the generated output.

### 8\. Save to Notion

The app writes structured project information to a Notion database so approved world logic can be reused later.

### 9\. Reuse for future work

Future prompts for the same brand or SKU should pull from the approved Notion record rather than starting from scratch.

## Output intent modes

The app supports separate output intents.

### World Board Mode

Purpose:

Client feedback on mood, world, lighting, audience, materials, scene logic, and product attitude.

Packaging:

May be approximate unless locked source assets are supplied.

Acceptable:

- Approximate packaging  
- Placeholder labels  
- Multi-panel concept boards  
- Scene mashups  
- Exploratory world styling  
- Imperfect label details  
- High-fidelity mood direction

World Board Mode disclaimer:

These images are directional concept frames for mood, world, lighting, materiality, audience, and scene logic. Packaging, typography, proportions, and product details may be approximate unless locked source assets are supplied.

### Product-Accurate Concept Mode

Purpose:

Create concept frames where brand and packaging accuracy matter.

Packaging:

Must preserve uploaded source-of-truth assets.

Used for:

- Client presentation frames  
- Product-accurate visual exploration  
- Packaging-aware composition  
- Production planning

### Production Build Mode

Purpose:

Move approved world direction into 3D, animation, compositing, ecommerce, retail, or campaign production.

Requires:

- Locked packaging  
- Approved logo  
- Approved label hierarchy  
- Product render or 3D model  
- Approved world rules  
- Channel-specific output specs  
- Motion behavior guidance  
- Production references

## Asset handling architecture

Each asset is controlled individually.

### Asset roles

Supported asset roles:

- Source of Truth  
- Editable Asset  
- World Influence  
- Competitor Reference  
- Avoid Reference

### Asset lock statuses

Supported lock statuses:

- locked  
- partially\_editable  
- editable  
- inspiration\_only  
- avoid

### Asset rule hierarchy

When generating prompts, asset-specific rules must be merged using this hierarchy:

1. Locked assets always win.  
2. Editable assets can change only in fields marked editable.  
3. Inspiration assets inform mood, lighting, material, composition, or aspiration.  
4. Competitor references inform differentiation and avoidances.  
5. Avoid references become negative prompt material.

### Example asset scenario

Logo asset:

- Role: Source of Truth  
- Lock status: locked  
- Rule: Preserve exactly. Do not redraw, retype, stylize, distort, recolor, simplify, or reinterpret.

Packaging asset:

- Role: Editable Asset  
- Lock status: partially\_editable  
- Rule: Packaging structure, can format, and layout can be explored, but any use of the locked logo must preserve the exact uploaded logo.

Correct prompt behavior:

Use the uploaded RhinoDart logo exactly as supplied. The uploaded packaging asset is editable and can be refined, but any visible logo must remain exact. Do not invent alternate logo typography or redraw the mark.

Incorrect prompt behavior:

Generate a vibrant orange RHINODART wordmark in bold condensed sans-serif.

The second version invites the model to fake the logo.

## Logo-safe placeholder mode

If exact logo or packaging assets are not supplied, the app should not encourage the model to invent readable logo typography.

Default prompt clause:

If exact logo or packaging assets are not supplied, do not attempt to recreate detailed logo typography or brand marks. Use a clean placeholder label system, partial crop, back-turned can, obscured mark, abstract brand block, or non-readable logo treatment so the visual world can be evaluated without inaccurate brand reproduction.

## Prompt modes

### Compact prompt mode

References the suite-level Asset Accuracy Lock.

Use when the prompt suite is used inside the app or exported with context.

Example:

Apply the RhinoDart Asset Accuracy Lock. Do not alter the can, logo, typography, colors, icon, claims, or format.

### Self-contained prompt mode

Repeats the full Asset Accuracy Lock inside every prompt.

Use when prompts are sent into external image tools that require each prompt to stand alone.

## Generated output structure

The recommended output schema should separate zones from scenes.

json {   "project": {     "client\_name": "",     "project\_name": "",     "product\_name": "",     "category": "",     "sku": "",     "commercial\_goal": "",     "output\_intent": ""   },   "asset\_preservation\_layer": {     "asset\_accuracy\_lock": "",     "locked\_assets": \[\],     "editable\_assets": \[\],     "world\_influence\_assets": \[\],     "competitor\_references": \[\],     "avoid\_references": \[\],     "logo\_safe\_mode": false,     "prompt\_preservation\_clause": ""   },   "world\_brief": {     "client": "",     "product": "",     "audience": "",     "commercial\_goal": "",     "core\_positioning": "",     "visual\_tension": "",     "world\_concept": "",     "what\_world\_communicates": "",     "what\_world\_avoids": ""   },   "world\_bible": {     "core\_world\_idea": "",     "visual\_constants": \[\],     "sensory\_constants": \[\],     "composition\_rules": \[\],     "lighting\_rules": \[\],     "material\_rules": \[\],     "forbidden\_territories": \[\]   },   "strict\_world": {     "definition": "",     "best\_use\_cases": \[\],     "visual\_rules": \[\],     "risks\_if\_overused": \[\]   },   "expanded\_world": {     "definition": "",     "approved\_environmental\_range": \[\],     "approved\_material\_range": \[\],     "approved\_occasion\_range": \[\],     "approved\_motion\_range": \[\],     "risk\_boundaries": \[\]   },   "world\_zones": \[     {       "zone\_name": "",       "zone\_purpose": "",       "commercial\_jobs": \[\],       "visual\_rules": \[\],       "material\_range": \[\],       "lighting\_range": \[\],       "composition\_range": \[\],       "ingredient\_behavior": \[\],       "best\_use\_cases": \[\],       "approved\_props": \[\],       "forbidden\_props": \[\],       "neighboring\_zone\_exclusions": \[\],       "scenes": \[         {           "scene\_name": "",           "scene\_driver": "",           "scene\_purpose": "",           "commercial\_job": "",           "audience\_or\_occasion": "",           "people\_present": "",           "primary\_environment": "",           "asset\_preservation\_status": "",           "prompt\_text": "",           "negative\_prompt": "",           "recommended\_crops": \[\],           "recommended\_use\_cases": \[\],           "client\_feedback\_question": "",           "world\_board\_use": "",           "production\_readiness": "",           "drift\_risks": \[\]         }       \]     }   \],   "global\_negative\_prompt": "",   "creative\_guardrails": \[\],   "forbidden\_drift": {     "category\_drift": "",     "tonal\_drift": "",     "ingredient\_drift": "",     "persona\_drift": "",     "material\_drift": "",     "lighting\_drift": "",     "motion\_drift": "",     "packaging\_drift": "",     "channel\_drift": ""   },   "suggested\_first\_asset\_set": \[\] }

## Scene driver strategy

A strong World Board should not rely only on product stills.

Recommended default World Board mix:

1. Product-led hero  
2. Ingredient-led proof scene  
3. Environment-led occasion scene  
4. People-led occasion scene  
5. Retail-led pack clarity scene  
6. Motion-led concept frame

### Product-led scene

Defines product presence, form, pack attitude, and visual authority.

### Ingredient-led scene

Proves quality, function, flavor, or formulation.

### Environment-led scene

Expands the world into a setting, occasion, or use context.

### People-led scene

Shows social identity, audience, and emotional role through human behavior.

### Retail-led scene

Tests shelf impact, pack clarity, category separation, and commercial credibility.

### Motion-led scene

Defines how the world moves in short-form animation, display loops, or launch film assets.

## People-led occasion scenes

People-led scenes answer:

Who does this product make me feel like when I choose it?

These scenes should not become generic lifestyle stock.

### People-led prompt rule

People define the atmosphere. Product should feel naturally integrated, visible enough to understand, but not staged like a product demo. Avoid ingredient clutter unless it supports the occasion.

### People-led drift risks

Avoid:

- Smiling stock-model energy  
- Obvious demographic shorthand  
- Frat-party behavior  
- Nightclub clichés  
- Staged product cheers unless requested  
- Generic executive or golf-buddy stereotypes  
- Making the product invisible  
- Overusing rooftop scenes  
- Over-polished lifestyle stock composition

### People-led examples for premium RTD cocktail

- Rooftop first round  
- Back patio dinner start  
- Listening room hang  
- Hotel balcony arrival  
- Desert firepit pass-around  
- Post-golf clubhouse table  
- Boat dock golden hour  
- Low-key house party kitchen island

## World zone requirements

Each World Zone must vary at least three of these items from other zones:

- Commercial job  
- Physical setting  
- Material palette  
- Composition style  
- Camera angle  
- Lighting behavior  
- Ingredient behavior  
- Use occasion  
- Channel output  
- Motion behavior

Each zone must include:

- Primary environment  
- Approved props  
- Forbidden props  
- Lighting range  
- Audience or occasion  
- Camera behavior  
- Neighboring-zone exclusions

This prevents a world from becoming one campaign look with multiple camera angles.

## Fixed versus flexible language

The app should distinguish fixed strategic language from flexible physical language.

### Fixed strategic language

These stay consistent across prompts:

- Core positioning  
- Audience state  
- Desired emotional effect  
- World concept  
- Visual tension  
- Brand promise  
- Ingredient role  
- Functional promise  
- Forbidden territories

### Flexible physical language

These should vary by zone:

- Props  
- Surfaces  
- Vessels  
- Camera angle  
- Product placement  
- Exact lighting direction  
- Exact shadow angle  
- Ingredient arrangement  
- Environmental cues  
- Material stack  
- Degree of abstraction  
- Composition density

Rule:

Do not repeat the same physical material stack across every scene unless the user marks those materials as required constants.

## Clinical drift control

Precision cues can help functional products feel intelligent, but they can also make beverages feel sterile or medicinal.

### High-risk language

Use carefully:

- Laboratory glassware  
- Lab  
- Beakers  
- Clinical  
- Sterile  
- Protocol  
- Scientific apparatus  
- White room  
- Medical blue or green  
- Excessive acrylic  
- Formula language without clear reason

### Preferred alternatives

Use more often:

- Architectural glass  
- Scientific glass architecture  
- Angular glass vessels  
- Crystalline structure  
- Mineral clarity  
- Ingredient architecture  
- Controlled suspension  
- Precise botanical arrangement  
- Structured refreshment  
- Ingredient proof  
- Ingredient integrity

### Acceptance rule

If the output uses scientific or precision cues, it must still feel like a desirable beverage, not a supplement lab, medicine, or sterile demonstration.

## Category-specific logic

### Functional beverage

Avoid:

- Spa cliché  
- Medical supplement tone  
- Vague wellness haze  
- Psychedelic cues  
- Ingredient clutter  
- Soft decorative botanicals unless the brand requires it

Protect:

- Refreshment  
- Function  
- Daily ritual  
- Ingredient trust  
- Benefit clarity  
- Health-conscious performance

### Alcohol and RTD cocktail

Avoid:

- Frat-party cues  
- Beer-buddy clichés  
- Aggressive masculinity  
- Energy drink chaos  
- Nightclub strobes  
- Cheap liquor store aesthetics  
- Overly serious spirits photography  
- Invented heritage or sourcing claims

Protect:

- Occasion  
- Appetite appeal  
- Craft cues  
- Social role  
- Ingredient truth  
- Premium but accessible behavior  
- Brand legality and claims accuracy

### Premium wellness

Avoid:

- Generic pastel wellness  
- Over-soft botanicals  
- Medical sterility  
- Overused spa surfaces  
- Supplement cliché

Protect:

- Sensory clarity  
- Product credibility  
- Ritual  
- Freshness  
- Composure  
- Believable benefit expression

## Ingredient truth logic

Ingredient scenes should include all primary product truths, not only the most photogenic ingredient.

Example for tequila RTD:

Core ingredient truths may include:

- Tequila  
- Agave  
- Wildflower honey  
- Citrus liqueur  
- Lime  
- Ice  
- Salt

Approved visual cues may include:

- Agave leaf texture  
- Agave fiber  
- Volcanic stone  
- Lime oil  
- Citrus liqueur glow  
- Salt crystal restraint  
- Honey viscosity  
- Amber liquid behavior  
- Tequila glass reflection  
- Craft cocktail ice

Important rule:

Do not invent heritage, sourcing, tequila type, region, distillery, or craft claims unless those details are supplied and approved.

## Audience-to-environment translation

Audience should translate into indirect environment cues, not literal demographic clichés.

### Example: Socially adventurous male, first drink before night out

Desired state:

Confident, anticipatory, refined.

Indirect cues:

- Hotel balcony ledge  
- City twilight reflection  
- Cold can  
- Cut lime  
- Low amber practical light  
- Dark linen  
- Ice glass  
- Travel surface

Avoid:

- Crowds  
- Club lights  
- Beer group  
- Frat energy  
- Aggressive masculinity

### Example: High-performing parent morning reset

Desired state:

Composed, clear, ready.

Indirect cues:

- Cold can on clean kitchen stone  
- Stroller shadow crossing edge of frame  
- School calendar corner  
- Lime peel  
- Mineral condensation  
- Structured morning light

Avoid:

- Messy kitchen  
- Smiling parent  
- Toys  
- Chaos  
- Sentimental warmth  
- Stock family imagery

## Notion integration

The Notion database stores reusable project intelligence.

Recommended fields:

- Project Name  
- Client  
- Product  
- Category  
- SKU  
- Commercial Goal  
- Output Intent  
- Asset Accuracy Lock  
- Prompt Mode  
- Source-of-Truth Assets  
- Editable Assets  
- World Influence Assets  
- Competitor References  
- Avoid References  
- Locked Brand Elements  
- Flexible Brand Elements  
- World Brief  
- World Bible  
- Strict World  
- Expanded World  
- World Zones  
- Zone Scenes  
- Scene Drivers  
- Audience-to-Environment Translation  
- Lighting Range  
- Ingredient Truth Notes  
- Category-Specific Avoidances  
- Creative Guardrails  
- Forbidden Drift  
- Scene-Level Drift Risks  
- Suggested First Asset Set  
- Client Feedback Questions  
- Approved Zones  
- Rejected Zones  
- Generated Versions  
- Last Updated  
- Status

Recommended Notion statuses:

- Intake  
- Asset Review  
- World Generated  
- World Board Review  
- Client Review  
- Approved World  
- In Production  
- Archived

## Future SKU reuse

For future SKU work, pull forward:

- Asset Preservation Layer  
- World Bible  
- Strict World  
- Expanded World  
- Approved World Zones  
- Audience-to-Environment Translation  
- Global Negative Prompt  
- Creative Guardrails  
- Forbidden Drift

Allow updates to:

- Flavor cues  
- Ingredient behavior  
- SKU color accents  
- Benefit emphasis  
- Scene selection  
- Asset set recommendations  
- Channel-specific outputs

## Quality checks

Before finalizing a prompt suite, the system should check:

1. Are zones and scenes separate?  
2. Does each zone contain at least one scene?  
3. Does each scene have a declared scene driver?  
4. Does the World Board include more than product and ingredient scenes?  
5. Are people-led scenes included when audience or social occasion matters?  
6. Do multiple scenes overuse the same environment?  
7. Do multiple scenes overuse the same prop set?  
8. Do multiple scenes overuse the same lighting setup?  
9. Does the output preserve locked assets?  
10. Does the output avoid generating readable logos without source assets?  
11. Are editable assets scoped correctly?  
12. Does the output avoid category cliché?  
13. Does Forbidden Drift include category, tone, ingredient, persona, material, lighting, motion, packaging, and channel risks?  
14. Does each scene include drift risks?  
15. Does each scene include a client feedback question?  
16. Does the Notion record contain reusable world logic?

## Example: RhinoDart learnings

Recent RhinoDart tests showed:

- Ingredient-led and bar-led scenes looked strong, but too similar across outputs.  
- Desert outdoor social adventure created a stronger zone shift.  
- People-led rooftop occasion better answered “who is this for?”  
- Logo fidelity failed when the app treated locked logo and editable packaging too broadly.  
- The app needs asset-level rules, not one global asset mode.  
- The World Board should include product-led, ingredient-led, environment-led, people-led, retail-led, and motion-led scenes.  
- Zone prompts need approved props and forbidden props.  
- People-led scenes need specific anti-stock guardrails.  
- Logo-safe placeholder mode should be used when exact locked brand assets are missing.

## Example: Mindbloom learnings

Mindbloom tests showed:

- The product world direction was strong.  
- The output was too locked into one material stack.  
- World Zones are necessary to prevent sameness.  
- “Lab” and “laboratory glassware” can create clinical drift.  
- Product packaging should be preserved only when source-of-truth assets exist.  
- World Board Mode can tolerate approximate packaging, but Production Build Mode cannot.  
- The system should separate strict world from expanded world.

## MVP acceptance criteria

The app is working as intended if:

1. A user can create a project.  
2. A user can complete the structured intake.  
3. A user can upload multiple assets.  
4. Each asset can have its own role and lock status.  
5. The app analyzes each asset individually.  
6. The app preserves locked assets in generated prompt instructions.  
7. The app permits editable assets only within marked editable elements.  
8. The app distinguishes inspiration, competitor, and avoid references.  
9. The app generates an Asset Preservation Layer.  
10. The app generates a World Brief.  
11. The app generates a World Bible.  
12. The app generates Strict World and Expanded World sections.  
13. The app generates World Zones above scenes.  
14. Each zone can contain multiple scenes.  
15. Each scene has a scene driver.  
16. The app generates a balanced World Board mix.  
17. The app generates Forbidden Drift.  
18. The app generates client feedback questions.  
19. The app supports World Board Mode and Production Build Mode.  
20. The app writes reusable project data to Notion.  
21. Future project work can reuse approved world logic.

## Architecture notes

The app should treat prompt generation as structured transformation.

Input:

- Brand intake  
- Asset rules  
- Asset analysis  
- Audience context  
- Commercial goal  
- Output intent  
- Notion project memory

Transformation:

- Normalize intake  
- Analyze assets  
- Build asset context  
- Resolve rule conflicts  
- Build world layers  
- Generate zones  
- Generate scenes  
- Apply output specs  
- Apply drift checks  
- Persist reusable data

Output:

- Structured prompt suite  
- Client-readable World Board logic  
- Notion project record  
- Copyable scene prompts  
- Production planning reference

## Core implementation principle

Do not let the LLM invent the brand when source assets exist.

Do not let the LLM flatten a product world into one campaign look.

Do not let the LLM confuse a creative territory with a single scene prompt.

Do not let the LLM treat audience as demographic shorthand.

Do not let the LLM create final-production expectations in World Board Mode.

## Strategic principle

The app does not sell AI images.

It sells faster visual alignment before strategy, 3D, animation, retail, ecommerce, and campaign production.

A moodboard shows references from elsewhere.

A World Board shows generated scenes from the brand’s own emerging visual system.

The final value is not the prompt.

The final value is a reusable product world.  
