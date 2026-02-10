const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const canvas = $("#starfield");
const ctx = canvas.getContext("2d");
let stars = [];

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = Array.from({ length: Math.floor((canvas.width * canvas.height) / 9500) }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random() * 0.9 + 0.1,
    speed: Math.random() * 0.6 + 0.2
  }));
};

const drawStars = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach((s) => {
    s.y += s.speed * s.z;
    if (s.y > canvas.height) {
      s.y = -5;
      s.x = Math.random() * canvas.width;
    }
    const size = s.z * 2.2;
    ctx.fillStyle = `rgba(170, 220, 255, ${0.3 + s.z})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
};

const enableReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.15 });

  $$(".card, .showcase, .builder, .stats article").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
};

const enableTilt = () => {
  $$("[data-tilt]").forEach((tile) => {
    tile.addEventListener("mousemove", (event) => {
      const { left, top, width, height } = tile.getBoundingClientRect();
      const x = (event.clientX - left) / width - 0.5;
      const y = (event.clientY - top) / height - 0.5;
      tile.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg)`;
    });
    tile.addEventListener("mouseleave", () => {
      tile.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  });
};

const applyTheme = () => {
  const primary = $("#primary").value;
  const secondary = $("#secondary").value;
  const glow = $("#glow").value;
  document.documentElement.style.setProperty("--primary", primary);
  document.documentElement.style.setProperty("--secondary", secondary);
  document.documentElement.style.setProperty("--glow", glow);
  $("#status").textContent = `Thème appliqué: ${primary} + ${secondary} · Glow ${glow}%`;
};

const wowMode = () => {
  const presets = [
    ["#ff4dd8", "#8affef", "88"],
    ["#6f7dff", "#58ffd1", "72"],
    ["#ff6b35", "#ffe066", "90"]
  ];
  const [p, s, g] = presets[Math.floor(Math.random() * presets.length)];
  $("#primary").value = p;
  $("#secondary").value = s;
  $("#glow").value = g;
  applyTheme();
};

const downloadSite = async () => {
  const status = $("#status");
  if (!window.JSZip) {
    status.textContent = "Téléchargement impossible: JSZip non chargé.";
    return;
  }

  const zip = new JSZip();
  const files = ["index.html", "styles.css", "app.js"];
  const content = await Promise.all(files.map(async (file) => [file, await fetch(file).then((r) => r.text())]));
  content.forEach(([name, text]) => zip.file(name, text));

  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "nebula-forge-site.zip";
  link.click();
  URL.revokeObjectURL(link.href);
  status.textContent = "✅ Le fichier nebula-forge-site.zip est prêt.";
};

const init = () => {
  resizeCanvas();
  drawStars();
  enableReveal();
  enableTilt();

  ["#primary", "#secondary", "#glow"].forEach((id) => {
    $(id).addEventListener("input", applyTheme);
  });

  $("#surpriseBtn").addEventListener("click", wowMode);
  $("#downloadBtn").addEventListener("click", downloadSite);
  $("#year").textContent = new Date().getFullYear();
  window.addEventListener("resize", resizeCanvas);
};

init();
