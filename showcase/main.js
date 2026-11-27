// SM Enterprises showcase: WhatsApp links, scroll reveals, and the speaker-layout planner.

const WHATSAPP = "919848430077"; // the business WhatsApp number (98484 30077)

// ---------- WhatsApp: every [data-wa] link opens a chat with its message filled in ----------
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.wa)}`;
  a.target = "_blank";
  a.rel = "noopener";
});

document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Nav background once the page scrolls ----------
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ---------- Reveal on scroll ----------
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

// ---------- Layout planner ----------
// Top view, 600 x 460: screen along the top, seats in the middle. Positions follow Dolby's layouts.
const LAYOUTS = {
  classic: { code: "5.1.2", ear: 5, sub: 1, height: 2 },
  reference: { code: "5.1.4", ear: 5, sub: 1, height: 4 },
  elite: { code: "7.2.4", ear: 7, sub: 2, height: 4 },
};

const SEATS = {
  classic: [[255, 300], [300, 300], [345, 300]],
  reference: [[232, 290], [277, 290], [323, 290], [368, 290]],
  elite: [[232, 250], [277, 250], [323, 250], [368, 250], [232, 345], [277, 345], [323, 345], [368, 345]],
};

const ROLE = {
  front: "plays music and effects that move across the screen",
  centre: "carries the dialogue, locked to the picture",
  side: "brings sound in from beside you",
  rear: "brings sound in from behind you",
  height: "Dolby Atmos: rain, aircraft and anything above you",
  sub: "the deep bass you feel as much as hear",
};

const SPEAKERS = [
  { name: "Front left", kind: "ear", role: "front", pos: { classic: [170, 74], reference: [180, 62], elite: [180, 62] } },
  { name: "Centre", kind: "ear", role: "centre", pos: { classic: [300, 66], reference: [300, 62], elite: [300, 62] } },
  { name: "Front right", kind: "ear", role: "front", pos: { classic: [430, 74], reference: [420, 62], elite: [420, 62] } },
  { name: "Surround left", kind: "ear", role: "side", pos: { classic: [58, 300], reference: [58, 290], elite: [58, 250] } },
  { name: "Surround right", kind: "ear", role: "side", pos: { classic: [542, 300], reference: [542, 290], elite: [542, 250] } },
  { name: "Rear left", kind: "ear", role: "rear", pos: { elite: [200, 425] } },
  { name: "Rear right", kind: "ear", role: "rear", pos: { elite: [400, 425] } },
  { name: "Ceiling left", kind: "height", role: "height", pos: { classic: [215, 240] } },
  { name: "Ceiling right", kind: "height", role: "height", pos: { classic: [385, 240] } },
  { name: "Ceiling front left", kind: "height", role: "height", pos: { reference: [215, 190], elite: [215, 175] } },
  { name: "Ceiling front right", kind: "height", role: "height", pos: { reference: [385, 190], elite: [385, 175] } },
  { name: "Ceiling rear left", kind: "height", role: "height", pos: { reference: [215, 370], elite: [215, 380] } },
  { name: "Ceiling rear right", kind: "height", role: "height", pos: { reference: [385, 370], elite: [385, 380] } },
  { name: "Subwoofer", kind: "sub", role: "sub", pos: { classic: [520, 84], reference: [520, 84], elite: [520, 84] } },
  { name: "Second subwoofer", kind: "sub", role: "sub", pos: { elite: [80, 84] } },
];

const NS = "http://www.w3.org/2000/svg";
const el = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
};
const place = (node, [x, y]) => { node.style.transform = `translate(${x}px, ${y}px)`; };

const seatLayer = document.getElementById("plan-seats");
const speakerLayer = document.getElementById("plan-speakers");
const caption = document.getElementById("plan-caption");
const defaultCaption = caption.textContent;

const seatNodes = Array.from({ length: 8 }, () => {
  const g = el("g", { class: "seat" });
  g.append(el("rect", { x: -19, y: -17, width: 38, height: 34, rx: 9 }), el("rect", { x: -19, y: 11, width: 38, height: 6, rx: 3, opacity: 0.6 }));
  place(g, [300, 300]);
  seatLayer.append(g);
  return g;
});

let current = "classic";
let picked = null;

const speakerNodes = SPEAKERS.map((s) => {
  const g = el("g", { class: `spk spk-${s.kind}`, tabindex: "0", role: "button", "aria-label": s.name });
  g.append(el("circle", { class: "wave", r: 10 }), el("circle", { class: "halo", r: 16 }));
  g.append(s.kind === "sub" ? el("rect", { class: "dot", x: -8, y: -8, width: 16, height: 16, rx: 3 }) : el("circle", { class: "dot", r: 7 }));
  const pick = () => {
    if (g.classList.contains("is-off")) return;
    if (picked) picked.classList.remove("is-picked");
    picked = picked === g ? null : g;
    if (picked) {
      picked.classList.add("is-picked");
      caption.innerHTML = `<strong>${s.name}</strong> ${ROLE[s.role].startsWith("Dolby") ? "· " : ""}${ROLE[s.role]}`;
    } else {
      caption.textContent = defaultCaption;
    }
  };
  g.addEventListener("click", pick);
  g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  speakerLayer.append(g);
  return g;
});

function show(tier) {
  current = tier;
  SPEAKERS.forEach((s, i) => {
    const node = speakerNodes[i];
    const pos = s.pos[tier];
    node.classList.toggle("is-off", !pos);
    node.setAttribute("aria-hidden", pos ? "false" : "true");
    node.setAttribute("tabindex", pos ? "0" : "-1");
    if (pos) place(node, pos);
  });
  seatNodes.forEach((node, i) => {
    const pos = SEATS[tier][i];
    node.style.opacity = pos ? "1" : "0";
    if (pos) place(node, pos);
  });
  if (picked && picked.classList.contains("is-off")) {
    picked.classList.remove("is-picked");
    picked = null;
    caption.textContent = defaultCaption;
  }
  const L = LAYOUTS[tier];
  document.getElementById("layout-code").textContent = L.code;
  document.getElementById("n-ear").textContent = L.ear;
  document.getElementById("n-sub").textContent = L.sub;
  document.getElementById("sub-word").textContent = L.sub === 1 ? "subwoofer" : "subwoofers";
  document.getElementById("n-height").textContent = L.height;
  document.querySelectorAll("[data-layout]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.layout === tier)));
}

document.querySelectorAll("[data-layout]").forEach((b) => b.addEventListener("click", () => show(b.dataset.layout)));
show(current);
