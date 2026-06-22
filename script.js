const noButton = document.getElementById("noButton");
const yesButton = document.getElementById("yesButton");
const buttonZone = document.getElementById("buttonZone");
const forgiveMessage = document.getElementById("forgiveMessage");
const canvas = document.getElementById("confettiCanvas");
const context = canvas.getContext("2d");

let confettiPieces = [];
let confettiAnimation;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function moveNoButton() {
  const zoneRect = buttonZone.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const padding = 12;
  const maxX = Math.max(padding, zoneRect.width - buttonRect.width - padding);
  const maxY = Math.max(padding, zoneRect.height - buttonRect.height - padding);
  const nextX = Math.floor(Math.random() * maxX);
  const nextY = Math.floor(Math.random() * maxY);

  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;
}

function createConfetti() {
  const colors = ["#ff6f91", "#c83e6b", "#ffe58f", "#bdebd7", "#b9dcff", "#ffffff"];
  const pieces = [];

  for (let i = 0; i < 180; i += 1) {
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

function celebrateForgiveness() {
  forgiveMessage.classList.add("show");
  yesButton.textContent = "Forgiveness accepted ♥";
  resizeCanvas();
  confettiPieces = createConfetti();
  cancelAnimationFrame(confettiAnimation);
  drawConfetti();

  setTimeout(() => {
    cancelAnimationFrame(confettiAnimation);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, 5200);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((section) => {
  observer.observe(section);
});

noButton.addEventListener("pointerenter", moveNoButton);
noButton.addEventListener("pointermove", moveNoButton);
noButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  moveNoButton();
});
noButton.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});
noButton.addEventListener("focus", moveNoButton);
yesButton.addEventListener("click", celebrateForgiveness);
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
