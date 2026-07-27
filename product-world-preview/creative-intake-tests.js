/**
 * Regression tests for creative-intake.js v10 (lean dossier)
 * Run: node creative-intake-tests.js
 *
 * Covers:
 *   - Primary anchor retained in multi-source assembly
 *   - Anchor order: [primary, ...references]
 *   - Per-anchor confidence and read_notes
 *   - Tiered asset boundary: zero, one, two ambiguous, each hard signal
 *   - Confidence follows highest-influence source
 *   - Evidence dedup: intake_expressive fields empty on multi-source path
 */

const intake = require('./creative-intake.js');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error('FAIL:', label);
  }
}

function assertEq(actual, expected, label) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.error('FAIL:', label, '| expected:', expected, '| got:', actual);
  }
}

// --- Helpers ---

function makePrimaryInput(type, extras) {
  return Object.assign({ type, raw_text: 'Test brief', user_context: 'Test context' }, extras || {});
}

function makeFragment(overrides) {
  return Object.assign({
    territory: ['warm industrial'],
    visual_evidence: ['brass machinery in soft light'],
    tonal_evidence: ['nostalgic maker energy'],
    reference_points: ['Miyazaki workshop interiors'],
    confidence: 'high',
    read_notes: 'Clear visual system read'
  }, overrides || {});
}

function makeReference(overrides) {
  return Object.assign({
    input: { type: 'artifact_reference', source_name: 'Gladiator wheat field', user_context: 'emotional register only', usage_note: 'Use the light behavior, not the setting' },
    role: 'emotional_cinematic_reference',
    anchor_id: 'anchor_2',
    fragment: makeFragment({ confidence: 'medium', read_notes: 'Artifact identified with moderate confidence', territory: ['golden-hour elegy'], visual_evidence: ['backlit wheat stalks'], tonal_evidence: ['quiet grief'], reference_points: ['Gladiator afterlife'] })
  }, overrides || {});
}

function makeScene(overrides) {
  return Object.assign({
    scene_name: 'Test scene',
    world_description: 'A warm industrial workshop with brass fittings and amber light filtering through dusty skylights, tools hanging on pegboards.',
    composition: 'Wide establishing shot through the workshop doorway, shallow depth layering foreground tools against background glow.',
    lighting: 'Warm amber key from skylights with cool fill from open doors.',
    props: ['brass gears', 'leather apron', 'wooden workbench'],
    evidence_cues: ['pegboard silhouette', 'sawdust motes'],
    signature_objects: ['overhead crane hook'],
    render_path: 'world_only'
  }, overrides || {});
}

// ============================================================
// 1. Primary anchor retained in multi-source assembly
// ============================================================

console.log('\n--- Primary anchor retention ---');

const primary = makePrimaryInput('text_brief');
const primaryFrag = makeFragment();
const ref1 = makeReference();
const data = intake.assembleDossierDataFromSources(primary, primaryFrag, [ref1], null);

assert(Array.isArray(data.brief.anchors), 'anchors is an array');
assertEq(data.brief.anchors.length, 2, 'two anchors: primary + one reference');
assertEq(data.brief.anchors[0].anchor_id, 'anchor_1', 'primary anchor is first');
assertEq(data.brief.anchors[0].role, 'creative_brief', 'primary anchor role is creative_brief');
assertEq(data.brief.anchors[1].anchor_id, 'anchor_2', 'reference anchor is second');
assertEq(data.brief.anchors[1].role, 'emotional_cinematic_reference', 'reference anchor role preserved');

// Primary evidence survives
assert(data.brief.anchors[0].evidence.territory.length > 0, 'primary anchor carries territory evidence');
assert(data.brief.anchors[0].evidence.visual_evidence.length > 0, 'primary anchor carries visual evidence');

// ============================================================
// 2. Per-anchor confidence and read_notes
// ============================================================

console.log('\n--- Per-anchor confidence and read_notes ---');

assertEq(data.brief.anchors[0].confidence, 'high', 'primary anchor confidence from fragment');
assert(data.brief.anchors[0].read_notes.length > 0, 'primary anchor read_notes populated');
assertEq(data.brief.anchors[1].confidence, 'medium', 'reference anchor confidence from its fragment');
assert(data.brief.anchors[1].read_notes.length > 0, 'reference anchor read_notes populated');

// Single-source path also gets confidence and read_notes
const singleData = intake.assembleDossierData(primary, primaryFrag, null);
assertEq(singleData.brief.anchors[0].confidence, 'high', 'single-source anchor has confidence');
assert(singleData.brief.anchors[0].read_notes.length > 0, 'single-source anchor has read_notes');

