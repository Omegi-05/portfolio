const finalText = "PORTFOLIO";
const chars = "012345678ABCDEFGHIJKLMNOPQRSTUVWXYZ9@#$%&*";

const progressFill = document.getElementById("progressFill");
const glitchText = document.getElementById("glitchText");
const subtitle = document.getElementById("subtitle");
const clickHint = document.getElementById("clickHint");
const loader = document.getElementById("loader");
const mainContent = document.getElementById("mainContent");

let iteration = 0;
let intervalId;
let animDone = false;

/*LOADER PROGREESS */

let progress = 0;

const barInterval = setInterval(() => {
  progress += 10;
  progressFill.style.width = progress + "%";

  if (progress >= 100) {
    clearInterval(barInterval);
    setTimeout(startGlitch, 200); 
  }
}, 100);

/* GLITCH ANIMATION */

function getRandomChar() {
  return chars[Math.floor(Math.random() * chars.length)];
}

function startGlitch() {
  iteration = 0;
  animDone = false;
  glitchText.classList.remove("complete");
  clickHint.classList.remove("show");

  clearInterval(intervalId);

  intervalId = setInterval(() => {
    let current = "";

    for (let i = 0; i < finalText.length; i++) {
      current += i < iteration ? finalText[i] : getRandomChar();
    }

    glitchText.textContent = current;

    if (iteration >= finalText.length) {
      clearInterval(intervalId);
      glitchText.textContent = finalText;
      glitchText.classList.add("complete");
      animDone = true;

      setTimeout(() => clickHint.classList.add("show"), 600);
    }

    iteration += 1 / 3;
  }, 50);
}

/* CLICK FOR ENTER*/

document.getElementById("glitchWrap").addEventListener("click", () => {
  if (!animDone) return;

  loader.classList.add("fade-out");

  setTimeout(() => {
    loader.style.display = "none";
    mainContent.classList.add("visible");
  }, 600);
});

glitchText.addEventListener("click", (e) => {
  if (!glitchText.classList.contains("complete")) return;
  e.stopPropagation();
  startGlitch();
});

/* HOVER SOUND */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep8bit(freq, duration = 0.12) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";// 8 BIT // 
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration); 

  gain.gain.setValueAtTime(0.08, audioCtx.currentTime); // VOLUMMEEEEE //
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// NOTE HERE // 
const notes = [100, 200, 300, 400];

document.querySelectorAll("#dossier .card").forEach((card, i) => {
  card.addEventListener("mouseenter", () => {
    if (audioCtx.state === "suspended") audioCtx.resume();
    beep8bit(notes[i]);
  });
});