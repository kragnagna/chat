const state = {
  agentId: null,
  intel: [],
  reports: [],
  agents: [],
  channels: [
    { id: "alpha", name: "Alpha", members: ["CHIEF-01", "GHOST-12", "ORBIT-7"], messages: [] },
    { id: "shadow", name: "Shadow", members: ["NOVA-4", "CHIEF-01"], messages: [] },
    { id: "delta", name: "Delta", members: ["RAVEN-9", "QUILL-2"], messages: [] }
  ],
  activeChannel: "alpha"
};

const selectors = {
  panels: document.querySelectorAll(".panel"),
  navItems: document.querySelectorAll(".nav__item"),
  login: document.getElementById("login"),
  protocol: document.getElementById("protocol"),
  dashboard: document.getElementById("dashboard"),
  timer: document.getElementById("sessionTimer"),
  mobileTimer: document.getElementById("mobileTimer")
};

const storageKey = "mix-intranet-state";
const sessionKey = "mix-intranet-session";
const protocolKey = "mix-intranet-protocol";
const notesKey = "mix-intranet-notes";
const lockKey = "mix-intranet-lock";

const codePairs = [
  ["Vipère", "Crochet"],
  ["Neon", "Spectre"],
  ["Orion", "Aigle"],
  ["Tempête", "Silex"],
  ["Cipher", "Mirage"]
];

const logMessages = [
  "Analyse réseau: balise hostile détectée",
  "Paquet quantique neutralisé",
  "Signal chiffré reçu depuis la zone Baltique",
  "Interférence satellite: module Orion stable",
  "Sonde thermique: aucune signature hostile",
  "Proxy fantôme activé pour la mission Delta"
];

const loadState = () => {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    Object.assign(state, JSON.parse(saved));
  }
};

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const showPanel = (id) => {
  selectors.panels.forEach((panel) => panel.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  selectors.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.section === id);
  });
};

const ensureSession = () => {
  const session = JSON.parse(localStorage.getItem(sessionKey));
  if (!session) {
    showPanel("login");
    return;
  }
  state.agentId = session.agentId;
  const accepted = localStorage.getItem(protocolKey) === "true";
  showPanel(accepted ? "dashboard" : "protocol");
};

const setLockTimer = () => {
  const existing = localStorage.getItem(lockKey);
  if (!existing) {
    const expiry = Date.now() + 10 * 60 * 1000;
    localStorage.setItem(lockKey, expiry.toString());
  }
};

const updateTimerDisplay = () => {
  const expiry = Number(localStorage.getItem(lockKey));
  const remaining = Math.max(0, expiry - Date.now());
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const display = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
  selectors.timer.textContent = display;
  selectors.mobileTimer.textContent = display;
  if (remaining === 0) {
    logout();
  }
};

const logout = () => {
  localStorage.removeItem(sessionKey);
  localStorage.removeItem(protocolKey);
  localStorage.removeItem(lockKey);
  showPanel("login");
};

const renderLog = () => {
  const list = document.getElementById("activityLog");
  list.innerHTML = "";
  const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  logMessages.slice(0, 5).forEach((msg) => {
    const li = document.createElement("li");
    li.textContent = `[${now}] ${msg}`;
    list.appendChild(li);
  });
};

const renderCode = () => {
  const [challenge, response] = codePairs[Math.floor(Math.random() * codePairs.length)];
  document.getElementById("codeOfDay").textContent = `Code du jour: ${challenge} → ${response}`;
};

const renderIntel = () => {
  const list = document.getElementById("intelList");
  list.innerHTML = "";
  state.intel.forEach((item) => {
    const card = document.createElement("div");
    card.className = "intel__card";
    card.innerHTML = `<strong>${item.name}</strong> · ${item.allegiance}<br />Niveau: ${item.threat} · ${item.location}<br /><em>${item.notes}</em>`;
    list.appendChild(card);
  });
};

const renderReports = () => {
  const list = document.getElementById("reportList");
  list.innerHTML = "";
  state.reports.forEach((report, index) => {
    const card = document.createElement("div");
    card.className = "intel__card";
    card.innerHTML = `<strong>${report.mission}</strong><br />${report.content}<div class="hint">${report.timestamp}</div><button data-index="${index}" class="danger">Supprimer</button>`;
    list.appendChild(card);
  });
};

const renderAgents = () => {
  const list = document.getElementById("agentList");
  list.innerHTML = "";
  state.agents.forEach((agent, index) => {
    const card = document.createElement("div");
    card.className = "intel__card";
    card.innerHTML = `<strong>${agent.name}</strong> · ${agent.status}<div class="hint">Accès: ${agent.permission}</div><button data-index="${index}" class="danger">Retirer</button>`;
    list.appendChild(card);
  });
};

const renderChannels = () => {
  const list = document.getElementById("channelList");
  list.innerHTML = "";
  state.channels.forEach((channel) => {
    const item = document.createElement("div");
    item.className = "channel__item";
    item.textContent = channel.name;
    if (channel.id === state.activeChannel) {
      item.classList.add("active");
    }
    item.addEventListener("click", () => {
      state.activeChannel = channel.id;
      saveState();
      renderChannels();
      renderChat();
    });
    list.appendChild(item);
  });
};

const renderChat = () => {
  const channel = state.channels.find((item) => item.id === state.activeChannel);
  const log = document.getElementById("chatLog");
  log.innerHTML = "";
  channel.messages.forEach((msg) => {
    const bubble = document.createElement("div");
    bubble.className = `chat__bubble ${msg.sender === state.agentId ? "self" : ""}`;
    bubble.innerHTML = `<strong>${msg.sender}</strong>: ${msg.text}<div class="hint">${msg.time}</div>`;
    log.appendChild(bubble);
  });
  const members = document.getElementById("channelMembers");
  members.textContent = `Présents: ${channel.members.join(", ")}`;
};

