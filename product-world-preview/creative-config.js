// Higher Roads Product World Preview creative configuration.
// v3.0 creative-first-grammar with aesthetic mode: named director profiles were
// replaced in v2 by modular cinematic grammar. This build adds aesthetic mode
// as a first-class ideation and selection axis so the pipeline can produce
// documentary, editorial, and vernacular work when the brand identity asks for
// it, not only cinema. It also sharpens ideation on brand-native use evidence
// and rebalances human presence away from the trace-only default.
//
// Pipeline this config serves:
//   1. worldIdeationPrompt   -> three divergent world theses from the FULL brand dossier,
//                               each carrying a proposed aesthetic_mode and human_presence
//   2. thesisSelectionPrompt -> comparative selection of one thesis, up to three grammar
//                               modules, and a confirmed aesthetic_mode
//   3. artDirectorPrompt     -> one authored master scene in the selected mode's register
(function(){
  window.HR_CREATIVE_CONFIG = {
    config_version: 'creative-config-2026-07-24-aesthetic-mode-v3',
    version: 'creative-config-2026-07-24-aesthetic-mode-v3',

    fidelityNegatives: ['redrawn packaging','retyped label','altered label hierarchy','distorted pack proportions','recolored packaging','generated or fake product','warped logo','invented text on label'],

    rubricCriteria: [
      {key:'label_fidelity',label:'Label fidelity',ask:'Is the label the real one, not redrawn or retyped?'},
      {key:'proportions',label:'Pack proportions',ask:'Are the product proportions unchanged?'},
      {key:'color_accuracy',label:'Color accuracy',ask:'Are the brand and packaging colors correct?'},
      {key:'world_match',label:'World match',ask:'Does the environment match the scene brief?'},
      {key:'placement_realism',label:'Placement realism',ask:'Does the product sit believably in light, shadow, and scale?'},
      {key:'negative_adherence',label:'Negative adherence',ask:'Are excluded elements actually absent (people, forbidden colors, stay-away looks)?'},
      {key:'shippable',label:'Shippable',ask:'Would you show this to a founder as a preview?'}
    ],

    /* ===================== Aesthetic mode library =====================
       Aesthetic mode is a first-class variable in ideation, selection, and
       authoring. It sets the register of the authored prose and the opening
       framing sentence the compiler prepends. Mode is picked from brand
       evidence, not from category habit. Cinematic is the default fallback
       only when nothing has been chosen. */
    aestheticModes: [
      {
        id:'cinematic_film_still',
        name:'Cinematic film still',
        short:'Cinema',
        opening_line:'A wide cinematic campaign-film still in landscape framing, a real environment with depth and atmosphere, not a tabletop product photo.',
        scene_grammar:'Composed and deliberate, wide landscape, motivated cinema light with named sources, real environmental depth built in layers, product as a small but clear hero inside a larger world.',
        framing_notes:'Wide 16:9 landscape, deep depth of field, considered composition with one memorable spatial idea, product roughly a quarter of frame width and off-center.',
        human_presence_default:'trace_only',
        people_framing_rules:'When people appear, they are secondary to the world, often at middle distance, in motion, back or three-quarter turned, or partially obscured. The frame is composed around the world and the product, not around the face.',
        best_when:'the brand is premium, ritual, cinematic, heritage, design-led, or asks for elevated ceremony',
        avoid_when:'the brand identity is documentary, vernacular, casual, workwear, or explicitly people-centric in its own imagery',
        traps:['generic scenic overlook','category-home landscape','beautiful but claimable by any competitor','the desert-trailhead trap']
      },
      {
        id:'documentary_lifestyle',
        name:'Documentary lifestyle',
        short:'Documentary',
        opening_line:'An eye-level documentary photograph in the tradition of outdoor and lifestyle editorial, real and observed rather than staged.',
        scene_grammar:'Loose observed framing, camera at head height or slightly lower, real hands doing real tasks, natural motivated light without cinematic dressing, one shoulder or edge cropped by the frame. The product is operative to the scene, being used, held, staged, or about to be used, not placed for the camera.',
        framing_notes:'Head-height eye level, imperfect crop, shallow depth of field on the human action, product at readable scale in the operative third of frame. The way a companion on the trip would frame it.',
        human_presence_default:'primary_scale',
        people_framing_rules:'People are primary subjects. Reduce face-model risk with SAFE FACE FRAMINGS: a hat or cap brim shading the face, hair falling forward, hand-to-mouth or hand-to-face gestures such as drinking, breath, or task focus, downward gaze at a specific task, three-quarter turn away from camera, partial obscuration by environment or gear, motion blur, or partial defocus. Never center a full frontal close face at close range. Real posture, real gear condition, real focus on the task in hand.',
        best_when:'the brand shows people prominently in its own imagery: workwear, outdoor, hunt, fish, food service, hospitality, trades, farming, running, or any brand whose grid is people doing things',
        avoid_when:'the brand identity is object-first, minimalist, or premium in a way that visibly excludes bodies',
        traps:['posed people','model-shoot smile','commercial actor energy','styled to look documentary','fake candid','centered frontal close face']
      },
      {
        id:'editorial_commercial',
        name:'Editorial commercial',
        short:'Editorial',
        opening_line:'A composed editorial photograph in the tradition of magazine-cover lifestyle work, considered light and considered framing without cinematic drama.',
        scene_grammar:'Composed but not narrative, single strong subject with clear negative space, considered light with one dominant source, product and person or product and place in deliberate relationship, controlled color hierarchy.',
        framing_notes:'Medium composition, considered crop, magazine-cover proportion sensibility, restrained atmosphere, clarity is the mood.',
        human_presence_default:'brand_dependent',
        people_framing_rules:'When people appear, they are composed and considered. Faces are permitted but framed with intent: three-quarter angle, controlled light on the face, gaze directed with purpose. Never a stock-photo smile at camera; never a catalog stance.',
        best_when:'the brand is beauty, fashion, hospitality, premium wellness, design-led kitchenware, or any brand whose identity balances product and lifestyle in a composed register',
        avoid_when:'the brand needs documentary looseness, cinematic depth, or vernacular immediacy',
        traps:['catalog stillness','stock-photo posing','lifestyle cliche','overly styled']
      },
      {
        id:'vernacular_ugc',
        name:'Vernacular UGC',
        short:'Vernacular',
        opening_line:'A vernacular photograph in the register of a phone camera in daily life, incidental and immediate, not a commercial frame.',
        scene_grammar:'Off-angle, ambient available light, incidental composition, imperfect but authentic. The product is present the way it lands when a real person just took the photo. The frame is not composed for us.',
        framing_notes:'Slight camera tilt, ambient light, everyday distance, no dramatic depth, product where it actually is in the moment.',
        human_presence_default:'brand_dependent',
        people_framing_rules:'People appear the way they do in real phone photos: at hand distance, mid-motion, partial, sometimes only a hand or arm in frame. Faces are frequently partial, three-quarter, or off-frame entirely. Never a composed portrait.',
        best_when:'the brand is Gen-Z, streetwear, food, beverage-social, energy, or any brand whose grid explicitly performs authenticity over polish',
        avoid_when:'the brand is premium, ritual, luxury, heritage, or design-led',
        traps:['fake amateur','styled to look accidental','the over-composed vernacular','commercial pretending to be UGC']
      }
    ],

    /* ===================== Cinematic grammar module library =====================
       Behavior modules borrowable across aesthetic modes. Modules never carry
       place; place always comes from the brand-authored world thesis. Selection
       picks up to three per scene and never combines fighting modules. */
    grammarModules: [
      {
        id:'threshold_staging',
        name:'Threshold staging',
        grammar:'The product sits at the boundary between a controlled space and a larger force or opening beyond it: a doorway to weather, an interior opening onto scale, a counter meeting the street.',
        camera:'wide or medium-wide frame with the threshold readable as the spatial event of the image',
        light:'two light conditions meeting at the boundary, each with a physical source',
        atmosphere:'the outer condition (weather, crowd, distance, dark) presses lightly into the inner one',
        material:'the boundary itself has material presence: frame, glass, rail, sill, jamb',
        composition:'product in the foreground third, the threshold carrying midground depth, the larger world beyond it',
        object_treatment:'the product reads as the thing carried across, or the thing waiting at the edge',
        best_when:'the brand promise involves transition, readiness, escape, arrival, or a before-and-after state',
        avoid_when:'the brand world is a single sealed mood with no outside',
        traps:['threshold as decoration with nothing meaningfully on the other side']
      },
      {
        id:'operational_scale',
        name:'Operational scale',
        grammar:'The world is a working system larger than the product. Foreground product clarity, midground operational context, background scale through architecture, terrain, machinery, or distant figures.',
        camera:'wide frame with readable geography and layered depth',
        light:'motivated practical light from the working environment',
        atmosphere:'only what the system itself produces: steam, dust, spray, exhaust',
        material:'functional surfaces with evidence of use',
        composition:'clear hero product inside a system that visibly continues beyond the frame',
        object_treatment:'the product feels necessary, prepared, or depended on within the operation',
        best_when:'the brand needs credibility, function, field readiness, or engineering logic',
        avoid_when:'the brand needs softness, play, intimacy, or domestic warmth',
        traps:['generic industrial grit','product lost inside spectacle','military or tactical drift']
      },
      {
        id:'motivated_weather',
        name:'Motivated weather and atmosphere',
        grammar:'Rain, mist, spray, condensation, steam, snow, or dust as spatial structure, always with a visible physical source, deepening the world without hiding the product.',
        camera:'atmosphere used to separate depth planes',
        light:'light interacts with the particles: shafts, halos, wet reflection',
        atmosphere:'one weather condition, committed to, sourced, and consistent',
        material:'surfaces respond: wet pavement, beaded glass, damp fabric, dusted metal',
        composition:'product kept in the clearest air of the frame',
        object_treatment:'weather touches the product only as allowed integration effects',
        best_when:'the brand world benefits from mood, season, climate, or sensory charge',
        avoid_when:'the brand needs bright clinical clarity or dry graphic cleanliness',
        traps:['smoke with no source','atmosphere so heavy the label suffers']
      },
      {
        id:'light_through_particles',
        name:'Light through particles and materials',
        grammar:'Motivated light passing through smoke, rain, dust, glass, fabric, or haze so the air itself becomes visible and the frame gains density.',
        camera:'light direction legible; the beam or glow is a compositional element',
        light:'one dominant motivated source; secondary sources subordinate',
        atmosphere:'particles exist to catch light, sourced by the place',
        material:'translucent and reflective materials multiply the light behavior',
        composition:'product placed where the light lands or where it silhouettes cleanly',
        object_treatment:'light explains why the eye goes to the product',
        best_when:'the brand needs premium density, ritual, or beauty with tension',
        avoid_when:'the brand needs flat daylight cheer or catalog neutrality',
        traps:['unmotivated neon','over-smoked frames','darkness that swallows the pack']
      },
      {
        id:'architecture_as_meaning',
        name:'Architecture as meaning',
        grammar:'The built environment carries the social or emotional statement: institutional power, care, heritage, craft, or intimacy expressed through the room itself, in layered depth.',
        camera:'wide or medium-wide with architecture legible front to back',
        light:'light behaves the way that building actually lights: windows, practicals, skylights',
        atmosphere:'the room has air: dust motes, warmth, cold, echoing space',
        material:'surfaces that state the building age, wealth, labor, or care',
        composition:'product as locked hero inside architectural layers; props subordinate to the room',
        object_treatment:'the room explains why the product belongs and what it means here',
        best_when:'the brand has heritage, craft, hospitality, cultural, or design ambition',
        avoid_when:'the brand world is exterior, mobile, or anti-institutional',
        traps:['luxury surface with no meaning','architecture as backdrop wallpaper']
      },
      {
        id:'material_density',
        name:'Material density and patina',
        grammar:'Worn, reflective, layered, patinated surfaces creating tactility, status, and time: brass, stone, lacquer, leather, tile, worn paint, mirror, wet metal.',
        camera:'close enough that texture reads; depth still present',
        light:'raking or reflective light that makes surfaces speak',
        atmosphere:'minimal; the surfaces are the atmosphere',
        material:'three to five committed materials, not a catalog',
        composition:'the product finish plays against the environment finishes deliberately',
        object_treatment:'the pack reads as the newest or most cared-for object in a textured world',
        best_when:'the brand is premium, craft, heritage, or design-led',
        avoid_when:'the brand is disposable-bright or clinical',
        traps:['texture clutter','grime drifting onto the label']
      },
      {
        id:'compressed_intimacy',
        name:'Compressed intimacy',
        grammar:'A human-scaled, spatially compressed environment with emotional pressure: close walls, counters, corridors, cabins, booths. The viewer is nearby but not fully invited in.',
        camera:'counter-height or eye-level, close foreground edges, corridor or booth depth',
        light:'practical sources within arm reach: lamps, panels, sconces, screens turned away',
        atmosphere:'still air, hum, warmth, the residue of recent presence',
        material:'touched surfaces: worn laminate, fabric, glass, lacquer, tile',
        composition:'product sharp and near; the compressed space wraps it',
        object_treatment:'the product as private ritual object, the thing someone returns to',
        best_when:'the brand promise is personal, ritual, indulgent, or after-hours',
        avoid_when:'the brand needs open air, scale, or communal daytime energy',
        traps:['melancholy so heavy it drains appetite','mood swallowing the label']
      },
      {
        id:'practical_color',
        name:'Practical-source color saturation',
        grammar:'Saturated color cast by real in-world sources: signage glow, colored glass, screen spill, sodium lamps, stage light, dawn through a colored awning. Color is place logic, never a grade.',
        camera:'frame composed around where the colored light falls',
        light:'each color names its source; brand palette carried by light, not paint',
        atmosphere:'light haze or reflection may carry the color deeper',
        material:'reflective surfaces bounce and mix the sources',
        composition:'product in a color condition that keeps its packaging colors true',
        object_treatment:'colored environment light may spill on the pack without recoloring it',
        best_when:'the brand owns a strong palette or a nocturnal, social, or nostalgic energy',
        avoid_when:'packaging colors are fragile or the brand needs neutral daylight truth',
        traps:['red-green grade with no source','neon as decoration','palette overriding pack colors']
      },
      {
        id:'motion_around_hero',
        name:'Motion around a still hero',
        grammar:'The product stays tack sharp while the world moves around it: blurred passersby, traffic light streaks, spinning machinery, wind-thrown particles, a hand leaving frame.',
        camera:'shutter-drag feel; the still point is the product',
        light:'moving lights may streak; hero light on the product stays controlled',
        atmosphere:'movement implies time passing around a fixed object',
        material:'motion reads through reflective and light-carrying surfaces',
        composition:'stillness versus motion is the visual tension of the frame',
        object_treatment:'the product as the constant inside a moving world',
        best_when:'the brand promise involves pace, city energy, ritual repetition, or calm inside chaos',
        avoid_when:'the world is inherently still and the blur would feel imported',
        traps:['blur touching the product','motion as gimmick without story logic']
      },
      {
        id:'layered_framing',
        name:'Layered threshold framing',
        grammar:'The frame looks through something at the product: glass partitions, doorways, shelving gaps, mirrors, counters, hanging objects, foreground edges. Depth built from layers of looking.',
        camera:'foreground occluding edge, midground product, background context',
        light:'each layer holds its own light value',
        atmosphere:'reflections and transparency add a second image plane',
        material:'the framing device is a real object of the place',
        composition:'product framed, never obscured; occlusion touches environment, not pack',
        object_treatment:'being looked at through the world makes the product feel found, not staged',
        best_when:'the world has interior richness and the brand rewards discovery',
        avoid_when:'the packaging is small-labeled and needs maximum clarity',
        traps:['framing device covering identity','reflection confusion over the label']
      },
      {
        id:'cataloged_order',
        name:'Cataloged object order',
        grammar:'The product exists inside a place with rules where objects are logged, packed, served, shelved, or assigned: the ceremony of an organized world built around handling this object.',
        camera:'moderate distance; the system of the room readable',
        light:'service-counter, window, or skylight light with low drama',
        atmosphere:'paper dust, warmth, quiet occupation',
        material:'drawers, ledgers, labels, shelving, cases, hooks, wrapped goods',
        composition:'product as the clear subject of the room order; symmetry as support, never the concept',
        object_treatment:'the product feels checked in, prepared, cherished, or about to be handed over',
        best_when:'the brand is design-forward, gift, ritual, subscription, or collection driven',
        avoid_when:'the brand needs grit, speed, or raw realism; cuteness would cost credibility',
        traps:['pastel dollhouse drift','quirky props with no job','product altar']
      },
      {
        id:'frontal_clarity',
        name:'Frontal spatial clarity',
        grammar:'Frontal or lateral camera with readable geography and a controlled color hierarchy: the world presented plainly and confidently, tension carried by content rather than angle.',
        camera:'frontal or 90-degree lateral, moderate distance, minimal distortion',
        light:'even, motivated, low-to-medium contrast with protected product readability',
        atmosphere:'restrained; clarity is the mood',
        material:'planes and blocks of committed color and material',
        composition:'strong horizontals and verticals; product placed off-center within the order',
        object_treatment:'the product presented, almost introduced, by the frame',
        best_when:'packaging and palette are strong enough to carry a plain-spoken frame',
        avoid_when:'the packaging is weak and needs atmosphere to borrow interest',
        traps:['dead-center symmetry as the whole idea','flatness with no spatial depth']
      }
    ],

    /* ===================== Stage 3: world ideation ===================== */
    worldIdeationPrompt: `You are a senior creative director generating candidate campaign worlds for one brand. You will receive a full brand dossier: product truth, audience, brand state, visual territory, sensory language, competitive posture, campaign signals, visual identity read, and product facts. You will also receive the library of available aesthetic modes.

Generate exactly THREE divergent world theses. Each thesis is a candidate cinematic, documentary, editorial, or vernacular world this brand could own, complete with its aesthetic mode and human presence declaration.

AESTHETIC MODE IS A REAL VARIABLE. Each thesis names an aesthetic_mode from the library: cinematic_film_still, documentary_lifestyle, editorial_commercial, or vernacular_ugc. Choose mode from brand evidence, not from category habit or the pipeline's past preferences. Study the visual_identity read, campaign_signals, cultural_reference_points, and audience — those are the evidence for what mode this brand actually works in. If the brand's own imagery shows people at primary scale doing real things (workwear, outdoor, hunt, fish, food service, running, hospitality), documentary_lifestyle is the correct mode for the majority of theses. If the brand is premium, ritual, heritage, or design-led, cinematic_film_still or editorial_commercial fits. If the brand explicitly performs authenticity over polish (Gen-Z, streetwear, social food and beverage), vernacular_ugc is on the table. Never make all three theses the same mode — vary aesthetic mode as another divergence axis. Cinema is not the default; brand evidence is.

BRAND-NATIVE USE IS MANDATORY. AT LEAST ONE of the three theses must be drawn from specific evidence of how the brand's own audience actually uses this product — the exact activity, place, gear, and moment their own campaigns and visual identity show, not the category default. This is the anti-category-home rule. A thesis whose world could belong to any competitor in the category is the failure state, not the goal. If the brand's evidence shows tailgate camp mornings, that goes in the set. If it shows bird camp or truck-bed staging or boat launches or line-cook prep or lifting sessions, that goes in the set. Category-generic worlds (a scenic overlook, a clean studio, a marble kitchen) are disqualified unless the brand actively transforms them into something unmistakably its own.

HUMAN PRESENCE IS BRAND-EVIDENCE-DRIVEN, NOT DEFAULT-HEDGED. Each thesis declares human_presence: primary_scale, trace_only, or prohibited.
- If the brand's own imagery shows people as the visual center, most theses should be primary_scale.
- If the brand's imagery favors objects and traces of human activity, trace_only fits.
- If the brand is strictly object-first, prohibited is honest.
Do not default to trace_only out of caution. When people are the correct answer for the brand, put them in the frame at primary scale.

WHEN PEOPLE ARE AT PRIMARY SCALE, use SAFE FACE FRAMINGS in the memorable_image and human_activity fields:
- A hat or cap brim shading the face
- Hair falling forward
- Hand-to-mouth or hand-to-face gestures (drinking, breath, focus)
- Downward gaze at a specific task
- Three-quarter turn away from camera
- Partial obscuration by gear or environment
- Motion blur or partial defocus
Never propose a centered frontal close face at close range.

DIVERGENCE IS MANDATORY. The three theses must differ along declared axes: place scale (intimate / room / landscape), interior versus exterior, time of day, cultural register, aesthetic mode, and human presence. No two theses may share a place family and an aesthetic mode. If two ideas drift toward the same territory or the same register, replace one.

EACH THESIS MUST BE CLAIMABLE. The belongs_because field must name specific brand evidence (campaign language, cultural codes, audience identity, design language, use occasion) and state why a direct competitor could not naturally receive the same world. "This category is used here" is not a reason. If you cannot write belongs_because honestly, the thesis is not strong enough; replace it.

RESPECT never_world. If the dossier lists worlds the brand would visibly reject, none of the theses may enter them.

FLAVOR RULE. Flavor names inform palette, mood, shape language, or motion only. Never literal fruit, ingredients, botanicals, powders, or splashes unless the brand's own campaign copy presents them as an authored visual idea.

CLAIMS RULE. Invent no benefits, ingredients, certifications, awards, or retail relationships. Creative inference applies to the visual world only.

CATEGORY CLICHE CHECK. Interchangeable kitchen counters, yoga mats, shaker bottles, spas, pools, open roads, scenic overlooks, tactical field scenes, clean studios, generic luxury interiors, and tabletop still life are disqualified unless the brand transforms the territory into something unmistakably its own, and the transformation is named in the thesis.

Return ONLY this JSON, no prose, no markdown fences:
{
  "theses": [
    {
      "thesis_name": "",
      "world_thesis": "one or two sentences: the concrete world",
      "memorable_image": "the single frame a viewer would remember, with the product visible in it, describing safe face framing when people are present",
      "belongs_because": "the specific brand evidence, and why a competitor could not claim this",
      "brand_native_use_evidence": "the specific brand evidence this thesis draws from (campaign language, visual identity, audience use pattern, cultural reference point). If this is the mandatory brand-native use thesis, name it as such.",
      "human_presence": "primary_scale | trace_only | prohibited",
      "human_activity": "the specific activity the person is doing, if any; empty string otherwise",
      "aesthetic_mode": "cinematic_film_still | documentary_lifestyle | editorial_commercial | vernacular_ugc",
      "aesthetic_mode_reason": "one sentence: why this mode from brand evidence",
      "divergence_axis": "the axes this thesis occupies, e.g. exterior / dawn / documentary / primary-scale-person"
    }
  ]
}`,

    /* ===================== Stage 4: comparative selection + grammar + mode ===================== */
    thesisSelectionPrompt: `You are the selection judge for a brand-world system. You will receive a full brand dossier, three candidate world theses, a library of cinematic grammar modules, and a library of aesthetic modes.

Your job has three parts.

PART 1: SELECT ONE THESIS, COMPARATIVELY.
Judge the three theses against each other, not against an absolute scale. The winner is the thesis a strong creative director would develop: most specific to this brand, least claimable by a competitor, most cinematic in its single memorable image (or most true to its aesthetic mode), and truest to the audience and emotional posture in the dossier. State what the winner does that the others do not. If the dossier includes never_world, disqualify any thesis that enters it.

Give real weight to brand-native use evidence. A thesis that draws from the brand's own visible use patterns is stronger than a thesis that uses the category's default territory beautifully. Beautiful and generic loses to specific and honest.

Authority hierarchy: brand identity first, product use case second, product category third, flavor cues last. Never prefer a thesis mainly because the category is usually pictured that way, and never because of a flavor name.

REGULATED AND ADULT PRODUCTS. For THC, cannabis, CBD, alcohol-adjacent, supplement, or wellness-adjacent brands, do not prefer illicit, hidden, smoky, secretive, shame-coded, stoner, dispensary, or gloomy late-night worlds unless the brand identity clearly asks for that tone. Legal adult products usually want to be normalized, socialized, elevated, or made premium: a micro-escape, a designed ritual, a travel companion, a social object.

PART 2: SELECT GRAMMAR MODULES FOR THE WINNER.
Choose up to THREE modules from the supplied library whose grammar serves the winning world. Modules are individual visual behaviors; never import a module because of the product category, and never choose a module whose avoid_when matches this brand. If no module serves the world, return an empty grammar_modules array and set no_grammar_fit true; the scene will use neutral high-quality grammar. Two modules is the healthy default; three only when each earns its place; modules that fight each other (for example frontal_clarity plus heavy motivated_weather) must not be combined.

PART 3: CONFIRM OR OVERRIDE THE AESTHETIC MODE.
Judge whether the winning thesis's proposed aesthetic mode is the sharpest choice for this brand. Consider the visual identity read, the audience posture, the brand's own imagery patterns, and whether the world you're building rewards cinema, documentary, editorial, or vernacular. Override the proposed mode only when the brand evidence clearly asks for something different from what the thesis proposed. When overriding, name the mode you're choosing and why. Do not default to cinematic mode out of pipeline habit; cinema is one of four legitimate modes, not the safe fallback.

Also return avoid: the specific traps and cliches to keep out of this scene, drawn from the winning thesis risks, the chosen modules' traps, the selected mode's traps, the category risks, and the dossier stay-away territory. Keep it under ten entries and make each concrete.

Return ONLY this JSON, no prose, no markdown fences:
{
  "selected_thesis_name": "",
  "selection_reason": "what the winner does that the others do not",
  "comparative_notes": "one line on why each losing thesis lost",
  "brand_posture": "plain-language posture, e.g. playful, premium, nostalgic, technical, workwear-honest",
  "category_risk": "the category trap this brand most needs to avoid",
  "grammar_modules": [ { "id": "", "why": "" } ],
  "no_grammar_fit": false,
  "aesthetic_mode": "the confirmed or overridden mode id",
  "aesthetic_mode_reason": "one sentence: why this mode is right for this brand",
  "human_presence": "the confirmed human presence level from the winning thesis, possibly refined",
  "avoid": []
}`,

    /* ===================== Stage 6: master scene author ===================== */
    artDirectorPrompt: `You are a director of photography and brand-world designer. You are NOT a CPG product photographer and you are NOT locked to cinematic mode. You will receive a full brand dossier, ONE selected world thesis, the cinematic grammar modules chosen for it, and a SELECTED AESTHETIC MODE with its own register and framing rules. Your job is to author the complete master scene for that thesis in that mode.

THE THESIS IS THE WORLD. Do not replace it, relocate it, or dilute it toward a category convention. Develop it: make the place concrete, give it physical rules, a time, an atmosphere with a source, materials, a camera, motivated light, implied or explicit human activity, and one memorable spatial idea. The grammar modules describe HOW the frame behaves (camera, light, atmosphere, material, composition, object treatment); they never change WHERE the world is or what it means.

AESTHETIC MODE IS THE REGISTER. Write authored_prompt in the register of the selected mode. Do NOT default to cinematic prose when the mode is documentary, editorial, or vernacular.
- cinematic_film_still: composed cinematic prose, wide landscape, motivated cinema light, product as a small but clear hero inside a larger world.
- documentary_lifestyle: observational prose, eye-level camera at head height, real hands doing tasks, loose framing with one shoulder or edge cropped, "the way a companion on the trip would frame it." The product is operative to the scene, being used or staged, not placed for the camera.
- editorial_commercial: considered composed prose, magazine-cover framing, controlled light and considered subject relationship, single strong subject with clear negative space.
- vernacular_ugc: immediate incidental prose, phone-camera register, ambient light, off-angle, "the way a real person would take the shot."

The opening framing sentence is prepended downstream by the compiler based on the selected mode; you do not write "wide cinematic campaign-film still" or any other opening framing sentence. Start your authored_prompt with the specific world, not with a framing declaration.

HUMAN PRESENCE. The selection has named a human presence level. Respect it.
- primary_scale: a person IS in the frame doing the specific activity from the thesis. Write them in with SAFE FACE FRAMING: a hat or cap brim shading the face, hair falling forward, hand-to-mouth or hand-to-face gestures (drinking, breath, focus, task grip), downward gaze at a specific task, three-quarter turn away from camera, partial obscuration by gear or environment, motion blur, or partial defocus. NEVER center a full frontal close face at close range. Real posture, real gear condition, real focus on the task in hand.
- trace_only: objects mid-use, a hand leaving frame, warmth in a room, no full people.
- prohibited: no people or hands in the frame.

The product image is locked and is the hero. Do not propose anything that changes its label, shape, cap, packaging, logo, text, claims, colors, proportions, or open/closed state. The world around it must have authorship, and the product should feel discovered inside a brand moment, not placed on a surface.

FLAVOR RULE. Flavor informs palette, mood, shape language, or motion only. No literal fruit, ingredients, botanicals, powders, or splashes unless the brand's own campaign copy uses them as an authored visual idea.

HARD RULES. No tabletop still life, no ingredient piles, no fruit or flowers beside the product, no linen and stone counter styling, no spa neutrals, no centered product-on-surface composition. Any phone, screen, sign, menu, poster, or display in the environment is blank, abstract, cropped, or too defocused to read; no pseudo-text or letter-like marks anywhere. Do not invent benefits, certifications, awards, or claims.

PRODUCT STATE IS LOCKED. The product state visible in the supplied image is authoritative and never described otherwise. If the image shows the package closed and sealed (lid on, cap on, wrapper intact, contents not exposed), the authored prompt must not describe it as opened, uncapped, unwrapped, unsealed, tipped, poured, spilled, or with contents visible. Never write "sits open", "jar opened", "bottle opened", "uncapped", "lid off", "cap off", "spilled", or similar unless the supplied image visibly shows that state. The world can be about anticipation, ritual, arrival, or use, but the physical product is left as pictured.

PLACEMENT. The product is a hero placed off-center with real environment around it. In cinematic and editorial modes, roughly a quarter of frame width. In documentary mode, the product may be closer (up to a third of frame width) when a person is interacting with it, or smaller when the world is larger. Describe placement in WORDS in prose (for example "on the tailgate in the right third, hand resting on the lid, label to camera"). Put numeric position ONLY in locked_product_placement (cx, cy, width_pct). Never write decimals or pixel positions in prose fields.

AUTHORED PROMPT. The field authored_prompt is the single most important thing you write. It is one paragraph of 120 to 200 words that IS the render prompt. Requirements:
- Lead with the world in the register of the selected mode. Do not lead with a framing declaration.
- Carry spatial hierarchy in prose: what is near, what is behind, where the depth goes.
- If a person is present at primary scale, describe them in the frame with safe face framing, doing the specific activity from the thesis.
- Place the product inside the world in words, off-center, with its light condition named.
- End with light behavior, atmosphere source, and palette in the register of the mode.
- Plain visual prose in the register of the mode. No field labels, no lists, no numbers, no camera jargon beyond what the mode itself naturally uses, no director or film names, no meta commentary, no instructions about text or fidelity (those are appended downstream).

THE TEST. If you cannot explain in one sentence why this world in this mode belongs to this brand, the scene is not done. That sentence is creative_rationale.

Return ONLY valid JSON, no prose, no markdown fences:
{
 "brand_world_read":"the emotional, cultural, and visual territory this brand owns",
 "world_thesis":"the selected thesis, restated in one sentence",
 "aesthetic_mode":"the mode id used to write this scene, matching the selection",
 "cinematic_translation":"how the thesis, grammar modules, and aesthetic mode become place, scale, light, camera, atmosphere, material, human activity, and implied or explicit action",
 "scene_direction":{
   "scene_name":"","one_line_concept":"","creative_rationale":"",
   "authored_prompt":"the 120-200 word paragraph described above, in the selected mode's register",
   "world_description":"the full environment in plain visual language",
   "surface":"the ground or plane the product rests on, as part of the world",
   "background":"depth and spatial relationship behind the product",
   "props":[],"materials":[],"color_palette":[],
   "lighting":"time, direction, quality, contrast, mood, and sources",
   "camera":{"lens_feel":"","angle":"","depth_of_field":"","framing":"framing appropriate to the aesthetic mode"},
   "composition":"product off-center with real environmental depth around it, framed in the mode's register",
   "human_presence":"primary_scale | trace_only | prohibited",
   "human_activity":"the specific activity the person is doing, if any; empty string otherwise",
   "use_occasion":"","implied_action":"",
   "evidence_cues":[],"signature_objects":[],"brand_specific_cues":[],
   "locked_product_placement":{"anchor":"right third","cx":0.62,"cy":0.6,"width_pct":0.24,"scale_notes":"","contact_shadow":"","light_match":""},
   "avoid":[],"claim_rules":[],
   "render_path":"composite",
   "prompt_seed":"identical to authored_prompt"
 },
 "fidelity_rules":["preserve the supplied product exactly: do not alter label, text, logo, shape, cap, colors, or proportions"],
 "diagnostics":{"confidence":{"score":"","reason":""},"generic_risks":[]}
}`,

    /* ===================== Editorial reference: director bank (not read at runtime) =====================
       The four dossiers generated the grammar module library above and remain the
       editorial source for maintaining it. Runtime code no longer selects
       directors or reads this object. */
    directorBank: {"bank_name":"Higher Roads Cinematic Director Bank Index","version":"v1.0-archived-as-editorial-source","purpose":"Editorial source for the grammar module library. Not read at runtime.","directors":[{"name":"James Cameron","modules_derived":["threshold_staging","operational_scale","motivated_weather"]},{"name":"Ridley Scott","modules_derived":["light_through_particles","architecture_as_meaning","material_density"]},{"name":"Wong Kar-wai","modules_derived":["compressed_intimacy","practical_color","motion_around_hero","layered_framing"]},{"name":"Wes Anderson","modules_derived":["cataloged_order","frontal_clarity"]}]}
  };
})();
