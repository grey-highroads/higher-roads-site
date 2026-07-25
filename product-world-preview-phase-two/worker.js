/**
 * Product World Preview - staged preview and render Worker (single file, paste into Cloudflare)
 * Build: worker-2026-07-25-phase-six-multi-anchor-v6 (mode-neutral wrapper so documentary,
 * editorial, and vernacular aesthetics are not overridden by a hardcoded
 * cinematic opening; prose-led render prompt, landscape default, multimodal
 * brand read with visual-identity fields, extra brand-page pooling)
 *
 * POST { product_url, home_url, api_key } -> { brand, factual, candidates, vibes }
 * Does the server-side work the browser cannot: fetches the brand pages (CORS),
 * extracts the product identity + image candidates, pools the copy, and runs ONE
 * brand-read model call. Returns the exact shape the Preview page consumes.
 *
 * Rendering: OpenAI images/edits (native composite). The product is uploaded as the
 * edit image; see renderFlow, renderBundleFlow, and callOpenAIImageEdit.
 *
 * Deploy (no CLI):
 *   1. Cloudflare dashboard -> Workers -> Create -> Quick Edit -> paste this file -> Deploy.
 *   2. Copy the worker URL, put it in PREVIEW_ENDPOINT in the Preview page.
 *   3. Enter your Anthropic key in the page (same pattern as the Builder). Nothing else.
 *
 * Tags:
 *  [VERIFIED] model call shape mirrors the live Builder callClaude (index.html 1204-1216).
 *  [VERIFIED] parser + pooler + validator logic is the unit-tested code, inlined and
 *             differentially checked against the modules (preview-worker-parity.test.cjs).
 *  [ASSUMED, verify on deploy] real-brand parse hit-rate (8.5) and brand-read quality (8.1).
 *             This Worker is the instrument to measure them. Run real brands and read the
 *             confidence + candidate output; do not assume the read is good until you see it.
 *  [ASSUMED, verify] the key is forwarded straight to api.anthropic.com over TLS and not
 *             logged. Confirm your Worker has no logging of the request body before public use.
 */

/* ========================= parser (from asset-parser.worker.js) ========================= */
function stripTags(s){ return (s||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(); }
function decode(s){ return (s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim(); }
function metaMap(html){ const map={}; const re=/<meta\b[^>]*>/gi; let m; while((m=re.exec(html))){ const tag=m[0]; const key=(tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)||[])[1]; const val=(tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)||[])[1]; if(key&&val!=null&&map[key.toLowerCase()]==null) map[key.toLowerCase()]=decode(val); } return map; }
function jsonLdProduct(html){
  const re=/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi; let m;
  const find=(node)=>{ if(!node||typeof node!=='object') return null; if(Array.isArray(node)){ for(const x of node){ const r=find(x); if(r) return r; } return null; } const t=node['@type']; if(t==='Product'||(Array.isArray(t)&&t.includes('Product'))) return node; if(node['@graph']) return find(node['@graph']); return null; };
  while((m=re.exec(html))){ let p; try{ p=JSON.parse(m[1].trim()); }catch{ continue; } const r=find(p); if(r) return r; } return null;
}
function firstOffer(ld){ if(!ld||!ld.offers) return null; const o=Array.isArray(ld.offers)?ld.offers[0]:ld.offers; return o&&typeof o==='object'?o:null; }
function absolutize(url,base){ if(!url) return null; try{ return new URL(url,base).toString(); }catch{ return null; } }
function isShopifyCdn(url){ try{ return /(^|\.)cdn\.shopify\.com$/.test(new URL(url).hostname); }catch{ return false; } }
function upscaleShopify(url,width){ if(!isShopifyCdn(url)) return url; try{ const u=new URL(url); u.searchParams.set('width',String(width)); return u.toString(); }catch{ return url; } }
/* ---- candidate image discovery: gallery-aware, dedup by normalized key ---- */
function cleanShopifySize(absUrl){
  try{ const u=new URL(absUrl); u.pathname=u.pathname.replace(/_(?:pico|icon|thumb|small|compact|medium|large|grande|master|original|\d+x\d*|x\d+)(?:_crop_[a-z]+)?(?=\.[a-z0-9]+$)/i,''); return u.toString(); }catch{ return absUrl; }
}
function canonicalImageKey(absUrl){
  try{ const u=new URL(absUrl); return u.hostname.replace(/^www\./,'').toLowerCase()+u.pathname.toLowerCase(); }catch{ return String(absUrl||'').toLowerCase(); }
}
const IMAGE_HARD_REJECT_RE=/(?:^|[^a-z0-9])(nutrition(?:al)?|supplement[-_ ]?facts?|facts[-_ ]?panel|ingredient(?:s)?|directions?|dosage|serving[-_ ]?size|certificate|lab[-_ ]?result|coa|barcode|upc|qr[-_ ]?code|sprite|favicon|logo|icons?|badge|visa|mastercard|amex|paypal|klarna|afterpay|shop[-_ ]?pay|apple[-_ ]?pay|google[-_ ]?pay|placeholder|spacer|loading|swatch|flag|avatar|rating|stars?|social|instagram|facebook|tiktok|youtube|pinterest|trust|seal|gift[-_ ]?card|shipping|recycl(?:e|ing)|footer|header|navigation|payment)(?:[^a-z0-9]|$)/i;
const IMAGE_SOFT_REJECT_RE=/(?:^|[^a-z0-9])(related|recommended|recommendation|you[-_ ]?may[-_ ]?also[-_ ]?like|cross[-_ ]?sell|upsell|collection|article|blog|press|award|review|testimonial|thumbnail|thumb)(?:[^a-z0-9]|$)/i;
const IMAGE_POSITIVE_RE=/(?:^|[^a-z0-9])(product|pdp|gallery|featured|hero|primary|main|zoom|carousel|media|packshot|package|front|bottle|can|pouch|box|jar|sachet)(?:[^a-z0-9]|$)/i;

