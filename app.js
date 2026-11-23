let session = "";
let latestPosition = null;
let lastLocationSent = 0;
let currentRequiresLocation = false;
let locationTimer = null;
let watchId = null;
let selectedHuntId = "";
let availableHunts = [];

const startButton = document.getElementById("startButton");
const game = document.getElementById("game");
const questionElement = document.getElementById("question");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answer");
const message = document.getElementById("message");
const score = document.getElementById("score");
const startScreen = document.getElementById("start_screen");
const huntSelect = document.getElementById("huntSelect");
const skipButton = document.getElementById("skipButton");
const choices = document.getElementById("choices");
const answerSubmit = answerForm.querySelector('button[type="submit"]');
const leaderboard = document.getElementById("leaderboard");
const qrSection = document.getElementById("qr_section");
const qrPreview = document.getElementById("qrPreview");
const qrResult = document.getElementById("qrResult");
const startQrBtn = document.getElementById("startQrBtn");
const stopQrBtn = document.getElementById("stopQrBtn");
let qrScanner = null;

document
  .getElementById("startForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    await startGame();
  });

skipButton.addEventListener("click", async () => {
  await skipQuestion(session);
});

answerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const answer = answerInput.value.trim();
  if (!answer) return;

  await sendAnswer(session, answer);
  answerInput.value = "";
});

huntSelect.addEventListener("change", () => {
  selectedHuntId = huntSelect.value;
});

async function startGame() {
  if (!selectedHuntId) {
    message.textContent = "Please choose a hunt first";
    return;
  }

  try {
    const playerNameInput = document.getElementById("nameInput").value.trim();
    message.textContent = "Starting game...";
    startButton.disabled = true;

    const params = new URLSearchParams({
      player: playerNameInput || "Anonymous" + Math.floor(Math.random() * 1000),
      app: "Code Cyprus Treasure Hunt",
      "treasure-hunt-id": selectedHuntId,
    });

    const res = await fetch(`https://codecyprus.org/th/api/start?${params}`);

    const startData = await res.json();
    if (startData.status === "OK") {
      session = startData.session;
      startLocationTracking();
      clearInterval(locationTimer);
      locationTimer = setInterval(() => sendLocation(session), 120000);
      startScreen.hidden = true;
      message.textContent = "";

      await getQuestion(session);
    } else {
      message.textContent =
        startData.errorMessages?.[0] || "Failed to start game";
      startButton.disabled = false;
    }
  } catch (error) {
    message.textContent =
      error.message || "An error occurred while starting the game";
    startButton.disabled = false;
  }
}

async function getQuestion(session) {
  const params = new URLSearchParams({ session });

  const response = await fetch(
    `https://codecyprus.org/th/api/question?${params}`,
  );

  const data = await response.json();
  if (data.status !== "OK") {
    message.textContent = data.errorMessages?.[0] || "Something went wrong";
    return;
  }
  if (data.completed) {
    await showFinalScore(session);
    return;
  }
  renderAnswerControls(data.questionType);
  currentRequiresLocation = data.requiresLocation;
  questionElement.innerHTML = data.questionText;
  game.hidden = false;
  if (!answerInput.hidden) {
    answerInput.focus();
  }
  skipButton.hidden = !data.canBeSkipped;
}

async function getQuizes() {
  const res = await fetch("https://codecyprus.org/th/api/list");
  const { treasureHunts } = await res.json();

  for (const hunt of treasureHunts) {
    const opt = document.createElement("option");
    opt.value = hunt.uuid;
    opt.textContent = hunt.name;
    huntSelect.appendChild(opt);
  }
}


async function sendAnswer(session, answer) {
  if (currentRequiresLocation) {
    const sent = await sendLocation(session);
    if (!sent) {
      message.textContent = "Location is required to answer this question.";
      return;
    }
  }
  const params = new URLSearchParams({
    session,
    answer,
  });

  const response = await fetch(
    `https://codecyprus.org/th/api/answer?${params}`,
  );

  const data = await response.json();

  if (data.status !== "OK") {
    message.textContent = data.errorMessages?.[0] || "Something went wrong";
    return;
  }
  if (data.correct) {
    message.textContent = "";
    if (data.completed) {
      await showFinalScore(session);
      return;
    }
    await getQuestion(session);
    await updateScore(session);
  } else {
    message.textContent = data.message || "Incorrect answer. Try again!";
  }
}

