(function(){
  'use strict';
  const VERSION = 'prompt-writer-2026-07-24-prose-preserving-v3';
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

  const FORMAT_NOUN = { can:'can', pouch:'pouch', tub:'tub', bottle:'bottle', box:'carton', package:'package' };

  function inferFormat(pkg){
    const existing=c(pkg&&pkg.package_format)||c(pkg&&pkg.fidelity_contract&&pkg.fidelity_contract.package_format)||c(pkg&&pkg.integration_treatment&&pkg.integration_treatment.package_format);
    if(existing) return existing==='carton'?'box':existing;
    const a=(pkg&&pkg.locked_asset)||{};
    const s=[a.asset_name,a.asset_type,a.image_ref,a.source_image_url,a.asset_url,a.media_type].map(c).join(' ').toLowerCase();
    if(/\b(pouch|bag|packet|sachet|wrapper|jerky|granola|chips)\b/.test(s)) return 'pouch';
    if(/\b(can|soda|spritz|seltzer|rtd)\b/.test(s)) return 'can';
    if(/\b(tub|jar|canister|pre-workout|supplement tub|powder container)\b/.test(s)) return 'tub';
    if(/\b(bottle|shooter|squeeze|vial)\b/.test(s)) return 'bottle';
    if(/\b(box|carton|case)\b/.test(s)) return 'box';
    return 'package';
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
    const lines=[
      'Preserve the supplied '+noun+' exactly as pictured: logo, label hierarchy, typography, colors, proportions, silhouette, and open or closed state unchanged, fully readable.',
      integrationSentence(pkg, format),
      'Any environmental surface that would carry writing (signs, screens, menus, posters, other packaging) is blank, abstract, cropped, or defocused beyond reading, with no pseudo-text or letter-like marks anywhere.'
    ];
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

    const compiled_positive=[
      'A wide cinematic campaign-film still in landscape framing, a real environment with depth and atmosphere, not a tabletop product photo.',
      world,
      protectionBlock(pkg, format)
    ].join(' ');

    const compiled_negative=canonicalNegative(pkg);

    const worldChars=world.length, totalChars=compiled_positive.length;
    return {
      prompt_writer_id:'prose_preserving_compiler_v3',
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
        world_source:source
      }
    };
  }

  window.HR_PROMPT_WRITER_CONFIG={
    version:VERSION,
    defaultWriterId:'prose_preserving_compiler_v3',
    writers:{
      prose_preserving_compiler_v3:{
        id:'prose_preserving_compiler_v3',
        label:'Prose-Preserving Compiler v3',
        supports:{engines:['generic'],modes:['product_accurate','composite','reference']},
        compile:proseCompile
      }
    }
  };
})();