// ============================================================
// 3. Evidence dedup: intake_expressive empty on multi-source
// ============================================================

console.log('\n--- Evidence deduplication ---');

const ix = data.vibes.intake_expressive;
assertEq(ix.audience.desired_state.length, 0, 'desired_state empty (evidence lives in anchors)');
assertEq(ix.brand_state.core_adjectives.length, 0, 'core_adjectives empty');
assertEq(ix.visual_territory.closest_to.length, 0, 'closest_to empty');
assertEq(ix.sensory.textures_and_materials.length, 0, 'textures_and_materials empty');
assertEq(ix.campaign_signals.cultural_codes.length, 0, 'cultural_codes empty');
assertEq(ix.campaign_signals.actions_and_motion.length, 0, 'actions_and_motion empty');
assertEq(ix.campaign_signals.campaign_energy, '', 'campaign_energy empty');
assert(ix.campaign_signals.evidence_notes.length > 0, 'evidence_notes still populated (distinct content)');

// ============================================================
// 4. Confidence follows highest-influence source
// ============================================================

console.log('\n--- Confidence aggregation ---');

// Lead source high, supporting source low: should be high
const refLow = makeReference({
  input: Object.assign({}, makeReference().input, { influence_weight: 20 }),
  fragment: makeFragment({ confidence: 'low', read_notes: 'Uncertain read' })
});
const dataHighLead = intake.assembleDossierDataFromSources(primary, primaryFrag, [refLow], null);
assertEq(dataHighLead.vibes.confidence, 'high', 'confidence follows high-weight primary, not low-weight reference');

// Lead source low, supporting source high: should be low (lead has weight 100)
const primaryFragLow = makeFragment({ confidence: 'low' });
const refHigh = makeReference({
  input: Object.assign({}, makeReference().input, { influence_weight: 40 }),
  fragment: makeFragment({ confidence: 'high' })
});
const dataLowLead = intake.assembleDossierDataFromSources(primary, primaryFragLow, [refHigh], null);
assertEq(dataLowLead.vibes.confidence, 'low', 'confidence follows primary at weight 100 even when ref is high');

// All unknown: stays unknown
const primaryFragUnk = makeFragment({ confidence: 'unknown' });
const refUnk = makeReference({ fragment: makeFragment({ confidence: 'unknown' }) });
const dataUnk = intake.assembleDossierDataFromSources(primary, primaryFragUnk, [refUnk], null);
assertEq(dataUnk.vibes.confidence, 'unknown', 'all unknown stays unknown');

// ============================================================
// 5. Tiered asset boundary
// ============================================================

console.log('\n--- Tiered asset boundary ---');

// Clean scene: valid
const cleanScene = makeScene();
const cleanResult = intake.sceneAssetBoundary(cleanScene, 0);
assertEq(cleanResult.valid, true, 'clean scene is valid');
assertEq(cleanResult.hard.length, 0, 'no hard signals on clean scene');
assertEq(cleanResult.ambiguous.length, 0, 'no ambiguous signals on clean scene');

// Has locked assets: always valid regardless of content
const productScene = makeScene({ world_description: 'A product display with logo and packshot.' });
const lockedResult = intake.sceneAssetBoundary(productScene, 1);
assertEq(lockedResult.valid, true, 'scene with locked assets is always valid');

// Hard signal: product
const productResult = intake.sceneAssetBoundary(makeScene({ world_description: 'A glowing product on a marble shelf.' }), 0);
assertEq(productResult.valid, false, 'hard: "product" triggers repair');
assert(productResult.hard.includes('product'), 'hard array contains "product"');

// Hard signal: logo
const logoResult = intake.sceneAssetBoundary(makeScene({ world_description: 'The brand logo hovers above the scene.' }), 0);
assertEq(logoResult.valid, false, 'hard: "logo" triggers repair');
assert(logoResult.hard.includes('logo'), 'hard array contains "logo"');

// Hard signal: logotype
const logotypeResult = intake.sceneAssetBoundary(makeScene({ world_description: 'The logotype is etched in stone.' }), 0);
assertEq(logotypeResult.valid, false, 'hard: "logotype" triggers repair');
assert(logotypeResult.hard.includes('logo'), 'hard array contains "logo" for logotype match');

// Hard signal: sku
const skuResult = intake.sceneAssetBoundary(makeScene({ props: ['branded sku display'] }), 0);
assertEq(skuResult.valid, false, 'hard: "sku" triggers repair');
assert(skuResult.hard.includes('sku'), 'hard array contains "sku"');

