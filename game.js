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

function move() {
  state.direction = { ...state.nextDirection };

  const newHead = {
    x: state.snake[0].x + state.direction.x,
    y: state.snake[0].y + state.direction.y,
  };

  if (
    newHead.x < 0 ||
    newHead.x >= COLS ||
    newHead.y < 0 ||
    newHead.y >= ROWS
  ) {
    gameOver();
    return;
  }

  const collidedWithSelf = state.snake.some(
    (segment) => segment.x === newHead.x && segment.y === newHead.y,
  );

  if (collidedWithSelf) {
    gameOver();
    return;
  }

  state.snake.unshift(newHead);

  let ate = false;

  if (state.food && newHead.x === state.food.x && newHead.y === state.food.y) {
    state.score += 1;
    state.totalPackets += 1;
    spawnFood();
    ate = true;
    addTelemetryLog("DATA PACKET COLLECTED +1", "success");
    addScoreEntry("Data Packet", 1, "#6b7280");
  }

  if (
    state.defense &&
    newHead.x === state.defense.x &&
    newHead.y === state.defense.y
  ) {
    state.score += 500;
    state.totalDefenses += 1;
    ate = true;
    addTelemetryLog(`NODE SECURED — ${state.defense.name}`, "success");
    addScoreEntry(`Defense: ${state.defense.name}`, 500, "#00A651");
    state.defense = null;
    if (state.threat) {
      state.threat = null;
    }
    if (state.activeCurriculum && typeof showCard === "function") {
      showCard("defense");
      return;
    }
  }

  if (
    state.threat &&
    newHead.x === state.threat.x &&
    newHead.y === state.threat.y
  ) {
    state.score = Math.max(0, state.score - 1000);
    state.totalThreats += 1;
    addTelemetryLog(`THREAT DETECTED — ${state.threat.name}`, "danger");
    addScoreEntry(`Threat: ${state.threat.name}`, -1000, "#E31937");
    state.threat = null;
    if (state.defense) {
      state.defense = null;
    }
    if (state.activeCurriculum && typeof showCard === "function") {
      showCard("threat");
      return;
    }
  }

  if (!ate) {
    state.snake.pop();
  }

  if (
    state.threat === null &&
    typeof CURRICULUM !== "undefined" &&
    Array.isArray(CURRICULUM) &&
    CURRICULUM.length > 0 &&
    Math.random() < 0.02
  ) {
    if (typeof spawnThreatPair === "function") {
      spawnThreatPair();
    }
  }

  draw();
  updateDashboard();
}

function startGame() {
  if (state.status !== "idle" && state.status !== "gameover") {
    return;
  }

  state.snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  state.direction = { x: 1, y: 0 };
  state.nextDirection = { x: 1, y: 0 };
  state.score = 0;
  state.status = "playing";
  state.threat = null;
  state.defense = null;
  state.activeCurriculum = null;
  state.totalThreats = 0;
  state.totalDefenses = 0;
  state.totalPackets = 0;
  state.lessonsCompleted = 0;

  const scoreLog = document.getElementById("score-log");
  const telemetryLog = document.getElementById("telemetry-log");

  if (scoreLog) {
    scoreLog.innerHTML = "";
  }
  if (telemetryLog) {
    telemetryLog.innerHTML = "";
  }

  spawnFood();

  if (state.gameInterval) {
    clearInterval(state.gameInterval);
  }

  state.gameInterval = setInterval(move, state.speed);

  if (state.sessionTimer) {
    clearInterval(state.sessionTimer);
  }

  state.sessionSeconds = 0;

  const formatSessionTime = (seconds) => {
    const pad = (value) => String(value).padStart(2, "0");
    const hrs = pad(Math.floor(seconds / 3600));
    const mins = pad(Math.floor((seconds % 3600) / 60));
    const secs = pad(seconds % 60);
    return `[SESSION: ${hrs}:${mins}:${secs}]`;
  };

  state.sessionTimer = setInterval(() => {
    state.sessionSeconds += 1;
    const timerEl = document.getElementById("session-timer");
    if (timerEl) {
      timerEl.textContent = formatSessionTime(state.sessionSeconds);
    }
  }, 1000);

  addTelemetryLog("SESSION INITIALIZED", "success");
  updateDashboard();
  draw();
}

function gameOver() {
  state.status = "gameover";

  if (state.gameInterval) {
    clearInterval(state.gameInterval);
    state.gameInterval = null;
  }

  if (state.sessionTimer) {
    clearInterval(state.sessionTimer);
    state.sessionTimer = null;
  }

  addTelemetryLog("SESSION TERMINATED", "danger");
  updateDashboard();
  draw();
}

function updateDashboard() {
  const scoreValue = document.getElementById("score-value");
  const progressFill = document.getElementById("progress-fill");
  const rankPercent = document.getElementById("rank-percent");
  const threatsCount = document.getElementById("threats-count");
  const defenseCount = document.getElementById("defense-count");
  const packetsCount = document.getElementById("packets-count");

  if (scoreValue) {
    scoreValue.textContent = String(state.score);
  }

  const progressWidth = Math.min(Math.max((state.score / 50) * 100, 0), 100);
  if (progressFill) {
    progressFill.style.width = `${progressWidth}%`;
  }

  if (rankPercent) {
    rankPercent.textContent = `${Math.min(Math.max(state.score, 0), 100)}%`;
  }

  if (threatsCount) {
    threatsCount.textContent = String(state.totalThreats);
  }
  if (defenseCount) {
    defenseCount.textContent = String(state.totalDefenses);
  }
  if (packetsCount) {
    packetsCount.textContent = String(state.totalPackets);
  }
}

function addTelemetryLog(message, type) {
  const logContainer = document.getElementById("telemetry-log");
  if (!logContainer) {
    return;
  }

  const pad = (value) => String(value).padStart(2, "0");
  const now = new Date();
  const timeLabel = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
    now.getSeconds(),
  )}`;

  const entry = document.createElement("div");
  entry.className = "log-entry";

  const timeSpan = document.createElement("span");
  timeSpan.className = "log-time";
  timeSpan.textContent = timeLabel;

  const messageSpan = document.createElement("span");
  messageSpan.className = type === "danger" ? "log-danger" : "log-success";
  messageSpan.textContent = message;

  entry.appendChild(timeSpan);
  entry.appendChild(document.createTextNode(" "));
  entry.appendChild(messageSpan);

  logContainer.insertBefore(entry, logContainer.firstChild);
}

function addScoreEntry(label, points, color) {
  const scoreLog = document.getElementById("score-log");
  if (!scoreLog) {
    return;
  }

  if (
    scoreLog.children.length === 1 &&
    scoreLog.firstChild.textContent.includes("No recent activity")
  ) {
    scoreLog.innerHTML = "";
  }

  const entry = document.createElement("div");
  entry.className = "score-entry";

  const labelSpan = document.createElement("span");
  labelSpan.className = "event-label";
  labelSpan.style.color = color;
  labelSpan.textContent = label;

  const pointsSpan = document.createElement("span");
  pointsSpan.className = "event-score";
  pointsSpan.style.color = color;
  pointsSpan.textContent = `${points >= 0 ? "+" : ""}${points}`;

  entry.appendChild(labelSpan);
  entry.appendChild(pointsSpan);

  scoreLog.insertBefore(entry, scoreLog.firstChild);
}

spawnFood();
draw();
