const fallbackConcepts = {
  "produce": {
    "id": "produce",
    "label": "Produce",
    "machineName": "Conversation Intake Engine",
    "eyebrow": "Machine 01",
    "summary": "Captures raw expert conversations before they degrade into messy source files.",
    "whatEnters": "Expert sessions, recordings, audio signals, camera feeds, overlays, and production notes.",
    "whatHappens": "The machine stabilizes the source material with recording standards, scene controls, audio checks, and backup capture.",
    "whatComesOut": "Clean source media for packaging, publishing, measurement, and preservation.",
    "bullets": [
      "Recording workflow",
      "Scene switching",
      "Audio monitoring",
      "Backup capture"
    ],
    "repoPaths": [
      "FRAMEWORK.md",
      "produce/real-time-production/obs-production-standard.md"
    ]
  },
  "package": {
    "id": "package",
    "label": "Package",
    "machineName": "Asset Packaging Line",
    "eyebrow": "Machine 02",
    "summary": "Turns one source session into audience-ready media assets.",
    "whatEnters": "Clean source recordings, transcripts, key moments, guest context, and topic notes.",
    "whatHappens": "The machine cuts, labels, titles, describes, formats, and polishes the raw session into channel-ready pieces.",
    "whatComesOut": "Titles, descriptions, clips, reels, thumbnails, chapters, quote cards, and guest assets.",
    "bullets": [
      "Title press",
      "Description printer",
      "Clip cutter",
      "Thumbnail polisher"
    ],
    "repoPaths": [
      "package/titles/top-performing-title-styles.md",
      "package/descriptions/rss-feed-description-patterns.md"
    ]
  },
  "publish": {
    "id": "publish",
    "label": "Publish",
    "machineName": "Channel Launch Dock",
    "eyebrow": "Machine 03",
    "summary": "Sends packaged assets into channels while the owned website stays the canonical home.",
    "whatEnters": "Finished content assets, release copy, channel variants, links, and publishing checklists.",
    "whatHappens": "The machine routes each asset to the right destination and keeps the durable version anchored in owned space.",
    "whatComesOut": "Website pages, RSS items, YouTube videos, LinkedIn posts, emails, premieres, and simulcast replays.",
    "bullets": [
      "Website home",
      "RSS feed",
      "YouTube",
      "LinkedIn and email"
    ],
    "repoPaths": [
      "publish/website/canonical-episode-page.md",
      "publish/live-premieres/simulcast-standard.md"
    ]
  },
  "prove": {
    "id": "prove",
    "label": "Prove",
    "machineName": "Proof and Score Lab",
    "eyebrow": "Machine 04",
    "summary": "Measures what shipped and turns performance into factory feedback.",
    "whatEnters": "Published assets, analytics, engagement signals, conversions, benchmarks, and evidence notes.",
    "whatHappens": "The machine scores usefulness, repeatability, evidence level, and production fit.",
    "whatComesOut": "Scorecards, evidence labels, benchmark checks, pattern improvements, and feedback signals.",
    "bullets": [
      "Scorecard",
      "Evidence label",
      "Benchmark check",
      "Feedback signal"
    ],
    "repoPaths": [
      "SCORING.md",
      "EVIDENCE.md"
    ]
  },
  "preserve": {
    "id": "preserve",
    "label": "Preserve",
    "machineName": "Content Memory Archive",
    "eyebrow": "Machine 05",
    "summary": "Stores knowledge so every session can feed the next one.",
    "whatEnters": "Transcripts, speaker labels, timestamps, metadata, tags, assets, and topic relationships.",
    "whatHappens": "The machine indexes, tags, connects, and retrieves knowledge across the archive.",
    "whatComesOut": "Searchable memory, reusable insights, vector retrieval, content libraries, and compounding knowledge.",
    "bullets": [
      "Transcript vault",
      "Topic tags",
      "Vector memory",
      "Search retrieval"
    ],
    "repoPaths": [
      "preserve/vector-memory/content-memory-standard.md"
    ]
  }
};

const overview = {
  id: "overview",
  label: "Overview",
  machineName: "Choose a machine",
  eyebrow: "Factory overview",
  summary: "The factory map is the overview. Each machine opens a focused scene and a reusable concept card.",
  whatEnters: "Raw expert conversations and source media.",
  whatHappens: "The factory turns source material into owned media assets.",
  whatComesOut: "Published assets, measured results, and reusable memory.",
  bullets: ["Factory map", "Scene switching", "Reusable cards", "Saved concept tray"],
  repoPaths: ["Owned Media Index"]
};

let concepts = fallbackConcepts;
let activeConcept = overview;
let saved = [];

