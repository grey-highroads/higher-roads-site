(function(){
  'use strict';
  const VERSION = 'prompt-writer-2026-07-10-v1';

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
  function lowerContains(hay, needle){ return c(hay).toLowerCase().includes(c(needle).toLowerCase()); }
  function splitTerms(str){
    if(Array.isArray(str)) return str;
    return c(str).split(/,|;|\n|\|/g).map(x=>x.trim()).filter(Boolean);
  }
  function normalizeTerm(t){ return c(t).toLowerCase().replace(/^(no|avoid|without)\s+/,'').replace(/[.]/g,'').trim(); }

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
    if(/\b(pouch|bag|packet|sachet|wrapper)\b/.test(s)) return 'pouch';
    if(/\b(can|soda|spritz|seltzer)\b/.test(s)) return 'can';
    if(/\b(bottle|shooter|squeeze|jar)\b/.test(s)) return 'bottle';
    if(/\b(box|carton|case)\b/.test(s)) return 'box';
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
      ['tile','wood','shelving','cooler','glass','bench','counter','trail','bike racks','gear','towels','boxes','labels','aprons','cork boards','maps','shelf tags','work lamps','window light','terracotta pots','watering cans','iron frames'].forEach(t=>{ if(lowerContains(s,t)) nounish.push(t); });
    }
    seeds=seeds.concat(nounish);
    return uniq(seeds).slice(0,8);
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
  function compactPrompt(parts){ return uniq(parts.map(sentence).filter(Boolean)).join(' '); }

  function compile(renderPackage, options){
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
    if(anchors.length>8) warnings.push('Visual anchors were capped to reduce prop overload.');

    const protectedRegions=uniq([].concat(l(it.protected_regions), formatTerms, ['logo','product name','flavor or SKU identity','label hierarchy','typography','primary graphic system','color relationships','pack proportions']));
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

    let negTerms=[];
    negTerms=negTerms.concat([
      'redrawn packaging','retyped label','altered label hierarchy','changed package format','recolored packaging','warped logo','invented product text','generated duplicate products','extra branded packages','readable third-party branding','people or hands unless explicitly allowed','tabletop fallback','fake labels','competing brand identities','readable third-party logos, badges, patches, agency names, park service marks, store names, invented brand systems, fake sponsor marks, competing brand identities, or readable environmental signage that looks like another brand'
    ]);
    negTerms=negTerms.concat(l(profileInfo.avoid));
    negTerms=negTerms.concat(splitTerms(pkg.prompts&&pkg.prompts.negative));
    negTerms=negTerms.map(stripBadFragment).filter(Boolean);
    const before=negTerms.slice();
    negTerms=removeContradictions(compiled_positive, uniq(negTerms), removed_terms);
    if(removed_terms.length) warnings.push('Removed or narrowed '+removed_terms.length+' positive/negative prompt conflict(s).');
    // Remove raw broad material bans that often conflict with real-world scene grammar.
    const broadBan=/^(stainless steel|bottles|glass bottles|labels|signage)$/i;
    negTerms=negTerms.filter(t=>{
      if(broadBan.test(t)){
        removed_terms.push({term:t, reason:'overbroad_negative'});
        return false;
      }
      return true;
    });
    const compiled_negative=uniq(negTerms).join(', ');

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
        negative_fragments:uniq(negTerms).length
      }
    };
  }

  window.HR_PROMPT_WRITER_CONFIG={
    version:VERSION,
    defaultWriterId:'deterministic_compiler_v1',
    writers:{
      deterministic_compiler_v1:{
        id:'deterministic_compiler_v1',
        label:'Deterministic Compiler v1',
        supports:{engines:['generic'],modes:['product_accurate','composite','reference']},
        compile
      }
    }
  };
})();
