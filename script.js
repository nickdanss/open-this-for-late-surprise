/* ===== Element references ===== */
const noButton = document.getElementById("noButton");
const yesButton = document.getElementById("yesButton");
const buttonZone = document.getElementById("buttonZone");
const forgiveMessage = document.getElementById("forgiveMessage");

const cakeScene = document.getElementById("cakeScene");
const blowButton = document.getElementById("blowButton");
const micButton = document.getElementById("micButton");
const micHint = document.getElementById("micHint");
const wishMessage = document.getElementById("wishMessage");

const canvas = document.getElementById("confettiCanvas");
const context = canvas.getContext("2d");

let confettiPieces = [];
let confettiAnimation;
let candlesBlown = false;

/* ===== Confetti ===== */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createConfetti() {
  const colors = ["#a8423d", "#b95f63", "#c4a259", "#e9c4be", "#ddc792", "#fcf8f1"];
  const pieces = [];
  for (let i = 0; i < 200; i += 1) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 8 + 5,
      speed: Math.random() * 4 + 3,
      drift: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 12 - 6,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  return pieces;
}

function drawConfetti() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces.forEach((piece) => {
    context.save();
    context.translate(piece.x, piece.y);
    context.rotate((piece.rotation * Math.PI) / 180);
    context.fillStyle = piece.color;
    context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
    context.restore();

    piece.y += piece.speed;
    piece.x += piece.drift;
    piece.rotation += piece.rotationSpeed;

    if (piece.y > canvas.height + 20) {
      piece.y = -20;
      piece.x = Math.random() * canvas.width;
    }
  });
  confettiAnimation = requestAnimationFrame(drawConfetti);
}

function launchConfetti(duration = 5600) {
  resizeCanvas();
  confettiPieces = createConfetti();
  cancelAnimationFrame(confettiAnimation);
  drawConfetti();
  setTimeout(() => {
    cancelAnimationFrame(confettiAnimation);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, duration);
}

/* ===== Candle blowing ===== */
function blowOutCandles() {
  if (candlesBlown) return;
  candlesBlown = true;

  cakeScene.classList.add("out");
  wishMessage.classList.add("show");
  launchConfetti();

  blowButton.textContent = "Wish granted ♥";
  blowButton.disabled = true;
  stopListening();
  micButton.disabled = true;
  micHint.textContent = "Your candles are out. The celebration is officially owed to you. ♥";
  micHint.classList.remove("listening");
}

blowButton.addEventListener("click", blowOutCandles);

/* ===== Microphone-based blowing (optional, graceful fallback) ===== */
let audioContext;
let analyser;
let micStream;
let micRafId;

function stopListening() {
  if (micRafId) cancelAnimationFrame(micRafId);
  micRafId = null;
  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
    audioContext = null;
  }
}

function listenForBlow() {
  const data = new Uint8Array(analyser.frequencyBinCount);

  // Track sustained loud, broadband input (a blow) rather than a sharp tap.
  let sustained = 0;

  function tick() {
    if (candlesBlown) return;
    analyser.getByteFrequencyData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i += 1) sum += data[i];
    const average = sum / data.length;

    if (average > 38) {
      sustained += 1;
    } else {
      sustained = Math.max(0, sustained - 1);
    }

    // ~6 consecutive loud frames ≈ a real, sustained blow.
    if (sustained >= 6) {
      blowOutCandles();
      return;
    }

    micRafId = requestAnimationFrame(tick);
  }
  tick();
}

async function enableMicrophone() {
  if (candlesBlown) return;

  const supported =
    navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function";

  if (!supported) {
    micHint.textContent = "Microphone isn't available here — just tap “Blow the candles 🎂”.";
    micButton.disabled = true;
    return;
  }

  micButton.disabled = true;
  micHint.textContent = "Asking for microphone permission…";

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    if (audioContext.state === "suspended") await audioContext.resume();

    const source = audioContext.createMediaStreamSource(micStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    micButton.textContent = "Listening… 🎙️";
    micHint.textContent = "Now blow toward your mic — or tap the button anytime.";
    micHint.classList.add("listening");
    listenForBlow();
  } catch (error) {
    // Permission denied or any failure — the button still works.
    stopListening();
    micButton.disabled = false;
    micButton.textContent = "Use microphone 🎤";
    micHint.classList.remove("listening");
    micHint.textContent = "No mic, no problem — just tap “Blow the candles 🎂”.";
  }
}

micButton.addEventListener("click", enableMicrophone);

/* ===== Forgiveness ===== */
function moveNoButton() {
  const zoneRect = buttonZone.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const padding = 12;
  const maxX = Math.max(padding, zoneRect.width - buttonRect.width - padding);
  const maxY = Math.max(padding, zoneRect.height - buttonRect.height - padding);
  noButton.style.left = `${Math.floor(Math.random() * maxX)}px`;
  noButton.style.top = `${Math.floor(Math.random() * maxY)}px`;
}

function celebrateForgiveness() {
  forgiveMessage.classList.add("show");
  yesButton.textContent = "Forgiveness accepted ♥";
  launchConfetti(5200);
}

noButton.addEventListener("pointerenter", moveNoButton);
noButton.addEventListener("pointermove", moveNoButton);
noButton.addEventListener("pointerdown", (event) => { event.preventDefault(); moveNoButton(); });
noButton.addEventListener("click", (event) => { event.preventDefault(); moveNoButton(); });
noButton.addEventListener("focus", moveNoButton);
yesButton.addEventListener("click", celebrateForgiveness);

/* ===== Scroll reveal ===== */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));

/* ===== Init ===== */
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
