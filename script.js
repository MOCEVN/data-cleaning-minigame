const ROUNDS = [
  {
    hint: "Vind alle foute cellen. Klik op cellen met ontbrekende waarden (NaN) of inconsistente tekst.",
    cols: ["naam", "stad", "leeftijd", "email"],
    rows: [
      {
        vals: ["Jan de Vries", "amsterdam", "28", "jan@mail.nl"],
        errors: [1],
      },
      {
        vals: ["Maria Lopez", "Amsterdam", "31", "maria@mail.nl"],
        errors: [],
      },
      {
        vals: ["Pieter Bakker", "Rotterdam", "NaN", "pieter@mail.nl"],
        errors: [2],
      },
      {
        vals: ["Sara Jansen", "AMSTERDAM", "25", "sara@mail.nl"],
        errors: [1],
      },
      {
        vals: ["Tom Visser", "Utrecht", "29", "tom@mail.nl"],
        errors: [],
      },
    ],
  },
  {
    hint: "Let op duplicaten! Rijen die exact hetzelfde zijn als een eerdere rij zijn fouten.",
    cols: ["naam", "afdeling", "score", "datum"],
    rows: [
      {
        vals: ["Anna Smit", "Marketing", "88", "2024-01-10"],
        errors: [],
      },
      { vals: ["Boris Klaas", "Sales", "72", "2024-01-11"], errors: [] },
      {
        vals: ["Anna Smit", "Marketing", "88", "2024-01-10"],
        errors: [0, 1, 2, 3],
      },
      { vals: ["Clara Dijk", "HR", "NaN", "2024-01-12"], errors: [2] },
      { vals: ["Boris Klaas", "sales", "72", "2024-01-11"], errors: [1] },
    ],
  },
  {
    hint: "Mix van fouten: NaN, duplicaten en inconsistente tekst. Vind ze allemaal!",
    cols: ["product", "categorie", "prijs", "voorraad"],
    rows: [
      { vals: ["Laptop", "elektronica", "999", "15"], errors: [1] },
      { vals: ["Muis", "Elektronica", "25", "NaN"], errors: [3] },
      {
        vals: ["Laptop", "elektronica", "999", "15"],
        errors: [0, 1, 2, 3],
      },
      { vals: ["Toetsenbord", "ELEKTRONICA", "45", "30"], errors: [1] },
      { vals: ["Monitor", "Elektronica", "349", "8"], errors: [] },
    ],
  },
];

let lives, score, round, timerInterval, timeLeft, totalTime;
let found, total;
let gameActive = false;

function heart(full) {
  const c = full ? "#E24B4A" : "#D3D1C7";
  return `<span class="heart"><svg viewBox="0 0 18 18" fill="none">
    <path d="M9 15s-6-4.35-6-8.25A3.75 3.75 0 0 1 9 4.41 3.75 3.75 0 0 1 15 6.75C15 10.65 9 15 9 15Z" fill="${c}"/>
  </svg></span>`;
}

function renderLives() {
  let h = "";
  for (let i = 0; i < 3; i++) h += heart(i < lives);
  document.getElementById("lives-display").innerHTML = h;
}

function startGame() {
  lives = 3;
  score = 0;
  round = 0;
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  loadRound();
}

function loadRound() {
  if (round >= ROUNDS.length) {
    endGame(true);
    return;
  }
  const r = ROUNDS[round];
  found = 0;
  total = r.rows.reduce((s, row) => s + row.errors.length, 0);
  totalTime = 25000;
  timeLeft = totalTime;
  gameActive = true;

  document.getElementById("round-lbl").textContent =
    `Ronde ${round + 1} van ${ROUNDS.length}`;
  document.getElementById("hint-text").textContent = r.hint;
  document.getElementById("feedback").textContent =
    `Vind ${total} fout${total !== 1 ? "en" : ""}.`;
  document.getElementById("score-val").textContent = score;
  renderLives();
  renderTable();
  startTimer();
}

function renderTable() {
  const r = ROUNDS[round];
  let html = `<table><tr>${r.cols.map((c) => `<th>${c}</th>`).join("")}</tr>`;
  r.rows.forEach((row, ri) => {
    html += "<tr>";
    row.vals.forEach((v, ci) => {
      const isErr = row.errors.includes(ci);
      html += `<td id="c${ri}_${ci}" class="clean" onclick="clickCell(${ri},${ci},${isErr})">${v}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";
  document.getElementById("table-wrap").innerHTML = html;
}

function clickCell(ri, ci, isErr) {
  if (!gameActive) return;
  const el = document.getElementById(`c${ri}_${ci}`);
  if (
    !el ||
    el.classList.contains("correct") ||
    el.classList.contains("missed")
  )
    return;

  if (isErr) {
    el.classList.remove("wrong");
    el.classList.add("correct");
    el.onclick = null;
    found++;
    score += 10;
    document.getElementById("score-val").textContent = score;
    const rem = total - found;
    document.getElementById("feedback").textContent =
      rem > 0
        ? `Nog ${rem} fout${rem !== 1 ? "en" : ""} te vinden.`
        : "Alle fouten gevonden!";
    if (found === total) setTimeout(nextRound, 800);
  } else {
    el.classList.add("wrong");
    setTimeout(() => el && el.classList.remove("wrong"), 500);
    lives--;
    renderLives();
    document.getElementById("feedback").textContent =
      "Dat is een correcte cel! -1 leven.";
    if (lives <= 0) {
      gameActive = false;
      clearInterval(timerInterval);
      revealMissed();
      setTimeout(() => endGame(false), 1200);
    }
  }
}

function revealMissed() {
  const r = ROUNDS[round];
  r.rows.forEach((row, ri) => {
    row.errors.forEach((ci) => {
      const el = document.getElementById(`c${ri}_${ci}`);
      if (el && !el.classList.contains("correct")) el.classList.add("missed");
    });
  });
}

function startTimer() {
  clearInterval(timerInterval);
  const bar = document.getElementById("timer-bar");
  timerInterval = setInterval(() => {
    timeLeft -= 100;
    const pct = Math.max(0, (timeLeft / totalTime) * 100);
    bar.style.width = pct + "%";
    bar.style.background =
      pct > 50 ? "#378ADD" : pct > 25 ? "#EF9F27" : "#E24B4A";
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameActive = false;
      revealMissed();
      document.getElementById("feedback").textContent = "Tijd is om!";
      lives--;
      renderLives();
      if (lives <= 0) setTimeout(() => endGame(false), 1000);
      else setTimeout(nextRound, 1200);
    }
  }, 100);
}

function nextRound() {
  clearInterval(timerInterval);
  gameActive = false;
  round++;
  setTimeout(loadRound, 300);
}

function endGame(won) {
  clearInterval(timerInterval);
  gameActive = false;
  document.getElementById("game-area").style.display = "none";
  document.getElementById("end-screen").style.display = "block";
  document.getElementById("end-title").textContent = won
    ? "Gelukt!"
    : "Game over";
  document.getElementById("end-msg").textContent = won
    ? "Je hebt alle datasets opgeschoond."
    : "Je hebt al je levens verloren.";
  document.getElementById("end-stats").textContent =
    `Eindscore: ${score} punten`;
}

startGame();
