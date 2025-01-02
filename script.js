let imageRock = document.getElementById("rock");
let imagePaper = document.getElementById("paper");
let imageScissors = document.getElementById("scissors");
let playerChoiceImage = document.getElementById("playerChoice");
let computerChoiceImage = document.getElementById("computerChoice");

let timerText = document.getElementById("timerText");
let selfScoreText = document.getElementById("selfScoreText");
let enemyScoreText = document.getElementById("enemyScoreText");
let titleText = document.getElementById("titleText");
const resultText = document.getElementById("resultText");
const scoreText = document.getElementById("scoreText");

let gm = false;

const mainMenu = document.getElementById("mainMenu");
const spMenu = document.getElementById("spMenu");
const spDisplay = document.getElementById("spDisplay");
const mpMenu = document.getElementById("mpMenu");
const mpSettings = document.getElementById("mpSettings");
const optionDisplay = document.getElementById("optionDisplay");
const creditsDisplay = document.getElementById("creditsDisplay");
const gameOverModal = document.getElementById("gameOverModal");

const spButton = document.getElementById("spButton");
const mpButton = document.getElementById("mpButton");
const optionButton = document.getElementById("optionButton");
const creditsButton = document.getElementById("creditsButton");
const startGameButton = document.getElementById("startGameButton");
const backToSpMenuButton = document.getElementById("backToSpMenuButton");
const replayButton = document.getElementById("replayButton");
const changeSettingsButton = document.getElementById("changeSettingsButton");
const mainMenuButton = document.getElementById("mainMenuButton");
const joinButton = document.getElementById("joinButton");
const hostMenuButton = document.getElementById("hostMenuButton");
const hostButton = document.getElementById("hostButton");
const backToMpMenuButton = document.getElementById("backToMpMenuButton");

const backToMenuButtons = document.querySelectorAll("#backToMenuButton");

spDisplay.style.display = "none";
mpMenu.style.display = "none";
mpSettings.style.display = "none";
optionDisplay.style.display = "none";
creditsDisplay.style.display = "none";
spMenu.style.display = "none";
gameOverModal.style.display = "none";

const lobbyCodeInput = document.getElementById("lobbyCodeInput");
const dropsInput = document.getElementById("dropsInput");
const timerSelect = document.getElementById("timerSelect");

let count;
let selected = 0;
let computerChoice = 0;
let selfScore = 0;
let enemyScore = 0;
let timer;
let anotherTimer;

let drops;
let timerSpSetting;

spButton.addEventListener("click", (event) => {
  mainMenu.style.display = "none";
  spMenu.style.display = "grid";
});

startGameButton.addEventListener("click", (event) => {
  drops = dropsInput.value;
  timerSpSetting = timerSelect.value;

  if (drops === "infinite") {
    drops = Infinity; // You can use `Infinity` in JavaScript
  } else {
    drops = parseInt(drops);
  }

  reset();
  startSpGame(drops, timerSpSetting);

  spMenu.style.display = "none";
  spDisplay.style.display = "block";
});

backToSpMenuButton.addEventListener("click", (event) => {
  clearInterval(timer);
  spMenu.style.display = "grid";
  spDisplay.style.display = "none";
});

changeSettingsButton.addEventListener("click", (event) => {
  reset();
  spMenu.style.display = "grid";
  gameOverModal.style.display = "none";
  spDisplay.style.display = "none";
  mainMenu.style.display = "none";
});

replayButton.addEventListener("click", (event) => {
  drops = parseInt(dropsInput.value);
  timerSpSetting = timerSelect.value;
  reset();
  startSpGame(drops, timerSpSetting);
  mainMenu.style.display = "none";
  gameOverModal.style.display = "none";
  spDisplay.style.display = "block";
});

mpButton.addEventListener("click", (event) => {
  mainMenu.style.display = "none";
  mpMenu.style.display = "block";
});

hostMenuButton.addEventListener("click", (event) => {
  mpMenu.style.display = "none";
  mpSettings.style.display = "grid";
});

hostButton.addEventListener("click", (event) => {});

backToMpMenuButton.addEventListener("click", (event) => {
  mpSettings.style.display = "none";
  mpMenu.style.display = "block";
});

optionButton.addEventListener("click", (event) => {
  mainMenu.style.display = "none";
  optionDisplay.style.display = "block";
});

creditsButton.addEventListener("click", (event) => {
  mainMenu.style.display = "none";
  creditsDisplay.style.display = "block";
});

// Reusing the same "Back to Menu" button for multiple sections
backToMenuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Find and hide the currently visible section
    const sections = [
      spDisplay,
      mpMenu,
      optionDisplay,
      creditsDisplay,
      spMenu,
      gameOverModal,
    ];
    sections.forEach((section) => {
      if (section.style.display !== "none") {
        section.style.display = "none";
      }
    });
    // Show the main menu
    mainMenu.style.display = "grid";
  });
});

