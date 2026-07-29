(function(){
  'use strict';
  const VERSION = 'prompt-writer-2026-07-28-world-board-v13';
  /*
   * Prose-preserving compiler.
   *
   * The v2 compiler reassembled the authored scene into a labeled field taxonomy
   * ("setting: ... materials: ... lighting: ...") and generated a negative prompt
   * the OpenAI edit path never reads. v3 inverts the instruction budget:
   *
   *   1. The authored scene prose (scene_brief.authored_prompt, falling back to
   *      prompt_seed, then a minimal prose assembly) IS the render prompt.
   *      The compiler never re-fragments it, never injects anchors from a noun
   *      whitelist, and never adds content the scene did not author.
   *   2. Protection is appended as one compact block, three to four sentences,
   *      so the world carries roughly three quarters of the prompt.
   *   3. compiled_negative is a short canonical string kept only for future
   *      backends with a real negative channel (ComfyUI). The OpenAI edit path
   *      does not consume it. sceneNouns and removeContradictions are retired.
   */

  function c(x){ return String(x==null?'':x).trim(); }
  function l(x){ return Array.isArray(x)?x.filter(v=>c(v)):[]; }
  function uniq(arr){
    const out=[], seen=new Set();
    (arr||[]).forEach(v=>{
      const s=c(v).replace(/\s+/g,' ');
      if(!s) return;
      const k=s.toLowerCase();
      if(seen.has(k)) return;
      seen.add(k); out.push(s);
    });
    return out;
  }
  function splitTerms(str){
    if(Array.isArray(str)) return str;
    return c(str).split(/,|;|\n|\|/g).map(x=>x.trim()).filter(Boolean);
  }

  const FORMAT_NOUN = { can:'can', pouch:'pouch', tub:'tub', jar:'jar', bottle:'bottle', box:'carton', cooler:'cooler', package:'package' };

  function inferFormat(pkg){
    const existing=c(pkg&&pkg.package_format)||c(pkg&&pkg.fidelity_contract&&pkg.fidelity_contract.package_format)||c(pkg&&pkg.integration_treatment&&pkg.integration_treatment.package_format);
    if(existing) return existing==='carton'?'box':existing;
    const a=(pkg&&pkg.locked_asset)||{};
    const s=[a.asset_name,a.asset_type,a.image_ref,a.source_image_url,a.asset_url,a.media_type].map(c).join(' ').toLowerCase();
    // Jar (gummies, edibles) distinguished from tub (powders) so downstream
    // logic can hold shelf-stable, non-refrigerated behavior for both.
    if(/\b(jar|gummy|gummies|edible|edibles|softgel|softgels|capsule|capsules|honey|jam|preserves|salve|balm)\b/.test(s)) return 'jar';
    if(/\b(pouch|bag|packet|sachet|wrapper|jerky|granola|chips)\b/.test(s)) return 'pouch';
    if(/\b(can|soda|spritz|seltzer|rtd)\b/.test(s)) return 'can';
    if(/\b(tub|canister|pre[- ]?workout|supplement tub|powder container|protein tub)\b/.test(s)) return 'tub';
    if(/\b(bottle|shooter|squeeze|dropper|tincture|drops|vial|flask)\b/.test(s)) return 'bottle';
    if(/\b(cooler|hard[- ]?cooler|soft[- ]?cooler|ice[- ]?chest|hard[- ]?sided|hard[- ]?side)\b/.test(s)) return 'cooler';
    if(/\b(box|carton|case)\b/.test(s)) return 'box';
    return 'package';
  }

  /* State-lock neutralization. The art-director prompt tells the scene author
     that product state is locked; this is the belt-and-suspenders enforcement.
     If the authored prose describes the product as opened, uncapped, unwrapped,
     tipped, poured, or spilled, we neutralize the phrasing at compile time so
     the rendered prompt never contradicts the fidelity contract. Returns the
     rewritten prose plus the list of phrases we changed for the warning log. */
  // Note on regex construction: 'opened?' matches 'opene' or 'opened', NOT 'open'
  // (the ? applies only to the immediately preceding character). We use the
  // explicit '(?:open|opened)' alternation everywhere to catch both forms.
  const OPEN_WORD = '(?:open|opened)';
  const STATE_LOCK_PATTERNS = [
    [new RegExp('\\b(jar|bottle|can|pouch|tub|box|package|container)s?\\s+'+OPEN_WORD+'\\b','gi'), '$1 closed and sealed'],
    [new RegExp('\\bsits?\\s+'+OPEN_WORD+'\\b','gi'), 'sits'],
    [new RegExp('\\bstands?\\s+'+OPEN_WORD+'\\b','gi'), 'stands'],
    [new RegExp('\\brests?\\s+'+OPEN_WORD+'\\b','gi'), 'rests'],
    [new RegExp('\\bsitting\\s+'+OPEN_WORD+'\\b','gi'), 'sitting'],
    [new RegExp('\\bstanding\\s+'+OPEN_WORD+'\\b','gi'), 'standing'],
    [/\b(the\s+)?lid\s+(?:is\s+)?(?:off|removed|open)\b/gi, 'the lid on'],
    [/\b(the\s+)?cap\s+(?:is\s+)?(?:off|removed|open)\b/gi, 'the cap on'],
    [/\bwith\s+(the\s+)?(lid|cap)\s+(?:off|removed)\b/gi, 'with the $2 on'],
    [/\buncapped\b/gi, 'capped'],
    [/\bunsealed\b/gi, 'sealed'],
    [/\bunwrapped\b/gi, 'wrapped'],
    [/\bpoured\s+out\b/gi, 'held ready'],
    [/\bspilled\b/gi, 'settled'],
    [/\btipped\s+over\b/gi, 'upright'],
    [/\bcontents\s+visible\b/gi, 'contents held inside'],
    [/\bcontents\s+spilling\b/gi, 'contents held inside']
  ];
  function neutralizeStateLanguage(s){
    let out=c(s), changed=[];
    STATE_LOCK_PATTERNS.forEach(pair=>{
      const [pat,repl]=pair;
      const found=out.match(pat);
      if(found){
        changed=changed.concat(found);
        out=out.replace(pat,repl);
      }
    });
    return {out, changed};
  }

  /* Cleanup only. Removes markdown, meta labels, stray numeric placement
     coordinates, and instruction fragments that belong downstream. It never
     adds content and never reorders the authored prose. */
  function sanitizeAuthoredProse(s){
    let out=c(s);
    if(!out) return '';
    out=out
      .replace(/```[a-z]*\n?/gi,'')
      .replace(/^\s*(authored[_ ]prompt|prompt[_ ]seed|scene direction|render prompt)\s*[:\-]\s*/i,'')
      .replace(/\b(cx|cy|width_pct)\s*[:=]?\s*[\d.]+\s*,?/gi,'')
      .replace(/\b0\.\d+\b/g,'')
      .replace(/\s+/g,' ')
      .trim();
    if(out && !/[.!?]$/.test(out)) out+='.';
    return out;
  }

  /* Last-resort prose assembly when neither authored_prompt nor prompt_seed
     survived the handoff. Plain sentences, no field labels. */
  function assembleFallbackProse(sd){
    sd=sd||{};
    const parts=[
      c(sd.world_description),
      c(sd.locked_asset_placement_intent),
      c(sd.product_placement_intent)&&('The product '+c(sd.product_placement_intent).replace(/^the product\s*/i,'')),
      c(sd.composition),
      c(sd.lighting)
    ].filter(Boolean).map(s=>/[.!?]$/.test(s)?s:s+'.');
    return sanitizeAuthoredProse(parts.join(' '));
  }

  function peopleExcluded(pkg){
    // If the scene brief explicitly includes people at primary or supporting scale,
    // they are intended and should not be excluded by blanket negative language.
    const hp=c(pkg&&pkg.scene_brief&&pkg.scene_brief.human_presence).toLowerCase();
    if(hp==='primary_scale'||hp==='supporting_scale'||hp==='crowd_scale') return false;
    const hay=[
      splitTerms(pkg&&pkg.prompts&&pkg.prompts.negative).join(' '),
      l(pkg&&pkg.scene_brief&&pkg.scene_brief.avoid).join(' '),
      l(pkg&&pkg.integration_treatment&&pkg.integration_treatment.avoid).join(' ')
    ].join(' ').toLowerCase();
    return /\bno people\b|\bpeople or hands\b|\bno humans\b/.test(hay);
  }

  /* Gate Two optional locked-asset contract. Existing CPG packages still use
     locked_asset and receive the protection block below. World-only briefs pass
     locked_assets:[] and receive global scene protections without package
     language. */
  function hasLockedAsset(pkg){
    if(Array.isArray(pkg&&pkg.locked_assets)) return pkg.locked_assets.length>0;
    const asset=(pkg&&pkg.locked_asset)||{};
    return !![
      asset.asset_id,
      asset.asset_name,
      asset.image_ref,
      asset.source_image_url,
      asset.asset_url,
      asset.stored_asset_url,
      asset.image_data
    ].map(c).find(Boolean);
  }

  function primaryLockedAsset(pkg){
    if(Array.isArray(pkg&&pkg.locked_assets)&&pkg.locked_assets.length) return pkg.locked_assets[0]||{};
    return (pkg&&pkg.locked_asset)||{};
  }

  function isProductLockedAsset(pkg){
    if(!hasLockedAsset(pkg)) return false;
    return /^(packaging|product|product_photo|product_render)$/i.test(c(primaryLockedAsset(pkg).asset_type));
  }

  function protectedAssetName(pkg){
    const asset=primaryLockedAsset(pkg);
    return c(asset.asset_name)||c(asset.asset_type).replace(/_/g,' ')||'protected asset';
  }

  function deliveryContext(pkg){
    const sb=(pkg&&pkg.scene_brief)||{};
    const meta=(pkg&&pkg.meta)||{};
    const raw=(sb.delivery_context&&typeof sb.delivery_context==='object')
      ?sb.delivery_context
      :((meta.delivery_context&&typeof meta.delivery_context==='object')?meta.delivery_context:{});
    return {
      type:c(raw.type)||'still_image',
      width_px:Number(raw.width_px)||null,
      height_px:Number(raw.height_px)||null,
      duration_ms:Number(raw.duration_ms)||null,
      viewing_distance:c(raw.viewing_distance),
      loop:raw.loop===true,
      performer_clear_zone:c(raw.performer_clear_zone)
    };
  }

  function deliveryContextBlock(pkg){
    const context=deliveryContext(pkg);
    if(context.type!=='led_wall') return '';
    const sb=(pkg&&pkg.scene_brief)||{};
    const legibility=(sb.distance_legibility&&typeof sb.distance_legibility==='object')?sb.distance_legibility:{};
    const temporal=(sb.temporal_behavior&&typeof sb.temporal_behavior==='object')?sb.temporal_behavior:{};
    const dimensions=context.width_px&&context.height_px
      ?context.width_px+' by '+context.height_px+' pixels'
      :'the supplied panoramic dimensions';
    const durationMs=Number(temporal.duration_ms)||context.duration_ms||8000;
    const seconds=Math.max(1,Math.round(durationMs/1000));
    const zone=context.performer_clear_zone||'lower-center';
    const lines=[
      'Compose across the full panoramic '+dimensions+' LED wall with one dominant visual read that remains legible from far viewing distance.',
      c(legibility.primary_read)?'The primary read is '+c(legibility.primary_read)+'.':'Keep the primary read large, singular, and immediately recognizable.',
      'Protect the '+zone.replace(/_/g,' ')+' performer clear zone from dense detail, high-contrast edges, faces, text, and competing focal events.',
      c(temporal.motion_cycle)?'Over '+seconds+' seconds, '+c(temporal.motion_cycle).replace(/^[A-Z]/,m=>m.toLowerCase()).replace(/[.!?]?$/,'.'):'Use one slow, coherent motion cycle across the full duration.',
      c(temporal.loop_seam)?'The seamless loop reconnects invisibly because '+c(temporal.loop_seam).replace(/^[A-Z]/,m=>m.toLowerCase()).replace(/[.!?]?$/,'.'):'The seamless loop returns invisibly to its opening state with no hard cut, flash, or continuity jump.'
    ];
    return lines.join(' ');
  }

  function integrationSentence(pkg, format){
    const it=(pkg&&pkg.integration_treatment)||{};
    const allowed=uniq(l(it.allowed_effects)).map(e=>e.replace(/_/g,' ')).slice(0,6);
    const base=allowed.length?allowed.join(', '):'natural contact shadow, scene-matched reflected light and color spill, and soft depth of field';
    const formatExtra = format==='can'?' and physically motivated condensation or rim highlights where the scene supports them'
      : format==='pouch'?' and minor natural pouch crinkle at contact points'
      : format==='bottle'?' and physically motivated condensation or edge reflection where the scene supports them'
      : '';
    return 'Integrate it physically with '+base+formatExtra+', so it feels photographed in the scene, never pasted on.';
  }

  function protectionBlock(pkg, format){
    if(!hasLockedAsset(pkg)){
      const globalLines=[
        'Render only the authored environment and its explicitly approved unbranded environmental objects; introduce no additional focal object or readable identity mark.',
        'Any environmental surface that would carry writing (signs, screens, menus, posters, or displays) is blank, abstract, cropped, or defocused beyond reading, with no pseudo-text or letter-like marks anywhere.'
      ];
      if(peopleExcluded(pkg)) globalLines.push('No people or hands appear in the frame.');
      return globalLines.join(' ');
    }
    if(!isProductLockedAsset(pkg)){
      const preserve=uniq(l(pkg&&pkg.fidelity_contract&&pkg.fidelity_contract.preserve));
      const lines=[
        'Use the supplied '+protectedAssetName(pkg)+' as the identity source of truth; preserve its protected subject, artifact, anatomy, marks, proportions, and visible structure unchanged.',
        preserve.length?'Preserve exactly: '+preserve.join(', ')+'.':'Do not redraw, replace, or reinterpret the protected identity.',
        'Integrate it only through non-destructive environmental light, contact shadow, reflected color, atmosphere, occlusion, and depth effects that do not alter protected identity.',
        'Any environmental surface that would carry writing (signs, screens, menus, posters, or displays) is blank, abstract, cropped, or defocused beyond reading, with no pseudo-text or letter-like marks anywhere.'
      ];
      if(peopleExcluded(pkg)) lines.push('No additional people or hands appear in the frame.');
      return lines.join(' ');
    }
    const noun=FORMAT_NOUN[format]||'package';
    // Formats with a state (lid, cap, seal, wrapper) get an explicit closed-state
    // assertion. This is the second half of the state-lock belt-and-suspenders,
    // downstream of the authored-prose neutralization above.
    const statefulFormats=new Set(['jar','tub','bottle','box','pouch','cooler']);
    const lines=[
      'Preserve the supplied '+noun+' exactly as pictured: logo, label hierarchy, typography, colors, proportions, silhouette, and open or closed state unchanged, fully readable.'
    ];
    if(statefulFormats.has(format)){
      lines.push('The '+noun+' is closed and sealed exactly as supplied: lid on, cap on, wrapper intact, contents not exposed. Do not render the '+noun+' as opened, tipped, or with contents visible.');
    }
    lines.push(integrationSentence(pkg, format));
    lines.push('Any environmental surface that would carry writing (signs, screens, menus, posters, other packaging) is blank, abstract, cropped, or defocused beyond reading, with no pseudo-text or letter-like marks anywhere.');
    if(peopleExcluded(pkg)) lines.push('No people or hands appear in the frame.');
    return lines.join(' ');
  }

  /* Canonical compact negative, retained for future backends only. */
  function canonicalNegative(pkg){
    const base=isProductLockedAsset(pkg)
      ?['redrawn or retyped packaging','warped logo','recolored packaging','changed package proportions or silhouette','duplicate or extra branded products','readable environmental text or screen UI','pseudo-text or gibberish lettering','people or hands unless the scene allows them','category-default props not in the approved scene','product pasted on after the fact','placeholder frames or placement guides']
      :hasLockedAsset(pkg)
      ?['redrawn or replaced protected asset','altered protected identity or anatomy','changed protected marks or proportions','duplicate protected subject','readable environmental text or screen UI','pseudo-text or gibberish lettering','additional people or hands unless the scene allows them','category-default props not in the approved scene','protected asset pasted on after the fact','placeholder frames or placement guides']
      :['invented product or package','invented logo, label, SKU, or branded object','readable environmental text or screen UI','pseudo-text or gibberish lettering','people or hands unless the scene allows them','category-default props not in the approved scene','placeholder frames or placement guides'];
    const deliveryNegatives=deliveryContext(pkg).type==='led_wall'
      ?['hard cuts or montage','visible loop jump','fine unreadable detail','small focal subjects','full-frame high-frequency motion','content competing with the performer clear zone']
      :[];
    const userExclusions=uniq(l(pkg&&pkg.user_constraints&&pkg.user_constraints.exclusions));
    const terms=uniq([].concat(
      base,
      deliveryNegatives,
      userExclusions,
      splitTerms(pkg&&pkg.prompts&&pkg.prompts.negative).slice(0,6)
    ));
    return terms.join(', ');
  }

  /* Mode-aware opening line. The compiler prepends the framing sentence
     appropriate to the selected aesthetic mode, so the scene author never
     has to write it and never accidentally defaults to cinematic prose when
     the mode is documentary, editorial, or vernacular. Falls back to
     cinematic if no mode is provided. */
  const MODE_OPENING_LINES = {
    cinematic_film_still: 'A wide cinematic campaign-film still in landscape framing, a real environment with depth and atmosphere, not a tabletop product photo.',
    documentary_lifestyle: 'An eye-level documentary photograph in the tradition of outdoor and lifestyle editorial, real and observed rather than staged.',
    editorial_commercial: 'A composed editorial photograph in the tradition of magazine-cover lifestyle work, considered light and considered framing without cinematic drama.',
    vernacular_ugc: 'A vernacular photograph in the register of a phone camera in daily life, incidental and immediate, not a commercial frame.'
  };
  function openingLineForMode(pkg){
    const sb=(pkg&&pkg.scene_brief)||{};
    const context=deliveryContext(pkg);
    if(context.type==='led_wall'){
      const dimensions=context.width_px&&context.height_px
        ?context.width_px+' by '+context.height_px
        :'ultra-wide';
      return 'A panoramic LED-wall motion composition across a '+dimensions+' canvas, designed for a live performance and far-distance legibility.';
    }
    const explicit=c(sb.opening_line);
    if(explicit) return isProductLockedAsset(pkg)?explicit:explicit.replace(/,\s*not a tabletop product photo\.?$/i,'.');
    const modeId=c(sb.aesthetic_mode)||c(pkg&&pkg.aesthetic_mode)||'cinematic_film_still';
    const line=MODE_OPENING_LINES[modeId] || MODE_OPENING_LINES.cinematic_film_still;
    return isProductLockedAsset(pkg)?line:line.replace(/,\s*not a tabletop product photo\.?$/i,'.');
  }

  /* Safe-face-framing addendum. When people are permitted at primary scale,
     append one compact instruction that reduces face-model failure risk
     without constraining the artistic choice. */
  function safeFaceFramingAddendum(pkg){
    const sb=(pkg&&pkg.scene_brief)||{};
    const level=c(sb.human_presence);
    if(level!=='primary_scale') return '';
    // A generic protected asset may itself be a person or portrait. Do not add
    // hats, hair, gestures, gaze, motion, or reframing that could contradict
    // the unchanged-identity contract.
    if(hasLockedAsset(pkg)&&!isProductLockedAsset(pkg)) return '';
    return 'People appear with faces framed safely: a hat or cap brim shading the face, hair falling forward, hand-to-mouth or hand-to-face gestures, downward gaze at a task, three-quarter turn away from camera, motion, or partial defocus. No centered close frontal faces.';
  }


  /* ===================== world_board delivery context ===================== */

  function boardSceneBlock(scenes){
    if(!Array.isArray(scenes)||!scenes.length) return '';
    var capped=scenes.slice(0,4);
    var panels=capped.map(function(s){
      var parts=[];
      if(c(s.moment)) parts.push(c(s.moment));
      if(c(s.environment)) parts.push(c(s.environment));
      return parts.join(': ');
    }).filter(Boolean);
    if(!panels.length) return '';
    return 'The panels show these moments from one life: '+panels.join('. Next: ')+'.';
  }

  function boardProtectionBlock(pkg){
    const lines=[];
    if(isProductLockedAsset(pkg)){
      const noun=FORMAT_NOUN[inferFormat(pkg)]||'package';
      lines.push('Where the supplied '+noun+' appears in a panel, preserve it exactly as pictured: logo, label hierarchy, typography, colors, proportions, and silhouette unchanged and fully readable, identical across every panel it appears in.');
      lines.push('The '+noun+' appears in no more than two panels. The remaining panels are pure world with no product.');
    } else if(hasLockedAsset(pkg)){
      lines.push('Preserve the supplied protected asset unchanged wherever it appears, identical across panels.');
    } else {
      lines.push('No product, logo, label, or branded object appears in any panel.');
    }
    lines.push('No headline, caption, body copy, ingredient list, benefit tile, or infographic text anywhere on the board. Any surface that would carry writing stays blank, abstract, cropped, or defocused, with no pseudo-text or letter-like marks.');
    if(peopleExcluded(pkg)) lines.push('No people or hands appear in any panel.');
    return lines.join(' ');
  }

  function boardNegative(pkg){
    var base=splitTerms(canonicalNegative(pkg));
    var boardTerms=[
      'benefit tiles or text cards','headline or caption text','ingredient list','infographic layout',
      'charts or data callouts','icon grids','captioned labels','watermark text',
      'mismatched panels from different worlds','panels in conflicting palettes or light'
    ];
    return uniq([].concat(base, boardTerms)).join(', ');
  }

  function boardAssemble(pkg, scenes, storyboard){
    var sb=(pkg&&pkg.scene_brief)||{};
    var lighting=c(sb.lighting);

    var opening='A multi-panel visual world board on a single landscape canvas: several photographic views of one cohesive world, every panel sharing palette, light, and lens character, reading as one life across a real stretch of time.';

    var protagonist='';
    if(storyboard&&c(storyboard.protagonist)){
      protagonist='The person: '+c(storyboard.protagonist)+'.';
    }

    var pattern='';
    if(storyboard&&c(storyboard.lifestyle_pattern)){
      pattern='The rhythm: '+c(storyboard.lifestyle_pattern)+'.';
    }

    var arc='';
    if(storyboard&&c(storyboard.emotional_arc)){
      arc=c(storyboard.emotional_arc)+'.';
    }

    var sceneBlock=boardSceneBlock(scenes);

    var spine='Every panel matches in palette, light direction, color grade, and lens.';

    var quality='Each panel is photographic, never a chart, diagram, icon, or text block. Premium photoreal quality.';

    var protection=boardProtectionBlock(pkg);

    var compiled_positive=[opening,protagonist,pattern,arc,sceneBlock,spine,quality,protection].filter(Boolean).join(' ');
    var compiled_negative=boardNegative(pkg);

    var sceneChars=sceneBlock.length;
    var totalChars=compiled_positive.length;
    return {
      prompt_writer_id:'prose_preserving_compiler_v4',
      prompt_writer_version:VERSION,
      compiled_positive:compiled_positive,
      compiled_negative:compiled_negative,
      warnings:[],
      removed_terms:[],
      prompt_stats:{
        positive_chars:totalChars,
        negative_chars:compiled_negative.length,
        world_chars:sceneChars,
        world_share:totalChars?Math.round(100*sceneChars/totalChars):0,
        world_source:'storyboard_scenes',
        delivery_context:'world_board',
        board_scene_count:Math.min(Array.isArray(scenes)?scenes.length:0, 4),
        aesthetic_mode:c(sb.aesthetic_mode)||'cinematic_film_still',
        human_presence:c(sb.human_presence)||'trace_only'
      }
    };
  }

  function proseCompile(renderPackage){
    const pkg=renderPackage||{};
    const warnings=[];
    const sd=pkg.scene_brief||{};
    const format=inferFormat(pkg);

    let world=sanitizeAuthoredProse(sd.authored_prompt);
    let source='authored_prompt';
    if(!world){ world=sanitizeAuthoredProse(sd.prompt_seed); source='prompt_seed'; }
    if(!world){ world=assembleFallbackProse(sd); source='field_assembly'; warnings.push('No authored_prompt or prompt_seed reached the compiler; assembled minimal prose from scene fields.'); }
    if(!world){
      world=hasLockedAsset(pkg)
        ?'A cinematic world with real environmental depth built around the supplied protected asset.'
        :'A cinematic still with a specific environment, clear spatial depth, and motivated light.';
      source='generic';
      warnings.push('Scene brief was empty; compiled a generic world line.');
    }
    if(source!=='authored_prompt') warnings.push('World prose source: '+source+'.');

    // State-lock enforcement: neutralize opened/uncapped/unwrapped/poured/etc.
    // phrases the scene author may have slipped in against the fidelity contract.
    const stateFix=isProductLockedAsset(pkg)?neutralizeStateLanguage(world):{out:world,changed:[]};
    if(stateFix.changed.length){
      world=stateFix.out;
      warnings.push('State-lock neutralized authored phrasing: '+stateFix.changed.slice(0,5).join(' | '));
    }

    // Board delivery context: intercept before single-scene compilation
    var dc=deliveryContext(pkg);
    if(dc.type==='world_board'){
      var boardScenes=(pkg&&pkg.storyboard&&Array.isArray(pkg.storyboard.scenes))?pkg.storyboard.scenes:[];
      var boardStory=(pkg&&pkg.storyboard)||null;
      // Guard: only compile as board if we actually have scenes.
      // Without scenes the board prompt is empty and produces garbage.
      if(boardScenes.length>=2){
        return boardAssemble(pkg, boardScenes, boardStory);
      }
      // Fall through to single-scene compilation if no storyboard data
      warnings.push('world_board delivery context was set but no storyboard scenes were available; compiling as single scene instead.');
    }

        const opening=openingLineForMode(pkg);
    const contextBlock=deliveryContextBlock(pkg);
    const safeFace=safeFaceFramingAddendum(pkg);
    const compiled_positive=[
      opening,
      world,
      protectionBlock(pkg, format),
      contextBlock,
      safeFace
    ].filter(Boolean).join(' ');

    const compiled_negative=canonicalNegative(pkg);

    const worldChars=world.length, totalChars=compiled_positive.length;
    return {
      prompt_writer_id:'prose_preserving_compiler_v4',
      prompt_writer_version:VERSION,
      compiled_positive,
      compiled_negative,
      warnings:uniq(warnings),
      removed_terms:[],
      prompt_stats:{
        positive_chars:totalChars,
        negative_chars:compiled_negative.length,
        world_chars:worldChars,
        world_share:totalChars?Math.round(100*worldChars/totalChars):0,
        world_source:source,
        delivery_context:deliveryContext(pkg).type,
        aesthetic_mode:c((pkg&&pkg.scene_brief&&pkg.scene_brief.aesthetic_mode))||'cinematic_film_still',
        human_presence:c((pkg&&pkg.scene_brief&&pkg.scene_brief.human_presence))||'trace_only'
      }
    };
  }

  window.HR_PROMPT_WRITER_CONFIG={
    version:VERSION,
    defaultWriterId:'prose_preserving_compiler_v4',
    writers:{
      prose_preserving_compiler_v4:{
        id:'prose_preserving_compiler_v4',
        label:'Prose-Preserving Compiler v4 (mode- and delivery-aware)',
        supports:{engines:['generic'],modes:['world_exploration','protected_asset','product_accurate','composite','reference']},
        compile:proseCompile
      }
    }
  };
})();
