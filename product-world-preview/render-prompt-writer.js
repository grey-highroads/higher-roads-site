(function(){
  'use strict';
  const VERSION = 'prompt-writer-2026-07-24-mode-aware-v4';
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
      c(sd.product_placement_intent)&&('The product '+c(sd.product_placement_intent).replace(/^the product\s*/i,'')),
      c(sd.composition),
      c(sd.lighting)
    ].filter(Boolean).map(s=>/[.!?]$/.test(s)?s:s+'.');
    return sanitizeAuthoredProse(parts.join(' '));
  }

  function peopleExcluded(pkg){
    const hay=[
      splitTerms(pkg&&pkg.prompts&&pkg.prompts.negative).join(' '),
      l(pkg&&pkg.scene_brief&&pkg.scene_brief.avoid).join(' '),
      l(pkg&&pkg.integration_treatment&&pkg.integration_treatment.avoid).join(' ')
    ].join(' ').toLowerCase();
    return /\bno people\b|\bpeople or hands\b|\bno humans\b/.test(hay);
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
    const terms=uniq([].concat([
      'redrawn or retyped packaging','warped logo','recolored packaging','changed package proportions or silhouette','duplicate or extra branded products','readable environmental text or screen UI','pseudo-text or gibberish lettering','people or hands unless the scene allows them','category-default props not in the approved scene','product pasted on after the fact','placeholder frames or placement guides'
    ], splitTerms(pkg&&pkg.prompts&&pkg.prompts.negative).slice(0,6)));
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
    const explicit=c(sb.opening_line);
    if(explicit) return explicit;
    const modeId=c(sb.aesthetic_mode)||c(pkg&&pkg.aesthetic_mode)||'cinematic_film_still';
    return MODE_OPENING_LINES[modeId] || MODE_OPENING_LINES.cinematic_film_still;
  }

  /* Safe-face-framing addendum. When people are permitted at primary scale,
     append one compact instruction that reduces face-model failure risk
     without constraining the artistic choice. */
  function safeFaceFramingAddendum(pkg){
    const sb=(pkg&&pkg.scene_brief)||{};
    const level=c(sb.human_presence);
    if(level!=='primary_scale') return '';
    return 'People appear with faces framed safely: a hat or cap brim shading the face, hair falling forward, hand-to-mouth or hand-to-face gestures, downward gaze at a task, three-quarter turn away from camera, motion, or partial defocus. No centered close frontal faces.';
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
    if(!world){ world='A cinematic brand-world photograph with real environmental depth built around the supplied product.'; source='generic'; warnings.push('Scene brief was empty; compiled a generic world line.'); }
    if(source!=='authored_prompt') warnings.push('World prose source: '+source+'.');

    // State-lock enforcement: neutralize opened/uncapped/unwrapped/poured/etc.
    // phrases the scene author may have slipped in against the fidelity contract.
    const stateFix=neutralizeStateLanguage(world);
    if(stateFix.changed.length){
      world=stateFix.out;
      warnings.push('State-lock neutralized authored phrasing: '+stateFix.changed.slice(0,5).join(' | '));
    }

    const opening=openingLineForMode(pkg);
    const safeFace=safeFaceFramingAddendum(pkg);
    const compiled_positive=[
      opening,
      world,
      protectionBlock(pkg, format),
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
        label:'Prose-Preserving Compiler v4 (mode-aware)',
        supports:{engines:['generic'],modes:['product_accurate','composite','reference']},
        compile:proseCompile
      }
    }
  };
})();
