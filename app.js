let session = "";
let latestPosition = null;
let lastLocationSent = 0;
let currentRequiresLocation = false;
let locationTimer = null;
let watchId = null;

const startButton = document.getElementById("startButton");
const game = document.getElementById("game");
const questionElement = document.getElementById("question");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answer");
const message = document.getElementById("message");
const score = document.getElementById("score");
const startScreen = document.getElementById("start_screen");
const skipButton = document.getElementById("skipButton");
const choices = document.getElementById("choices");
const answerSubmit = answerForm.querySelector('button[type="submit"]');

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

async function startGame() {
  try {
    const playerNameInput = document.getElementById("nameInput").value.trim();
    message.textContent = "Starting game...";
    startButton.disabled = true;

    const response = await fetch("https://codecyprus.org/th/api/list");

    const data = await response.json();
    console.log(data);

    const huntId = data.treasureHunts[0].uuid;
    const params = new URLSearchParams({
      player: playerNameInput || "Anonymous" + Math.floor(Math.random() * 1000),
      app: "Code Cyprus Treasure Hunt",
      "treasure-hunt-id": huntId,
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
  skipButton.hidden = !data.canBeSkipped;
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
  const params = new URLSearchParams({ session });
  const response = await fetch(`https://codecyprus.org/th/api/score?${params}`);
  const data = await response.json();

  if (data.status === "OK") {
    score.textContent = data.score;
    message.textContent = `Game finished! Your score: ${data.score}`;
  }
  game.hidden = true;
  startButton.disabled = false;
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
    showChoices(["true", "false"]);
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
    button.className = "btn_secondary";
    button.textContent = option;
    button.addEventListener("click", () => sendAnswer(session, option));
    choices.appendChild(button);
  });
}
