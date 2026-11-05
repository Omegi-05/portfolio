import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

const container = document.querySelector(".container");
const flairs = gsap.utils.toArray(
  ".flair--1, .flair--2, .flair--3, .flair--4, .flair--5, .flair--6, .flair--7",
);

const bounce = 0.8;
const friction = 0.99;

// Un objet d'état par image //
const items = flairs.map((el) => {
  const item = { el, vx: 0, vy: 0, isDragging: false };

  // les position de départ aléatoire dans le conteneur //
  gsap.set(el, {
    x: gsap.utils.random(0, container.clientWidth - el.offsetWidth),
    y: gsap.utils.random(0, container.clientHeight - el.offsetHeight),
  });

  item.draggable = Draggable.create(el, {
    bounds: container,
    inertia: false,
    onPress() {
      item.isDragging = true;
      item.vx = item.vy = 0;
    },
    onDragEnd() {
      item.isDragging = false;
      item.vx = InertiaPlugin.getVelocity(el, "x");
      item.vy = InertiaPlugin.getVelocity(el, "y");
    },
  })[0];

  return item;
});

gsap.ticker.add((time, deltaTime) => {
  const dt = deltaTime / 1000;

  items.forEach((item) => {
    const { el } = item;

    if (item.isDragging) return;
    if (Math.abs(item.vx) < 1 && Math.abs(item.vy) < 1) return;

    let x = gsap.getProperty(el, "x") + item.vx * dt;
    let y = gsap.getProperty(el, "y") + item.vy * dt;

    const maxX = container.clientWidth - el.offsetWidth;
    const maxY = container.clientHeight - el.offsetHeight;

    // Rebond horizontal //
    if (x <= 0) {
      x = 0;
      item.vx = Math.abs(item.vx) * bounce;
    } else if (x >= maxX) {
      x = maxX;
      item.vx = -Math.abs(item.vx) * bounce;
    }

    // Rebond vertical //
    if (y <= 0) {
      y = 0;
      item.vy = Math.abs(item.vy) * bounce;
    } else if (y >= maxY) {
      y = maxY;
      item.vy = -Math.abs(item.vy) * bounce;
    }

    // Friction //
    item.vx *= friction;
    item.vy *= friction;

    gsap.set(el, { x, y });
    item.draggable.update();
  });
});


// inspirations : https://library.jjangik.kr/#throw // 
