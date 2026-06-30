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
const cacheButton = document.querySelector(".control--cache");
const toast = document.querySelector(".toast");
const loadingRow = document.querySelector("#loading-row");
const repoPaths = document.querySelector("#repo-paths");
const repoNote = document.querySelector("#repo-note");
const manifestDot = document.querySelector("#manifest-dot");
const manifestStatus = document.querySelector("#manifest-status");

const fallbackManifest = {
  stages: [
    {
      id: "produce",
      stageName: "Produce",
      machineName: "Conversation Intake Engine",
      shortSummary: "Fallback copy: captures raw expert sessions.",
      score: 1,
      evidenceLevel: "fallback",
      detailUrl: "content/stages/produce.json",
      repoPaths: ["FRAMEWORK.md"]
    },
    {
      id: "package",
      stageName: "Package",
      machineName: "Asset Packaging Line",
      shortSummary: "Fallback copy: turns sessions into useful assets.",
      score: 2,
      evidenceLevel: "fallback",
      detailUrl: "content/stages/package.json",
      repoPaths: ["package/"]
    },
    {
      id: "publish",
      stageName: "Publish",
      machineName: "Channel Launch Dock",
      shortSummary: "Fallback copy: sends assets into channels.",
      score: 3,
      evidenceLevel: "fallback",
      detailUrl: "content/stages/publish.json",
      repoPaths: ["publish/"]
    },
    {
      id: "prove",
      stageName: "Prove",
      machineName: "Proof and Score Lab",
      shortSummary: "Fallback copy: measures what worked.",
      score: 4,
      evidenceLevel: "fallback",
      detailUrl: "content/stages/prove.json",
      repoPaths: ["SCORING.md"]
    },
    {
      id: "preserve",
      stageName: "Preserve",
      machineName: "Content Memory Archive",
      shortSummary: "Fallback copy: stores knowledge for reuse.",
      score: 5,
      evidenceLevel: "fallback",
      detailUrl: "content/stages/preserve.json",
      repoPaths: ["preserve/"]
    }
  ]
};

const fallbackDetails = {
  produce: {
    stageName: "Produce",
    machineName: "Conversation Intake Engine",
    summary: "Fallback detail: this machine captures the source session.",
    bullets: ["Fallback recording workflow", "Fallback audio check"],
    activity: 45,
    repoNotes: "Fallback detail used because live detail was unavailable."
  },
  package: {
    stageName: "Package",
    machineName: "Asset Packaging Line",
    summary: "Fallback detail: this machine packages raw media into assets.",
    bullets: ["Fallback title", "Fallback clip"],
    activity: 50,
    repoNotes: "Fallback detail used because live detail was unavailable."
  },
  publish: {
    stageName: "Publish",
    machineName: "Channel Launch Dock",
    summary: "Fallback detail: this machine distributes finished assets.",
    bullets: ["Fallback website", "Fallback social"],
    activity: 55,
    repoNotes: "Fallback detail used because live detail was unavailable."
  },
  prove: {
    stageName: "Prove",
    machineName: "Proof and Score Lab",
    summary: "Fallback detail: this machine measures performance.",
    bullets: ["Fallback score", "Fallback evidence"],
    activity: 60,
    repoNotes: "Fallback detail used because live detail was unavailable."
  },
  preserve: {
    stageName: "Preserve",
    machineName: "Content Memory Archive",
    summary: "Fallback detail: this machine preserves knowledge.",
    bullets: ["Fallback transcript", "Fallback tags"],
    activity: 65,
    repoNotes: "Fallback detail used because live detail was unavailable."
  }
};

let manifest = fallbackManifest;
const detailCache = new Map();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function getStageMeta(stageKey) {
  return manifest.stages.find((stage) => stage.id === stageKey) || fallbackManifest.stages.find((stage) => stage.id === stageKey);
}

function setStatus(status, message) {
  manifestStatus.textContent = message;
  manifestDot.classList.remove("is-ok", "is-fail");
  if (status === "ok") {
    manifestDot.classList.add("is-ok");
  }
  if (status === "fail") {
    manifestDot.classList.add("is-fail");
  }
}

function setLoading(stageKey, isLoading) {
  const hotspot = hotspots.find((item) => item.dataset.stage === stageKey);
  hotspot?.classList.toggle("is-loading", isLoading);
  loadingRow.classList.toggle("is-visible", isLoading);
}

