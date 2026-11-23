const huntSelect = document.getElementById("huntSelect");
const leaderboard = document.getElementById("leaderboard");
const leaderboardMessage = document.getElementById("leaderboardMessage");

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

async function loadHunts() {
  const response = await fetch("https://codecyprus.org/th/api/list");
  const data = await response.json();

  for (const hunt of data.treasureHunts) {
    const option = createElement("option", "", hunt.name);
    option.value = hunt.uuid;
    huntSelect.appendChild(option);
  }
}

async function fetchLeaderboard(huntId) {
  const url =
    "https://codecyprus.org/th/api/leaderboard?treasure-hunt-id=" +
    huntId +
    "&sorted&limit=20";

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

function buildHeader(huntName, totalPlayers) {
  const header = createElement("div", "leaderboard_header");

  const titleBox = createElement("div");
  titleBox.appendChild(createElement("h2", "leaderboard_title", huntName));
  titleBox.appendChild(createElement("p", "leaderboard_subtitle", "Top 20 players"));

  const countBox = createElement("div", "final_score_badge");
  countBox.appendChild(createElement("span", "final_score_label", "Total players"));
  countBox.appendChild(createElement("span", "final_score_value", totalPlayers));

  header.appendChild(titleBox);
  header.appendChild(countBox);

  return header;
}

function buildTableHead() {
  const thead = document.createElement("thead");
  const row = document.createElement("tr");

  row.appendChild(createElement("th", "", "Rank"));
  row.appendChild(createElement("th", "", "Player"));
  row.appendChild(createElement("th", "num", "Score"));
  row.appendChild(createElement("th", "num", "Date"));

  thead.appendChild(row);
  return thead;
}

function formatDate(completionTime) {
  if (!completionTime) {
    return "N/A";
  }

  return new Date(completionTime).toLocaleDateString();
}

function buildPlayerRow(player, rank) {
  const row = document.createElement("tr");
  const playerName = String(player.player).trim();

  if (rank <= 3) {
    row.classList.add("rank_" + rank);
  }

  const rankCell = createElement("td", "rank_cell", rank);
  const nameCell = createElement("td", "", playerName);

  const scoreCell = createElement("td", "num");
  scoreCell.appendChild(createElement("span", "score_pill", player.score));

  const dateCell = createElement("td", "num date_cell", formatDate(player.completionTime));

  row.appendChild(rankCell);
  row.appendChild(nameCell);
  row.appendChild(scoreCell);
  row.appendChild(dateCell);

  return row;
}

function buildTable(players) {
  const wrapper = createElement("div", "leaderboard_table_wrap");
  const table = createElement("table", "leaderboard_table");
  const tbody = document.createElement("tbody");

  for (let i = 0; i < players.length; i++) {
    tbody.appendChild(buildPlayerRow(players[i], i + 1));
  }

  table.appendChild(buildTableHead());
  table.appendChild(tbody);
  wrapper.appendChild(table);

  return wrapper;
}

async function showLeaderboard() {
  const huntId = huntSelect.value;

  leaderboard.hidden = true;
  leaderboardMessage.textContent = "";

  if (huntId === "") {
    return;
  }

  leaderboardMessage.textContent = "Loading...";

  const data = await fetchLeaderboard(huntId);

  if (data.status === "ERROR") {
    leaderboardMessage.textContent = "Could not load the leaderboard.";
    return;
  }

  const players = data.leaderboard || [];
  const huntName = huntSelect.options[huntSelect.selectedIndex].textContent;

  leaderboard.innerHTML = "";
  leaderboard.appendChild(buildHeader(huntName, data.numOfPlayers || players.length));

  if (players.length === 0) {
    leaderboard.appendChild(
      createElement("p", "leaderboard_empty", "No scores recorded yet."),
    );
  } else {
    leaderboard.appendChild(buildTable(players));
  }

  leaderboardMessage.textContent = "";
  leaderboard.hidden = false;
}

huntSelect.addEventListener("change", showLeaderboard);
loadHunts();