function startSpGame(drops, timerSpSetting) {
  count = timerSpSetting;
  titleText.textContent = `First to ${drops}`;
  if (timerSpSetting == "off") {
    timerText.textContent = `FIGHT!`;
  } else {
    timerText.textContent = `${timerSpSetting} seconds remeaning`;
    TimerCheck();
  }
}

function TimerCheck() {
  if (gm === false && timerSpSetting !== "off") {
    timer = setInterval(function () {
      count--;
      timerText.innerHTML = count + " seconds remaining";

      if (count <= 0) {
        if (selected == 0) {
          selected = Math.floor(Math.random() * 3) + 1;

          switch (selected) {
            case 1:
              playerChoiceImage.src = "rock.png";
              break;

            case 2:
              playerChoiceImage.src = "paper.png";
              break;

            case 3:
              playerChoiceImage.src = "scissors.png";
              break;
          }
        }
        clearInterval(timer);
        count = timerSpSetting;
        getResult(selected);
      }
    }, 1000);
  }
}

function selection(element) {
  playerChoiceImage.src = element;

  switch (element) {
    case "/images/rock.png":
      selected = 1;
      break;

    case "/images/paper.png":
      selected = 2;
      break;

    case "/images/scissors.png":
      selected = 3;
      break;
  }
  if (timerSpSetting == "off") {
    getResult(selected);
  }
}

function getResult(playerChoice) {
  computerChoice = Math.floor(Math.random() * 3) + 1;

  switch (computerChoice) {
    case 1:
      computerChoiceImage.src = "/images/rock.png";
      break;

    case 2:
      computerChoiceImage.src = "/images/paper.png";
      break;

    case 3:
      computerChoiceImage.src = "/images/scissors.png";
      break;
  }

  switch (playerChoice) {
    case 1:
      if (computerChoice == 2) {
        enemyScore = enemyScore + 1;
        check(selfScore, enemyScore);
        timerText.innerHTML = "You lost";
      } else if (computerChoice == 3) {
        selfScore = selfScore + 1;
        check(selfScore, enemyScore);
        timerText.innerHTML = "You won!";
      } else {
        timerText.innerHTML = "Draw!";
      }
      break;

    case 2:
      if (computerChoice == 3) {
        enemyScore = enemyScore + 1;
        check(selfScore, enemyScore);
        timerText.innerHTML = "You lost";
      } else if (computerChoice == 1) {
        selfScore = selfScore + 1;
        check(selfScore, enemyScore);
        timerText.innerHTML = "You won!";
      } else {
        timerText.innerHTML = "Draw!";
      }

      break;

    case 3:
      if (computerChoice == 1) {
        enemyScore = enemyScore + 1;
        check(selfScore, enemyScore);
        timerText.innerHTML = "You lost";
      } else if (computerChoice == 2) {
        selfScore = selfScore + 1;
        check(selfScore, enemyScore);
        timerText.innerHTML = "You won!";
      } else {
        timerText.innerHTML = "Draw!";
      }
      break;
  }
  selected = 0;
  selfScoreText.innerHTML = selfScore;
  enemyScoreText.innerHTML = enemyScore;
  if (timerSpSetting != "off") {
    anotherTimer = setInterval(function () {
      clearInterval(anotherTimer);
      computerChoiceImage.src = "/images/q.png";
      playerChoiceImage.src = "/images/q.png";
      TimerCheck();
    }, 1000);
  }
}

function check(playerScore, computerScore) {
  if (playerScore == drops) {
    gm = true;
    gameOver("VICTORY!", playerScore, computerScore);
  } else if (computerScore == drops) {
    gm = true;
    gameOver("DEFEAT!", playerScore, computerScore);
  }
  return;
}

function gameOver(result, playerScore, computerScore) {
  // Update modal text
  resultText.textContent = result; // "VICTORY!" or "DEFEAT!"
  scoreText.textContent = `${playerScore}-${computerScore}`;

  // Show modal
  gameOverModal.style.display = "flex";
  document.body.classList.add("modal-active");

  selected = 0;
  clearInterval(timer);
  clearInterval(anotherTimer);
}

function reset() {
  gm = false;
  selfScore = 0;
  enemyScore = 0;
  selected = 0;
  clearInterval(timer);
  selfScoreText.innerHTML = selfScore;
  enemyScoreText.innerHTML = enemyScore;
  computerChoiceImage.src = "/images/q.png";
  playerChoiceImage.src = "/images/q.png";
}

// Add an event listener to the document for key presses
document.addEventListener("keydown", (event) => {
  // Check which key was pressed
  switch (event.code) {
    case "Numpad1": // Numpad 1 key
      selected = 1; // Rock
      playerChoiceImage.src = "/images/rock.png";
      break;

    case "Numpad2": // Numpad 2 key
      selected = 2; // Paper
      playerChoiceImage.src = "/images/paper.png";
      break;

    case "Numpad3": // Numpad 3 key
      selected = 3; // Scissors
      playerChoiceImage.src = "/images/scissors.png";
      break;

    default:
      // If any other key is pressed, do nothing
      break;
  }
  if (timerSpSetting == "off") {
    getResult(selected);
  }
});
