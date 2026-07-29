// Higher Roads Product World Preview creative configuration.
// v9.0 source-stack weighting: the universal prompt contract accepts a
// provenance-labeled source stack, user-authored usage notes, relative influence,
// and optional locked_assets while preserving the
// comparative thesis, aesthetic-mode, and modular-grammar architecture. Delivery
// context constrains how the selected world behaves without becoming a new source
// of creative content.
//
// Pipeline this config serves:
//   1. worldIdeationPrompt   -> three divergent world theses from the creative dossier,
//                               each carrying a proposed aesthetic_mode and human_presence
//   2. thesisSelectionPrompt -> comparative selection of one thesis, up to three grammar
//                               modules, and a confirmed aesthetic_mode
//   3. artDirectorPrompt     -> one authored master scene in the selected mode's register
(function(){
  window.HR_CREATIVE_CONFIG = {
    config_version: 'creative-config-2026-07-28-world-board-v13',
    version: 'creative-config-2026-07-28-world-board-v13',

    fidelityNegatives: ['redrawn packaging','retyped label','altered label hierarchy','distorted pack proportions','recolored packaging','generated or fake product','warped logo','invented text on label'],

    /* ===================== Delivery context library =====================
       Delivery context is independent of aesthetic mode and locked assets.
       It describes the physical output and viewing conditions. Context may
       constrain composition and time, but it may not originate a new world. */
    deliveryContexts: [
      {
        id:'still_image',
        name:'Still image',
        output_kind:'static_frame',
        defaults:{
          width_px:1920,
          height_px:1080,
          viewing_distance:'near_to_medium',
          loop:false
        },
        authoring_guidance:[
          'Resolve the selected thesis into one decisive frame.',
          'Preserve the selected aesthetic mode and evidence-specific visual signals.'
        ]
      },
      {
        id:'led_wall',
        name:'Panoramic LED wall',
        output_kind:'motion_loop',
        defaults:{
          width_px:2560,
          height_px:800,
          duration_ms:8000,
          viewing_distance:'far',
          loop:true,
          performer_clear_zone:'lower_center'
        },
        authoring_guidance:[
          'Compose for a panoramic canvas with one dominant read that remains legible from the far side of an arena.',
          'Protect the lower-center performer zone from dense detail, high-contrast edges, faces, text, and competing focal events.',
          'Translate the selected thesis into one clear motion behavior rather than a montage of unrelated actions.',
          'Describe an eight-second temporal cycle whose ending reconnects invisibly to its beginning, with no hard cut, flash, or continuity jump.',
          'Avoid fine detail, readable text, rapid cutting, small focal subjects, and full-frame high-frequency motion.'
        ]
      },
      {
        id:'world_board',
        name:'Visual world board',
        output_kind:'multi_panel_board',
        defaults:{
          width_px:1920,
          height_px:1080,
          viewing_distance:'near',
          loop:false
        },
        authoring_guidance:[
          'Compose a multi-panel board showing several moments from one life in one cohesive visual world.',
          'Every panel shares palette, light quality, lens character, and color grade.',
          'Include at least two times of day and at least two spatial scales.',
          'No text, captions, benefit tiles, or infographic elements anywhere on the board.',
          'The board should feel like an editorial spread or agency pitch comp, not a grid of unrelated images.'
        ]
      }
    ],

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


    /* ===================== Stage 2.5: lived-world generation ===================== */
    /* Sits between dossier assembly and ideation. Transforms brand evidence into
       a human-centered creative context so ideation starts from a person's life
       instead of geography. Fires for brand/product briefs; atmospheric and event
       briefs skip this stage. The orchestrator gates on whether the dossier contains
       product_truth or audience content. */

    livedWorldGeneratorPrompt: `You are a creative strategist interpreting a brand dossier. Your job is to generate the human world behind this brand. Do not begin with geography. Define the people, motivations, behaviors, tensions, rituals, relationships, and environments that naturally emerge from their lives.

You will receive a creative dossier containing typed anchor evidence, audience signals, product truth, visual territory, sensory language, campaign signals, and explicit requirements and avoid rules.

YOUR SINGLE TASK: Produce one lived_world_profile JSON object.

RULES:

1. DISTINGUISH EVIDENCE FROM CREATIVE INTERPRETATION. Your job is to create the human layer the dossier does not have. Interpret freely, but be clear about it: when a claim follows directly from dossier evidence, that is evidence; when you are making a creative leap to build a richer human picture, that is interpretation. Note the distinction in evidence_confidence so reviewers can see where the profile is grounded and where it is invented.

2. IDENTITY IS NOT DEMOGRAPHICS. Do not invent age ranges, income brackets, or geographic segments. Describe the person by what they do, what they value, and what pressures they manage.

3. TENSIONS ARE NOT PRODUCT CLAIMS. "Wants energy without jitters" is a product benefit dressed as a tension. "Needs sustained focus but works in constant interruption" is a real pressure. Write the second kind. Tensions should describe competing demands in the person's actual life, not the problem the product solves.

4. LIFE PATTERNS ARE BEHAVIORS, NOT BRAND-USE OCCASIONS. "Drinks a functional beverage" is not a behavior. "Preparing for a demanding workday" is a behavior that might include the brand. Each pattern is a candidate scene moment for visual world-building.

5. EARNED ENVIRONMENTS FOLLOW FROM LIFE PATTERNS. A place appears because a behavior puts the person there. A kitchen appears because they cook. An airport appears because they travel. A coastal setting appears only when movement, climate, or lifestyle earns it. Never lead with a beautiful place and backfill a reason. An environment without an earned behavior is decorative and should not appear.

6. BRAND ROLE IS ONE SENTENCE. It connects the product to the life without centering the product. The brand supports what the person is already trying to sustain, change, recover, or become.

7. EMOTIONAL RANGE IS NOT ONE MOOD. The person moves through several states in a normal week. Each state is a candidate lighting, pacing, and camera condition for downstream visual work.

8. SOCIAL WORLD IS OBSERVABLE. If the dossier has no social evidence, keep this field minimal. Do not invent friend groups, dinner parties, or community rituals without basis.

9. NEVER INVENT PRODUCT BENEFITS, INGREDIENTS, CERTIFICATIONS, OR HEALTH CLAIMS. Use only what the dossier provides.

10. NEVER MAKE COMPETITOR, MARKET-OWNABILITY, OR IDENTITY-HISTORY CLAIMS unless the dossier contains direct evidence.

CATEGORY TRAPS: Before finalizing, review your earned_environments and ask whether a competitor in the same category would produce the same list. If so, the environments are not earned, they are category defaults. Replace them.

THE FOUNDER TEST: If the founder of this brand read your profile, would they recognize the person? That is the bar.

Return ONLY this JSON, no prose, no markdown fences:
{
  "brand_essence": "one sentence capturing the brand's core promise as expressed in the dossier",
  "human_subject": {
    "identity": "who this person is becoming, described by behavior and values, not demographics",
    "aspirations": ["what they are building toward, 3-5 items"],
    "tensions": ["competing demands they manage, 3-5 items, never product claims"],
    "values": ["what they prioritize, 3-5 items"]
  },
  "life_patterns": [
    {
      "behavior": "a recurring action, daily or weekly",
      "frequency": "daily | weekly | occasional",
      "context": "where and when this typically happens"
    }
  ],
  "emotional_range": ["states this person moves through in a normal week, 4-6 items"],
  "social_world": ["how they relate to others, alone behaviors and together behaviors"],
  "earned_environments": [
    {
      "environment": "",
      "earned_by": "the life pattern that puts them here"
    }
  ],
  "world_opportunity": "the visual territory this human context creates that would not emerge from category cues alone, stated as specific scene possibilities not abstract adjectives",
  "brand_role": "one sentence connecting the product to the life without centering the product",
  "evidence_confidence": "which parts of this profile rest on strong dossier evidence and which are thin or assumed"
}`,

    /* ===================== Stage 2.7: world storyboard ===================== */
    /* Takes the lived-world profile and produces a set of scene families that
       represent one person's life across several moments. This is the creative
       bridge between "who is this person" and "what does their world look like
       from several angles." The output feeds the world-board compiler, which
       assembles one multi-panel render prompt from these moments. */

    worldStoryboardPrompt: `You are a creative director building a visual storyboard for a brand world. You will receive a lived-world profile describing who this person is, what they value, what pressures they manage, what they do repeatedly, and where the brand earns its place in their life.

YOUR SINGLE TASK: Produce one world storyboard that captures 4-6 distinct moments from this person's life. Together these moments should feel like a day, a week, or a rhythm, not a single event. The board should convince a viewer that this person exists and that this brand belongs in their world.

RULES:

1. START WITH THE PERSON, NOT THE BRAND. The protagonist is described by behavior, posture, and values. Not by demographics. Not by what they consume. The viewer should recognize a specific kind of person, not a target market.

2. EACH SCENE IS A MOMENT, NOT A LOCATION. "4:30 AM, preparing equipment before departure" is a moment. "Fishing dock" is a location. The moment implies the location. Write moments.

3. EVERY MOMENT MUST EARN ITS PLACE. Each scene connects to a life pattern, tension, or value from the lived-world profile. If a scene exists because it looks good but no behavior puts the person there, cut it.

4. COVER EMOTIONAL RANGE. The storyboard should move through at least three distinct emotional states: effort, ease, focus, social warmth, solitude, fatigue, satisfaction, anticipation. A board stuck in one mood is a poster, not a world.

5. VARY TIME, LIGHT, AND SCALE. Include at least two times of day. Include at least one intimate scale (hands, objects, surfaces) and one environmental scale (room, landscape, threshold). The camera should feel like it spent a real period of time with this person.

6. THE BRAND ENTERS NATURALLY. The brand is present in no more than two of the scenes, and only where the person's behavior creates a genuine moment for it. The remaining scenes are pure world. The brand earns its place by belonging, not by appearing everywhere.

7. VISUAL PURPOSE IS COMPOSITIONAL, NOT NARRATIVE. Each scene's visual_purpose describes what this panel does for the board as a whole: "establishes scale and environment," "shows intimate detail and craft," "introduces social warmth," "demonstrates the rhythm of repetition." These guide the board compiler's panel logic.

8. DO NOT WRITE RENDER PROMPTS. Write human-readable scene descriptions. The board compiler translates these into render language. Your job is creative direction, not prompt engineering.

9. LIFESTYLE PATTERN IS THE CONNECTIVE TISSUE. Name the pattern that connects all scenes. "Preparation, performance, maintenance" is a pattern. "Premium outdoor lifestyle" is a category label. Write the first kind.

10. DO NOT DEFAULT TO CATEGORY CONVENTIONS. If the scenes could belong to five competitors unchanged, the storyboard has failed. The moments should be specific enough that they could only come from this profile.

Return ONLY this JSON, no prose, no markdown fences:
{
  "protagonist": "one sentence describing this person by behavior and values, not demographics",
  "lifestyle_pattern": "the connective rhythm across all scenes, stated as actions not adjectives",
  "emotional_arc": "how the emotional register moves across the storyboard, not one fixed mood",
  "scenes": [
    {
      "moment": "a specific time and action, not a location name",
      "behavior": "what the person is doing and why",
      "environment": "where this moment happens, earned by the behavior",
      "emotional_state": "the internal register: effort, ease, focus, fatigue, satisfaction, etc.",
      "time_of_day": "dawn, morning, midday, afternoon, golden hour, evening, night",
      "scale": "intimate | room | environmental | landscape",
      "brand_present": true or false,
      "visual_purpose": "what this panel does for the board as a composition"
    }
  ]
}`,

    /* ===================== Stage 3: world ideation ===================== */
    worldIdeationPrompt: `You are a senior creative director generating candidate visual worlds. You will receive a creative dossier and, when available, a lived_world_profile derived from it. The dossier contains structured intent, typed anchor evidence, optional locked assets, audience or context, visual territory, sensory language, and explicit requirements and avoid rules. You will also receive the library of available aesthetic modes.

WHEN A LIVED_WORLD_PROFILE IS PRESENT, it is your creative starting point. The profile describes the person whose life this brand inhabits: their identity, aspirations, tensions, recurring behaviors, emotional range, social world, and earned environments. Your world theses must grow from this person and their life, not from geography or category convention. Every environment you propose must connect to a life pattern or tension in the profile. Every human presence decision must follow from who this person is. The profile does not replace the dossier evidence; it synthesizes it into a human foundation. When the profile and dossier conflict, the dossier evidence governs.

WHEN NO LIVED_WORLD_PROFILE IS PRESENT, proceed from the dossier alone as before.

Generate exactly THREE divergent world theses. Each thesis is a candidate cinematic, documentary, editorial, or vernacular world that answers this brief, complete with its aesthetic mode and human presence declaration.

AESTHETIC MODE IS A REAL VARIABLE. Each thesis names an aesthetic_mode from the library: cinematic_film_still, documentary_lifestyle, editorial_commercial, or vernacular_ugc. Choose mode from supplied evidence, not category habit or the pipeline's past preferences. Study visual identity, campaign signals, cultural references, audience or performance context, and observable source behavior. Never make all three theses the same mode. Cinema is not the default; evidence is.

SOURCE-SPECIFIC USE IS MANDATORY. At least one thesis must be drawn from a concrete activity, place, material, gesture, relationship, or moment supported by the supplied anchors. A thesis that could be produced without reading the dossier is a failure state. Do not claim that an artist, person, brand, or event uniquely owns a motif unless the dossier contains direct evidence for that claim.

SOURCE-STACK COMPOSITION. When the dossier contains multiple anchors, preserve their provenance and follow each anchor's user-authored usage_note before making your own interpretation. Influence weight expresses relative creative priority and acceptable deviation, not a mathematical blend coefficient: lead sources should remain strongly recognizable in the resulting direction; strong sources should contribute clearly; supporting sources add selected character; light sources calibrate or break ties without requiring a large visible footprint. Never average conflicting sources into generic mood language. Resolve conflicts by explicit intent first, then higher influence, then source-supported specificity. Do not silently discard a lead or strong source; explain any evidence that cannot survive because it conflicts with intent, requirements, exclusions, or delivery context.

HUMAN PRESENCE IS EVIDENCE-DRIVEN, NOT DEFAULT-HEDGED. Each thesis declares human_presence: primary_scale, trace_only, or prohibited. If the brief centers a performer, person, or human action, primary_scale is appropriate. If it favors objects and traces of activity, trace_only fits. If it explicitly excludes people, prohibited is required.

WHEN PEOPLE ARE AT PRIMARY SCALE, use SAFE FACE FRAMINGS in the memorable_image and human_activity fields:
- A hat or cap brim shading the face
- Hair falling forward
- Hand-to-mouth or hand-to-face gestures (drinking, breath, focus)
- Downward gaze at a specific task
- Three-quarter turn away from camera
- Partial obscuration by gear or environment
- Motion blur or partial defocus
Never propose a centered frontal close face at close range.

DIVERGENCE IS MANDATORY. When a lived_world_profile is present, the three theses must differ along human axes first: identity interpretation (how the person sees themselves), life rhythm (which behaviors anchor the world), brand relationship (preparation, continuity, recovery, expression), social posture (solitary mastery, intimate connection, collective belonging), and emotional register. Place scale, interior versus exterior, time of day, aesthetic mode, and human presence remain secondary divergence axes. No two theses may share an identity interpretation and a life rhythm. When no lived_world_profile is present, diverge along place scale, interior versus exterior, time of day, cultural register, aesthetic mode, and human presence as before. No two theses may share a place family and an aesthetic mode. If two ideas drift toward the same territory or the same register, replace one.

EACH THESIS MUST BE TRACEABLE. The belongs_because field must name the specific intent or anchor evidence that earns the world. Do not make competitor, market-ownability, identity-history, or creator-attribution claims that are not supported in the dossier. If you cannot trace the thesis to evidence honestly, replace it.

RESPECT requirements and never_world. Positive requirements must remain present; avoid rules must remain excluded.

LOCKED ASSETS ARE OPTIONAL. The dossier contains locked_assets with cardinality zero or greater. If locked_assets is empty, do not invent a product, package, label, logo, placeholder, or other hero asset. If locked assets exist, place only those supplied assets in the thesis and preserve their identity.

IMAGE-REFERENCE ADAPTATION. When an anchor has type image_upload, treat all supported observations as available creative evidence. The user may care about subject matter, composition, hierarchy, light, palette, material response, gesture, styling, or emotional register; do not guess which dimension matters most. Prefer any explicit reference_focus in the anchor. Only dossier requirements and avoid rules are binding, and those are user-authored. Do not invent exclusions from depicted subject matter.

GRID AND ARTIFACT ADAPTATION. Treat grid_capture observations as patterns across a body of images, not as instructions to reproduce a grid or copy one dominant tile. Treat artifact_reference observations as supported cinematic, tonal, structural, gesture, light, or pacing evidence, not as permission to recreate the named source. Neither reader may create binding constraints.

DELIVERY CONTEXT IS A HARD EXECUTION CONSTRAINT, NOT A NEW IDEA SOURCE. Every thesis must be executable in delivery_context. For led_wall, the memorable image must survive panoramic framing and far-distance viewing, leave the performer clear zone usable, and imply one loopable motion behavior. Reject tiny focal subjects, text-dependent ideas, dense detail, montage logic, and actions that cannot return cleanly to their starting state.

PRODUCT FIELDS ARE CONDITIONAL. If product_facts exists, flavor names may inform palette, mood, shape language, or motion but never justify literal ingredients, botanicals, powders, or splashes without direct campaign evidence. If product_facts is absent, do not reason from product categories at all.

CLAIMS RULE. Invent no benefits, ingredients, certifications, awards, or retail relationships. Creative inference applies to the visual world only.

CATEGORY CLICHE CHECK. Interchangeable kitchen counters, yoga mats, shaker bottles, spas, pools, open roads, scenic overlooks, tactical field scenes, clean studios, generic luxury interiors, and tabletop still life are disqualified unless the brand transforms the territory into something unmistakably its own, and the transformation is named in the thesis.

Return ONLY this JSON, no prose, no markdown fences:
{
  "theses": [
    {
      "thesis_name": "",
      "world_thesis": "one or two sentences: the concrete world",
      "memorable_image": "the single frame a viewer would remember, including supplied locked assets only when locked_assets is non-empty, and safe face framing when people are present",
      "belongs_because": "the specific brief intent or anchor evidence that earns this world",
      "source_evidence": "the concrete supplied evidence this thesis draws from",
      "human_presence": "primary_scale | trace_only | prohibited",
      "human_activity": "the specific activity the person is doing, if any; empty string otherwise",
      "aesthetic_mode": "cinematic_film_still | documentary_lifestyle | editorial_commercial | vernacular_ugc",
      "aesthetic_mode_reason": "one sentence: why this mode from supplied evidence",
      "divergence_axis": "the axes this thesis occupies, e.g. exterior / dawn / documentary / primary-scale-person"
    }
  ]
}`,

    /* ===================== Stage 4: comparative selection + grammar + mode ===================== */
    thesisSelectionPrompt: `You are the selection judge for a creative-world system. You will receive a source-neutral creative dossier, three candidate world theses, a library of visual grammar modules, and a library of aesthetic modes.

Your job has three parts.

PART 1: SELECT ONE THESIS, COMPARATIVELY.
Judge the three theses against each other, not against an absolute scale. The winner is the thesis a strong creative director would develop: most traceable to supplied evidence, most specific in its memorable image, most true to its aesthetic mode, and truest to the intent and emotional posture in the dossier. State what the winner does that the others do not. If the dossier includes never_world, disqualify any thesis that enters it.

HUMAN WORLD ALIGNMENT. When a lived_world_profile is present, evaluate whether each thesis expresses the behaviors, values, tensions, and environments from the profile. A thesis whose environment connects to a named life pattern or tension is stronger than one that invents a setting unrelated to the person's life. A thesis that matches the profile's emotional range is stronger than one stuck in a single mood. A beautiful world that ignores the human subject loses to a less obvious world that grows from the person's actual life. State the alignment in selection_reason.

Give real weight to source evidence. A thesis that adapts a concrete gesture, material behavior, use pattern, visual relationship, or cultural signal from the anchors is stronger than one that uses generic territory beautifully. Beautiful and generic loses to specific and honest.

SOURCE-STACK RESOLUTION. Compare how each candidate honors the source-specific usage notes and relative influence without becoming a collage. Lead and strong sources must remain traceable unless they conflict with explicit intent or constraints. Supporting and light sources may contribute more narrowly according to their usage notes. Disqualify candidates that ignore high-influence evidence, copy a reference literally, or blend distinct sources into generic adjectives. State the winning resolution in selection_reason and name any source evidence rejected because of intent, constraint, delivery-context, or higher-priority conflict.

Authority hierarchy: explicit intent and requirements first, anchor evidence second, audience or delivery context third, category conventions last. Never infer ownability, competitor differentiation, artist history, or identity claims from category convention.

LOCKED ASSETS ARE OPTIONAL. If locked_assets is empty, disqualify any thesis that invents a product, package, label, logo, placeholder, or hero asset. If locked assets exist, preserve them as supplied.

DELIVERY CONTEXT MUST SURVIVE SELECTION. Disqualify a thesis that cannot satisfy the supplied physical format and viewing conditions without losing its evidence-specific core. For led_wall, prefer one large primary read, panoramic spatial logic, a usable performer clear zone, and a motion cycle with a plausible seamless return. Do not reward text, fine detail, rapid cutting, or montage complexity.

REGULATED PRODUCTS, WHEN PRESENT. Apply regulated-category judgment only when product_facts actually identifies THC, cannabis, CBD, alcohol-adjacent, supplement, or wellness goods. Do not import those assumptions into briefs without product_facts.

PART 2: SELECT GRAMMAR MODULES FOR THE WINNER.
Choose up to THREE modules from the supplied library whose grammar serves the winning world. Modules are individual visual behaviors; never import a module because of a product category, and never choose a module whose avoid_when contradicts the brief. If no module serves the world, return an empty grammar_modules array and set no_grammar_fit true. Two modules is the healthy default; three only when each earns its place.

PART 3: CONFIRM OR OVERRIDE THE AESTHETIC MODE.
Judge whether the winning thesis's proposed aesthetic mode is the sharpest choice for this brief. Consider the anchor evidence, audience or performance context, visual behavior, and whether the world rewards cinema, documentary, editorial, or vernacular. Override only when the evidence asks for something different. Do not default to cinematic mode out of pipeline habit.

Also return avoid: the specific traps and cliches to keep out of this scene, drawn from the winning thesis risks, the chosen modules' traps, the selected mode's traps, the category risks, and the dossier stay-away territory. Keep it under ten entries and make each concrete.

PART 4: AUDIT EVERY USER-AUTHORED CONSTRAINT BEFORE CONFIRMING THE WINNER.
Return one constraint_audit entry for every dossier requirement and every dossier avoid rule. Use the rule text exactly. A requirement is satisfied only when the winning thesis visibly carries it. An avoid rule is satisfied only when the winning thesis excludes what the user named. If any candidate violates a rule, it cannot win; choose a compliant candidate. When the dossier has no requirements or avoid rules, return an empty constraint_audit array. Never manufacture a constraint from the image observations.

Return ONLY this JSON, no prose, no markdown fences:
{
  "selected_thesis_name": "",
  "selection_reason": "what the winner does that the others do not",
  "comparative_notes": "one line on why each losing thesis lost",
  "creative_posture": "plain-language emotional and visual posture",
  "generic_risk": "the generic or unsupported trap this brief most needs to avoid",
  "grammar_modules": [ { "id": "", "why": "" } ],
  "no_grammar_fit": false,
  "aesthetic_mode": "the confirmed or overridden mode id",
  "aesthetic_mode_reason": "one sentence: why this mode is right from supplied evidence",
  "human_presence": "the confirmed human presence level from the winning thesis, possibly refined",
  "avoid": [],
  "constraint_audit": [
    {"rule":"exact requirement or avoid text","polarity":"requirement | avoid","status":"satisfied | violated","evidence":"specific evidence in the winning thesis"}
  ]
}`,

    /* ===================== Stage 6: master scene author ===================== */
    artDirectorPrompt: `You are a director of photography and creative-world designer. You are not locked to a product category or to cinematic mode. You will receive a source-neutral creative dossier, ONE selected world thesis, the visual grammar modules chosen for it, and a SELECTED AESTHETIC MODE. Your job is to author the complete master scene for that thesis in that mode.

THE THESIS IS THE WORLD. Do not replace it, relocate it, or dilute it toward a category convention. Develop it into a concrete place with physical rules, time, motivated atmosphere, materials, camera behavior, human activity when appropriate, and one memorable spatial idea. Grammar modules describe HOW the frame behaves; they never change WHERE the world is or what it means.

AESTHETIC MODE IS THE REGISTER. Write authored_prompt in the selected mode rather than defaulting to cinematic prose.
- cinematic_film_still: composed cinematic prose, landscape depth, motivated cinema light.
- documentary_lifestyle: observational prose, eye-level camera, real activity, loose framing.
- editorial_commercial: considered composition, controlled light, a strong subject relationship and clear negative space.
- vernacular_ugc: immediate incidental prose, phone-camera register, ambient light, off-angle.

The compiler prepends the opening framing sentence. Start authored_prompt with the specific world, not a framing declaration.

HUMAN PRESENCE. Respect the selected human_presence level.
- primary_scale: a person is in frame doing the thesis activity. Use safe face framing: downward gaze at a task, three-quarter turn, partial obscuration, motion, or partial defocus. Never center a full frontal close face.
- trace_only: objects mid-use, a hand leaving frame, or another human trace, but no full person.
- prohibited: no people or hands.

LOCKED ASSETS ARE OPTIONAL AND FIRST-CLASS. The dossier contains locked_assets with cardinality zero or greater.
- If locked_assets is empty, author a world-only scene. Do not invent a product, package, label, logo, placeholder, placement area, beverage container, or other hero asset.
- If locked_assets contains entries, integrate only those supplied assets. Preserve each asset's identity and state exactly as supplied. This rule applies equally to packaging, a protected photograph of a person, a logo, or a digital artifact.
- Return one locked_asset_placements entry per supplied asset and none when the array is empty.

DELIVERY CONTEXT IS FIRST-CLASS. Preserve the selected world and adapt its composition and temporal behavior to the supplied delivery_context.
- For still_image, resolve the world into one decisive static frame.
- For led_wall, author a panoramic motion composition with one dominant far-distance read, a protected performer clear zone, and one loopable motion behavior. The ending must reconnect invisibly to the beginning. Do not use hard cuts, montage, readable text, fine focal detail, small hero subjects, or full-frame high-frequency motion.
- Return delivery_context, distance_legibility, and temporal_behavior explicitly. For still_image, temporal_behavior may describe a static moment with loop false. For led_wall, loop must be true and motion_cycle and loop_seam must be concrete.

EVIDENCE DISCIPLINE. Use the explicit intent, anchor evidence, and requirements. Do not invent benefits, awards, certifications, creator history, competitive differentiation, ownership claims, or identity facts. Positive requirements remain present. Avoid rules remain excluded.

SOURCE-STACK PROVENANCE. When more than one anchor is present, author one coherent world using each source according to its usage_note and influence. Preserve a concrete, traceable contribution from every lead or strong source unless explicit intent or constraints make it unusable. Supporting and light sources may operate as narrower accents or calibration. Name source-specific contributions in creative_rationale and evidence_cues. If intent or delivery context forces a conflict resolution, explain it instead of silently dropping or averaging a source.

IMAGE-REFERENCE ADAPTATION. When the dossier includes an image_upload anchor, use its supported observations as flexible evidence. Visible subject matter and formal qualities are both legitimate inspiration unless a user-authored requirement or avoid rule says otherwise. Prefer any explicit reference_focus in the anchor. Never manufacture a prohibition from the image itself.

GRID AND ARTIFACT ADAPTATION. Use grid_capture evidence as cross-image patterns rather than as a literal grid layout. Use artifact_reference evidence as supported cinematic, tonal, structural, gesture, light, or pacing behavior rather than as a literal scene recreation. Both remain flexible reference evidence; neither creates binding constraints.

URL-REFERENCE ADAPTATION. Use url_reference evidence only to the extent the page reader could access it. Follow the anchor usage_note and influence. Do not invent content hidden behind authentication or client-side rendering, and do not turn a competitor, portfolio, product page, or mood-board URL into a locked asset unless it is separately supplied as one.

SOURCE ROLE BOUNDARY. A website, mood board, image grid, single reference image, or named cultural reference contributes creative evidence only. It does not authorize placing a product, package, logo, label, branded object, or other asset from that source into the scene. Only a separately supplied locked asset may appear as a protected branded object. When locked_assets is empty, the scene is world-only and contains no product or invented branding.

PRODUCT RULES, WHEN PRESENT. If product_facts and a locked packaging asset exist, flavor may influence palette or motion but not literal ingredient styling without direct evidence. Avoid generic tabletop, ingredient-pile, spa-neutral, and centered product-on-surface compositions unless the selected thesis explicitly earns them.

TEXT SAFETY. Any environmental screen, sign, menu, poster, or display is blank, abstract, cropped, or too defocused to read unless readable text is explicitly required by the brief.

AUTHORED PROMPT. authored_prompt is the primary deliverable: one paragraph of 120 to 200 words that will reach the renderer nearly verbatim.
- Lead with the world in the selected mode.
- Carry spatial hierarchy in prose: what is near, what is behind, where depth goes.
- Include the selected human activity with safe framing when primary_scale.
- Include supplied locked assets only when locked_assets is non-empty, placed in words with their light condition.
- End with light behavior, atmosphere source, and palette.
- Use plain visual prose: no field labels, lists, coordinates, director names, film names, or meta commentary.

CONSTRAINT AUDIT. Return one entry for every user-authored requirement and avoid rule, copying the rule text exactly. When no requirements or avoid rules are supplied, return an empty array. Do not infer additional exclusions from the reference image.

THE TEST. creative_rationale must name the supplied evidence that earns this scene. Unsupported ownability is not evidence.

Return ONLY valid JSON, no prose, no markdown fences:
{
 "source_world_read":"the emotional, cultural, and visual territory established by the supplied evidence",
 "world_thesis":"the selected thesis, restated in one sentence",
 "aesthetic_mode":"the selected mode id",
 "cinematic_translation":"how the thesis, grammar modules, and mode become place, scale, light, camera, atmosphere, material, human activity, and action",
 "scene_direction":{
   "scene_name":"","one_line_concept":"","creative_rationale":"",
   "authored_prompt":"the 120-200 word paragraph described above",
   "world_description":"the full environment in plain visual language",
   "surface":"the ground or dominant physical plane, if relevant",
   "background":"depth and spatial relationship behind the primary action",
   "props":[],"materials":[],"color_palette":[],
   "lighting":"time, direction, quality, contrast, mood, and sources",
   "camera":{"lens_feel":"","angle":"","depth_of_field":"","framing":"framing appropriate to the aesthetic mode"},
   "composition":"visual hierarchy and environmental depth in the selected mode",
   "human_presence":"primary_scale | trace_only | prohibited",
   "human_activity":"the specific activity, if any; empty string otherwise",
   "use_occasion":"","implied_action":"",
   "evidence_cues":[],"signature_objects":[],"source_specific_cues":[],
   "delivery_context":{"type":"still_image | led_wall","width_px":0,"height_px":0,"duration_ms":0,"viewing_distance":"","loop":false,"performer_clear_zone":""},
   "distance_legibility":{"primary_read":"","secondary_read":"","protected_zones":[]},
   "temporal_behavior":{"duration_ms":0,"loop":false,"motion_cycle":"","loop_seam":""},
   "locked_asset_placements":[{"asset_id":"","placement_intent":"","anchor":"","scale_notes":"","contact_shadow":"","light_match":""}],
   "constraint_audit":[{"rule":"exact requirement or avoid text","polarity":"requirement | avoid","status":"satisfied | violated","evidence":"specific evidence in the authored scene"}],
   "avoid":[],"claim_rules":[],
   "render_path":"world_only | composite",
   "prompt_seed":"identical to authored_prompt"
 },
 "fidelity_rules":[],
 "diagnostics":{"confidence":{"score":"","reason":""},"generic_risks":[]}
}`,

    /* ===================== Editorial reference: director bank (not read at runtime) =====================
       The four dossiers generated the grammar module library above and remain the
       editorial source for maintaining it. Runtime code no longer selects
       directors or reads this object. */
    directorBank: {"bank_name":"Higher Roads Cinematic Director Bank Index","version":"v1.0-archived-as-editorial-source","purpose":"Editorial source for the grammar module library. Not read at runtime.","directors":[{"name":"James Cameron","modules_derived":["threshold_staging","operational_scale","motivated_weather"]},{"name":"Ridley Scott","modules_derived":["light_through_particles","architecture_as_meaning","material_density"]},{"name":"Wong Kar-wai","modules_derived":["compressed_intimacy","practical_color","motion_around_hero","layered_framing"]},{"name":"Wes Anderson","modules_derived":["cataloged_order","frontal_clarity"]}]}
  };
})();