function renderPanel(stageKey, detail, sourceLabel) {
  const meta = getStageMeta(stageKey);

  hotspots.forEach((hotspot) => {
    const active = hotspot.dataset.stage === stageKey;
    hotspot.classList.toggle("is-active", active);
    hotspot.setAttribute("aria-expanded", String(active));
  });

  eyebrow.textContent = `${meta.stageName} · ${sourceLabel}`;
  title.textContent = detail.machineName || meta.machineName;
  body.textContent = detail.summary || meta.shortSummary;
  list.innerHTML = (detail.bullets || []).map((item) => `<li>${item}</li>`).join("");
  meterFill.style.width = `${detail.activity || 35}%`;
  scoreNumber.textContent = meta.score || 0;
  scoreCaption.textContent = meta.evidenceLevel || "Loaded";
  repoPaths.innerHTML = (meta.repoPaths || []).map((item) => `<li>${item}</li>`).join("");
  repoNote.textContent = detail.repoNotes || "";
  panel.classList.add("is-open");
}

async function loadManifest() {
  try {
    const response = await fetch("content/factory-manifest.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Manifest failed: ${response.status}`);
    }
    manifest = await response.json();
    setStatus("ok", `Fresh manifest loaded · ${manifest.updatedAt || "no date"} · ${manifest.stages.length} stations`);
    showToast("Small manifest loaded on page open.");
  } catch (error) {
    manifest = fallbackManifest;
    setStatus("fail", "Manifest failed. Fallback content active.");
    showToast("Manifest fetch failed. Demo still works with fallback content.");
    console.warn(error);
  }
}

async function loadStageDetail(stageKey) {
  const meta = getStageMeta(stageKey);

  if (detailCache.has(stageKey)) {
    renderPanel(stageKey, detailCache.get(stageKey), "cached detail");
    showToast(`${meta.stageName} loaded from in-memory cache.`);
    return;
  }

  renderPanel(stageKey, fallbackDetails[stageKey], "loading");
  setLoading(stageKey, true);

  try {
    const response = await fetch(meta.detailUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Detail failed: ${response.status}`);
    }
    const detail = await response.json();
    detailCache.set(stageKey, detail);
    renderPanel(stageKey, detail, "fresh detail");
    showToast(`${meta.stageName} detail fetched only after click.`);
    maybePrefetchNext(stageKey);
  } catch (error) {
    renderPanel(stageKey, fallbackDetails[stageKey], "fallback detail");
    showToast(`${meta.stageName} detail failed. Fallback detail active.`);
    console.warn(error);
  } finally {
    setLoading(stageKey, false);
  }
}

function maybePrefetchNext(stageKey) {
  const ids = manifest.stages.map((stage) => stage.id);
  const currentIndex = ids.indexOf(stageKey);
  const nextKey = ids[currentIndex + 1];

  if (!nextKey || detailCache.has(nextKey)) {
    return;
  }

  const prefetch = () => {
    const nextMeta = getStageMeta(nextKey);
    fetch(nextMeta.detailUrl, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(response))
      .then((detail) => {
        detailCache.set(nextKey, detail);
        showToast(`${nextMeta.stageName} prefetched quietly in the background.`);
      })
      .catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(prefetch);
  } else {
    window.setTimeout(prefetch, 900);
  }
}

function closePanel() {
  panel.classList.remove("is-open");
  meterFill.style.width = "0%";
  hotspots.forEach((hotspot) => {
    hotspot.classList.remove("is-active", "is-loading");
    hotspot.setAttribute("aria-expanded", "false");
  });
}

hotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    loadStageDetail(hotspot.dataset.stage);
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
  showToast("Loop running. Each detail still lazy-loads or uses cache.");

  const sequence = ["produce", "package", "publish", "prove", "preserve"];

  for (const key of sequence) {
    await loadStageDetail(key);
    await new Promise((resolve) => window.setTimeout(resolve, 800));
  }

  showToast("Loop complete. Check cache to see what loaded.");
  window.setTimeout(() => {
    factory.classList.remove("is-running");
  }, 1600);
}

runButton.addEventListener("click", runFactoryLoop);

cacheButton.addEventListener("click", () => {
  const loaded = [...detailCache.keys()];
  showToast(loaded.length ? `Cached details: ${loaded.join(", ")}` : "No detail files cached yet. Click a machine first.");
});

loadManifest();
