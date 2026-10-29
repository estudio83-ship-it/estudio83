const D = __DATA__;
const root = document.querySelector(".fk");
const stage = root.querySelector(".fk-stage");
const layer = stage.querySelector(".fk-parts");
const readout = root.querySelector("[data-readout]");
const hint = root.querySelector("[data-hint]");
const partButtons = [...root.querySelectorAll(".fk-part")];
const still = matchMedia("(prefers-reduced-motion: reduce)");

const nodes = [...layer.querySelectorAll(".it")].map((el) => {
  const m = el.dataset.m.split(",").map(Number);
  return { el, piece: el.dataset.piece, key: Number(el.dataset.k), m, lift: m[0] * D.V[0] + m[1] * D.V[1] + m[2] * D.V[2], shown: "" };
});
let order = nodes.map((_, index) => index);

const IDS = Object.keys(D.pieces);
const SPRING = D.spring;
const piece = Object.fromEntries(IDS.map((id) => [id, { x: 0, v: 0, target: 0, pending: null }]));

let clock = 0;
let apart = false;
let selected = null;
let inside = false;
let leaveTimer = 0;
let idleTimer = 0;
let touring = !still.matches;
let tourClock = 0;
let visible = false;
let frame = 0;
let last = 0;

function say(text) {
  if (readout.textContent !== text) readout.textContent = text;
  if (stage.getAttribute("aria-valuetext") !== text) stage.setAttribute("aria-valuetext", text);
}

function setApart(on) {
  if (apart === on) return;
  apart = on;
  const goal = on ? 1 : 0;
  let index = 0;
  for (const id of on ? D.stagger : [...D.stagger].reverse()) {
    if (piece[id].target === goal) piece[id].pending = null;
    else piece[id].pending = { value: goal, at: clock + (still.matches ? 0 : index++ * SPRING.stagger) };
  }
  run();
}

function select(id) {
  if (selected === id) return;
  selected = id;
  for (const node of nodes) {
    if (id !== null && node.piece === id) node.el.setAttribute("data-on", "");
    else node.el.removeAttribute("data-on");
  }
  if (id) stage.setAttribute("data-focus", "");
  else stage.removeAttribute("data-focus");
  partButtons.forEach((button) => (button.dataset.part === id ? button.setAttribute("data-on", "") : button.removeAttribute("data-on")));
  stage.setAttribute("aria-valuenow", String(id ? D.order.indexOf(id) + 1 : 0));
}

function steer(state, dt, calm) {
  if (state.pending && clock >= state.pending.at) {
    state.target = state.pending.value;
    state.pending = null;
  }
  if (calm) {
    state.x = state.target;
    state.v = 0;
    return false;
  }
  for (let i = 0; i < SPRING.substeps; i++) {
    const h = dt / SPRING.substeps;
    state.v += ((state.target - state.x) * SPRING.stiffness - state.v * SPRING.damping) * h;
    state.x += state.v * h;
  }
  if (Math.abs(state.target - state.x) < 2e-4 && Math.abs(state.v) < 2e-4) {
    state.x = state.target;
    state.v = 0;
    return state.pending !== null;
  }
  return true;
}

function place() {
  for (const node of nodes) {
    const share = piece[node.piece].x;
    const tx = (D.EX[0] * node.m[0] + D.EY[0] * node.m[1] + D.EZ[0] * node.m[2]) * share;
    const ty = (D.EX[1] * node.m[0] + D.EY[1] * node.m[1] + D.EZ[1] * node.m[2]) * share;
    const text = share === 0 ? "" : `translate(${tx.toFixed(2)} ${ty.toFixed(2)})`;
    if (text !== node.shown) {
      node.shown = text;
      if (text) node.el.setAttribute("transform", text);
      else node.el.removeAttribute("transform");
    }
  }
  const next = nodes.map((_, i) => i).sort((a, b) => nodes[a].key + nodes[a].lift * piece[nodes[a].piece].x - (nodes[b].key + nodes[b].lift * piece[nodes[b].piece].x));
  if (next.some((index, at) => index !== order[at])) {
    const fragment = document.createDocumentFragment();
    for (const index of next) fragment.appendChild(nodes[index].el);
    layer.appendChild(fragment);
    order = next;
  }
}