async function showFinalScore(session) {
  stopLocationTracking();
  const params = new URLSearchParams({ session });
  const response = await fetch(
    `https://codecyprus.org/th/api/leaderboard?${params}&sorted&limit=10`,
  );
  const data = await response.json();
  const players = data.leaderboard || [];

  if (data.status === "OK") {
    await updateScore(session);
    leaderboard.textContent = `Your final score: ${score.textContent}\n`;
    players.forEach((player, index) => {
      const row = document.createElement("p");
      const date = player.completionTime
        ? new Date(player.completionTime).toLocaleDateString()
        : "N/A";
      row.textContent = `${index + 1}. ${player.player} - ${player.score} - ${date}`;
      leaderboard.appendChild(row);
    });
  } else {
    message.textContent =
      data.errorMessages?.[0] || "Could not fetch leaderboard";
  }
  leaderboard.hidden = false;
  qrSection.hidden = false;
  game.hidden = true;
  startButton.disabled = false;
}

startQrBtn.addEventListener("click", startQrScanner);
stopQrBtn.addEventListener("click", stopQrScanner);

async function startQrScanner() {
  if (typeof Instascan === "undefined") {
    qrResult.textContent = "QR scanner library failed to load.";
    return;
  }
  try {
    qrScanner = new Instascan.Scanner({ video: qrPreview, mirror: false });
    qrScanner.addListener("scan", (content) => {
      qrResult.textContent = `Scanned QR: ${content}`;
      stopQrScanner();
    });
    const cameras = await Instascan.Camera.getCameras();
    if (cameras.length > 0) {
      const backCam = cameras.find((c) => /back|rear|environment/i.test(c.name));
      await qrScanner.start(backCam || cameras[0]);
      startQrBtn.hidden = true;
      stopQrBtn.hidden = false;
      qrResult.textContent = "Camera active — point at a QR code.";
    } else {
      qrResult.textContent = "No camera found on this device.";
    }
  } catch (err) {
    qrResult.textContent = `Camera error: ${err.message || err}`;
  }
}

function stopQrScanner() {
  if (qrScanner) {
    qrScanner.stop();
  }
  startQrBtn.hidden = false;
  stopQrBtn.hidden = true;
}

async function skipQuestion(session) {
  const params = new URLSearchParams({ session });
  const response = await fetch(`https://codecyprus.org/th/api/skip?${params}`);
  const data = await response.json();

  if (data.status !== "OK") {
    message.textContent = data.errorMessages?.[0] || "Could not skip";
    return;
  }

  message.textContent = data.message || "Question skipped";
  setTimeout(() => {
    message.textContent = "";
  }, 1500);

  if (data.completed) {
    await showFinalScore(session);
  }

  await getQuestion(session);
  await updateScore(session);
}

async function updateScore(session) {
  const params = new URLSearchParams({ session });
  const response = await fetch(`https://codecyprus.org/th/api/score?${params}`);
  const data = await response.json();

  if (data.status === "OK") {
    score.textContent = data.score;
  }
}

function startLocationTracking() {
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by this browser.");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      latestPosition = position.coords;
    },
    () => {
      message.textContent = "Location access denied.";
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
    },
  );
}

async function sendLocation(session) {
  if (!latestPosition) return false;
  if (Date.now() - lastLocationSent < 30000) return true;

  const params = new URLSearchParams({
    session,
    latitude: latestPosition.latitude,
    longitude: latestPosition.longitude,
  });
  const response = await fetch(
    `https://codecyprus.org/th/api/location?${params}`,
  );
  const data = await response.json();

  if (data.status !== "OK") {
    message.textContent =
      data.errorMessages?.[0] || "Location was not accepted";
    return false;
  }
  lastLocationSent = Date.now();
  return true;
}

function stopLocationTracking() {
  clearInterval(locationTimer);
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

function renderAnswerControls(questionType) {
  choices.innerHTML = "";
  choices.hidden = true;
  answerInput.hidden = false;
  answerSubmit.hidden = false;
  answerInput.value = "";

  if (questionType === "BOOLEAN") {
    showChoices(["True", "False"]);
  } else if (questionType === "MCQ") {
    showChoices(["A", "B", "C", "D"]);
  } else {
    answerInput.type =
      questionType === "INTEGER" || questionType === "NUMERIC"
        ? "number"
        : "text";
  }
}

function showChoices(options) {
  answerInput.hidden = true;
  answerSubmit.hidden = true;
  choices.hidden = false;

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn_primary";
    button.textContent = option;
    button.addEventListener("click", () => sendAnswer(session, option));
    choices.appendChild(button);
  });
}

nameInput.focus();
getQuizes();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}