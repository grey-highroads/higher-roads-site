(function(){
  'use strict';
  const VERSION = 'prompt-writer-2026-07-10-production-v2';

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
  function firstSentence(s){
    s=stripBadFragment(s);
    if(!s) return '';
    const m=s.match(/^(.{1,260}?[.!?])\s/);
    return m?m[1]:s.slice(0,260).replace(/[,;:]?\s+\S*$/,'');
  }

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
    if(/\b(can|soda|spritz|seltzer|rtd)\b/.test(s)) return 'can';
    if(/\b(bottle|shooter|squeeze|jar|vial)\b/.test(s)) return 'bottle';
    if(/\b(box|carton|case)\b/.test(s)) return 'box';
    return 'package';
  }
  function inferProfile(pkg){
    const p=c(pkg&&pkg.integration_treatment&&pkg.integration_treatment.profile);
    if(p) return p;
    const s=[pkg&&pkg.meta&&pkg.meta.chosen_direction,pkg&&pkg.scene_brief&&pkg.scene_brief.world_description,pkg&&pkg.prompts&&pkg.prompts.positive].map(c).join(' ').toLowerCase();
    if(/trail|field|outdoor|mountain|ranger|gear|camp|forest|lake|dock|vehicle|tailgate|stone|dust|road/.test(s)) return 'field_outdoor';
    if(/cooler|condensation|cold|ice|pool|beverage|can|spritz/.test(s)) return 'cold_beverage';
    if(/kitchen|production|prep|bottling|workstation|steam|oil|flour|skillet|counter/.test(s)) return 'kitchen_production';
    if(/retail|display|glass|store|shelf|premium|boutique|gallery/.test(s)) return 'premium_retail';
    return 'clean_interior';
  }
  function sceneText(pkg){
    return [pkg&&pkg.meta&&pkg.meta.chosen_direction,pkg&&pkg.scene_brief&&pkg.scene_brief.world_description,pkg&&pkg.scene_brief&&pkg.scene_brief.composition,pkg&&pkg.prompts&&pkg.prompts.positive].map(c).join(' ').toLowerCase();
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
      ['tile floor','painted wood','shelving','cooler','glass partition','work bench','counter','trail','bike racks','gear bags','towels','boxes','paper labels','canvas aprons','cork boards','maps','route cards','shelf tags','work lamps','window light','terracotta pots','watering cans','iron frames','rope coils','wet boots','field bag','stone table','open doorway','mountain light'].forEach(t=>{ if(lowerContains(s,t)) nounish.push(t); });
    }
    seeds=seeds.concat(nounish);
    return uniq(seeds).slice(0,8);
  }
  function spatialAnchors(anchors){
    anchors=uniq(anchors).slice(0,8);
    const fg=anchors.slice(0,2).join(', ');
    const mg=anchors.slice(2,5).join(', ');
    const bg=anchors.slice(5,8).join(', ');
    return {fg,mg,bg};
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

  function sceneNativeIntegration(pkg, profile, format, profileInfo){
    const s=sceneText(pkg);
    const formatPhrase = format==='pouch' ? 'minor pouch crinkle' : format==='can' ? 'clean rim highlight' : format==='bottle' ? 'subtle edge reflection' : 'slight edge texture';

    if(profile==='field_outdoor'){
      const terrain = /stone|rock|granite/.test(s) ? 'warm reflected light from stone' : /snow|alpine|cold/.test(s) ? 'cool alpine light spill' : /road|trail|dust|gravel/.test(s) ? 'dry trail dust' : 'dry outdoor dust';
      const shadow = /rope|gear|bag|boot|bike/.test(s) ? 'soft gear shadow' : 'soft local shadow from nearby field objects';
      return uniq(['dry dust on lower package edges', shadow, terrain, 'minor scuffs at contact points', formatPhrase, 'logo and product name fully readable']).join(', ');
    }
    if(profile==='cold_beverage'){
      return uniq(['condensation beads on the product surface','wet contact base','cold edge highlights','soft cooler or glass reflection','label wrap and flavor name fully readable']).join(', ');
    }
    if(profile==='kitchen_production'){
      const surface = /oil|skillet|pan|drizzle|kitchen/.test(s) ? 'warm counter reflection and faint oil sheen nearby' : 'soft work-surface reflection';
      return uniq([surface,'steam haze behind the product','light paper dust or fingerprints only where plausible','clean label face','product name fully readable']).join(', ');
    }
    if(profile==='premium_retail'){
      return uniq(['controlled glass reflection','soft display shadow','clean edge highlight','low grime','no readable store branding']).join(', ');
    }
    return uniq(['natural contact shadow','subtle environmental color spill','soft edge darkening','slight package crinkle if plausible','clean readable label face']).join(', ');
  }

  function compressedNegative(positive, pkg, profileInfo, removed){
    let terms=[];
    terms=terms.concat([
      'redrawn packaging','retyped label','altered label hierarchy','changed package format','recolored packaging','warped logo','invented product text','generated duplicate products','extra branded packages','readable third-party branding','people or hands unless explicitly allowed','tabletop fallback','cluttered set dressing','too many props','generic stock-photo styling','product pasted on after the fact','environmental effects covering logo or product name','fake sponsor marks','competing brand identities'
    ]);
    terms=terms.concat(l(profileInfo.avoid));
    terms=terms.concat(splitTerms(pkg&&pkg.prompts&&pkg.prompts.negative));
    terms=terms.map(stripBadFragment).filter(Boolean);
    terms=removeContradictions(positive, uniq(terms), removed);
    const broadBan=/^(stainless steel|bottles|glass bottles|labels|signage)$/i;
    terms=terms.filter(t=>{
      if(broadBan.test(t)){
        removed.push({term:t, reason:'overbroad_negative'});
        return false;
      }
      return true;
    });

    const groups=[
      {re:/redrawn packaging|retyped label|altered label hierarchy|changed package format|recolored packaging|warped logo|invented product text/i, out:'redrawn packaging, retyped labels, altered hierarchy, changed package format, recolored packaging, warped logo, or invented product text'},
      {re:/generated duplicate products|extra branded packages|fake labels|competing brand identities/i, out:'generated duplicate products, extra branded packages, fake labels, or competing brand identities'},
      {re:/readable third-party|third-party logos|badges|patches|agency names|park service marks|store names|invented brand systems|fake sponsor marks|readable environmental signage/i, out:'readable third-party logos, badges, patches, agency names, store names, invented brand systems, fake sponsor marks, or readable environmental signage'},
      {re:/people or hands/i, out:'people or hands unless explicitly allowed'},
      {re:/tabletop fallback|generic tabletop/i, out:'generic tabletop fallback'},
      {re:/cluttered|too many props|overly styled|prop overload/i, out:'cluttered set dressing or too many props'},
      {re:/product pasted|pasted on/i, out:'product pasted on after the fact'},
      {re:/environmental effects covering logo|mud over logo|unreadable product name|label warping|fake printed droplets|torn package|crushed silhouette/i, out:'environmental effects covering logo/product name, label warping, torn packaging, or crushed silhouette'}
    ];
    const compressed=[];
    groups.forEach(g=>{
      const matched=terms.some(t=>g.re.test(t));
      if(matched) compressed.push(g.out);
    });
    // Keep a small number of specific avoid terms not captured by groups.
    terms.forEach(t=>{
      if(groups.some(g=>g.re.test(t))) return;
      if(compressed.length>=14) return;
      compressed.push(t);
    });
    return uniq(compressed).join(', ');
  }

  function deterministicCompile(renderPackage){
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
    const compiled_negative=compressedNegative(compiled_positive, pkg, profileInfo, removed_terms);
    if(removed_terms.length) warnings.push('Removed or narrowed '+removed_terms.length+' positive/negative prompt conflict(s).');
    return result('deterministic_compiler_v1','Deterministic Compiler v1',compiled_positive,compiled_negative,warnings,removed_terms,positiveParts.filter(Boolean).length,splitTerms(compiled_negative).length);
  }

  function productionCompile(renderPackage, options){
    const pkg=renderPackage||{};
    const warnings=[];
    const removed_terms=[];
    const format=inferFormat(pkg);
    const formatTerms=FORMAT_TERMS[format]||FORMAT_TERMS.package;
    const profile=inferProfile(pkg);
    const profileInfo=INTEGRATION_PROFILES[profile]||INTEGRATION_PROFILES.clean_interior;
    const meta=pkg.meta||{};
    const sd=pkg.scene_brief||{};
    const direction=stripBadFragment(c(meta.chosen_direction)||'brand product world');
    const setting=firstSentence(sd.world_description)||direction;
    const placement=stripBadFragment(c(sd.product_placement_intent));
    const lighting=stripBadFragment(c(sd.lighting));
    const composition=stripBadFragment(c(sd.composition));
    const anchors=sceneNouns(pkg);
    const spatial=spatialAnchors(anchors);
    const integration=sceneNativeIntegration(pkg, profile, format, profileInfo);

    if(anchors.length>6) warnings.push('Visual anchors compressed into foreground/midground/background staging.');
    if(!c(sd.world_description)) warnings.push('Scene world_description was empty; compiled prompt used direction only.');

    const foreground=[
      'locked product is the sharp foreground hero',
      placement || 'front face readable, natural scale, believable contact shadow',
      spatial.fg && ('nearby anchors: '+spatial.fg)
    ].filter(Boolean).join('; ');
    const midground=[
      spatial.mg && ('midground shows '+spatial.mg),
      composition && composition.length<220 ? composition : ''
    ].filter(Boolean).join('; ');
    const background=spatial.bg ? ('background opens into '+spatial.bg+' with real depth and soft focus') : 'background shows enough real environment to explain where the product belongs';
    const light=lighting || 'motivated natural or practical light keeps the label readable and physically matched to the scene';
    const atmosphere='atmosphere is physically motivated, restrained, and does not obscure the product';

    const positiveParts=[
      'wide 16:9 campaign-film still, cinematic product-world photograph, real environment, not a tabletop product photo',
      'scene: '+direction,
      'setting: '+setting,
      'foreground: '+foreground,
      midground && ('midground: '+midground),
      'background: '+background,
      'lighting: '+light,
      atmosphere,
      'physical integration: '+integration,
      'all environmental markings are generic and unreadable; no third-party logos, patches, agency names, store names, or invented brand systems',
      'product fidelity: preserve identity-locked '+format+' packaging, '+formatTerms.join(', ')+', logo, label hierarchy, typography, product text, color relationships, proportions, SKU or flavor identity, primary graphic system, and silhouette unchanged'
    ];
    const compiled_positive=compactPrompt(positiveParts);
    const compiled_negative=compressedNegative(compiled_positive, pkg, profileInfo, removed_terms);
    if(removed_terms.length) warnings.push('Compressed or removed '+removed_terms.length+' conflicting/overbroad negative term(s).');
    return result('production_visual_compiler_v2','Production Visual Compiler v2',compiled_positive,compiled_negative,warnings,removed_terms,positiveParts.filter(Boolean).length,splitTerms(compiled_negative).length);
  }

  function result(id,label,compiled_positive,compiled_negative,warnings,removed_terms,posFragments,negFragments){
    return {
      prompt_writer_id:id,
      prompt_writer_version:VERSION,
      compiled_positive,
      compiled_negative,
      warnings:uniq(warnings),
      removed_terms,
      prompt_stats:{
        positive_chars:compiled_positive.length,
        negative_chars:compiled_negative.length,
        positive_fragments:posFragments,
        negative_fragments:negFragments
      }
    };
  }

  window.HR_PROMPT_WRITER_CONFIG={
    version:VERSION,
    defaultWriterId:'production_visual_compiler_v2',
    writers:{
      deterministic_compiler_v1:{
        id:'deterministic_compiler_v1',
        label:'Deterministic Compiler v1',
        supports:{engines:['generic'],modes:['product_accurate','composite','reference']},
        compile:deterministicCompile
      },
      production_visual_compiler_v2:{
        id:'production_visual_compiler_v2',
        label:'Production Visual Compiler v2',
        supports:{engines:['generic'],modes:['product_accurate','composite','reference']},
        compile:productionCompile
      }
    }
  };
})();