function text() {
  if (selected) return D.pieces[selected].say;
  const moving = IDS.some((id) => Math.abs(piece[id].x - piece[id].target) > 0.002 || piece[id].pending);
  if (moving) return apart ? "despiezando" : "montando";
  return apart ? D.apart : D.rest;
}

// recorrido en reposo: montado, despiece, cada conjunto, montado otra vez
const HOLD = 1.6;
const CYCLE = 2.2 + 1.2 + D.order.length * HOLD + 1.0 + 1.8;
function tourAt(t) {
  const s = t % CYCLE;
  if (s < 2.2) return { apart: false, part: null };
  if (s < 3.4) return { apart: true, part: null };
  const i = Math.floor((s - 3.4) / HOLD);
  if (i < D.order.length) return { apart: true, part: D.order[i] };
  if (s < CYCLE - 1.8) return { apart: true, part: null };
  return { apart: false, part: null };
}

function quietTour() {
  touring = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (inside || still.matches) return;
    touring = true;
    tourClock = 0;
    run();
  }, 6000);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  const calm = still.matches;
  if (touring) {
    tourClock += dt;
    const step = tourAt(tourClock);
    setApart(step.apart);
    select(step.part);
  }
  let moving = false;
  for (const id of IDS) if (steer(piece[id], dt, calm)) moving = true;
  place();
  say(text());
  frame = visible && (moving || touring) ? requestAnimationFrame(tick) : 0;
}

function run() {
  if (!frame && visible) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
}

new IntersectionObserver(
  (entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
  },
  { rootMargin: "120px 0px" },
).observe(stage);

function pieceAt(event) {
  const hit = document.elementFromPoint(event.clientX, event.clientY);
  const item = hit && hit.closest ? hit.closest(".it") : null;
  return item ? item.dataset.piece : null;
}

stage.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  inside = true;
  clearTimeout(leaveTimer);
  quietTour();
  setApart(true);
  select(pieceAt(event));
  run();
});

stage.addEventListener("pointerleave", () => {
  inside = false;
  clearTimeout(leaveTimer);
  leaveTimer = setTimeout(() => {
    if (inside) return;
    select(null);
    setApart(false);
    run();
  }, 260);
});

stage.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch") return;
  quietTour();
  const id = pieceAt(event);
  if (!id || !apart) {
    select(null);
    setApart(!apart);
  } else select(id === selected ? null : id);
  run();
});

partButtons.forEach((button) => {
  const show = () => {
    quietTour();
    clearTimeout(leaveTimer);
    setApart(true);
    select(button.dataset.part);
    run();
  };
  const hide = () => {
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => {
      if (inside || partButtons.some((other) => other.matches(":hover, :focus-visible"))) return;
      select(null);
      setApart(false);
      run();
    }, 260);
  };
  button.addEventListener("pointerenter", show);
  button.addEventListener("focus", show);
  button.addEventListener("pointerleave", hide);
  button.addEventListener("blur", hide);
  button.addEventListener("click", show);
});

stage.addEventListener("keydown", (event) => {
  const index = selected ? D.order.indexOf(selected) : -1;
  let next = null;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(D.order.length - 1, index + 1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(0, index - 1);
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = D.order.length - 1;
  else if (event.key === "Escape") {
    event.preventDefault();
    quietTour();
    select(null);
    setApart(false);
    run();
    return;
  } else if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    quietTour();
    setApart(!apart);
    if (!apart) select(null);
    run();
    return;
  }
  if (next === null) return;
  event.preventDefault();
  quietTour();
  setApart(true);
  select(D.order[next]);
  run();
});

const narrow = matchMedia("(hover: none), (max-width: 480px)");
const wording = () => hint && (hint.textContent = narrow.matches ? "Toca para despiezar" : "Pasa el cursor para despiezar");
wording();
narrow.addEventListener("change", wording);
if (still.matches) touring = false;
place();
say(text());
