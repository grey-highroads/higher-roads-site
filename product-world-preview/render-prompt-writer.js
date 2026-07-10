(function(){
  'use strict';

  const VERSION = 'prompt-writer-2026-07-10-production-v1';

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
  function stripBadFragment(s){
    s=c(s).replace(/\s+/g,' ');
    if(!s) return '';
    if(/^0+(\.0+)?$/.test(s)) return '';
    if(/^(null|undefined|false|true|nan)$/i.test(s)) return '';
    if(/^(0\.?\s*)+$/.test(s)) return '';
    return s.replace(/\b0\.\s*0\.\s*/g,'').replace(/\s+/g,' ').trim();
  }
  function sentence(s){
    s=stripBadFragment(s);
    if(!s) return '';
    return /[.!?]$/.test(s)?s:s+'.';
  }
  function splitTerms(str){
    if(Array.isArray(str)) return str;
    return c(str).split(/,|;|\n|\|/g).map(x=>x.trim()).filter(Boolean);
  }
  function normalizeTerm(t){ return c(t).toLowerCase().replace(/^(no|avoid|without)\s+/,'').replace(/[.]/g,'').trim(); }
  function compactPrompt(parts){ return uniq(parts.map(sentence).filter(Boolean)).join(' '); }
  function lowerContains(hay, needle){ return c(hay).toLowerCase().includes(c(needle).toLowerCase()); }

  const FORMAT_TERMS = {
    can:['can body','can top','pull tab','rim','label wrap','cylindrical proportions'],
    pouch:['sealed pouch','top seal','hang hole if visible','gusset if visible','front face','product window if visible','pack silhouette'],
    bottle:['bottle body','cap','neck','shoulder','label wrap','bottle silhouette'],
    box:['carton panels','folds','closure','front face','edges','box proportions'],
    package:['package structure','front face','silhouette','proportions']
  };

  const INTEGRATION_PROFILES = {
    clean_interior:{
      allowed:['contact shadow','warm or cool color spill','soft reflection','edge darkening','slight package crinkle','subtle paper dust','lens softness'],
      avoid:['mud','heavy dust','field grime','wetness','condensation unless physically motivated']
    },
    field_outdoor:{
      allowed:['light dust','dirt speckling','minor scuffs','edge wear','gear shadow','local occlusion','weather light','minor pouch wrinkles'],
      avoid:['mud over logo','torn package','crushed silhouette','unreadable product name']
    },
    cold_beverage:{
      allowed:['condensation','wet base contact','cooler reflection','cold highlights','water droplets','soft edge shadow'],
      avoid:['label warping','fake printed droplets','unreadable flavor name']
    },
    kitchen_production:{
      allowed:['steam haze','soft oil sheen','flour or paper dust if relevant','counter reflection','warm practical light','light fingerprints'],
      avoid:['ingredient pile as main subject','fake labels','extra SKUs']
    },
    premium_retail:{
      allowed:['controlled reflection','glass softness','display shadow','low grime'],
      avoid:['readable store branding','altar composition','sterile stock look']
    }
  };

  function inferFormat(pkg){
    const existing=c(pkg&&pkg.package_format)||c(pkg&&pkg.fidelity_contract&&pkg.fidelity_contract.package_format)||c(pkg&&pkg.integration_treatment&&pkg.integration_treatment.package_format);
    if(existing) return existing==='carton'?'box':existing;
    const a=(pkg&&pkg.locked_asset)||{};
    const s=[a.asset_name,a.asset_type,a.image_ref,a.source_image_url,a.asset_url,a.media_type].map(c).join(' ').toLowerCase();
    if(/\b(pouch|bag|packet|sachet|wrapper|jerky|granola|chips)\b/.test(s)) return 'pouch';
    if(/\b(can|soda|spritz|seltzer|rtd|ready[- ]?to[- ]?drink)\b/.test(s)) return 'can';
    if(/\b(bottle|shooter|squeeze|jar|dropper|vial)\b/.test(s)) return 'bottle';
    if(/\b(box|carton|case|tub|tin)\b/.test(s)) return 'box';
    return 'package';
  }
  function inferProfile(pkg){
    const p=c(pkg&&pkg.integration_treatment&&pkg.integration_treatment.profile);
    if(p) return p;
    const s=[pkg&&pkg.meta&&pkg.meta.chosen_direction,pkg&&pkg.scene_brief&&pkg.scene_brief.world_description,pkg&&pkg.prompts&&pkg.prompts.positive].map(c).join(' ').toLowerCase();
    if(/trail|field|outdoor|mountain|ranger|gear|camp|forest|lake|dock|vehicle|tailgate/.test(s)) return 'field_outdoor';
    if(/cooler|condensation|cold|ice|pool|beverage/.test(s)) return 'cold_beverage';
    if(/kitchen|production|prep|bottling|workstation|steam|oil|flour/.test(s)) return 'kitchen_production';
    if(/retail|display|glass|store|shelf|premium|boutique/.test(s)) return 'premium_retail';
    return 'clean_interior';
  }
  function getSceneFamily(pkg){
    const s=[pkg&&pkg.meta&&pkg.meta.chosen_direction,pkg&&pkg.scene_brief&&pkg.scene_brief.world_description,pkg&&pkg.prompts&&pkg.prompts.positive].map(c).join(' ').toLowerCase();
    if(/trail|field|outdoor|mountain|ranger|gear|camp|forest|lake|dock|vehicle|tailgate/.test(s)) return 'field / outdoor';
    if(/cooler|cold|ice|condensation|pool|beverage/.test(s)) return 'cold beverage / refreshment';
    if(/kitchen|production|prep|bottling|workstation|cook|steam|oil|flour/.test(s)) return 'kitchen / production';
    if(/retail|display|store|shelf|boutique|counter|service/.test(s)) return 'retail / service';
    if(/conservatory|garden|greenhouse|botanical/.test(s)) return 'botanical / wellness';
    return 'brand world';
  }
  function sceneNouns(pkg){
    const sd=(pkg&&pkg.scene_brief)||{};
    const it=(pkg&&pkg.integration_treatment)||{};
    let seeds=[];
    seeds=seeds.concat(l(sd.props));
    seeds=seeds.concat(l(it.scene_anchors));
    const raw=c(pkg&&pkg.prompts&&pkg.prompts.positive);
    const nounish=[];
    const matMatch=raw.match(/materials:\s*([^.]*)/i);
    if(matMatch) nounish.push(...splitTerms(matMatch[1]));
    const settingMatch=raw.match(/setting:\s*([^.]*)/i);
    if(settingMatch){
      const s=settingMatch[1];
      ['tile','wood','shelving','cooler','glass','bench','counter','trail','bike racks','gear','towels','boxes','labels','aprons','cork boards','maps','shelf tags','work lamps','window light','terracotta pots','watering cans','iron frames','rope coils','field bag','wet boots','skillet','linen towel','wooden spoon','bottles','packing materials','workstation','doorway','forest','mountain light'].forEach(t=>{ if(lowerContains(s,t)) nounish.push(t); });
    }
    seeds=seeds.concat(nounish);
    return uniq(seeds).slice(0,8);
  }
  function foregroundMidBackground(pkg, anchors){
    const sd=(pkg&&pkg.scene_brief)||{};
    const setting=c(sd.world_description).toLowerCase();
    const direction=c(pkg&&pkg.meta&&pkg.meta.chosen_direction).toLowerCase();
    const joined=(direction+' '+setting+' '+anchors.join(' ')).toLowerCase();
    if(/trail|ranger|field|mountain|gear|camp|tailgate|outdoor/.test(joined)){
      return {
        foreground:'locked product sharp in the foreground on a worn table, bench, tailgate, cooler edge, or gear surface with believable contact shadow',
        midground:'rope, field bag, wet boots, trail maps, utility shelving, towels, water bottles, or recovery gear arranged as working context',
        background:'open doorway, trailhead road, forest edge, lake, parked vehicle, bike rack, or mountain light in soft focus'
      };
    }
    if(/kitchen|cook|skillet|prep|bottling|production|workstation|oil/.test(joined)){
      return {
        foreground:'locked product sharp in the foreground on the real working surface, label readable and scale believable',
        midground:'one active work cue such as skillet, towel, spoon, packing tray, empty unlabeled bottles, boxes, route cards, or prep tools',
        background:'tiles, shelves, window light, production room geometry, or kitchen depth in soft focus'
      };
    }
    if(/conservatory|greenhouse|garden|botanical|terracotta/.test(joined)){
      return {
        foreground:'locked product sharp on bench, ledge, shelf, or tile surface, physically grounded and label readable',
        midground:'terracotta pots, watering can, seed packets, plant tags, iron frames, or garden tools as restrained context',
        background:'glass panes, botanical depth, garden light, or greenhouse structure in soft focus'
      };
    }
    if(/retail|display|store|service|shelf|counter|premium/.test(joined)){
      return {
        foreground:'locked product sharp in the foreground with controlled reflection and readable identity',
        midground:'restrained shelf, counter, display edge, route card, glass, or packaging system with no competing labels',
        background:'store, service, display, or room architecture in soft focus without readable third-party branding'
      };
    }
    return {
      foreground:'locked product sharp in the foreground, label readable, physically grounded in the scene',
      midground:'a small set of scene-defining objects that explain use and scale',
      background:'real environmental depth in soft focus, not a flat tabletop backdrop'
    };
  }
  function removeContradictions(positive, negTerms, removed){
    const pos=c(positive).toLowerCase();
    const safe=[];
    const replacements={
      'bottles':'generated duplicate product labels or competing branded packages',
      'glass bottles':'generated duplicate product labels or competing branded packages',
      'stainless steel':'cool or clinical stainless surfaces unless explicitly part of the working environment',
      'labels':'generated duplicate product labels or competing branded packages',
      'signage':'readable third-party branding or invented branded signage'
    };
    negTerms.forEach(term=>{
      const t=c(term);
      if(!t) return;
      const key=normalizeTerm(t);
      if(pos.includes(key) && replacements[key]){
        removed.push({term:t, reason:'positive_negative_conflict', replacement:replacements[key]});
        safe.push(replacements[key]);
      }else if(pos.includes(key) && key.length>4){
        removed.push({term:t, reason:'positive_negative_conflict'});
      }else{
        safe.push(t);
      }
    });
    return uniq(safe);
  }
  function cleanNegativeTerms(positive, terms, removed){
    let negTerms=uniq((terms||[]).map(stripBadFragment).filter(Boolean));
    negTerms=removeContradictions(positive, negTerms, removed);
    const broadBan=/^(stainless steel|bottles|glass bottles|labels|signage)$/i;
    negTerms=negTerms.filter(t=>{
      if(broadBan.test(t)){
        removed.push({term:t, reason:'overbroad_negative'});
        return false;
      }
      return true;
    });
    return uniq(negTerms);
  }
  function rawNegativeTerms(pkg, profileInfo){
    let negTerms=[];
    negTerms=negTerms.concat([
      'redrawn packaging','retyped label','altered label hierarchy','changed package format','recolored packaging','warped logo','invented product text','generated duplicate products','extra branded packages','readable third-party branding','people or hands unless explicitly allowed','tabletop fallback','fake labels','competing brand identities','readable third-party logos, badges, patches, agency names, park service marks, store names, invented brand systems, fake sponsor marks, competing brand identities, or readable environmental signage that looks like another brand'
    ]);
    negTerms=negTerms.concat(l(profileInfo&&profileInfo.avoid));
    negTerms=negTerms.concat(splitTerms(pkg&&pkg.prompts&&pkg.prompts.negative));
    return negTerms;
  }

  function compileDeterministic(renderPackage, options){
    const pkg=renderPackage||{};
    const warnings=[];
    const removed_terms=[];
    const format=inferFormat(pkg);
    const formatTerms=FORMAT_TERMS[format]||FORMAT_TERMS.package;
    const profile=inferProfile(pkg);
    const profileInfo=INTEGRATION_PROFILES[profile]||INTEGRATION_PROFILES.clean_interior;
    const meta=pkg.meta||{};
    const sd=pkg.scene_brief||{};
    const it=pkg.integration_treatment||{};
    const direction=stripBadFragment(c(meta.chosen_direction)||'brand product world');
    const setting=stripBadFragment(c(sd.world_description));
    const placement=stripBadFragment(c(sd.product_placement_intent));
    const composition=stripBadFragment(c(sd.composition));
    const lighting=stripBadFragment(c(sd.lighting));
    const atmosphere=stripBadFragment(c(it.scene_specific_notes)||'Atmosphere is physically motivated and supports scene depth without hiding the product.');
    const anchors=sceneNouns(pkg);
    if(!setting) warnings.push('Scene world_description was empty; compiled prompt used direction only.');

    const allowedEffects=uniq([].concat(l(it.allowed_effects), profileInfo.allowed)).slice(0,10);
    const positiveParts=[
      'wide 16:9 cinematic product-world photograph, campaign-film still, real environment, not a tabletop product photo',
      'scene: '+direction,
      setting && ('setting: '+setting),
      placement && ('product placement: locked product is the readable hero, physically integrated into the environment; '+placement),
      composition && ('composition: '+composition),
      anchors.length && ('visual anchors: '+anchors.join(', ')),
      lighting && ('lighting: '+lighting),
      atmosphere && ('atmosphere: '+atmosphere),
      'physical integration: apply scene-matched non-destructive effects only where plausible, such as '+allowedEffects.join(', '),
      'environmental signage, maps, route cards, shelf tags, labels, utility markings, or operational symbols must be generic, non-branded, and not readable as a real or invented third-party identity',
      'product fidelity: identity-locked packaging; preserve package format ('+format+'), '+formatTerms.join(', ')+', logo, label hierarchy, text, color relationships, proportions, SKU or flavor identity, and primary graphic system unchanged'
    ];
    const compiled_positive=compactPrompt(positiveParts);
    const compiled_negative=cleanNegativeTerms(compiled_positive, rawNegativeTerms(pkg, profileInfo), removed_terms).join(', ');
    if(removed_terms.length) warnings.push('Removed or narrowed '+removed_terms.length+' positive/negative prompt conflict(s).');

    return {
      prompt_writer_id:'deterministic_compiler_v1',
      prompt_writer_version:VERSION,
      compiled_positive,
      compiled_negative,
      warnings:uniq(warnings),
      removed_terms,
      prompt_stats:{
        positive_chars:compiled_positive.length,
        negative_chars:compiled_negative.length,
        positive_fragments:positiveParts.filter(Boolean).length,
        negative_fragments:splitTerms(compiled_negative).length
      }
    };
  }

  function compileProductionVisual(renderPackage, options){
    const pkg=renderPackage||{};
    const warnings=[];
    const removed_terms=[];
    const format=inferFormat(pkg);
    const formatTerms=FORMAT_TERMS[format]||FORMAT_TERMS.package;
    const profile=inferProfile(pkg);
    const profileInfo=INTEGRATION_PROFILES[profile]||INTEGRATION_PROFILES.clean_interior;
    const meta=pkg.meta||{};
    const sd=pkg.scene_brief||{};
    const it=pkg.integration_treatment||{};
    const direction=stripBadFragment(c(meta.chosen_direction)||'brand product world');
    const setting=stripBadFragment(c(sd.world_description));
    const lighting=stripBadFragment(c(sd.lighting));
    const anchors=sceneNouns(pkg).slice(0,6);
    const spatial=foregroundMidBackground(pkg, anchors);
    const family=getSceneFamily(pkg);
    const allowedEffects=uniq([].concat(l(it.allowed_effects), profileInfo.allowed)).slice(0,7);
    const protectedRegions=uniq([].concat(l(it.protected_regions), formatTerms, ['logo','product name','flavor or SKU identity','label hierarchy','typography','primary color blocks','pack proportions'])).slice(0,12);

    if(!setting) warnings.push('Scene world_description was empty; production compiler used direction and spatial fallback.');
    if(sceneNouns(pkg).length>6) warnings.push('Visual anchors capped to 6 for production prompt clarity.');

    const visualAnchorText=anchors.length?anchors.join(', '):family+' environment';
    const positiveParts=[
      'Wide 16:9 campaign-film still, real '+family+' environment, cinematic product-world photograph, not tabletop product photography.',
      'Scene: '+direction+'. '+(setting?setting:'The environment has real scale, depth, and physical rules.'),
      'Foreground: '+spatial.foreground+'.',
      'Midground: '+spatial.midground+'. Keep supporting objects restrained; use only these visual anchors where helpful: '+visualAnchorText+'.',
      'Background: '+spatial.background+'.',
      lighting?('Lighting: '+lighting+'.'): 'Lighting: motivated natural or practical light, with controlled hero light keeping the product readable.',
      'Atmosphere: physically motivated depth from the scene; no haze, weather, steam, or reflections that hide the product.',
      'Physical integration: apply only light, non-destructive scene effects such as '+allowedEffects.join(', ')+'. Effects should sit over the locked asset as environmental treatment, not redesign the package.',
      'Product fidelity: identity-locked '+format+'; preserve '+protectedRegions.join(', ')+' unchanged and readable.',
      'All environmental signage, maps, labels, patches, badges, route cards, shelf tags, utility markings, and operational symbols must be generic, non-branded, and unreadable as any real or invented third-party identity.'
    ];
    const compiled_positive=compactPrompt(positiveParts);

    const productionNegatives=[
      'overexplained strategy language','brand manifesto text in the scene','too many props','cluttered set dressing','generic tabletop product photo','flat background','product floating without contact shadow','product pasted on after the fact','environmental effects covering logo','environmental effects covering product name','dirty or damaged packaging unless explicitly requested','readable signage','readable third-party logos','agency names','park service marks','store names','invented brand systems','fake sponsor marks','competing brand identities'
    ];
    const negTerms=cleanNegativeTerms(compiled_positive, rawNegativeTerms(pkg, profileInfo).concat(productionNegatives), removed_terms);
    if(removed_terms.length) warnings.push('Removed or narrowed '+removed_terms.length+' positive/negative prompt conflict(s).');

    return {
      prompt_writer_id:'production_visual_compiler_v1',
      prompt_writer_version:VERSION,
      compiled_positive,
      compiled_negative:negTerms.join(', '),
      warnings:uniq(warnings),
      removed_terms,
      prompt_stats:{
        positive_chars:compiled_positive.length,
        negative_chars:negTerms.join(', ').length,
        positive_fragments:positiveParts.filter(Boolean).length,
        negative_fragments:negTerms.length
      }
    };
  }

  window.HR_PROMPT_WRITER_CONFIG={
    version:VERSION,
    defaultWriterId:'production_visual_compiler_v1',
    writers:{
      production_visual_compiler_v1:{
        id:'production_visual_compiler_v1',
        label:'Production Visual Compiler v1',
        supports:{engines:['generic'],modes:['product_accurate','composite','reference']},
        compile:compileProductionVisual
      },
      deterministic_compiler_v1:{
        id:'deterministic_compiler_v1',
        label:'Deterministic Compiler v1',
        supports:{engines:['generic'],modes:['product_accurate','composite','reference']},
        compile:compileDeterministic
      }
    }
  };
})();
