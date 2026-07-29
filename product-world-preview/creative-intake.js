(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.HR_CREATIVE_INTAKE=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const INPUT_TYPES=['url','url_reference','text_brief','artifact_reference','image_upload','grid_capture'];
  const DELIVERY_CONTEXTS={
    still_image:{
      type:'still_image',
      name:'Still image',
      output_kind:'static_frame',
      aspect_ratio:'16:9',
      loop:false
    },
    led_wall:{
      type:'led_wall',
      name:'Panoramic LED wall',
      output_kind:'motion_loop',
      width_px:2560,
      height_px:800,
      duration_ms:8000,
      loop:true,
      viewing_distance:'arena',
      performer_clear_zone:'lower-center'
    },
    world_board:{
      type:'world_board',
      name:'Visual world board',
      output_kind:'multi_panel_board',
      width_px:1920,
      height_px:1080,
      loop:false,
      viewing_distance:'near'
    }
  };

  function text(value){
    return String(value==null?'':value).replace(/\s+/g,' ').trim();
  }

  function list(value){
    const source=Array.isArray(value)?value:(value==null||value===''?[]:[value]);
    const seen=new Set();
    return source.map(text).filter(item=>{
      const key=item.toLowerCase();
      if(!item||seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function sceneAssetBoundary(scene,lockedAssetCount){
    const count=Number(lockedAssetCount)||0;
    if(count>0) return {valid:true,hard:[],ambiguous:[],signals:[]};
    const source=scene&&typeof scene==='object'?scene:{};
    const placementText=[
      text(source.locked_asset_placement_intent),
      text(source.product_placement_intent)
    ].filter(Boolean);
    const sceneText=[
      text(source.authored_prompt),
      text(source.prompt_seed),
      text(source.world_description),
      text(source.composition),
      text(source.creative_rationale),
      list(source.props).join(' '),
      list(source.signature_objects).join(' '),
      list(source.source_specific_cues).join(' ')
    ].join(' ');
    // Hard signals: structural fields or terms that unambiguously indicate
    // an invented product. These always trigger repair.
    const hardPatterns=[
      ['product',/\bproduct\b/i],
      ['logo',/\blogo(?:type)?\b/i],
      ['sku',/\bsku\b/i],
      ['packshot',/\bpackshot\b/i]
    ];
    // Ambiguous signals: terms that may appear in legitimate creative prose
    // (a gnome workshop with packing crates, a labeled potion jar). A single
    // ambiguous hit warns. Two or more together trigger repair, since the
    // combination pattern is strong evidence of an invented product.
    const ambiguousPatterns=[
      ['package',/\bpackag(?:e|ed|ing)\b/i],
      ['branding',/\bbranded\b|\bbrand mark\b/i],
      ['label',/\blabel(?:s|ed|ling)?\b|\blabel hierarchy\b/i],
      ['supplement',/\bsupplement\b/i],
      ['gummy product',/\bgumm(?:y|ies)\b/i]
    ];
    const hard=[];
    const ambiguous=[];
    if(placementText.length) hard.push('asset_placement');
    hardPatterns.forEach(([name,pattern])=>{ if(pattern.test(sceneText)) hard.push(name); });
    ambiguousPatterns.forEach(([name,pattern])=>{ if(pattern.test(sceneText)) ambiguous.push(name); });
    if(Array.isArray(source.locked_asset_placements)&&source.locked_asset_placements.length){
      hard.push('locked_asset_placements');
    }
    if(text(source.render_path).toLowerCase()==='composite') hard.push('composite_render_path');
    // Hard signals always fail. Multiple ambiguous signals together also fail.
    const valid=hard.length===0&&ambiguous.length<2;
    return {valid,hard:list(hard),ambiguous:list(ambiguous),signals:list(hard.concat(ambiguous))};
  }

  function deliveryContext(value){
    const key=text(value)||'still_image';
    return Object.assign({},DELIVERY_CONTEXTS[key]||DELIVERY_CONTEXTS.still_image);
  }

  function ensureInputType(value){
    const type=text(value);
    if(!INPUT_TYPES.includes(type)) throw new Error('Unsupported creative input type: '+type);
    return type;
  }

  function constraintsFrom(fragment,explicitExclusions){
    return {
      requirements:list(fragment&&fragment.requirements_added),
      avoid:list([].concat(
        list(fragment&&fragment.avoid_added),
        text(explicitExclusions)?[text(explicitExclusions)]:[]
      ))
    };
  }

  function lockedAssetRecord(file,preserveInstructions,assetType){
    if(!file) return null;
    return {
      asset_id:'locked_asset_1',
      asset_name:text(file.name)||'Protected asset',
      asset_type:text(assetType)||'digital_artifact',
      media_type:text(file.type)||'application/octet-stream',
      lock_status:'locked',
      preserve_elements:text(preserveInstructions)?[text(preserveInstructions)]:[],
      source_file:file
    };
  }

  function assembleDossierData(input,fragment,lockedAsset){
    const type=ensureInputType(input&&input.type);
    const context=deliveryContext(input&&input.delivery_context);
    const evidence=fragment&&typeof fragment==='object'?fragment:{};
    // A visual or named reference is evidence, not authority. Only a
    // user-authored text brief may promote reader-extracted "must/no" language
    // into hard constraints. Other source types receive hard exclusions solely
    // from the explicit exclusions field.
    const constraints=type==='text_brief'
      ?constraintsFrom(evidence,input&&input.explicit_exclusions)
      :{
        requirements:[],
        avoid:text(input&&input.explicit_exclusions)?[text(input.explicit_exclusions)]:[]
      };
    const lockedAssets=lockedAsset?[lockedAsset]:[];
    const sourceName=text(input&&input.source_name)
      ||text(evidence.source)
      ||(type==='text_brief'?'Plain-text creative brief':type.replace(/_/g,' '));
    const intent=text(input&&input.intent)
      ||list(evidence.territory)[0]
      ||text(input&&input.raw_text);
    const anchor={
      anchor_id:'anchor_1',
      type,
      source:sourceName,
      role:type==='text_brief'?'creative_brief':'visual_system',
      polarity:text(evidence.polarity)||'reference_only',
      user_context:text(input&&input.user_context),
      confidence:text(evidence.confidence)||'unknown',
      read_notes:text(evidence.read_notes),
      evidence:{
        territory:list(evidence.territory),
        visual_evidence:list(evidence.visual_evidence),
        tonal_evidence:list(evidence.tonal_evidence),
        reference_points:list(evidence.reference_points)
      }
    };
    // Evidence lives once, in the anchor. The intake_expressive block keeps
    // only content that does not exist in the anchor: user context, delivery
    // occasion, reader notes, and the composed intent. Empty structures stay
    // present so downstream readers of the dossier shape never branch.
    return {
      brand:sourceName,
      brief:{
        intent,
        source_name:sourceName,
        source_kind:type,
        anchors:[anchor],
        delivery_context:context,
        requirements:constraints.requirements,
        avoid:constraints.avoid,
        locked_assets:lockedAssets.map(asset=>{
          const copy=Object.assign({},asset);
          delete copy.source_file;
          return copy;
        })
      },
      factual:{},
      candidates:[],
      vibes:{
        confidence:text(evidence.confidence)||'unknown',
        primary:{},
        alternates:[],
        intake_expressive:{
          product_truth:{},
          audience:{
            primary:text(input&&input.user_context),
            desired_state:[],
            tired_of:[]
          },
          brand_state:{
            make_people_feel:'',
            core_adjectives:[],
            avoid_states:constraints.avoid
          },
          visual_territory:{
            closest_to:[],
            stay_away_from:constraints.avoid,
            ownable:intent
          },
          sensory:{
            flavor:'',
            textures_and_materials:[],
            color_palette:'',
            forbidden_colors:''
          },
          competitive:{admires:'',avoid_resembling:''},
          visual_identity:{
            design_language_read:'',
            cultural_reference_points:[],
            never_world:constraints.avoid
          },
          campaign_signals:{
            exact_phrases:[],
            cultural_codes:[],
            use_occasions:[context.name],
            locations:[],
            actions_and_motion:[],
            signature_objects:[],
            campaign_energy:'',
            evidence_notes:[
              type+' reader output mapped into the universal creative dossier.',
              text(evidence.read_notes)
            ].filter(Boolean)
          },
          assets:{brand_intent:[intent,text(input&&input.user_context)].filter(Boolean).join('. ')}
        },
        scene_direction:null
      },
      diagnostics:{
        intake_version:'universal_creative_intake_v3',
        input_type:type,
        reader_fragment:evidence,
        constraint_authority:'user_authored_only',
        evidence_carrier:'brief.anchors_only'
      },
      locked_asset_file:lockedAsset&&lockedAsset.source_file||null
    };
  }

  function referenceRole(value,type){
    const requested=text(value);
    if([
      'user_directed_reference',
      'visual_system',
      'emotional_cinematic_reference',
      'creative_brief',
      'differentiate_away_from'
    ].includes(requested)) return requested;
    return type==='text_brief'?'creative_brief':'user_directed_reference';
  }

  function influenceRecord(input){
    const raw=Number(input&&input.influence_weight);
    const weight=Number.isFinite(raw)?Math.max(10,Math.min(100,Math.round(raw))):60;
    const level=text(input&&input.influence_level)
      ||(weight>=85?'lead':weight>=65?'strong':weight>=35?'supporting':'light');
    return {
      level,
      weight,
      interpretation:'relative creative priority, not a mathematical blend coefficient'
    };
  }

  function referenceAnchor(record,index){
    const input=record&&record.input||{};
    const fragment=record&&record.fragment||{};
    const type=ensureInputType(input.type);
    const role=referenceRole(record&&record.role,type);
    return {
      anchor_id:text(record&&record.anchor_id)||'anchor_'+(index+1),
      type,
      source:text(input.source_name)||text(fragment.source)||'Reference '+(index+1),
      role,
      polarity:'reference_only',
      user_context:text(input.user_context),
      reference_focus:text(input.reference_focus),
      usage_note:text(input.usage_note)||text(input.reference_focus),
      influence:influenceRecord(input),
      confidence:text(fragment.confidence)||'unknown',
      read_notes:text(fragment.read_notes),
      evidence:{
        territory:list(fragment.territory),
        visual_evidence:list(fragment.visual_evidence),
        tonal_evidence:list(fragment.tonal_evidence),
        reference_points:list(fragment.reference_points)
      }
    };
  }

  function confidenceAcross(records){
    // Confidence follows influence. The highest-weight source with a known
    // confidence sets the dossier confidence; a light-weight accent source
    // with a low-confidence read no longer drags the whole dossier down.
    // Unknown reads are skipped unless every source is unknown.
    const rank={unknown:0,low:1,medium:2,high:3};
    const known=records
      .map(record=>({
        weight:Number(record&&record.influence&&record.influence.weight)||0,
        value:text(record&&record.fragment&&record.fragment.confidence)||'unknown'
      }))
      .filter(entry=>rank[entry.value]>0)
      .sort((a,b)=>b.weight-a.weight);
    return known.length?known[0].value:'unknown';
  }

  function assembleDossierDataFromSources(input,primaryFragment,referenceRecords,lockedAsset){
    const data=assembleDossierData(input,primaryFragment,lockedAsset);
    const references=Array.isArray(referenceRecords)?referenceRecords.filter(Boolean):[];
    const referenceAnchors=references.map(referenceAnchor);
    // The primary anchor is assembled by assembleDossierData and lives at
    // data.brief.anchors[0]. Keep it and append reference anchors so both
    // the primary reader's evidence and every reference's evidence reach
    // ideation, selection, and scene authoring through one structure.
    const primaryAnchor=data.brief.anchors[0];
    const primaryFragment_=primaryFragment&&typeof primaryFragment==='object'?primaryFragment:{};
    // Per-anchor confidence and read_notes so the model knows which evidence
    // was uncertain, even when the aggregate confidence follows the lead source.
    primaryAnchor.confidence=text(primaryFragment_.confidence)||'unknown';
    primaryAnchor.read_notes=text(primaryFragment_.read_notes);
    referenceAnchors.forEach((anchor,index)=>{
      const frag=references[index]&&references[index].fragment||{};
      anchor.confidence=text(frag.confidence)||'unknown';
      anchor.read_notes=text(frag.read_notes);
    });
    data.brief.anchors=[primaryAnchor].concat(referenceAnchors);

    const primaryRecord={
      role:'creative_brief',
      influence:{level:'authority',weight:100},
      fragment:primaryFragment_
    };
    const evidenceRecords=[primaryRecord].concat(references.map((record,index)=>({
      role:referenceAnchors[index].role,
      influence:referenceAnchors[index].influence,
      fragment:record.fragment&&typeof record.fragment==='object'?record.fragment:{}
    })));
    const ix=data.vibes.intake_expressive;

    // Evidence lives in exactly one place: the anchors array. Each anchor
    // carries its role, influence, usage note, confidence, read_notes, and
    // structured evidence. No tagged copies in intake_expressive.
    data.brief.source_kind='brief';
    data.brief.source_name=referenceAnchors.length
      ?'multi-source creative brief'
      :(text(input&&input.source_name)||'User-authored creative brief');
    data.brief.requirements=list([].concat(
      data.brief.requirements,
      references
        .filter(record=>record&&record.input&&record.input.type==='text_brief')
        .flatMap(record=>list(record.fragment&&record.fragment.requirements_added))
    ));
    data.brief.avoid=list([].concat(
      data.brief.avoid,
      references
        .filter(record=>record&&record.input&&record.input.type==='text_brief')
        .flatMap(record=>list(record.fragment&&record.fragment.avoid_added))
    ));
    data.vibes.confidence=confidenceAcross(evidenceRecords);
    ix.campaign_signals.evidence_notes=evidenceRecords.flatMap((record,index)=>[
      (index===0?'creative_brief':record.role)+' reader output preserved in the multi-source dossier.',
      text(record.fragment.read_notes)
    ]).filter(Boolean);
    ix.visual_identity.cultural_reference_points=list(
      [primaryAnchor].concat(referenceAnchors).map(anchor=>anchor.source)
    );
    ix.assets.brand_intent=[
      text(input&&input.raw_text),
      text(input&&input.user_context),
      ...referenceAnchors.flatMap(anchor=>[
        anchor.source,
        anchor.usage_note,
        anchor.influence.level+' influence at '+anchor.influence.weight+'%'
      ])
    ].filter(Boolean).join('. ');
    data.diagnostics.intake_version='universal_creative_intake_v3';
    data.diagnostics.input_type=referenceAnchors.length?'multi_source_brief':'text_brief';
    data.diagnostics.evidence_carrier='brief.anchors_only';
    data.diagnostics.reader_fragments=evidenceRecords.map(record=>record.fragment);
    data.diagnostics.anchor_roles=[primaryAnchor].concat(referenceAnchors).map(anchor=>({
      anchor_id:anchor.anchor_id,
      type:anchor.type,
      role:anchor.role,
      source:anchor.source,
      usage_note:anchor.usage_note,
      influence:anchor.influence,
      confidence:anchor.confidence
    }));
    return data;
  }

  async function filePayload(file){
    if(!file) throw new Error('Choose an image file.');
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)){
      throw new Error('Use a JPEG, PNG, WebP, or GIF image.');
    }
    if(file.size>5000000) throw new Error('Images must be 5 MB or smaller.');
    const dataUrl=await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result||''));
      reader.onerror=()=>reject(new Error('The image could not be read.'));
      reader.readAsDataURL(file);
    });
    return {
      image_b64:dataUrl.split(',')[1]||'',
      media_type:file.type,
      filename:file.name
    };
  }

  async function readInput(input,postAction){
    const type=ensureInputType(input&&input.type);
    if(typeof postAction!=='function') throw new Error('Creative reader transport is unavailable.');
    let response;
    if(type==='text_brief'){
      response=await postAction('read_text_brief',{
        brief_text:text(input.raw_text),
        user_context:text(input.user_context)
      });
    }else if(type==='artifact_reference'){
      response=await postAction('read_artifact_reference',{
        reference:text(input.raw_text),
        user_context:text(input.user_context)
      });
    }else if(type==='url_reference'||type==='url'){
      response=await postAction('read_url_reference',{
        url:text(input.url)||text(input.raw_text),
        user_context:text(input.user_context),
        reference_focus:text(input.reference_focus)||text(input.usage_note)
      });
    }else if(type==='image_upload'||type==='grid_capture'){
      const payload=await filePayload(input.file);
      response=await postAction(type==='grid_capture'?'read_grid_capture':'read_image_upload',Object.assign(payload,{
        user_context:text(input.user_context),
        reference_focus:text(input.reference_focus),
        explicit_exclusions:text(input.explicit_exclusions)
      }));
    }else{
      throw new Error('Website URLs use the established brand reader.');
    }
    if(!response||!response.fragment) throw new Error('The input reader returned no dossier fragment.');
    return response.fragment;
  }

  return {
    INPUT_TYPES,
    DELIVERY_CONTEXTS,
    assembleDossierData,
    assembleDossierDataFromSources,
    constraintsFrom,
    deliveryContext,
    ensureInputType,
    filePayload,
    influenceRecord,
    lockedAssetRecord,
    sceneAssetBoundary,
    readInput
  };
});
