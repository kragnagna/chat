const SESSION_KEY = "mix-session";
const DATA_KEY = "mix-data";
const TIMER_KEY = "mix-timer";
const NOTES_KEY = "mix-notes";
const SESSION_DURATION = 10 * 60 * 1000;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const state = {
  agent: null,
  data: {
    intel: [],
    channels: [{ id: "alpha", members: ["CHIEF-01", "VEGA-12", "LYNX-07"] }],
    messages: { alpha: [] },
    dms: ["ORION-09", "MIRA-21"],
    briefings: [],
    reports: [],
    agents: [{ id: "CHIEF-01", status: "Actif", permission: "Commandant" }],
  },
};

const activityTemplates = [
  "Analyse réseau : signature hostile détectée.",
  "Satellite Omega : liaison sécurisée confirmée.",
  "Proxy fantôme : tentative d'accès bloquée.",
  "Drone A-17 : transmission stabilisée.",
  "Cortex : pattern d'intrusion neutralisé.",
];

const dailyCodes = [
  { challenge: "Vipère", response: "Crochet" },
  { challenge: "Quartz", response: "Sabre" },
  { challenge: "Raptor", response: "Nébuleuse" },
  { challenge: "Éclipse", response: "Vector" },
];

const briefingTemplates = [
  "# Mission: {mission}\n\n## Objectifs\n- Extraire l'agent cible.\n- Couper la liaison adverse.\n\n## Risques\n- Surveillance drone.\n- Extraction sous brouillage.\n\n## Contexte géopolitique\nZone rouge instable, présence de mercenaires privés.",
  "# Mission: {mission}\n\n## Objectifs\n- Neutraliser la passerelle SIGINT.\n- Sécuriser les données.\n\n## Risques\n- Drones autonomes.\n- Contre-mesures IA.\n\n## Contexte géopolitique\nAlliance locale fragile, extraction via couloir nord.",
];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playBeep = (frequency = 520, duration = 0.08) => {
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.04;
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

const saveData = () => {
  localStorage.setItem(DATA_KEY, JSON.stringify(state.data));
};

const loadData = () => {
  const stored = localStorage.getItem(DATA_KEY);
  if (stored) {
    state.data = JSON.parse(stored);
  }
};

const setSession = (agent) => {
  state.agent = agent;
  localStorage.setItem(SESSION_KEY, agent);
  const expiry = Date.now() + SESSION_DURATION;
  localStorage.setItem(TIMER_KEY, expiry.toString());
};

const clearSession = () => {
  state.agent = null;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TIMER_KEY);
};

const updateTimer = () => {
  const expiry = Number(localStorage.getItem(TIMER_KEY));
  if (!expiry) return;
  const remaining = expiry - Date.now();
  if (remaining <= 0) {
    clearSession();
    lockUI();
    return;
  }
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  $("#session-timer").textContent = `${String(mins).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
};

const scheduleTimer = () => {
  updateTimer();
  setInterval(updateTimer, 1000);
};

const lockUI = () => {
  $("#login-screen").classList.add("active");
  $("#gatekeeping").classList.remove("active");
  $("#agent-id").textContent = "AGENT-UNASSIGNED";
};

const unlockUI = () => {
  $("#login-screen").classList.remove("active");
  $("#agent-id").textContent = state.agent;
};

const renderActivity = () => {
  const log = $("#activity-log");
  const entry = document.createElement("li");
  const time = new Date().toLocaleTimeString("fr-FR");
  entry.textContent = `[${time}] ${activityTemplates[Math.floor(Math.random() * activityTemplates.length)]}`;
  log.prepend(entry);
  if (log.children.length > 6) log.removeChild(log.lastChild);
};

const renderIntel = () => {
  const list = $("#intel-list");
  list.innerHTML = "";
  state.data.intel.forEach((card) => {
    const div = document.createElement("div");
    div.className = "intel-card";
    div.innerHTML = `
      <strong>${card.name}</strong>
      <div>Allégeance: ${card.allegiance}</div>
      <div>Niveau: ${card.threat}</div>
      <div>Localisation: ${card.location}</div>
      <small>${card.notes || ""}</small>
    `;
    list.appendChild(div);
  });
};

const renderChannels = () => {
  const list = $("#channel-list");
  list.innerHTML = "";
  state.data.channels.forEach((channel) => {
    const item = document.createElement("li");
    item.className = "list-item";
    item.innerHTML = `<span>#${channel.id}</span><small>${channel.members.length} membres</small>`;
    item.addEventListener("click", () => setActiveChannel(channel.id));
    list.appendChild(item);
  });
};

