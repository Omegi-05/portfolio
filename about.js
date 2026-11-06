gsap.registerPlugin(Draggable, InertiaPlugin);

const wrapper = document.querySelector(".wrapper");
const flairs = gsap.utils.toArray(".flair");

const bounce = 0.8;
const friction = 0.99;

const items = flairs.map((el) => {
  const item = { el, vx: 0, vy: 0, isDragging: false };

  InertiaPlugin.track(el, "x,y");

  item.draggable = Draggable.create(el, {
    bounds: wrapper,
    inertia: false,
    onPress() {
      item.isDragging = true;
      item.vx = item.vy = 0;
    },
    onRelease() {
      item.isDragging = false;
    },
    onDragEnd() {
      item.isDragging = false;
      item.vx = InertiaPlugin.getVelocity(el, "x");
      item.vy = InertiaPlugin.getVelocity(el, "y");
    },
  })[0];

  return item;
});

// Répartition en grille avec décalage aléatoire
function scatter() {
  const W = wrapper.clientWidth;
  const H = wrapper.clientHeight;
  const n = items.length;

  // Nombre de colonnes/lignes adapté au format de l'écran
  const cols = Math.ceil(Math.sqrt(n * (W / H)));
  const rows = Math.ceil(n / cols);
  const cellW = W / cols;
  const cellH = H / rows;

  // Mélange les cases pour que l'ordre des images soit aléatoire
  const cells = gsap.utils.shuffle(
    Array.from({ length: cols * rows }, (_, i) => i),
  );

  items.forEach((item, i) => {
    const { el } = item;
    const col = cells[i] % cols;
    const row = Math.floor(cells[i] / cols);

    // Position aléatoire à l'intérieur de sa case
    const minX = col * cellW;
    const minY = row * cellH;
    const maxX = Math.max(minX, minX + cellW - el.offsetWidth);
    const maxY = Math.max(minY, minY + cellH - el.offsetHeight);

    gsap.set(el, {
      x: gsap.utils.clamp(0, W - el.offsetWidth, gsap.utils.random(minX, maxX)),
      y: gsap.utils.clamp(0, H - el.offsetHeight, gsap.utils.random(minY, maxY)),
    });

    item.vx = item.vy = 0;
    item.draggable.update();
  });
}

// Physique : rebonds + friction
gsap.ticker.add((time, deltaTime) => {
  const dt = deltaTime / 1000;
  const W = wrapper.clientWidth;
  const H = wrapper.clientHeight;

  items.forEach((item) => {
    const { el } = item;

    if (item.isDragging) return;
    if (Math.abs(item.vx) < 1 && Math.abs(item.vy) < 1) return;

    let x = gsap.getProperty(el, "x") + item.vx * dt;
    let y = gsap.getProperty(el, "y") + item.vy * dt;

    const maxX = W - el.offsetWidth;
    const maxY = H - el.offsetHeight;

    if (x <= 0) {
      x = 0;
      item.vx = Math.abs(item.vx) * bounce;
    } else if (x >= maxX) {
      x = maxX;
      item.vx = -Math.abs(item.vx) * bounce;
    }

    if (y <= 0) {
      y = 0;
      item.vy = Math.abs(item.vy) * bounce;
    } else if (y >= maxY) {
      y = maxY;
      item.vy = -Math.abs(item.vy) * bounce;
    }

    item.vx *= friction;
    item.vy *= friction;

    gsap.set(el, { x, y });
    item.draggable.update();
  });
});

// On attend que tout soit chargé pour avoir les bonnes tailles
window.addEventListener("load", scatter);

// Redistribue si la fenêtre change de taille
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    items.forEach((item) => item.draggable.applyBounds(wrapper));
    scatter();
  }, 150);
});