function isLikelyProductImage(url){
  const u=String(url||'').toLowerCase();
  if(u.startsWith('data:')) return false;
  if(/\.svg(\?|$)/.test(u)) return false;
  if(IMAGE_HARD_REJECT_RE.test(u)) return false;
  if(!/\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(u) && !/cdn\.shopify\.com\/s\/files/i.test(u)) return false;
  return true;
}
function pickLargestFromSrcset(srcset){
  const parts=String(srcset||'').split(',').map(s=>s.trim()).filter(Boolean);
  let best=null,bestW=-1;
  for(const p of parts){
    const seg=p.split(/\s+/);
    const url=seg[0];
    const m=(seg[1]||'').match(/(\d+(?:\.\d+)?)(w|x)/i);
    const w=m?(m[2].toLowerCase()==='x'?parseFloat(m[1])*1000:parseFloat(m[1])):0;
    if(url&&w>=bestW){ bestW=w; best=url; }
  }
  return best;
}
function tagAttr(tag,name){
  const re=new RegExp('\\\\b'+name+'\\\\s*=\\\\s*["\\\']([^"\\\']*)["\\\']','i');
  return (String(tag||'').match(re)||[])[1]||'';
}
function explicitImageDimensions(tag){
  const width=parseInt(tagAttr(tag,'width'),10)||0;
  const height=parseInt(tagAttr(tag,'height'),10)||0;
  return {width,height};
}
function dimensionsTooSmall(tag){
  const d=explicitImageDimensions(tag);
  if(d.width&&d.width<240) return true;
  if(d.height&&d.height<240) return true;
  if(d.width&&d.height&&d.width*d.height<100000) return true;
  return false;
}
function normalizedProductTerms(name){
  return String(name||'').toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>=4).slice(0,8);
}
function candidateContextScore(url, tag, source, productName){
  const context=(String(url||'')+' '+String(tag||'')).toLowerCase();
  if(IMAGE_HARD_REJECT_RE.test(context)) return -1000;
  let score=0;
  if(source==='platform_media') score+=110;
  else if(source==='product_json_ld') score+=100;
  else if(source==='product_gallery') score+=88;
  else if(source==='open_graph') score+=76;
  else if(source==='twitter') score+=68;
  else if(source==='image_src') score+=62;
  else if(source==='shopify_fallback') score+=34;
  else score+=42;

  if(IMAGE_POSITIVE_RE.test(context)) score+=18;
  if(IMAGE_SOFT_REJECT_RE.test(context)) score-=65;
  if(/\b(back|rear|side|detail|secondary)\b/i.test(context)) score-=18;
  if(/\b(lifestyle|in[-_ ]?use|scene)\b/i.test(context)) score+=4;

  const terms=normalizedProductTerms(productName);
  if(terms.some(t=>context.includes(t))) score+=16;
  return score;
}
function detectPlatform(html){
  const source=String(html||'');
  if(/cdn\.shopify\.com|myshopify\.com|shopify-section|\bShopify\.(?:theme|routes|shop|currency|locale)\b/i.test(source)) return 'shopify';
  if(/woocommerce|wc-product-gallery|wp-content\/plugins\/woocommerce/i.test(source)) return 'woocommerce';
  if(/cdn\d*\.bigcommerce\.com|stencil-utils/i.test(source)) return 'bigcommerce';
  if(/static1\.squarespace\.com|squarespace-cdn/i.test(source)) return 'squarespace';
  if(/assets\.website-files\.com|\bwebflow\b/i.test(source)) return 'webflow';
  return 'unknown';
}
function likelyGalleryTag(tag){
  const context=String(tag||'').toLowerCase();
  if(IMAGE_HARD_REJECT_RE.test(context)) return false;
  return IMAGE_POSITIVE_RE.test(context) ||
    /\b(data-zoom-image|data-product-image|data-image-id|data-media-id)\b/i.test(context);
}
function extractShopifyStructuredImageUrls(html){
  const source=String(html||'').replace(/\\\//g,'/');
  const out=[];
  const patterns=[
    /"(?:featured_image|featured_media|image|images|media)"\s*:\s*"((?:https?:)?\/\/cdn\.shopify\.com\/s\/files\/[^"]+\.(?:jpe?g|png|webp|avif|gif)(?:\?[^"]*)?)"/gi,
    /"(?:src|preview_image)"\s*:\s*"((?:https?:)?\/\/cdn\.shopify\.com\/s\/files\/[^"]+\.(?:jpe?g|png|webp|avif|gif)(?:\?[^"]*)?)"/gi
  ];
  for(const re of patterns){
    let m;
    while((m=re.exec(source))){
      out.push(m[1].startsWith('//')?'https:'+m[1]:m[1]);
      if(out.length>=24) return out;
    }
  }
  return out;
}
// Candidate extraction ranks product-specific sources first, rejects known utility
// graphics and facts panels, and uses the unrestricted Shopify CDN scan only as a
// low-confidence fallback. Distinct gallery shots survive deduplication while
// thumbnail variants collapse to the same canonical key.
function extractCandidateImages(html, baseUrl, ld, meta, max, productName){
  const MAX=max||6;
  const byKey=new Map();

  const add=(rawUrl,source,tag)=>{
    if(!rawUrl) return;
    const abs=absolutize(String(rawUrl).trim(),baseUrl);
    if(!abs||!/^https?:/i.test(abs)) return;
    if(!isLikelyProductImage(abs)) return;
    if(tag&&dimensionsTooSmall(tag)) return;

    const score=candidateContextScore(abs,tag||'',source,productName);
    if(score<20) return;

    const clean=cleanShopifySize(abs);
    const key=canonicalImageKey(clean);
    const candidate={url:upscaleShopify(clean,1600),source,score};
    const previous=byKey.get(key);
    if(!previous||candidate.score>previous.score) byKey.set(key,candidate);
  };

  extractShopifyStructuredImageUrls(html).forEach(url=>add(url,'platform_media','shopify product media'));

  if(ld&&ld.image){
    (Array.isArray(ld.image)?ld.image:[ld.image]).forEach(image=>{
      add(typeof image==='string'?image:image&&(image.url||image.contentUrl),'product_json_ld','json-ld product image');
    });
  }

  const tags=html.match(/<img\b[^>]*>/gi)||[];
  tags.forEach(tag=>{
    if(!likelyGalleryTag(tag)) return;
    const srcset=tagAttr(tag,'data-srcset')||tagAttr(tag,'srcset');
    if(srcset) add(pickLargestFromSrcset(srcset),'product_gallery',tag);
    const src=tagAttr(tag,'data-zoom-image')||tagAttr(tag,'data-original')||tagAttr(tag,'data-src')||tagAttr(tag,'src');
    if(src) add(src,'product_gallery',tag);
  });

  add(meta['og:image:secure_url'],'open_graph','open graph product page');
  add(meta['og:image'],'open_graph','open graph product page');
  add(meta['twitter:image'],'twitter','twitter product page');

  const imageSrc=(html.match(/<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i)||[])[1];
  if(imageSrc) add(imageSrc,'image_src','link image_src');

  // Generic image tags improve recall only after the high-confidence paths.
  if(byKey.size<MAX){
    tags.forEach(tag=>{
      const srcset=tagAttr(tag,'data-srcset')||tagAttr(tag,'srcset');
      if(srcset) add(pickLargestFromSrcset(srcset),'generic_img',tag);
      const src=tagAttr(tag,'data-zoom-image')||tagAttr(tag,'data-original')||tagAttr(tag,'data-src')||tagAttr(tag,'src');
      if(src) add(src,'generic_img',tag);
    });
  }

  // Last resort for Shopify themes that serialize media without useful markup.
  if(byKey.size<3){
    const unescaped=String(html||'').replace(/\\\//g,'/');
    const urls=unescaped.match(/https?:\/\/cdn\.shopify\.com\/s\/files\/[^\s"'\\<>)]+\.(?:jpe?g|png|webp|avif|gif)(?:\?[^\s"'\\<>)]*)?/gi)||[];
    urls.slice(0,80).forEach(url=>add(url,'shopify_fallback','unstructured shopify fallback'));
  }

  return [...byKey.values()]
    .sort((a,b)=>b.score-a.score)
    .slice(0,MAX)
    .map(({url,source})=>({url,source}));
}
function extractIdentity(html,baseUrl){
  const meta=metaMap(html), ld=jsonLdProduct(html), offer=firstOffer(ld), notes=[];
  const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1];
  const h1=(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)||[])[1];
  const name=(ld&&ld.name)||meta['og:title']||decode(stripTags(title))||decode(stripTags(h1))||null;
  let category=(ld&&(ld.category||ld.additionalType))||meta['product:category']||null;
  if(category&&typeof category==='object') category=category.name||null;
  if(!category) notes.push('category_absent');
  const flavor_sku=(ld&&(ld.sku||ld.mpn))||meta['product:retailer_item_id']||null;
  if(!flavor_sku) notes.push('sku_absent');
  const amount=(offer&&(offer.price!=null?String(offer.price):null))||meta['product:price:amount']||meta['og:price:amount']||null;
  const currency=(offer&&(offer.priceCurrency||null))||meta['product:price:currency']||meta['og:price:currency']||null;
  if(!amount) notes.push('price_absent');
  const cand=extractCandidateImages(html,baseUrl,ld,meta,6,name);
  const platform=detectPlatform(html);
  return {product:{name,category,flavor_sku,price:{amount,currency}},candidates:cand,platform_guess:platform,confidence:{image:cand.length?'high':'low',identity:name?'high':'low',notes}};
}

/* ========================= pooler (from vibes-parser.js) ========================= */
function stripChrome(html){ return String(html||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<noscript[\s\S]*?<\/noscript>/gi,' '); }
function attr(html,re){ const m=html.match(re); return m?m[1].trim():''; }
function collapse(s){ return decode(s).replace(/\s+/g,' ').trim(); }
function poolText(productHtml,rootHtml,opts={}){
  const cap=opts.cap||14000; const parts=[]; const sources={};
  const pages=[['product',productHtml],['home',rootHtml]];
  for(const extra of (opts.extraPages||[])){ if(extra&&extra.html) pages.push([extra.label||'brand',extra.html]); }
  for(const [label,html] of pages){
    if(!html) continue;
    const clean=stripChrome(html);
    const desc=attr(clean,/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]*content=["']([^"']+)["']/i)||attr(clean,/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:description|description)["']/i);
    const theme=attr(clean,/<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    const jsonLdDesc=(()=>{
      try{
        const ld=jsonLdProduct(html);
        return ld&&ld.description?collapse(String(ld.description).replace(/<[^>]*>/g,' ')):'';
      }catch{return '';}
    })();
    const shopifyDesc=(()=>{
      const raw=String(html||'').replace(/\\\//g,'/');
      const m=raw.match(/"(?:description|body_html)"\s*:\s*"([\s\S]{0,12000}?)"\s*[,}]/i);
      if(!m) return '';
      return collapse(m[1].replace(/\\n/g,' ').replace(/\\t/g,' ').replace(/\\"/g,'"').replace(/<[^>]*>/g,' '));
    })();
    const heads=(clean.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)||[]).map(h=>collapse(h.replace(/<[^>]*>/g,''))).filter(Boolean).slice(0,label==='product'?18:10);
    const paras=(clean.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)||[])
      .map(p=>collapse(p.replace(/<[^>]*>/g,'')))
      .filter(t=>t.length>25)
      .filter(t=>!/(privacy|terms of service|shipping policy|returns?|subscribe|newsletter|copyright|all rights reserved|customer reviews?)/i.test(t))
      .slice(0,label==='product'?28:14);
    const block=[];
    if(desc) block.push(`[${label} description] ${collapse(desc)}`);
    if(jsonLdDesc) block.push(`[${label} json-ld product description] ${jsonLdDesc}`);
    if(shopifyDesc) block.push(`[${label} embedded product description] ${shopifyDesc}`);
    if(theme) block.push(`[${label} theme-color] ${theme}`);
    if(heads.length) block.push(`[${label} headings] ${heads.join(' | ')}`);
    if(paras.length) block.push(`[${label} copy] ${paras.join(' ')}`);
    if(block.length) parts.push(block.join('\n'));
    sources[label]={ has_description:!!desc, headings:heads.length, paragraphs:paras.length, theme_color:theme||null };
  }
  let pooled=parts.join('\n\n'); if(pooled.length>cap) pooled=pooled.slice(0,cap);
  const totalSignal=Object.values(sources).reduce((n,s)=>n+(s?s.headings+s.paragraphs+(s.has_description?1:0):0),0);
  const richness=totalSignal>=8?'rich':totalSignal>=3?'moderate':'thin';
  return { pooled, sources, richness };
}

/* ========================= schema + validator (from interpretive-schema.js + contract-validator.js) ===== */
const INTAKE_TYPES={
  'product_truth.what_it_does':'string',
  'product_truth.top_benefits':'string',
  'product_truth.key_ingredients':'string',
  'product_truth.avoid_mistaken_for':'string',
  'audience.primary':'string',
  'audience.desired_state':'array',
  'audience.tired_of':'array',
  'brand_state.make_people_feel':'string',
  'brand_state.core_adjectives':'array',
  'brand_state.avoid_states':'array',
  'visual_territory.closest_to':'array',
  'visual_territory.stay_away_from':'array',
  'visual_territory.ownable':'string',
  'sensory.flavor':'string',
  'sensory.textures_and_materials':'array',
  'sensory.color_palette':'string',
  'sensory.forbidden_colors':'string',
  'competitive.admires':'string',
  'competitive.avoid_resembling':'string',
  'assets.brand_intent':'string',
  'visual_identity.design_language_read':'string',
  'visual_identity.cultural_reference_points':'array',
  'visual_identity.never_world':'array',
  'campaign_signals.exact_phrases':'array',
  'campaign_signals.cultural_codes':'array',
  'campaign_signals.use_occasions':'array',
  'campaign_signals.locations':'array',
  'campaign_signals.actions_and_motion':'array',
  'campaign_signals.signature_objects':'array',
  'campaign_signals.campaign_energy':'string',
  'campaign_signals.evidence_notes':'array'
};
const CONTROL_FLOW=['brand_state.avoid_states','visual_territory.stay_away_from','sensory.forbidden_colors'];
const FORBIDDEN_TOP_KEYS=['project','base64','lock_status','asset_type','asset_role','asset_id','preserve_elements','editable_elements'];
const SCENE_REQUIRED_HARD=['world_description','product_placement_intent','use_occasion','implied_action'];
const SCENE_FIELD_TYPES={
  scene_name:'string',
  world_description:'string',
  use_occasion:'string',
  implied_action:'string',
  evidence_cues:'array',
  signature_objects:'array',
  creative_rationale:'string',
  product_placement_intent:'string',
  composition:'string',
  lighting:'string',
  props:'array',
  avoid:'array',
  claim_rules:'array',
  render_path:'string'
};
const SCENE_SOFT_DEFAULTS={ scene_name:'',composition:'',lighting:'',evidence_cues:[],signature_objects:[],creative_rationale:'',props:[],avoid:[],claim_rules:[] };
const RENDER_PATH_FORCED='composite';
const _get=(o,p)=>p.split('.').reduce((a,k)=>a==null?undefined:a[k],o);
const _setP=(o,p,v)=>{ const ks=p.split('.'),last=ks.pop(); let t=o; for(const k of ks){ t[k]??={}; t=t[k]; } t[last]=v; };
const _hasP=(o,p)=>_get(o,p)!==undefined;
function toArray(v){ if(Array.isArray(v)) return v.map(x=>String(x).trim()).filter(Boolean); if(v==null||v==='') return []; return String(v).split(/[;,\n]/).map(s=>s.trim()).filter(Boolean); }
function toStringV(v){ if(Array.isArray(v)) return v.map(x=>String(x).trim()).filter(Boolean).join(', '); if(v==null) return ''; return String(v).trim(); }
function validateContract(raw){
  if(!raw||typeof raw!=='object') throw new Error('output is not an object');
  for(const k of FORBIDDEN_TOP_KEYS){ if(k in raw) throw new Error('lane violation: '+k); }
  if(_hasP(raw,'assets.mode')) throw new Error('lane violation: assets.mode');
  for(const denied of ['base64','lock_status','asset_type','asset_role','asset_id','preserve_elements']) for(const g of Object.keys(raw)) if(raw[g]&&typeof raw[g]==='object'&&denied in raw[g]) throw new Error('lane violation: '+denied+' under '+g);
  const value=JSON.parse(JSON.stringify(raw)), repairs=[], warnings=[];
  for(const [path,type] of Object.entries(INTAKE_TYPES)){ if(!_hasP(value,path)) continue; const cur=_get(value,path), wantArray=type==='array', isArr=Array.isArray(cur); if(wantArray&&!isArr){ _setP(value,path,toArray(cur)); repairs.push('coerce '+path+' array'); } else if(!wantArray&&isArr){ _setP(value,path,toStringV(cur)); repairs.push('coerce '+path+' string'); } }
  const scene=value.scene_direction; if(!scene||typeof scene!=='object') throw new Error('scene_direction missing');
  for(const req of SCENE_REQUIRED_HARD){ if(!scene[req]||!String(scene[req]).trim()) throw new Error('scene_direction.'+req+' missing'); }
  for(const [f,type] of Object.entries(SCENE_FIELD_TYPES)){ if(scene[f]===undefined){ if(f in SCENE_SOFT_DEFAULTS) scene[f]=SCENE_SOFT_DEFAULTS[f]; continue; } if(type==='array'&&!Array.isArray(scene[f])) scene[f]=toArray(scene[f]); if(type==='string'&&Array.isArray(scene[f])) scene[f]=toStringV(scene[f]); }
  if(!Array.isArray(scene.evidence_cues)) scene.evidence_cues=toArray(scene.evidence_cues);
  if(!Array.isArray(scene.signature_objects)) scene.signature_objects=toArray(scene.signature_objects);
  scene.creative_rationale=String(scene.creative_rationale||'').trim();
  const distinctEvidence=[...new Set([].concat(scene.evidence_cues||[],scene.signature_objects||[],scene.props||[]).map(x=>String(x||'').trim()).filter(Boolean))];
  if(distinctEvidence.length<3) warnings.push('scene_specificity_low: fewer than three evidence-linked cues');
  if(scene.render_path&&scene.render_path!==RENDER_PATH_FORCED) warnings.push('render_path forced from '+scene.render_path);
  scene.render_path=RENDER_PATH_FORCED;
  if(!value.confidence||typeof value.confidence!=='object') value.confidence={score:'low',agreement_notes:[],conflicts:[]}; else { value.confidence.score=value.confidence.score==='high'?'high':'low'; value.confidence.agreement_notes=toArray(value.confidence.agreement_notes); value.confidence.conflicts=toArray(value.confidence.conflicts); }
  if(!Array.isArray(value.alternates)) value.alternates=[];
  if(value.confidence.score==='high'&&value.alternates.length) value.alternates=[];
  return { value, repairs, warnings };
}

/* ========================= prompt (from interpretive-prompt.js) ========================= */
function buildSystemPrompt(){
  const fl=(m)=>Object.entries(m).map(([p,t])=>`  "${p}": ${t==='array'?'array of short strings':'string'}`).join('\n');
  const intake=fl(INTAKE_TYPES), scene=fl(SCENE_FIELD_TYPES);
  return `You are a senior brand-visual strategist reading two things: a brand's homepage copy and one product page. Your job is to infer the brand's aesthetic world and write a production-ready scene brief that will place the founder's REAL product image into that world.

Output ONLY valid JSON, minified, single line, no preamble, no markdown fences.

TWO STANDARDS, DO NOT MIX THEM:
- Aesthetic fields are EXPRESSIVE. Infer boldly. A sparse site is still signal: sparseness reads as restraint, category conventions bracket the rest. Inference is the deliverable, not a fallback.
- Claims are FACTUAL. Never invent a benefit, certification, dosage, award, retailer, medical effect, or ingredient. claim_rules lists ONLY claims that appear in the supplied copy. If the copy does not state it, it does not go in.

You will be given the product's factual identity (name, category, SKU, price) as READ-ONLY context. The supplied product image is identity-locked and state-locked. Do not restate factual identity fields and do not propose opening, closing, pouring, unwrapping, removing parts, adding scoops, exposing contents, or changing the package state. Your output contains aesthetic direction and a scene brief only.

CONFIDENCE: score "high" when cues AGREE (copy tone, palette, category all point one way), "low" only when cues genuinely CONFLICT (e.g. playful copy over austere packaging). Thin copy is not low confidence. On "low", populate alternates with 1-2 distinct directions for the user to choose; on "high", alternates is empty.

CONTROL-FLOW FIELDS, match the type exactly:
- brand_state.avoid_states: array. If the brand's world excludes people, include an explicit "no people" entry.
- visual_territory.stay_away_from: array of aesthetics to steer away from.
- sensory.forbidden_colors: string (comma-separated), not an array.

VISUAL IDENTITY: if a product packaging image is supplied with this message, read the design itself and fill visual_identity.design_language_read with what the packaging communicates (typographic voice, illustration versus photography, color system, finish, density, era cues) in two or three sentences. Reconcile it with the copy; if packaging and copy disagree, note the conflict in confidence. Fill visual_identity.cultural_reference_points with specific music, film, fashion, place, or era adjacencies the brand is signaling, each with its evidence. Fill visual_identity.never_world with two or three worlds this brand would visibly reject. If no image is supplied, infer these fields from copy alone and say so in evidence_notes.

CAMPAIGN SIGNALS: extract campaign-specific evidence separately from broad brand mood. Capture exact phrases, cultural references, use occasions, concrete locations, actions or motion, signature objects, and campaign energy. Evidence found in supplied copy outranks category convention or aesthetic inference.

SCENE DIRECTION: world_description describes a concrete environment with a recognizable place and use occasion. product_placement_intent describes where the real product sits, its scale, angle, and focal priority, kept separate from world_description. render_path is always "composite".

CREATIVE QUALITY RULES:
- Include a specific use_occasion and implied_action, but do not reduce the idea to a category demonstration.
- Include at least three brand-shaped visual cues, objects, behaviors, or environmental decisions.
- At least one cue must express cultural attitude, audience identity, campaign energy, or a distinctive visual code.
- Do not satisfy the brief with palette, mood, clean surfaces, sunrise light, or familiar category props alone.
- Build a visual thesis with a memorable tension, contrast, transformation, ritual, threshold, or spatial idea.
- The result should feel cinematic and campaign-worthy, not like a stock product photograph.
- Avoid generic spa, resort, pool, tactical, field-readiness, grungy outdoor, service-counter, archive, institutional, or luxury-hotel worlds unless the supplied brand evidence explicitly supports them.
- If the source copy contains campaign language or cultural references, translate those into the scene before relying on category conventions.
- Do not use literal flavor ingredients, fruit, botanicals, powders, splashes, or ingredient piles as props unless the supplied campaign copy explicitly presents them as part of the campaign concept. Flavor may inform palette, shape language, motion, or mood.
- Do not open, close, unwrap, pour, crush, dent, peel, tear, remove a lid, add a scoop, expose powder, change fill state, or otherwise alter the supplied product state. The scene must treat the locked product exactly as pictured.
- Any phone, tablet, computer, TV, menu board, poster, package, display, or sign in the environment must be blank, abstract, cropped, or too defocused to read. Do not create pseudo-text, interface copy, fake menu items, invented words, or letter-like markings.
- Brand-specific evidence must outrank category ritual. Do not assume a shaker, scoop, yoga mat, gym bag, kitchen counter, pool, or outdoor gear merely because the product belongs to a related category.
- Use brand evidence as creative source material, not as a checklist. Translate attitude, audience identity, cultural codes, emotional posture, campaign energy, language, and visual territory into one authored world.
- The scene must feel specific enough that a competitor in the same category would not naturally receive the same concept.
- Favor a strong visual thesis over literal category demonstration.
- Build a concrete place, implied activity, physical rules, visual tension, and one memorable cinematic idea.
- Category rituals may appear only when transformed through the brand's own attitude and visual language.
- Avoid polished but interchangeable wellness, fitness, hospitality, outdoor, luxury, kitchen-counter, and tabletop concepts.
- Return a concise creative_rationale describing why the world belongs to this brand.
- Direct campaign signals should influence the concept strongly, but disciplined creative inference is allowed when it creates a more distinctive and coherent world.
- The product should belong in the world, but the world should not shrink into a product demonstration.
- Keep recognizable package identity, logo, label hierarchy, core colors, silhouette, and SKU. Do not let fidelity rules dominate the creative brief.
- Do not use literal flavor ingredients as props unless the campaign itself uses them as an authored visual idea.
- Environmental text and screen UI must remain blank, abstract, cropped, or unreadable.

world_description must describe a cinematic environment with physical rules, visual hierarchy, and a clear emotional point of view. It must not generate duplicate branded products or readable environmental text.

Emit exactly this shape (types are binding):
{
${intake},
  "scene_direction": {
${scene}
  },
  "confidence": { "score": "high|low", "agreement_notes": array, "conflicts": array },
  "alternates": array of { "scene_name": string, "world_description": string, "why": string }
}

Not every intake field must be filled; omit a field rather than guessing a fact. But every aesthetic field you can reasonably infer, you should. Arrays must be arrays, strings must be strings.`;
}
function buildUserMessage(pooled,factualIdentity){
  return `PRODUCT FACTUAL IDENTITY (read-only context, do not output these):
${JSON.stringify(factualIdentity)}

POOLED BRAND COPY (homepage + product page, deterministic extract):
${pooled}`;
}

/* ========================= model call (mirrors Builder callClaude, index.html 1204-1216) ===== */
async function callClaude(system,userText,apiKey,visionImage,maxTokens){
  const visionInstruction=visionImage&&visionImage.instruction
    ?String(visionImage.instruction)
    :'The image above is the product packaging. Read its design language directly (typography, illustration style, color system, finish, attitude) and use it for visual_identity.';
  const content=visionImage&&visionImage.data
    ?[{type:'image',source:{type:'base64',media_type:visionImage.media_type||'image/png',data:visionImage.data}},{type:'text',text:visionInstruction+'\n\n'+userText}]
    :userText;
  const res=await fetch('https://api.anthropic.com/v1/messages',{ method:'POST', headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01','content-type':'application/json'}, body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens:maxTokens||4500,system,messages:[{role:'user',content}]}) });
  const data=await res.json();
  if(data.error) throw new Error(data.error.message||'model error');
  const text=(data.content||[]).find(b=>b.type==='text')?.text||'';
  return text.replace(/```json\n?|```\n?/g,'').trim();
}
function safeJSONParse(raw){ try{ return JSON.parse(raw); }catch(e){ const s=raw.indexOf('{'),en=raw.lastIndexOf('}'); if(s>=0&&en>s){ try{ return JSON.parse(raw.slice(s,en+1)); }catch{} } throw new Error('model returned invalid JSON'); } }

/* ========================= artifact-reference reader (Phase Two) ============== */
const ANCHOR_FRAGMENT_ARRAY_FIELDS=[
  'territory',
  'visual_evidence',
  'tonal_evidence',
  'reference_points',
  'requirements_added',
  'avoid_added',
  'constraints_added'
];
const ARTIFACT_READER_SYSTEM=`You are an evidence-disciplined cultural-artifact reader for a creative direction system.

Read one named cultural artifact or one specific moment within it. Extract compact, structured creative evidence that another model can adapt into a new context.

Return ONLY valid JSON, with no prose outside the object and no markdown fences.

Use short strings and arrays of short strings, never paragraphs. Describe visual and emotional behavior rather than copying dialogue, lyrics, protected text, characters, costumes, or plot. Do not request or encourage a literal recreation.

Distinguish recognizable evidence from inference. Do not invent directors, cinematographers, release dates, credits, scenes, palettes, or cultural facts. If the reference is unfamiliar, ambiguous, or cannot be identified confidently, return confidence "low", leave unsupported arrays empty, and explain the uncertainty briefly in read_notes.

Generic creative vocabulary is insufficient evidence by itself. Terms such as "cinematic", "golden hour", "dramatic", or "moody" should appear only when paired with concrete behavior such as a particular light direction, tactile gesture, spatial relationship, material response, camera distance, or movement pattern.

Return exactly this shape:
{
  "territory": ["short emotional, cultural, or visual territory"],
  "visual_evidence": ["specific observable composition, light, material, gesture, camera, or motion behavior"],
  "tonal_evidence": ["specific emotional or tonal behavior"],
  "reference_points": ["specific recognizable moment or formal device, without quotations"],
  "requirements_added": ["positive requirement supported by the reference, such as preserve slow tactile motion"],
  "avoid_added": ["negative guardrail supported by the reference, such as avoid literal costume recreation"],
  "confidence": "high | medium | low",
  "read_notes": "one short diagnostic string"
}`;

function compactArtifactString(value,maxLength){
  return String(value==null?'':value).replace(/\s+/g,' ').trim().slice(0,maxLength||240);
}
function compactArtifactArray(value){
  const source=Array.isArray(value)?value:(value==null||value===''?[]:[value]);
  const seen=new Set();
  const out=[];
  for(const item of source){
    const text=compactArtifactString(item,240);
    const key=text.toLowerCase();
    if(!text||seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if(out.length>=10) break;
  }
  return out;
}
function validateArtifactFragment(raw,reference){
  return validateAnchorFragment(raw,{
    anchor_type:'artifact_reference',
    source:reference,
    polarity:'reference_only',
    low_confidence_note:'The reference could not be identified with enough confidence to support specific creative evidence.'
  });
}
function validateAnchorFragment(raw,options){
  const opts=options||{};
  const candidate=raw&&typeof raw==='object'&&!Array.isArray(raw)
    ?(raw.fragment&&typeof raw.fragment==='object'?raw.fragment:raw)
    :{};
  const confidence=['high','medium','low'].includes(String(candidate.confidence||'').toLowerCase())
    ?String(candidate.confidence).toLowerCase()
    :'low';
  const fragment={
    anchor_type:compactArtifactString(opts.anchor_type,80)||'unknown',
    source:compactArtifactString(opts.source,500),
    territory:[],
    visual_evidence:[],
    tonal_evidence:[],
    reference_points:[],
    requirements_added:[],
    avoid_added:[],
    constraints_added:[],
    polarity:compactArtifactString(opts.polarity,40)||'reference_only',
    confidence,
    read_notes:compactArtifactString(candidate.read_notes,500)
  };
  for(const field of ANCHOR_FRAGMENT_ARRAY_FIELDS) fragment[field]=compactArtifactArray(candidate[field]);
  // Gate Two separates polarity. Older reader responses remain accepted and are
  // split conservatively so a positive requirement never becomes a prohibition.
  if(!fragment.requirements_added.length&&!fragment.avoid_added.length&&fragment.constraints_added.length){
    for(const constraint of fragment.constraints_added){
      if(/^(avoid|no |never |do not |exclude|without )/i.test(constraint)) fragment.avoid_added.push(constraint);
      else fragment.requirements_added.push(constraint);
    }
  }
  if(confidence==='low'&&!fragment.read_notes){
    fragment.read_notes=compactArtifactString(opts.low_confidence_note,500)||'The anchor could not be read with enough confidence to support specific creative evidence.';
  }
  return fragment;
}
function buildArtifactReferenceUserMessage(reference,userContext){
  return [
    'ARTIFACT REFERENCE:',
    reference,
    '',
    'OPTIONAL USER CONTEXT:',
    userContext||'(none supplied)',
    '',
    'Extract only evidence you can support from the named reference. The eventual creative work will adapt these behaviors into another context rather than recreate the source.'
  ].join('\n');
}
async function artifactReferenceFlow(body){
  const reference=compactArtifactString(body&&body.reference,500);
  const userContext=compactArtifactString(body&&body.user_context,1000);
  const apiKey=String((body&&body.api_key)||'').trim();
  if(!reference) return json({error:'missing_reference'},400);
  if(!apiKey) return json({error:'missing_api_key'},400);

  const started=Date.now();
  let raw;
  try{
    raw=await callClaude(
      ARTIFACT_READER_SYSTEM,
      buildArtifactReferenceUserMessage(reference,userContext),
      apiKey,
      null
    );
  }catch(e){
    return json({error:'artifact_reader_model_failed',detail:String(e.message||e).slice(0,200)},502);
  }

  let parsed;
  try{ parsed=safeJSONParse(raw); }
  catch(e){ return json({error:'artifact_reader_invalid_json',detail:String(e.message||e).slice(0,160)},502); }

  const fragment=validateArtifactFragment(parsed,reference);
  return json({
    fragment,
    diagnostics:{
      reader:'artifact_reference_v1',
      model:'claude-sonnet-4-5',
      structured_fields:true
    },
    timing:{total_ms:Date.now()-started}
  });
}

/* ========================= image-upload reader (Phase Four) ================= */
const IMAGE_UPLOAD_READER_SYSTEM=`You are an evidence-disciplined image reader for a creative direction system.

Read the supplied image as a reference anchor. Extract compact, structured creative evidence that another model can adapt into a new context.

Return ONLY valid JSON, with no prose outside the object and no markdown fences.

Use short strings and arrays of short strings, never paragraphs. Describe only what is observable in the image: composition, spatial hierarchy, camera distance or graphic viewpoint, light direction and contrast, palette, material behavior, texture, gesture, motion implied by the frame, emotional register, and visual or cultural signals supported by visible evidence.

The image is a reference, not a locked asset. Do not claim that its pixels, a person's identity, a logo, or readable text must be preserved. Subject matter visible in the image remains available as inspiration: a hand, ring, garment, field, object, or other visible element may legitimately matter to the user. Variations are allowed unless the user supplies a separate explicit exclusion downstream.

Do not infer what the user wants retained or excluded from the image alone. The optional reference focus may help you prioritize observations, but it does not make you the source of creative constraints. requirements_added and avoid_added must both be empty arrays. User-authored focus and exclusions are attached to the dossier after the image read.

Do not identify a person, brand, creator, location, culture, film, campaign, or historical source unless that identity is explicitly supplied in the user context. Do not infer sensitive traits. Do not invent off-frame facts, intent, ownership, popularity, or provenance. If the image is unreadable or too ambiguous to support specific evidence, return confidence "low", leave unsupported arrays empty, and explain the limitation briefly in read_notes.

Generic vocabulary is insufficient by itself. Terms such as "cinematic", "premium", "dramatic", or "moody" should appear only when paired with concrete visible evidence.

Return exactly this shape:
{
  "territory": ["short emotional, cultural, or visual territory"],
  "visual_evidence": ["specific observable composition, light, material, gesture, camera, or motion behavior"],
  "tonal_evidence": ["specific emotional or tonal behavior supported by the image"],
  "reference_points": ["specific formal device or visible relationship, without copying text or asserting provenance"],
  "requirements_added": [],
  "avoid_added": [],
  "confidence": "high | medium | low",
  "read_notes": "one short diagnostic string"
}`;

function buildImageUploadUserMessage(filename,userContext,referenceFocus){
  return [
    'SOURCE FILENAME:',
    filename||'uploaded-reference-image',
    '',
    'OPTIONAL USER CONTEXT:',
    userContext||'(none supplied)',
    '',
    'OPTIONAL REFERENCE FOCUS:',
    referenceFocus||'(open inspiration; no element has been prioritized)',
    '',
    'Read the visible evidence only. Treat the reference focus as an observation priority, not as permission to invent requirements or exclusions.'
  ].join('\n');
}
function validateImageUploadFragment(raw,filename){
  const fragment=validateAnchorFragment(raw,{
    anchor_type:'image_upload',
    source:filename||'uploaded-reference-image',
    polarity:'reference_only',
    low_confidence_note:'The uploaded image could not be read with enough confidence to support specific creative evidence.'
  });
  fragment.requirements_added=[];
  fragment.avoid_added=[];
  fragment.constraints_added=[];
  return fragment;
}
async function imageUploadFlow(body){
  const filename=compactArtifactString(body&&body.filename,500)||'uploaded-reference-image';
  const userContext=compactArtifactString(body&&body.user_context,1000);
  const referenceFocus=compactArtifactString(body&&body.reference_focus,1000);
  const apiKey=String((body&&body.api_key)||'').trim();
  const mediaType=normalizeMediaType(body&&body.media_type);
  const imageB64=stripDataUrlPrefix(body&&body.image_b64);
  if(!apiKey) return json({error:'missing_api_key'},400);
  if(!imageB64) return json({error:'missing_image'},400);
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(mediaType)) return json({error:'unsupported_image_type'},415);

  let imageBytes;
  try{ imageBytes=base64ToBytes(imageB64); }
  catch{ return json({error:'invalid_image_data'},400); }
  if(!imageBytes.byteLength) return json({error:'empty_image'},400);
  if(imageBytes.byteLength>5000000) return json({error:'image_too_large',max_bytes:5000000},413);

  const started=Date.now();
  let raw;
  try{
    raw=await callClaude(
      IMAGE_UPLOAD_READER_SYSTEM,
      buildImageUploadUserMessage(filename,userContext,referenceFocus),
      apiKey,
      {
        media_type:mediaType,
        data:imageB64,
        instruction:'The image above is a reference anchor, not a locked asset. Read its observable visual behavior without identifying unsupported people, brands, places, or provenance.'
      },
      2600
    );
  }catch(e){
    return json({error:'image_reader_model_failed',detail:String(e.message||e).slice(0,200)},502);
  }

  let parsed;
  try{ parsed=safeJSONParse(raw); }
  catch(e){ return json({error:'image_reader_invalid_json',detail:String(e.message||e).slice(0,160)},502); }

  const fragment=validateImageUploadFragment(parsed,filename);
  return json({
    fragment,
    diagnostics:{
      reader:'image_upload_v1',
      model:'claude-sonnet-4-5',
      vision_only:true,
      structured_fields:true,
      constraint_source:'user_input_only',
      media_type:mediaType,
      byte_length:imageBytes.byteLength
    },
    timing:{total_ms:Date.now()-started}
  });
}

/* ========================= grid-capture reader (Phase Five) ================ */
const GRID_CAPTURE_READER_SYSTEM=`You are an evidence-disciplined grid reader for a creative direction system.

Read the supplied screenshot as a layout-preserved social, portfolio, campaign, or mood grid. Extract compact structured evidence that another model can adapt into a new context.

Return ONLY valid JSON, with no prose outside the object and no markdown fences.

Treat the grid as a body of work, not as one flattened photograph. Describe both tile-level evidence and cross-grid patterns: repeated subject families, human-presence distribution, camera-distance rhythm, palette cadence, lighting consistency, typography or graphic density, material patterns, composition alternation, negative-space behavior, sequencing, and the overall emotional or cultural register supported by the visible tiles.

At least three visual_evidence entries must describe patterns across multiple tiles. Do not let one visually dominant tile stand in for the whole grid. Name disagreement or variety when the grid does not have one consistent pattern.

The screenshot is a reference anchor, not a locked asset. Do not claim that its pixels, people, logos, readable text, or individual tile identities must be preserved. Visible subject matter and formal qualities remain available as inspiration. Variations are allowed unless the user supplies a separate explicit exclusion downstream.

Do not infer what the user wants retained or excluded from the grid alone. The optional reference focus may help you prioritize observations, but requirements_added and avoid_added must both be empty arrays. User-authored focus and exclusions are attached to the dossier after the read.

Do not identify a person, brand, creator, account, location, culture, campaign, or historical source unless explicitly supplied in user context. Do not infer sensitive traits, engagement, popularity, ownership, chronology, or off-screen facts. Do not transcribe usernames, captions, or other readable text unless the user explicitly asks and the text is essential to the reference focus.

If the screenshot is not a readable multi-tile grid, return confidence "low", describe the limitation in read_notes, and do not invent cross-grid patterns.

Return exactly this shape:
{
  "territory": ["short emotional, cultural, or visual territory"],
  "visual_evidence": ["specific tile-level or cross-grid visual evidence; at least three cross-grid patterns"],
  "tonal_evidence": ["specific emotional or tonal behavior supported across the grid"],
  "reference_points": ["specific formal relationship, cadence, or repeated device without asserting provenance"],
  "requirements_added": [],
  "avoid_added": [],
  "confidence": "high | medium | low",
  "read_notes": "one short diagnostic string naming grid consistency or limitations"
}`;

function buildGridCaptureUserMessage(filename,userContext,referenceFocus){
  return [
    'GRID SCREENSHOT FILENAME:',
    filename||'uploaded-grid-capture',
    '',
    'OPTIONAL USER CONTEXT:',
    userContext||'(none supplied)',
    '',
    'OPTIONAL REFERENCE FOCUS:',
    referenceFocus||'(open inspiration; no grid pattern has been prioritized)',
    '',
    'Read the screenshot as a multi-tile visual system. Treat the reference focus as an observation priority, not as permission to invent requirements or exclusions.'
  ].join('\n');
}

function validateGridCaptureFragment(raw,filename){
  const fragment=validateAnchorFragment(raw,{
    anchor_type:'grid_capture',
    source:filename||'uploaded-grid-capture',
    polarity:'reference_only',
    low_confidence_note:'The uploaded screenshot could not be read as a multi-tile grid with enough confidence to support cross-grid evidence.'
  });
  fragment.requirements_added=[];
  fragment.avoid_added=[];
  fragment.constraints_added=[];
  return fragment;
}

async function gridCaptureFlow(body){
  const filename=compactArtifactString(body&&body.filename,500)||'uploaded-grid-capture';
  const userContext=compactArtifactString(body&&body.user_context,1000);
  const referenceFocus=compactArtifactString(body&&body.reference_focus,1000);
  const apiKey=String((body&&body.api_key)||'').trim();
  const mediaType=normalizeMediaType(body&&body.media_type);
  const imageB64=stripDataUrlPrefix(body&&body.image_b64);
  if(!apiKey) return json({error:'missing_api_key'},400);
  if(!imageB64) return json({error:'missing_image'},400);
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(mediaType)) return json({error:'unsupported_image_type'},415);

  let imageBytes;
  try{ imageBytes=base64ToBytes(imageB64); }
  catch{ return json({error:'invalid_image_data'},400); }
  if(!imageBytes.byteLength) return json({error:'empty_image'},400);
  if(imageBytes.byteLength>5000000) return json({error:'image_too_large',max_bytes:5000000},413);

  const started=Date.now();
  let raw;
  try{
    raw=await callClaude(
      GRID_CAPTURE_READER_SYSTEM,
      buildGridCaptureUserMessage(filename,userContext,referenceFocus),
      apiKey,
      {
        media_type:mediaType,
        data:imageB64,
        instruction:'The image above is a multi-tile grid screenshot and a reference anchor, not a locked asset. Read layout-preserved patterns across the grid without identifying unsupported people, accounts, brands, places, or provenance.'
      },
      3000
    );
  }catch(e){
    return json({error:'grid_capture_reader_model_failed',detail:String(e.message||e).slice(0,200)},502);
  }

  let parsed;
  try{ parsed=safeJSONParse(raw); }
  catch(e){ return json({error:'grid_capture_reader_invalid_json',detail:String(e.message||e).slice(0,160)},502); }

  const fragment=validateGridCaptureFragment(parsed,filename);
  return json({
    fragment,
    diagnostics:{
      reader:'grid_capture_v1',
      model:'claude-sonnet-4-5',
      vision_only:true,
      layout_preserved:true,
      structured_fields:true,
      constraint_source:'user_input_only',
      media_type:mediaType,
      byte_length:imageBytes.byteLength
    },
    timing:{total_ms:Date.now()-started}
  });
}

/* Isolated diagnostic transport. The browser supplies the current master-scene
   or schema-repair prompt; the Worker changes transport, not creative
   instructions or output shape. */
async function diagnosticMasterSceneProxyFlow(body){
  const apiKey=String((body&&body.api_key)||'').trim();
  const diagnostic=String((body&&body.diagnostic)||'');
  const requestKind=String((body&&body.request_kind)||'');
  const system=String((body&&body.system_prompt)||'');
  const userText=String((body&&body.user_text)||'');
  const requestedTokens=Number(body&&body.max_tokens);
  const maxTokens=Math.max(256,Math.min(4500,Number.isFinite(requestedTokens)?Math.round(requestedTokens):3200));

  if(!['phase_two_gate_one_artifact_reference','phase_two_gate_two_artifact_reference','phase_three_led_wall_delivery_context','phase_four_image_upload_anchor_reader','phase_five_grid_capture_reader','phase_six_multi_anchor_composition'].includes(diagnostic)) return json({error:'diagnostic_scope_required'},400);
  if(!['master_scene','scene_schema_repair'].includes(requestKind)) return json({error:'invalid_request_kind'},400);
  if(!apiKey) return json({error:'missing_api_key'},400);
  if(!system||!userText) return json({error:'missing_prompt'},400);
  if(system.length>50000||userText.length>150000) return json({error:'prompt_too_large'},413);

  const started=Date.now();
  let text;
  try{
    text=await callClaude(system,userText,apiKey,null,maxTokens);
  }catch(e){
    return json({error:'diagnostic_master_scene_model_failed',detail:String(e.message||e).slice(0,240)},502);
  }

  return json({
    text,
    diagnostics:{
      transport:'diagnostic_worker_proxy_v1',
      request_kind:requestKind,
      model:'claude-sonnet-4-5',
      prompt_passthrough:true
    },
    timing:{total_ms:Date.now()-started}
  });
}

/* ========================= staged preview flows ========================= */
function candidatePayload(ex){
  return ex.candidates.slice(0,8).map((c,index)=>({
    candidate_id:'candidate_'+(index+1),
    source_image_url:upscaleShopify(c.url,1600),
    label:c.source,
    source:c.source,
    has_image_data:false
  }));
}

async function validateProductRequest(body){
  const productUrl=String((body&&body.product_url)||'').trim();
  if(!productUrl) return {error:json({error:'missing_product_url'},400)};
  let pu;
  try{ pu=new URL(productUrl); }catch{ return {error:json({error:'invalid_product_url'},400)}; }
  if(badHost(pu)) return {error:json({error:'blocked_host'},400)};
  return {pu};
}

async function discoverAssetsFlow(body){
  const checked=await validateProductRequest(body);
  if(checked.error) return checked.error;
  const pu=checked.pu;
  const started=Date.now();
  let productHtml;
  try{ productHtml=await getHtml(pu.toString()); }
  catch(e){ return json({error:'fetch_failed',detail:String(e.message||e).slice(0,120)},502); }
  if(!productHtml) return json({error:'could_not_fetch_product'},502);
  const fetchedAt=Date.now();
  const ex=extractIdentity(productHtml,pu.toString());
  return json({
    brand_hint:pu.hostname.replace(/^www\./,''),
    factual:ex.product,
    candidates:candidatePayload(ex),
    diagnostics:{platform:ex.platform_guess,parse_confidence:ex.confidence},
    timing:{html_fetch_ms:fetchedAt-started,extraction_ms:Date.now()-fetchedAt,total_ms:Date.now()-started}
  });
}

const BRAND_PAGE_LINK_RE=/href\s*=\s*["']([^"']*(?:about|our-story|story|mission|values|campaign|lookbook|journal|culture|community)[^"']*)["']/gi;
function discoverBrandPageUrls(homeHtml, baseUrl, max){
  const out=[]; const seen=new Set();
  let m;
  BRAND_PAGE_LINK_RE.lastIndex=0;
  while((m=BRAND_PAGE_LINK_RE.exec(String(homeHtml||'')))&&out.length<(max||2)){
    const abs=absolutize(m[1],baseUrl);
    if(!abs) continue;
    let u; try{ u=new URL(abs); }catch{ continue; }
    if(badHost(u)) continue;
    try{ if(u.hostname.replace(/^www\./,'')!==new URL(baseUrl).hostname.replace(/^www\./,'')) continue; }catch{ continue; }
    if(/\.(jpe?g|png|webp|gif|svg|pdf|css|js)(\?|$)/i.test(u.pathname)) continue;
    const key=u.origin+u.pathname;
    if(seen.has(key)) continue;
    seen.add(key); out.push(u.toString());
  }
  return out;
}
async function brandReadFlow(body){
  const checked=await validateProductRequest(body);
  if(checked.error) return checked.error;
  const pu=checked.pu;
  const apiKey=String((body&&body.api_key)||'').trim();
  const homeUrl=String((body&&body.home_url)||'').trim();
  if(!apiKey) return json({error:'missing_api_key'},400);
  const started=Date.now();
  const productPromise=getHtml(pu.toString());
  let homePromise=Promise.resolve(null);
  if(homeUrl){
    try{ const hu=new URL(homeUrl); if(!badHost(hu)) homePromise=getHtml(hu.toString()); }
    catch{}
  }
  let productHtml,homeHtml;
  try{ [productHtml,homeHtml]=await Promise.all([productPromise,homePromise]); }
  catch(e){ return json({error:'fetch_failed',detail:String(e.message||e).slice(0,120)},502); }
  if(!productHtml) return json({error:'could_not_fetch_product'},502);
  // Best-effort brand pages (about, story, campaign) discovered from the homepage.
  // Failures never block the read.
  let extraPages=[];
  if(homeHtml&&homeUrl){
    const brandPageUrls=discoverBrandPageUrls(homeHtml,homeUrl,2);
    const fetched=await Promise.all(brandPageUrls.map(u=>getHtml(u).catch(()=>null)));
    extraPages=fetched.map((html,i)=>html?{label:'brand',html,url:brandPageUrls[i]}:null).filter(Boolean);
  }
  const pagesFetchedAt=Date.now();
  const ex=extractIdentity(productHtml,pu.toString());
  const pool=poolText(productHtml,homeHtml,{extraPages});
  const pooledAt=Date.now();
  // Best-effort packaging image for the multimodal read. The packaging design is
  // the densest brand signal available; a fetch failure silently degrades to
  // text-only rather than failing the read.
  let visionImage=null;
  const topCandidate=ex.candidates&&ex.candidates[0];
  if(topCandidate&&topCandidate.url){
    try{
      const asset=await fetchImageB64(upscaleShopify(topCandidate.url,800));
      if(asset&&asset.image_b64&&asset.byte_length<4000000) visionImage={media_type:asset.media_type,data:asset.image_b64};
    }catch{ visionImage=null; }
  }
  let vibesRaw;
  try{ vibesRaw=await callClaude(buildSystemPrompt(),buildUserMessage(pool.pooled,ex.product),apiKey,visionImage); }
  catch(e){ return json({error:'model_call_failed',detail:String(e.message||e).slice(0,160)},502); }
  const modelFinishedAt=Date.now();
  let validated;
  try{ validated=validateContract(safeJSONParse(vibesRaw)); }
  catch(e){ return json({error:'brand_read_invalid',detail:String(e.message||e).slice(0,160)},502); }
  const v=validated.value;
  return json({
    brand:pu.hostname.replace(/^www\./,''),
    factual:ex.product,
    vibes:{
      confidence:v.confidence.score,
      primary:{scene_name:v.scene_direction.scene_name||'Primary direction',world_description:v.scene_direction.world_description},
      alternates:v.alternates||[],
      intake_expressive:{product_truth:v.product_truth,audience:v.audience,brand_state:v.brand_state,visual_territory:v.visual_territory,sensory:v.sensory,competitive:v.competitive,visual_identity:v.visual_identity||{},campaign_signals:v.campaign_signals||{},assets:{brand_intent:v.assets&&v.assets.brand_intent}},
      scene_direction:v.scene_direction
    },
    diagnostics:{platform:ex.platform_guess,parse_confidence:ex.confidence,pooling_richness:pool.richness,brand_pages_pooled:extraPages.length,vision_image_included:!!visionImage,repairs:validated.repairs,warnings:validated.warnings},
    timing:{page_fetch_ms:pagesFetchedAt-started,pooling_ms:pooledAt-pagesFetchedAt,model_ms:modelFinishedAt-pooledAt,validation_ms:Date.now()-modelFinishedAt,total_ms:Date.now()-started}
  });
}

async function legacyPreviewFlow(body){
  const assetsResponse=await discoverAssetsFlow(body);
  if(!assetsResponse.ok) return assetsResponse;
  const assetsData=await assetsResponse.json();
  if(!assetsData.candidates.length) return json({error:'no_image_found',parsed:{product:assetsData.factual,candidates:[],confidence:assetsData.diagnostics&&assetsData.diagnostics.parse_confidence}},422);
  const brandResponse=await brandReadFlow(body);
  if(!brandResponse.ok) return brandResponse;
  const brandData=await brandResponse.json();
  return json({
    brand:brandData.brand||assetsData.brand_hint,
    factual:Object.assign({},assetsData.factual||{},brandData.factual||{}),
    candidates:assetsData.candidates,
    vibes:brandData.vibes,
    diagnostics:Object.assign({},assetsData.diagnostics||{},brandData.diagnostics||{}),
    timing:{asset_discovery:assetsData.timing||null,brand_read:brandData.timing||null}
  });
}

/* ========================= handler ========================= */
const CORS={ 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization' };
const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json',...CORS}});
const UA='Mozilla/5.0 (compatible; HigherRoadsPreview/0.1; +https://higher-roads.com)';
function badHost(u){ if(!/^https?:$/.test(u.protocol)) return true; const h=u.hostname; return h==='localhost'||h==='127.0.0.1'||h==='0.0.0.0'||/^10\./.test(h)||/^192\.168\./.test(h)||/^169\.254\./.test(h)||/^172\.(1[6-9]|2\d|3[01])\./.test(h); }
async function getHtml(url){ const r=await fetch(url,{headers:{'User-Agent':UA,'Accept':'text/html'}}); if(!r.ok) return null; const b=await r.arrayBuffer(); return new TextDecoder().decode(b.slice(0,2000000)); }

/* ========================= render (one path, composite) ========================= */
function bytesToBase64(bytes){ let bin=''; const CH=0x8000; for(let i=0;i<bytes.length;i+=CH) bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+CH)); return btoa(bin); }
function normalizeMediaType(mt){ return String(mt||'image/png').split(';')[0].trim()||'image/png'; }
async function imageAssetFromBytes(buf,mediaType){
  const bytes=new Uint8Array(buf);
  if(bytes.byteLength>8000000) throw new Error('image too large');
  const b64=bytesToBase64(bytes);
  return { image_b64:b64, b64, base64:b64, media_type:normalizeMediaType(mediaType), byte_length:bytes.byteLength };
}
async function fetchImageB64(url){
  let u; try{ u=new URL(url); }catch{ throw new Error('invalid image_url'); }
  if(badHost(u)) throw new Error('blocked image host');
  const r=await fetch(u.toString(),{headers:{'User-Agent':UA,'Accept':'image/avif,image/webp,image/png,image/jpeg,image/*,*/*'}});
  if(!r.ok) throw new Error('image fetch '+r.status);
  const media_type=normalizeMediaType(r.headers.get('content-type')||'image/png');
  if(!/^image\//i.test(media_type)) throw new Error('url did not return an image');
  const buf=await r.arrayBuffer();
  const asset=await imageAssetFromBytes(buf,media_type);
  return { ...asset, source_image_url:u.toString() };
}
async function materializeAssetFlow(body){
  const imageUrl=String((body&&body.image_url)||body?.asset_url||body?.source_image_url||'').trim();
  if(!imageUrl) return json({error:'missing image_url'},400);
  try{
    const asset=await fetchImageB64(imageUrl);
    return json({ ...asset, image_url:imageUrl });
  }catch(e){
    return json({error:'asset_materialize_failed',detail:String(e.message||e).slice(0,200)},502);
  }
}
async function materializeCandidateImage(candidate){
  const source_image_url=upscaleShopify(candidate.url,1600);
  const out={ source_image_url, label:candidate.source };
  try{
    const asset=await fetchImageB64(source_image_url);
    out.media_type=asset.media_type;
    out.image_b64=asset.image_b64;
    out.byte_length=asset.byte_length;
    out.has_image_data=true;
  }catch(e){
    out.media_type='image/png';
    out.image_b64='';
    out.has_image_data=false;
    out.materialize_error=String(e.message||e).slice(0,120);
  }
  return out;
}

/* ========================= renderer adapters ========================= */
function stripDataUrlPrefix(s){ return String(s||'').replace(/^data:[^,]+,/,''); }
function base64ToBytes(b64){
  const clean=stripDataUrlPrefix(b64);
  const bin=atob(clean);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
  return bytes;
}
function extensionForMediaType(mt){
  const m=normalizeMediaType(mt).toLowerCase();
  if(m.includes('webp')) return 'webp';
  if(m.includes('jpeg')||m.includes('jpg')) return 'jpg';
  return 'png';
}
function cleanWorldPromptForNativeComposite(prompt){
  return String(prompt || '')
    .replace(/leave clear space for the product\.?/ig, '')
    .replace(/leave clear space\.?/ig, '')
    .replace(/leave room for the product\.?/ig, '')
    .replace(/clear space for the product\.?/ig, '')
    .replace(/clear placement area\.?/ig, '')
    .replace(/empty product zone\.?/ig, '')
    .replace(/product-shaped placement area\.?/ig, '')
    .replace(/placement area\.?/ig, '')
    .replace(/do not draw any product,?\s*/ig, '')
    .replace(/do not draw[^.]*\b(product|can|bottle|package|label|logo|brand name|readable text)[^.]*\./ig, '')
    .replace(/without any product,?\s*/ig, '')
    .replace(/no product,?\s*/ig, '')
    .replace(/no can,?\s*/ig, '')
    .replace(/no bottle,?\s*/ig, '')
    .replace(/no package,?\s*/ig, '')
    .replace(/no label,?\s*/ig, '')
    .replace(/no logo,?\s*/ig, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function inferNativePackageFormat(requestJson){
  const explicit=String(
    requestJson?.package_format ||
    requestJson?.fidelity_contract?.package_format ||
    requestJson?.integration_treatment?.package_format ||
    ''
  ).toLowerCase();
  if(explicit) return explicit==='carton'?'box':explicit;
  const asset=requestJson?.locked_asset||{};
  const text=[asset.asset_name,asset.name,asset.asset_type,asset.source_image_url,asset.asset_url]
    .filter(Boolean).join(' ').toLowerCase();
  if(/\b(pouch|bag|packet|sachet|wrapper)\b/.test(text)) return 'pouch';
  if(/\b(can|soda|spritz|seltzer|rtd)\b/.test(text)) return 'can';
  if(/\b(bottle|jar|vial|dropper|flask)\b/.test(text)) return 'bottle';
  if(/\b(box|carton|case|tub|tin)\b/.test(text)) return 'box';
  return 'package';
}
function buildNativeIntegrationGuidance(requestJson){
  const treatment=requestJson?.integration_treatment||{};
  const format=inferNativePackageFormat(requestJson);
  const allowed=Array.isArray(treatment.allowed_effects)?treatment.allowed_effects.filter(Boolean).map(e=>String(e).replace(/_/g,' ')).slice(0,6):[];
  const notes=String(treatment.scene_specific_notes||'').trim();
  const formatExtra = format==='can'||format==='bottle' ? ', with physically motivated condensation or edge highlights where the scene supports them'
    : format==='pouch' ? ', with minor natural pouch crinkle at contact points'
    : '';
  const effects=allowed.length?allowed.join(', '):'believable contact shadow, scene-matched directional and reflected light, ambient color spill, and depth of field consistent with the camera';
  return 'Integrate the supplied product physically into the scene with '+effects+formatExtra+(notes?'. '+notes:'')+'. These effects never obscure or alter the printed logo, product name, label, colors, proportions, or silhouette.';
}
function buildOpenAINativePrompt(requestJson){
  // Instruction budget: the authored world leads and carries most of the prompt.
  // Protection is one compact block. The compiled positive already contains the
  // scene prose plus a protection block from the prose-preserving compiler; this
  // wrapper only adds what the edit workflow itself requires.
  const variants = Array.isArray(requestJson && requestJson.variants) ? requestJson.variants : [];
  const reference = variants.find(v => v.render_path === 'reference') || {};
  const composite = variants.find(v => v.render_path === 'composite') || variants[0] || {};

  const world = cleanWorldPromptForNativeComposite(
    composite.positive ||
    reference.positive ||
    requestJson?.prompts?.positive ||
    ''
  );

  const product =
    requestJson?.meta?.product_name ||
    requestJson?.locked_asset?.asset_name ||
    'the supplied product';

  const alreadyProtected = /preserve the supplied/i.test(world);

  // Mode-neutral wrapper: the compiled world already carries the mode-specific
  // opening framing sentence (cinematic, documentary, editorial, or vernacular).
  // This wrapper only names the product and appends the edit-workflow rules,
  // so the aesthetic mode chosen upstream is not overridden here.
  return [
    'Create one finished photograph using the uploaded product image as the exact hero product: ' + product + '. Landscape aspect ratio.',
    world,
    alreadyProtected ? '' : buildNativeIntegrationGuidance(requestJson),
    alreadyProtected ? '' : 'Preserve the supplied package identity exactly: label, logo, text, colors, proportions, and silhouette unchanged and readable. Any environmental surface that would carry writing is blank, abstract, cropped, or defocused beyond reading, with no pseudo-text anywhere.',
    'Do not create placeholder frames, placement guides, crop marks, extra or duplicate products, or invented packaging.'
  ].filter(Boolean).join('\n');
}
async function callOpenAIImageEdit(prompt, productFile, env){
  const key=env&&env.OPENAI_API_KEY;
  if(!key) throw new Error('OPENAI_API_KEY secret not set on the Worker');
  const model=(env&&env.OPENAI_IMAGE_MODEL)||'gpt-image-2';
  // Landscape default so the render matches the wide cinematic framing every
  // upstream instruction demands. Env override still wins. Verify per-image
  // pricing at this size before high-volume use.
  const size=(env&&env.OPENAI_IMAGE_SIZE)||'1536x1024';
  const quality=(env&&env.OPENAI_IMAGE_QUALITY)||'medium';
  const outputFormat=(env&&env.OPENAI_IMAGE_OUTPUT_FORMAT)||'png';
  const fd=new FormData();
  fd.append('model',model);
  fd.append('prompt',prompt);
  fd.append('size',size);
  fd.append('quality',quality);
  fd.append('output_format',outputFormat);
  fd.append('image[]',productFile,productFile.name||('locked-product.'+extensionForMediaType(productFile.type)));
  const res=await fetch('https://api.openai.com/v1/images/edits',{ method:'POST', headers:{'Authorization':'Bearer '+key}, body:fd });
  const text=await res.text();
  let data; try{ data=JSON.parse(text); }catch{ data={raw:text}; }
  if(!res.ok){
    const detail=data?.error?.message||text||('OpenAI image edit '+res.status);
    throw new Error(detail.slice(0,300));
  }
  const b64=data?.data?.[0]?.b64_json;
  if(!b64) throw new Error('OpenAI returned no b64_json image');
  return {
  image_b64: b64,
  b64,
  base64: b64,
  media_type: 'image/' + outputFormat,
  model,
  provider: 'openai',
  requested_size: size,
  requested_quality: quality,
  requested_output_format: outputFormat
};
}
async function renderFlow(body, env){
  const requestJson=body.request_json||body.package||body;
  const prompt=String(body.prompt||buildOpenAINativePrompt(requestJson)).trim();
  const productUrl=String(body.product_image_url||'').trim();
  const productB64=String(body.product_image_b64||body.image_b64||requestJson?.locked_asset?.image_data||'').trim();
  const productMediaType=normalizeMediaType(body.product_media_type||body.media_type||requestJson?.locked_asset?.media_type||'image/png');
  if(!prompt) return json({error:'missing prompt'},400);

  let productFile=null, productImg=null;
  try{
    if(productB64){
      const bytes=base64ToBytes(productB64);
      productFile=new File([bytes],'locked-product.'+extensionForMediaType(productMediaType),{type:productMediaType});
      productImg={ image_b64:stripDataUrlPrefix(productB64), b64:stripDataUrlPrefix(productB64), base64:stripDataUrlPrefix(productB64), media_type:productMediaType };
    }else if(productUrl){
      const asset=await fetchImageB64(productUrl);
      const bytes=base64ToBytes(asset.image_b64);
      productFile=new File([bytes],'locked-product.'+extensionForMediaType(asset.media_type),{type:asset.media_type});
      productImg=asset;
    }else{
      return json({error:'missing product image payload'},400);
    }
  }catch(e){ return json({error:'product_input_failed',detail:String(e.message||e).slice(0,200)},400); }

  let finalImg;
  try{ finalImg=await callOpenAIImageEdit(prompt, productFile, env); }
  catch(e){ return json({error:'render_failed',provider:'openai',detail:String(e.message||e).slice(0,300)},502); }

  return json({
    provider:'openai',
    model:finalImg.model,
    requested_size: finalImg.requested_size,
    requested_quality: finalImg.requested_quality,
    requested_output_format: finalImg.requested_output_format,
    final_image:finalImg,
    rendered_image:finalImg,
    product_image:productImg,
    placement:requestJson?.placement_spec||body.placement||{cx:0.5,cy:0.66,scale:0.42},
    prompt_used:prompt
  });
}
async function renderBundleFlow(requestJson, productFile, env){
  if(!requestJson||typeof requestJson!=='object') return json({error:'missing request_json'},400);
  if(!productFile||typeof productFile.arrayBuffer!=='function') return json({error:'missing locked_product_image'},400);
  const prompt=buildOpenAINativePrompt(requestJson);
  let productImg;
  try{
    const buf=await productFile.arrayBuffer();
    productImg=await imageAssetFromBytes(buf,productFile.type||requestJson.locked_asset?.media_type||'image/png');
    productFile=new File([buf],productFile.name||('locked-product.'+extensionForMediaType(productImg.media_type)),{type:productImg.media_type});
  }catch(e){ return json({error:'product_file_failed',detail:String(e.message||e).slice(0,160)},400); }

  let finalImg;
  try{ finalImg=await callOpenAIImageEdit(prompt, productFile, env); }
  catch(e){ return json({error:'render_failed',provider:'openai',detail:String(e.message||e).slice(0,300)},502); }

  return json({
    provider:'openai',
    model:finalImg.model,
    requested_size: finalImg.requested_size,
    requested_quality: finalImg.requested_quality,
    requested_output_format: finalImg.requested_output_format,
    final_image:finalImg,
    rendered_image:finalImg,
    product_image:productImg,
    placement:requestJson.placement_spec||{cx:0.5,cy:0.66,scale:0.42},
    prompt_used:prompt
  });
}

async function handle(request, env){
  try{ return await _handle(request, env); }
  catch(e){ return json({ error:'worker_exception', detail:String((e&&e.message)||e).slice(0,300) }, 500); }
}

async function _handle(request, env){
  if(request.method==='OPTIONS') return new Response(null,{headers:CORS});
  if(request.method!=='POST') return json({error:'POST only'},405);

  const contentType=request.headers.get('content-type')||'';
  if(contentType.includes('multipart/form-data')){
    let form; try{ form=await request.formData(); }catch{ return json({error:'bad_multipart'},400); }
    const raw=form.get('request_json');
    const productFile=form.get('locked_product_image');
    let requestJson; try{ requestJson=JSON.parse(String(raw||'')); }catch{ return json({error:'bad request_json'},400); }
    return renderBundleFlow(requestJson, productFile, env);
  }

  let body; try{ body=await request.json(); }catch{ return json({error:'bad_request'},400); }
  const action=String((body&&body.action)||'preview');
  if(action==='discover_assets') return discoverAssetsFlow(body);
  if(action==='brand_read') return brandReadFlow(body);
  if(action==='read_artifact_reference') return artifactReferenceFlow(body);
  if(action==='read_image_upload') return imageUploadFlow(body);
  if(action==='read_grid_capture') return gridCaptureFlow(body);
  if(action==='diagnostic_master_scene_proxy') return diagnosticMasterSceneProxyFlow(body);
  if(action==='materialize_asset') return materializeAssetFlow(body);
  if(action==='render') return renderFlow(body, env);
  if(action==='preview') return legacyPreviewFlow(body);
  return json({error:'unknown_action'},400);
}

export default { fetch:(request, env, ctx)=>handle(request, env) };
export { extractIdentity, poolText, validateContract, buildSystemPrompt, upscaleShopify, renderFlow, materializeAssetFlow, renderBundleFlow, buildOpenAINativePrompt, callOpenAIImageEdit };
