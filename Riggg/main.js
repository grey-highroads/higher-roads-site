const factory = document.querySelector(".factory");
const hotspots = Array.from(document.querySelectorAll(".hotspot"));
const panel = document.querySelector("#stage-panel");
const closeButton = document.querySelector(".panel__close");
const title = document.querySelector("#panel-title");
const eyebrow = document.querySelector("#panel-eyebrow");
const body = document.querySelector("#panel-body");
const list = document.querySelector("#panel-list");
const meterFill = document.querySelector("#meter-fill");
const scoreNumber = document.querySelector("#score-number");
const scoreCaption = document.querySelector("#score-caption");
const runButton = document.querySelector(".control--run");
const panicButton = document.querySelector(".control--panic");
const toast = document.querySelector(".toast");

const stages = {
  produce: {
    eyebrow: "Machine 01",
    title: "Produce",
    body: "The Conversation Intake Engine captures raw expert sessions with cameras, microphones, overlays, scene controls, audio checks, and backup recording.",
    bullets: ["Recording workflow", "Scene switching", "Audio monitoring", "Clean source capture"],
    meter: 74,
    score: 1,
    caption: "Raw session captured"
  },
  package: {
    eyebrow: "Machine 02",
    title: "Package",
    body: "The Asset Packaging Line turns one session into titles, descriptions, clips, reels, thumbnails, quote cards, chapters, and guest assets.",
    bullets: ["Title press", "Description printer", "Clip cutter", "Thumbnail polisher"],
    meter: 88,
    score: 2,
    caption: "Assets shaped"
  },
  publish: {
    eyebrow: "Machine 03",
    title: "Publish",
    body: "The Channel Launch Dock sends each asset to the right destination while the owned website keeps the canonical version safe.",
    bullets: ["Website home", "RSS and podcast", "YouTube", "LinkedIn and email"],
    meter: 67,
    score: 3,
    caption: "Distribution active"
  },
  prove: {
    eyebrow: "Machine 04",
    title: "Prove",
    body: "The Proof and Score Lab checks reach, engagement, conversion, attribution, reuse value, evidence level, and production fit.",
    bullets: ["Scorecard", "Evidence label", "Benchmark check", "Feedback signal"],
    meter: 93,
    score: 4,
    caption: "Evidence collected"
  },
  preserve: {
    eyebrow: "Machine 05",
    title: "Preserve",
    body: "The Content Memory Archive stores transcripts, speaker labels, timestamps, tags, metadata, vectors, and retrieval paths.",
    bullets: ["Transcript vault", "Topic tags", "Vector memory", "Search retrieval"],
    meter: 100,
    score: 5,
    caption: "Compounding loop complete"
  }
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

function setActiveStage(stageKey) {
  const stage = stages[stageKey];

  hotspots.forEach((hotspot) => {
    const active = hotspot.dataset.stage === stageKey;
    hotspot.classList.toggle("is-active", active);
    hotspot.setAttribute("aria-expanded", String(active));
  });

  eyebrow.textContent = stage.eyebrow;
  title.textContent = stage.title;
  body.textContent = stage.body;
  list.innerHTML = stage.bullets.map((item) => `<li>${item}</li>`).join("");
  meterFill.style.width = `${stage.meter}%`;
  scoreNumber.textContent = stage.score;
  scoreCaption.textContent = stage.caption;
  panel.classList.add("is-open");
}

function closePanel() {
  panel.classList.remove("is-open");
  meterFill.style.width = "0%";
  hotspots.forEach((hotspot) => {
    hotspot.classList.remove("is-active");
    hotspot.setAttribute("aria-expanded", "false");
  });
}

hotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    setActiveStage(hotspot.dataset.stage);
    showToast(`${stages[hotspot.dataset.stage].title} machine activated`);
  });

  hotspot.addEventListener("mouseenter", () => {
    hotspot.classList.add("is-sequencing");
    window.setTimeout(() => hotspot.classList.remove("is-sequencing"), 700);
  });
});

closeButton.addEventListener("click", closePanel);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePanel();
  }
});

async function runFactoryLoop() {
  factory.classList.add("is-running");
  showToast("Factory loop running: Produce → Package → Publish → Prove → Preserve");

  const sequence = ["produce", "package", "publish", "prove", "preserve"];

  for (const key of sequence) {
    setActiveStage(key);
    const hotspot = hotspots.find((item) => item.dataset.stage === key);
    hotspot.classList.add("is-sequencing");
    window.setTimeout(() => hotspot.classList.remove("is-sequencing"), 700);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
  }

  showToast("Loop complete. Every session makes the next one better.");
  window.setTimeout(() => {
    factory.classList.remove("is-running");
  }, 2200);
}

runButton.addEventListener("click", runFactoryLoop);

panicButton.addEventListener("click", () => {
  factory.classList.add("is-scrambling");
  showToast("Gnomes scrambling. Machines recalibrating.");
  window.setTimeout(() => {
    factory.classList.remove("is-scrambling");
  }, 900);
});
