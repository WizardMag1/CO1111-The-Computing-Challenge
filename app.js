let session = "";

const startButton = document.getElementById("startButton");
const game = document.getElementById("game");
const questionElement = document.getElementById("question");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answer");
const message = document.getElementById("message");
const score = document.getElementById("score");
const startScreen = document.getElementById("start_screen");
const skipButton = document.getElementById("skipButton");

document.getElementById("startForm").addEventListener("submit", async (event) => {
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
      startScreen.hidden = true;
      message.textContent = "";

      await getQuestion(session);
    } else {
      message.textContent = startData.errorMessages?.[0] || "Failed to start game";
      startButton.disabled = false;
    }
  } catch (error) {
    message.textContent = error.message || "An error occurred while starting the game";
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
    message.textContent = "Game completed!";
    game.hidden = true;
    startButton.disabled = false;
    return;
  }

  questionElement.innerHTML = data.questionText;
  game.hidden = false;
  skipButton.hidden = !data.canBeSkipped;
}

async function sendAnswer(session, answer) {
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
      message.textContent = "Congratulations! You've completed the game!";
      game.hidden = true;
      startButton.disabled = false;
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
    return;
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