// Hard signal: packshot
const packshotResult = intake.sceneAssetBoundary(makeScene({ world_description: 'A hero packshot under studio light.' }), 0);
assertEq(packshotResult.valid, false, 'hard: "packshot" triggers repair');
assert(packshotResult.hard.includes('packshot'), 'hard array contains "packshot"');

// Hard signal: composite render_path
const compositeResult = intake.sceneAssetBoundary(makeScene({ render_path: 'composite' }), 0);
assertEq(compositeResult.valid, false, 'hard: composite render_path triggers repair');
assert(compositeResult.hard.includes('composite_render_path'), 'hard array contains "composite_render_path"');

// Hard signal: populated locked_asset_placements
const placementsResult = intake.sceneAssetBoundary(makeScene({ locked_asset_placements: [{ position: 'center' }] }), 0);
assertEq(placementsResult.valid, false, 'hard: locked_asset_placements triggers repair');
assert(placementsResult.hard.includes('locked_asset_placements'), 'hard array contains "locked_asset_placements"');

// Hard signal: asset_placement (placement intent text)
const placementIntentResult = intake.sceneAssetBoundary(makeScene({ locked_asset_placement_intent: 'Center the hero product.' }), 0);
assertEq(placementIntentResult.valid, false, 'hard: placement intent text triggers repair');
assert(placementIntentResult.hard.includes('asset_placement'), 'hard array contains "asset_placement"');

// One ambiguous signal: warns only, still valid
const labelResult = intake.sceneAssetBoundary(makeScene({ world_description: 'Potion jars with handwritten labels on a wooden shelf.' }), 0);
assertEq(labelResult.valid, true, 'one ambiguous: "label" warns but scene stays valid');
assertEq(labelResult.ambiguous.length, 1, 'one ambiguous signal detected');
assert(labelResult.ambiguous.includes('label'), 'ambiguous array contains "label"');
assertEq(labelResult.hard.length, 0, 'no hard signals from label alone');

// One ambiguous: package (the gnome workshop case)
const packageResult = intake.sceneAssetBoundary(makeScene({ world_description: 'A gnome workshop with packing crates and wooden packaging.' }), 0);
assertEq(packageResult.valid, true, 'one ambiguous: "package" warns but scene stays valid');
assert(packageResult.ambiguous.includes('package'), 'ambiguous array contains "package"');

// One ambiguous: supplement
const supplementResult = intake.sceneAssetBoundary(makeScene({ world_description: 'A supplement of light fills the chamber.' }), 0);
assertEq(supplementResult.valid, true, 'one ambiguous: "supplement" warns but scene stays valid');

// One ambiguous: gummy
const gummyResult = intake.sceneAssetBoundary(makeScene({ world_description: 'Gummy candies scattered on the table.' }), 0);
assertEq(gummyResult.valid, true, 'one ambiguous: "gummy" warns but scene stays valid');

// Two ambiguous signals: triggers repair
const twoAmbigResult = intake.sceneAssetBoundary(makeScene({ world_description: 'A branded supplement with a colorful label.' }), 0);
assertEq(twoAmbigResult.valid, false, 'two ambiguous signals together trigger repair');
assert(twoAmbigResult.ambiguous.length >= 2, 'two or more ambiguous signals detected');
assertEq(twoAmbigResult.hard.length, 0, 'no hard signals, just multiple ambiguous');

// Mixed hard + ambiguous: hard takes priority, still invalid
const mixedResult = intake.sceneAssetBoundary(makeScene({ world_description: 'The product sits on a labeled shelf.' }), 0);
assertEq(mixedResult.valid, false, 'mixed: hard "product" plus ambiguous "label" triggers repair');
assert(mixedResult.hard.includes('product'), 'hard array has "product"');
assert(mixedResult.ambiguous.includes('label'), 'ambiguous array has "label"');

// Zero signals
const emptySceneResult = intake.sceneAssetBoundary(makeScene({ world_description: 'Amber light fills a warm industrial workshop.' }), 0);
assertEq(emptySceneResult.valid, true, 'zero signals: valid');
assertEq(emptySceneResult.hard.length, 0, 'zero hard');
assertEq(emptySceneResult.ambiguous.length, 0, 'zero ambiguous');
assertEq(emptySceneResult.signals.length, 0, 'zero combined signals');

// ============================================================
// Summary
// ============================================================

console.log('\n' + '='.repeat(50));
console.log('Passed: ' + passed + '  Failed: ' + failed);
if (failed > 0) {
  console.log('REGRESSION DETECTED');
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED');
}
