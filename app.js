let session = "";
let selectedHuntId = "";
let playerName = "";

const startButton = document.getElementById("startButton");
const game = document.getElementById("game");
const questionElement = document.getElementById("question");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answer");
const message = document.getElementById("message");
const score = document.getElementById("score");

startButton.addEventListener("click", async () => {
  await startGame();
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
    message.textContent = "Starting game...";
    startButton.disabled = true;

    const response = await fetch("https://codecyprus.org/th/api/list");

    const data = await response.json();

    const huntId = data.treasureHunts[0].uuid;
    const params = new URLSearchParams({
      player: playerName || "Anonymous",
      app: "Code Cyprus Treasure Hunt",
      "treasure-hunt-id": huntId,
    });

    const res = await fetch(`https://codecyprus.org/th/api/start?${params}`);

    const startData = await res.json();

    console.log(startData);
    if (startData.status === "OK") {
      session = startData.session;

      await getQuestion(session);
    } else {
      message.textContent = startData.message || "Failed to start game";
      startButton.disabled = false;
    }
  } catch (error) {
    message.textContent = error.message;
    startButton.disabled = false;
  }
}

async function getQuestion(session) {
  const params = new URLSearchParams({ session });

  const response = await fetch(
    `https://codecyprus.org/th/api/question?${params}`,
  );

  const data = await response.json();

  console.log(data);
  if (data.status !== "OK") {
    message.textContent = data.message;
    return;
  }

  if (data.completed) {
    message.textContent = "Game completed!";
    game.hidden = true;
    startButton.disabled = false;
    return;
  }

  questionElement.textContent = data.questionText;
  game.hidden = false;
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

  console.log(data);

  if (data.status != "OK") {
    message.textContent = data.message;
    return;
  }
  if (data.status === "OK" && !data.completed) {
    await getQuestion(session);
  }
}
