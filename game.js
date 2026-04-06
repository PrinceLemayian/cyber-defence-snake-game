const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const COLS = 20;
const ROWS = 20;
const CELL = 24;

canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;

const state = {
  status: "idle",
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  food: null,
  score: 0,
  speed: 120,
  gameInterval: null,
  sessionSeconds: 0,
  sessionTimer: null,
  threat: null,
  defense: null,
  activeCurriculum: null,
  lessonsCompleted: 0,
  totalThreats: 0,
  totalDefenses: 0,
  totalPackets: 0,
  cardTimeLeft: 20,
  cardTimer: null,
};

function spawnFood() {
  let position;

  while (true) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    const collision = state.snake.some(
      (segment) => segment.x === x && segment.y === y,
    );

    if (!collision) {
      position = { x, y };
      break;
    }
  }

  state.food = position;
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawChip(cx, cy, fillColor, strokeColor, symbol, symbolColor, label) {
  const chipSize = 36;
  const x = cx * CELL + (CELL - chipSize) / 2;
  const y = cy * CELL + (CELL - chipSize) / 2;
  const radius = 10;

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  drawRoundedRect(x, y, chipSize, chipSize, radius);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = symbolColor;
  ctx.font = "18px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbol, x + chipSize / 2, y + chipSize / 2);

  ctx.fillStyle = "#6b7280";
  ctx.font = "10px Inter, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(label, x + chipSize / 2, y + chipSize + 8);
}

function truncateLabel(text, maxLength) {
  if (typeof text !== "string") {
    return "";
  }
  return text.length <= maxLength ? text : text.slice(0, maxLength - 1) + "…";
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f0faf0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(0,166,81,0.08)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += CELL) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += CELL) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  state.snake.forEach((segment, index) => {
    const x = segment.x * CELL + 1;
    const y = segment.y * CELL + 1;
    const size = CELL - 2;
    const color = index === 0 ? "#00C261" : "#00A651";

    ctx.fillStyle = color;
    drawRoundedRect(x, y, size, size, 3);
    ctx.fill();
  });

  if (state.food) {
    drawChip(
      state.food.x,
      state.food.y,
      "rgba(255,255,255,0.9)",
      "rgba(156,163,175,0.5)",
      "◈",
      "#9ca3af",
      "DATA_INT",
    );
  }

  if (state.threat) {
    drawChip(
      state.threat.x,
      state.threat.y,
      "rgba(239,68,68,0.1)",
      "rgba(239,68,68,0.5)",
      "✉",
      "rgba(239,68,68,0.8)",
      `THREAT: ${truncateLabel(state.threat.name, 12)}`,
    );
  }

  if (state.defense) {
    drawChip(
      state.defense.x,
      state.defense.y,
      "rgba(0,166,81,0.1)",
      "rgba(0,166,81,0.5)",
      "🛡",
      "rgba(0,166,81,0.8)",
      `DEFENSE: ${truncateLabel(state.defense.name, 12)}`,
    );
  }

  if (state.threat && state.defense) {
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    const startX = state.threat.x * CELL + CELL / 2;
    const startY = state.threat.y * CELL + CELL / 2;
    const endX = state.defense.x * CELL + CELL / 2;
    const endY = state.defense.y * CELL + CELL / 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  }

  if (state.status === "idle" || state.status === "gameover") {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = state.status === "idle" ? "#6b7280" : "#E31937";
    ctx.font = "16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const message =
      state.status === "idle"
        ? "PRESS [SPACE] TO START"
        : "GAME OVER — PRESS [SPACE]";

    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  const head = state.snake[0];
  const coordinatesElement = document.getElementById("coordinates");
  if (coordinatesElement) {
    coordinatesElement.textContent = `${head.x},${head.y}`;
  }
}

spawnFood();
draw();
