let session = "";

const startButton = document.getElementById("startButton");
const game = document.getElementById("game");
const questionElement = document.getElementById("question");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answer");
const message = document.getElementById("message");
const score = document.getElementById("score");

async function startGame() {
  try {
    message.textContent = "Starting game...";
    startButton.disabled = true;

    const response = await fetch("https://codecyprus.org/th/api/list");

    const data = await response.json();

    const huntId = data.treasureHunts[0].uuid;
    const params = new URLSearchParams({
      player: "Aleksandr123",
      app: "TreasureHuntWebApp",
      "treasure-hunt-id": huntId,
    });

    const res = await fetch(`https://codecyprus.org/th/api/start?${params}`);

    const game = await res.json();

    console.log(game);
    if (game.status === "OK") {
      const session = game.session;

      await getQuestion(session);
    }
  } catch {
    console.log(error);
  }
}

async function getQuestion(session) {
  const params = new URLSearchParams({ session });

  const response = await fetch(
    `https://codecyprus.org/th/api/question?${params}`,
  );

  const data = await response.json();

  console.log(data);
  // if (data.status === "OK" && !data.completed) {
  //   await sendAnswer(session, "42");
  // }
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
  if (data.status === "OK" && !data.completed) {
    await getQuestion(session);
  }
}

startGame();
