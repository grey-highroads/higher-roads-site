const fallbackConcepts = {
  "overview": {
    "id": "overview",
    "label": "Overview",
    "sceneTitle": "Riggg Factory",
    "machineName": "Owned Media Factory Map",
    "kicker": "Start here",
    "summary": "A bright factory map for exploring the Owned Media Index. Pick a machine, inspect its patterns, and save useful cards.",
    "buttons": [
      "Produce",
      "Package",
      "Publish",
      "Prove",
      "Preserve"
    ],
    "sources": [
      "Owned Media Index",
      "Factory operating model"
    ]
  },
  "produce": {
    "id": "produce",
    "label": "Produce",
    "sceneTitle": "Conversation Intake Engine",
    "machineName": "Produce",
    "kicker": "Capture the source",
    "summary": "Captures raw expert conversations before they degrade into scattered files.",
    "buttons": [
      "OBS Standard",
      "Audio Setup",
      "Scene Controls",
      "Backup Recording"
    ],
    "patterns": [
      {
        "title": "OBS Production Standard",
        "score": 4,
        "evidence": "Practitioner observation",
        "type": "Standard",
        "whatItIs": "A repeatable live production setup for recording, overlays, scenes, audio, and backup capture.",
        "qualityBar": "Clean audio, clear visuals, stable scenes, and a usable backup recording.",
        "prompt": "Turn this recording workflow into a reusable production checklist for a recurring owned media show.",
        "source": "produce/real-time-production/obs-production-standard.md"
      }
    ],
    "sources": [
      "FRAMEWORK.md",
      "produce/real-time-production/obs-production-standard.md"
    ]
  },
  "package": {
    "id": "package",
    "label": "Package",
    "sceneTitle": "Asset Packaging Line",
    "machineName": "Package",
    "kicker": "Turn sessions into assets",
    "summary": "Transforms source sessions into titles, descriptions, clips, thumbnails, chapters, quotes, and guest assets.",
    "buttons": [
      "Titles",
      "Descriptions",
      "Clips",
      "Thumbnails",
      "Quote Cards"
    ],
    "patterns": [
      {
        "title": "Guest Story Arc",
        "score": 4,
        "evidence": "Practitioner observation",
        "type": "Pattern",
        "whatItIs": "A description pattern that frames the guest\u2019s story, the lesson, and the application for the audience.",
        "qualityBar": "The description should make the guest relevant, name the tension, and promise a usable takeaway.",
        "prompt": "Write an episode description using Guest Story Arc: guest context, tension, lesson, and audience application.",
        "source": "patterns/package/descriptions/guest-story-arc"
      },
      {
        "title": "Top Performing Title Styles",
        "score": 4,
        "evidence": "Pattern-backed",
        "type": "Pattern library",
        "whatItIs": "A title framework for turning a topic into a clear reason to click.",
        "qualityBar": "The title should signal the audience, the topic, and the reason it matters.",
        "prompt": "Generate 10 title options using curiosity, contrarian, benefit-driven, and how-to structures.",
        "source": "package/titles/top-performing-title-styles.md"
      }
    ],
    "sources": [
      "package/titles/top-performing-title-styles.md",
      "package/descriptions/rss-feed-description-patterns.md"
    ]
  },
  "publish": {
    "id": "publish",
    "label": "Publish",
    "sceneTitle": "Channel Launch Dock",
    "machineName": "Publish",
    "kicker": "Route to the right places",
    "summary": "Moves packaged assets into channels while the owned website remains the canonical home.",
    "buttons": [
      "Website",
      "RSS",
      "YouTube",
      "LinkedIn",
      "Email",
      "Simulcast"
    ],
    "patterns": [
      {
        "title": "Canonical Episode Page",
        "score": 5,
        "evidence": "Workflow standard",
        "type": "Standard",
        "whatItIs": "A durable owned page that gives each episode, webinar, or session a stable home.",
        "qualityBar": "The page should contain the core asset, summary, transcript or notes, guest context, links, and conversion path.",
        "prompt": "Create a canonical episode page outline with hero, summary, key moments, guest context, transcript, related links, and CTA.",
        "source": "publish/website/canonical-episode-page.md"
      }
    ],
    "sources": [
      "publish/website/canonical-episode-page.md",
      "publish/live-premieres/simulcast-standard.md"
    ]
  },
  "prove": {
    "id": "prove",
    "label": "Prove",
    "sceneTitle": "Proof and Score Lab",
    "machineName": "Prove",
    "kicker": "Measure what matters",
    "summary": "Scores patterns, checks evidence, and turns performance back into system learning.",
    "buttons": [
      "Score",
      "Evidence",
      "Benchmarks",
      "Attribution",
      "Conversion"
    ],
    "patterns": [
      {
        "title": "Pattern Scoring",
        "score": 5,
        "evidence": "System standard",
        "type": "Scoring model",
        "whatItIs": "A way to rank patterns by usefulness, repeatability, evidence, and fit for real production.",
        "qualityBar": "A high score should mean the pattern is useful, repeatable, evidence-informed, and practical.",
        "prompt": "Score this owned media pattern from 1 to 5 using usefulness, evidence, repeatability, and production fit.",
        "source": "SCORING.md"
      }
    ],
    "sources": [
      "SCORING.md",
      "EVIDENCE.md"
    ]
  },
  "preserve": {
    "id": "preserve",
    "label": "Preserve",
    "sceneTitle": "Content Memory Archive",
    "machineName": "Preserve",
    "kicker": "Make it compound",
    "summary": "Stores transcripts, tags, speaker labels, metadata, and retrieval paths so every session feeds the next one.",
    "buttons": [
      "Transcripts",
      "Tags",
      "Vectors",
      "Search",
      "Reusable Memory"
    ],
    "patterns": [
      {
        "title": "Content Memory Standard",
        "score": 5,
        "evidence": "System standard",
        "type": "Standard",
        "whatItIs": "A structured way to preserve sessions so the archive becomes searchable and reusable.",
        "qualityBar": "Saved content should include clean transcripts, speaker labels, timestamps, metadata, tags, access rules, and retrieval paths.",
        "prompt": "Convert this session into a content memory entry with transcript metadata, speaker labels, topic tags, and retrieval notes.",
        "source": "preserve/vector-memory/content-memory-standard.md"
      }
    ],
    "sources": [
      "preserve/vector-memory/content-memory-standard.md"
    ]
  }
};