let activeChannel = "alpha";

const setActiveChannel = (id) => {
  activeChannel = id;
  const channel = state.data.channels.find((c) => c.id === id);
  $("#chat-title").textContent = `#${id}`;
  $("#chat-members").textContent = channel ? channel.members.join(" • ") : "";
  renderMessages();
};

const renderMessages = () => {
  const list = $("#chat-messages");
  list.innerHTML = "";
  const messages = state.data.messages[activeChannel] || [];
  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong>${msg.author}</strong> — ${msg.text}<small>${msg.time}</small>`;
    list.appendChild(div);
  });
  list.scrollTop = list.scrollHeight;
};

const renderDms = () => {
  const list = $("#dm-list");
  list.innerHTML = "";
  state.data.dms.forEach((dm) => {
    const item = document.createElement("li");
    item.className = "list-item";
    item.innerHTML = `<span>${dm}</span><small>DM actif</small>`;
    list.appendChild(item);
  });
};

const renderBriefings = () => {
  const list = $("#briefing-list");
  list.innerHTML = "";
  state.data.briefings.forEach((briefing) => {
    const div = document.createElement("div");
    div.className = "briefing";
    div.textContent = briefing;
    list.appendChild(div);
  });
};

const renderReports = () => {
  const list = $("#report-list");
  list.innerHTML = "";
  state.data.reports.forEach((report) => {
    const div = document.createElement("div");
    div.className = "report";
    div.innerHTML = `<strong>${report.mission}</strong><div>${report.text}</div>`;
    list.appendChild(div);
  });
};

const renderAgents = () => {
  const list = $("#agent-list");
  list.innerHTML = "";
  state.data.agents.forEach((agent, index) => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <div>
        <strong>${agent.id}</strong>
        <small>${agent.status} • ${agent.permission}</small>
      </div>
      <button class="btn ghost" data-index="${index}">Supprimer</button>
    `;
    div.querySelector("button").addEventListener("click", () => {
      state.data.agents.splice(index, 1);
      saveData();
      renderAgents();
    });
    list.appendChild(div);
  });
};

const renderNotes = () => {
  const notes = localStorage.getItem(NOTES_KEY) || "";
  $("#notes-area").value = notes;
};

const rotateCode = () => {
  const { challenge, response } = dailyCodes[Math.floor(Math.random() * dailyCodes.length)];
  $("#daily-challenge").textContent = challenge;
  $("#daily-response").textContent = response;
};

const handleOracle = () => {
  const question = $("#oracle-question").value.trim().toLowerCase();
  if (!question) return;
  const matches = state.data.intel.filter((card) =>
    `${card.name} ${card.notes} ${card.location}`.toLowerCase().includes(question)
  );
  if (matches.length === 0) {
    $("#oracle-answer").textContent =
      "Gemini : aucune fiche locale ne répond directement, élargissez la recherche.";
    return;
  }
  const details = matches
    .map((card) => `${card.name} — menace ${card.threat} à ${card.location}`)
    .join(" | ");
  $("#oracle-answer").textContent = `Gemini : corrélation trouvée. ${details}`;
};

const init = () => {
  loadData();
  renderIntel();
  renderChannels();
  renderDms();
  renderBriefings();
  renderReports();
  renderAgents();
  renderNotes();
  setActiveChannel(activeChannel);
  rotateCode();
  renderActivity();
  setInterval(renderActivity, 5000);
};

const handleLogin = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const agent = formData.get("agent").toString().trim().toUpperCase();
  const key = formData.get("key").toString().trim();
  if (!agent || !key) return;
  setSession(agent);
  $("#gatekeeping").classList.add("active");
  event.target.reset();
};

const acceptProtocols = () => {
  unlockUI();
  $("#gatekeeping").classList.remove("active");
};

const setupNavigation = () => {
  $$(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".nav-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const section = btn.dataset.section;
      $$(".section").forEach((s) => s.classList.remove("active"));
      $(`#${section}`).classList.add("active");
      $("#sidebar").classList.remove("open");
    });
  });
};