const stage = document.querySelector("#stage");
const hotspots = [...document.querySelectorAll(".hotspot")];
const navButtons = [...document.querySelectorAll(".nav button")];

const fields = {
  eyebrow: document.querySelector("#eyebrow"),
  title: document.querySelector("#title"),
  summary: document.querySelector("#summary"),
  enters: document.querySelector("#enters"),
  happens: document.querySelector("#happens"),
  comesout: document.querySelector("#comesout"),
  chips: document.querySelector("#chips"),
  paths: document.querySelector("#paths"),
  count: document.querySelector("#count"),
  savedList: document.querySelector("#saved-list"),
  toast: document.querySelector("#toast"),
  savedDrawer: document.querySelector(".saved")
};

const saveButton = document.querySelector("#save");
const copyButton = document.querySelector("#copy");
const copySavedButton = document.querySelector("#copy-saved");
const clearButton = document.querySelector("#clear");

const glow = {
  overview: ["50%", "50%"],
  produce: ["16%", "37%"],
  package: ["49%", "38%"],
  publish: ["78%", "42%"],
  prove: ["29%", "77%"],
  preserve: ["62%", "75%"]
};

function toast(message) {
  fields.toast.textContent = message;
  fields.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => fields.toast.classList.remove("show"), 1800);
}

function setButtons(id) {
  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.concept === id));
  hotspots.forEach(btn => btn.classList.toggle("active", btn.dataset.concept === id));
}

function render(concept) {
  activeConcept = concept;
  const id = concept.id;
  stage.dataset.scene = id;
  const [x, y] = glow[id] || glow.overview;
  stage.style.setProperty("--gx", x);
  stage.style.setProperty("--gy", y);
  setButtons(id);

  fields.eyebrow.textContent = concept.eyebrow;
  fields.title.textContent = concept.machineName;
  fields.summary.textContent = concept.summary;
  fields.enters.textContent = concept.whatEnters;
  fields.happens.textContent = concept.whatHappens;
  fields.comesout.textContent = concept.whatComesOut;
  fields.chips.innerHTML = concept.bullets.map(item => `<li>${item}</li>`).join("");
  fields.paths.innerHTML = concept.repoPaths.map(item => `<li>${item}</li>`).join("");

  const disabled = id === "overview";
  saveButton.disabled = disabled;
  copyButton.disabled = disabled;
}

function showConcept(id) {
  if (id === "overview") {
    render(overview);
    return;
  }
  if (!concepts[id]) {
    toast("Concept missing.");
    return;
  }
  render(concepts[id]);
}

function textFor(concept) {
  return `${concept.label}: ${concept.machineName}

Summary:
${concept.summary}

What enters:
${concept.whatEnters}

What happens:
${concept.whatHappens}

What comes out:
${concept.whatComesOut}

Key parts:
${concept.bullets.map(item => "- " + item).join("\n")}

Repo basis:
${concept.repoPaths.map(item => "- " + item).join("\n")}`;
}

async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(msg);
  } catch (error) {
    toast("Copy failed in this browser.");
  }
}

function saveConcept() {
  if (activeConcept.id === "overview") return;
  if (!saved.some(item => item.id === activeConcept.id)) {
    saved.push(activeConcept);
    renderSaved();
    fields.savedDrawer.classList.add("open");
    toast(`${activeConcept.label} saved.`);
  } else {
    toast(`${activeConcept.label} already saved.`);
  }
}

function renderSaved() {
  fields.count.textContent = saved.length;
  fields.savedList.innerHTML = saved.map(item => `<li>${item.label}: ${item.machineName}</li>`).join("");
}

function copySaved() {
  if (!saved.length) {
    toast("Save at least one concept first.");
    return;
  }
  copyText("Riggg Factory Saved Concepts\n\n" + saved.map(textFor).join("\n\n---\n\n"), "Saved brief copied.");
}

hotspots.forEach(btn => btn.addEventListener("click", () => showConcept(btn.dataset.concept)));
navButtons.forEach(btn => btn.addEventListener("click", () => showConcept(btn.dataset.concept)));
saveButton.addEventListener("click", saveConcept);
copyButton.addEventListener("click", () => copyText(textFor(activeConcept), "Concept card copied."));
copySavedButton.addEventListener("click", copySaved);
clearButton.addEventListener("click", () => {
  saved = [];
  renderSaved();
  toast("Saved tray cleared.");
});

fetch("content/concepts.json", { cache: "no-store" })
  .then(res => res.ok ? res.json() : Promise.reject())
  .then(data => {
    concepts = data;
    toast("Concept JSON loaded.");
  })
  .catch(() => {
    concepts = fallbackConcepts;
    toast("Using embedded concept data.");
  })
  .finally(() => render(overview));