let concepts = fallbackConcepts;
let currentScene = "overview";
let currentPattern = null;
let saved = [];

const app = document.querySelector(".app");
const navButtons = [...document.querySelectorAll("[data-scene]")].filter(el => el.tagName === "BUTTON");
const topNavButtons = [...document.querySelectorAll(".topnav button")];
const machines = [...document.querySelectorAll(".machine")];

const el = {
  kicker: document.querySelector("#kicker"),
  sceneTitle: document.querySelector("#scene-title"),
  machineName: document.querySelector("#machine-name"),
  summary: document.querySelector("#summary"),
  buttonBank: document.querySelector("#button-bank"),
  sources: document.querySelector("#sources"),
  drawerTitle: document.querySelector("#drawer-title"),
  patternGrid: document.querySelector("#pattern-grid"),
  backOverview: document.querySelector("#back-overview"),
  inspector: document.querySelector("#inspector"),
  closeInspector: document.querySelector("#close-inspector"),
  inspectType: document.querySelector("#inspect-type"),
  inspectTitle: document.querySelector("#inspect-title"),
  inspectScore: document.querySelector("#inspect-score"),
  inspectEvidence: document.querySelector("#inspect-evidence"),
  inspectWhat: document.querySelector("#inspect-what"),
  inspectQuality: document.querySelector("#inspect-quality"),
  inspectPrompt: document.querySelector("#inspect-prompt"),
  inspectSource: document.querySelector("#inspect-source"),
  saveCard: document.querySelector("#save-card"),
  copyPrompt: document.querySelector("#copy-prompt"),
  saved: document.querySelector("#saved"),
  savedCount: document.querySelector("#saved-count"),
  savedList: document.querySelector("#saved-list"),
  copyBrief: document.querySelector("#copy-brief"),
  clearSaved: document.querySelector("#clear-saved"),
  toast: document.querySelector("#toast")
};

function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.toast.classList.remove("show"), 1800);
}