const setupForms = () => {
  $("#intel-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    state.data.intel.unshift(data);
    saveData();
    renderIntel();
    event.target.reset();
  });

  $("#report-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    state.data.reports.unshift({ mission: data.mission, text: data.report });
    saveData();
    renderReports();
    event.target.reset();
  });

  $("#agent-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    state.data.agents.unshift({
      id: data.agentId.toUpperCase(),
      status: data.status,
      permission: data.permission || "Analyste",
    });
    saveData();
    renderAgents();
    event.target.reset();
  });
};

const setupChat = () => {
  $("#send-message").addEventListener("click", () => {
    const input = $("#chat-text");
    const text = input.value.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString("fr-FR");
    if (!state.data.messages[activeChannel]) {
      state.data.messages[activeChannel] = [];
    }
    state.data.messages[activeChannel].push({ author: state.agent, text, time });
    saveData();
    renderMessages();
    input.value = "";
    playBeep(720, 0.05);
  });

  $("#chat-text").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      $("#send-message").click();
    }
  });

  $("#new-channel").addEventListener("click", () => {
    const id = prompt("Nom du canal ?");
    if (!id) return;
    const channelId = id.toLowerCase().replace(/\s+/g, "-");
    if (state.data.channels.find((c) => c.id === channelId)) return;
    const channel = { id: channelId, members: [state.agent] };
    state.data.channels.push(channel);
    state.data.messages[channelId] = [];
    saveData();
    renderChannels();
    setActiveChannel(channelId);
  });

  $("#dissolve-channel").addEventListener("click", () => {
    const commander = state.agent === "CHIEF-01";
    if (!commander) {
      alert("Commande réservée au Commandant.");
      return;
    }
    if (!confirm("Confirmer la dissolution du canal ?")) return;
    state.data.channels = state.data.channels.filter((c) => c.id !== activeChannel);
    delete state.data.messages[activeChannel];
    saveData();
    renderChannels();
    setActiveChannel(state.data.channels[0]?.id || "alpha");
  });
};

const setupBriefings = () => {
  $("#generate-briefing").addEventListener("click", () => {
    const mission = prompt("Nom de mission ?");
    if (!mission) return;
    const template = briefingTemplates[Math.floor(Math.random() * briefingTemplates.length)];
    state.data.briefings.unshift(template.replace("{mission}", mission));
    saveData();
    renderBriefings();
  });
};

const setupSync = () => {
  $("#export-data").addEventListener("click", () => {
    const payload = JSON.stringify(state.data, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mix-sync-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    $("#sync-status").textContent = "Export terminé.";
  });

  $("#import-data").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state.data = JSON.parse(reader.result);
        saveData();
        init();
        $("#sync-status").textContent = "Import réussi.";
      } catch (error) {
        $("#sync-status").textContent = "Import invalide.";
      }
    };
    reader.readAsText(file);
  });
};

const setupNotes = () => {
  $("#notes-area").addEventListener("input", (event) => {
    localStorage.setItem(NOTES_KEY, event.target.value);
    $("#notes-meta").textContent = `Dernière sauvegarde: ${new Date().toLocaleTimeString("fr-FR")}`;
  });
};

const setupOracle = () => {
  $("#oracle-ask").addEventListener("click", handleOracle);
};

const setupMenu = () => {
  $("#menu-btn").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
  });
};

const setupStorageSync = () => {
  window.addEventListener("storage", (event) => {
    if (event.key === TIMER_KEY) {
      updateTimer();
    }
    if (event.key === DATA_KEY) {
      loadData();
      renderIntel();
      renderChannels();
      renderMessages();
      renderAgents();
      renderReports();
      renderBriefings();
    }
  });
};

const bootstrap = () => {
  const storedAgent = localStorage.getItem(SESSION_KEY);
  if (storedAgent) {
    state.agent = storedAgent;
    unlockUI();
  }
  scheduleTimer();
  init();
};

$("#login-form").addEventListener("submit", handleLogin);
$("#accept-protocols").addEventListener("click", acceptProtocols);
$("#rotate-code").addEventListener("click", rotateCode);
setupNavigation();
setupForms();
setupChat();
setupBriefings();
setupSync();
setupNotes();
setupOracle();
setupMenu();
setupStorageSync();
bootstrap();