const playBeep = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.frequency.value = 800;
  oscillator.type = "square";
  gainNode.gain.value = 0.1;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    audioContext.close();
  }, 120);
};

const oracleAnswer = (query) => {
  if (!query) {
    return "Veuillez poser une question précise à Oracle.";
  }
  const match = state.intel.find((item) => query.toLowerCase().includes(item.name.toLowerCase()));
  if (match) {
    return `Analyse Oracle: ${match.name} (${match.allegiance}). Menace ${match.threat}. Faiblesse probable: ${match.notes || "aucune information"}. Localisé à ${match.location}.`;
  }
  return "Oracle: aucune fiche correspondante détectée. Ajoutez une fiche d'identité.";
};

const generateBriefing = (mission, region, objective) => {
  const risks = [
    "risque de surveillance orbitale",
    "présence d'unités mercenaires",
    "brouillage des communications",
    "météo instable",
    "infiltration d'agent double"
  ];
  const risk = risks[Math.floor(Math.random() * risks.length)];
  return `# Briefing ${mission}\n\n## Contexte\nOpération dans la zone ${region}. Couverture en cours d'établissement.\n\n## Objectifs\n- ${objective || "Assurer l'extraction et la collecte de données"}\n- Maintenir la discrétion tactique\n\n## Risques\n- ${risk}\n- temps de réaction limité\n\n## Protocoles\n- Utiliser les canaux Signal Archives\n- Déployer une extraction en 12 minutes`; 
};

const init = () => {
  loadState();
  ensureSession();
  renderLog();
  renderCode();
  renderIntel();
  renderReports();
  renderAgents();
  renderChannels();
  renderChat();

  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const agentId = document.getElementById("agentId").value.trim();
    if (!agentId) return;
    localStorage.setItem(sessionKey, JSON.stringify({ agentId }));
    state.agentId = agentId;
    setLockTimer();
    showPanel("protocol");
  });

  document.getElementById("acceptProtocol").addEventListener("click", () => {
    localStorage.setItem(protocolKey, "true");
    showPanel("dashboard");
  });

  document.getElementById("logoutBtn").addEventListener("click", logout);

  selectors.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      showPanel(item.dataset.section);
      document.getElementById("sidebar").classList.remove("open");
    });
  });

  document.getElementById("drawerToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  document.getElementById("intelForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const intel = {
      name: document.getElementById("intelName").value,
      allegiance: document.getElementById("intelAllegiance").value,
      threat: document.getElementById("intelThreat").value,
      location: document.getElementById("intelLocation").value,
      notes: document.getElementById("intelNotes").value
    };
    state.intel.unshift(intel);
    saveState();
    event.target.reset();
    renderIntel();
  });

  document.getElementById("oracleAsk").addEventListener("click", () => {
    const query = document.getElementById("oracleQuery").value;
    document.getElementById("oracleResponse").textContent = oracleAnswer(query);
  });

  document.getElementById("chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;
    const channel = state.channels.find((item) => item.id === state.activeChannel);
    channel.messages.push({
      sender: state.agentId || "Anonyme",
      text,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    });
    saveState();
    input.value = "";
    playBeep();
    renderChat();
  });

  document.getElementById("dissolveChannel").addEventListener("click", () => {
    const isCommander = document.getElementById("commanderToggle").checked;
    if (!isCommander) return;
    const channel = state.channels.find((item) => item.id === state.activeChannel);
    channel.messages = [];
    saveState();
    renderChat();
  });

  document.getElementById("briefingForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const mission = document.getElementById("missionName").value;
    const region = document.getElementById("missionRegion").value;
    const objective = document.getElementById("missionObjective").value;
    document.getElementById("briefingOutput").textContent = generateBriefing(mission, region, objective);
  });

  document.getElementById("reportForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const report = {
      mission: document.getElementById("reportMission").value,
      content: document.getElementById("reportContent").value,
      timestamp: new Date().toLocaleString("fr-FR")
    };
    state.reports.unshift(report);
    saveState();
    event.target.reset();
    renderReports();
  });

  document.getElementById("reportList").addEventListener("click", (event) => {
    if (event.target.tagName !== "BUTTON") return;
    const index = Number(event.target.dataset.index);
    state.reports.splice(index, 1);
    saveState();
    renderReports();
  });

  document.getElementById("agentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const agent = {
      name: document.getElementById("agentName").value,
      status: document.getElementById("agentStatus").value,
      permission: "Niveau 3"
    };
    state.agents.unshift(agent);
    saveState();
    event.target.reset();
    renderAgents();
  });

  document.getElementById("agentList").addEventListener("click", (event) => {
    if (event.target.tagName !== "BUTTON") return;
    const index = Number(event.target.dataset.index);
    state.agents.splice(index, 1);
    saveState();
    renderAgents();
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const payload = btoa(JSON.stringify(state));
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mix-intranet-export.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importFile").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const decoded = atob(reader.result);
        Object.assign(state, JSON.parse(decoded));
        saveState();
        renderIntel();
        renderReports();
        renderAgents();
        renderChannels();
        renderChat();
      } catch (error) {
        console.error("Import error", error);
      }
    };
    reader.readAsText(file);
  });

  const notes = document.getElementById("personalNotes");
  notes.value = localStorage.getItem(notesKey) || "";
  notes.addEventListener("input", () => {
    localStorage.setItem(notesKey, notes.value);
  });

  setLockTimer();
  updateTimerDisplay();
  setInterval(updateTimerDisplay, 1000);

  window.addEventListener("storage", (event) => {
    if (event.key === lockKey) {
      updateTimerDisplay();
    }
  });
};

init();