function renderScene(sceneId) {
  const scene = concepts[sceneId] || concepts.overview;
  currentScene = sceneId;
  app.dataset.scene = sceneId;

  topNavButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.scene === sceneId));
  machines.forEach(btn => btn.classList.toggle("active", btn.dataset.scene === sceneId));

  el.kicker.textContent = scene.kicker;
  el.sceneTitle.textContent = scene.sceneTitle;
  el.machineName.textContent = scene.machineName;
  el.summary.textContent = scene.summary;

  el.buttonBank.innerHTML = (scene.buttons || []).map(label => `<button type="button">${label}</button>`).join("");
  el.sources.innerHTML = (scene.sources || []).map(source => `<li>${source}</li>`).join("");

  el.drawerTitle.textContent = sceneId === "overview" ? "Choose a workstation" : `${scene.label} pattern cards`;

  const patterns = scene.patterns || [];
  if (!patterns.length) {
    el.patternGrid.innerHTML = `
      <article class="pattern-card">
        <h3>Pick a machine</h3>
        <p>The drawer will fill with pattern cards, source links, scores, evidence, and reusable prompts.</p>
        <div class="meta-row"><span>Factory map</span><span>Overview</span></div>
      </article>
    `;
  } else {
    el.patternGrid.innerHTML = patterns.map((pattern, index) => `
      <article class="pattern-card">
        <h3>${pattern.title}</h3>
        <p>${pattern.whatItIs}</p>
        <div class="meta-row">
          <span>Score ${pattern.score}</span>
          <span>${pattern.evidence}</span>
          <span>${pattern.type}</span>
        </div>
        <button type="button" data-pattern-index="${index}">Inspect card</button>
      </article>
    `).join("");
  }

  el.patternGrid.querySelectorAll("[data-pattern-index]").forEach(btn => {
    btn.addEventListener("click", () => openPattern(patterns[Number(btn.dataset.patternIndex)]));
  });

  if (sceneId !== "overview") {
    toast(`${scene.label} workstation loaded.`);
  }
}

function openPattern(pattern) {
  currentPattern = pattern;
  el.inspectType.textContent = pattern.type;
  el.inspectTitle.textContent = pattern.title;
  el.inspectScore.textContent = `Score ${pattern.score}`;
  el.inspectEvidence.textContent = pattern.evidence;
  el.inspectWhat.textContent = pattern.whatItIs;
  el.inspectQuality.textContent = pattern.qualityBar;
  el.inspectPrompt.textContent = pattern.prompt;
  el.inspectSource.textContent = `Source: ${pattern.source}`;
  el.inspector.classList.add("open");
}

function cardToText(pattern) {
  return `${pattern.title}

Type: ${pattern.type}
Score: ${pattern.score}
Evidence: ${pattern.evidence}
Source: ${pattern.source}

What it is:
${pattern.whatItIs}

Quality bar:
${pattern.qualityBar}

Prompt template:
${pattern.prompt}`;
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch (error) {
    toast("Copy failed in this browser.");
  }
}

function saveCurrentCard() {
  if (!currentPattern) {
    toast("Inspect a pattern first.");
    return;
  }
  if (!saved.some(item => item.title === currentPattern.title)) {
    saved.push(currentPattern);
    renderSaved();
    el.saved.classList.add("open");
    toast(`${currentPattern.title} saved.`);
  } else {
    toast("This card is already saved.");
  }
}

function renderSaved() {
  el.savedCount.textContent = saved.length;
  el.savedList.innerHTML = saved.map(item => `<li>${item.title} · Score ${item.score}</li>`).join("");
}

function copyBrief() {
  if (!saved.length) {
    toast("Save at least one card first.");
    return;
  }
  copyText("Riggg Factory Saved Brief\n\n" + saved.map(cardToText).join("\n\n---\n\n"), "Saved brief copied.");
}

navButtons.forEach(btn => btn.addEventListener("click", () => renderScene(btn.dataset.scene)));
el.backOverview.addEventListener("click", () => renderScene("overview"));
el.closeInspector.addEventListener("click", () => el.inspector.classList.remove("open"));
el.saveCard.addEventListener("click", saveCurrentCard);
el.copyPrompt.addEventListener("click", () => currentPattern ? copyText(currentPattern.prompt, "Prompt copied.") : toast("Inspect a pattern first."));
el.copyBrief.addEventListener("click", copyBrief);
el.clearSaved.addEventListener("click", () => {
  saved = [];
  renderSaved();
  toast("Saved brief cleared.");
});

fetch("content/concepts.json", { cache: "no-store" })
  .then(res => res.ok ? res.json() : Promise.reject())
  .then(data => {
    concepts = data;
    renderScene("overview");
  })
  .catch(() => {
    concepts = fallbackConcepts;
    renderScene("overview");
  });
