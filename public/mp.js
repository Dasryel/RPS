const socket = io();
//text
const playersOnlineText = document.getElementById("playersOnlineText");
const codeText = document.getElementById("codeText");
const firstToText = document.getElementById("firstToText");
const mpTimerSettingText = document.getElementById("mpTimerSettingText");
const mpTitleText = document.getElementById("mpTitleText");
const player1ScoreText = document.getElementById("player1ScoreText");
const mpTimerText = document.getElementById("mpTimerText");
const player2ScoreText = document.getElementById("player2ScoreText");
const hostCheckText = document.getElementById("hostCheckText");

const resultTextMp = document.getElementById("resultTextMp");
const scoreTextMp = document.getElementById("scoreTextMp");

const test1 = document.getElementById("test1");
const test2 = document.getElementById("test2");

const dropsInputMp = document.getElementById("dropsInputMp");
const timerSelectMp = document.getElementById("timerSelectMp");

//display
const waitingDisplay = document.getElementById("waitingDisplay");
const mpDisplay = document.getElementById("mpDisplay");
const gameOverModalMp = document.getElementById("gameOverModalMp");

//image

const player1ChoiceImg = document.getElementById("player1ChoiceImg");
const player2ChoiceImg = document.getElementById("player2ChoiceImg");
//button
const backToMpMenuButtonFromWaiting = document.getElementById(
  "backToMpMenuButtonFromWaiting"
);
const backToMenuButtonFromLobby = document.getElementById(
  "backToMenuButtonFromLobby"
);

const backToMenuButtonFromMpGame = document.getElementById(
  "backToMenuButtonFromMpGame"
);

//
let player1Choice = 0;
let player2Choice = 0;
let player1Score = 0;
let player2Score = 0;
let isHost = false;

let firstTo;
let timerMpSetting;

let gameCode;
let lobbyCode;
let hostLobbyCode;
let randomNumber;
let gameTimer;

let hostTimerCheck;

let mpTimer;
let isGameOver = false;
let sCounter;

waitingDisplay.style.display = "none";

hostButton.addEventListener("click", (event) => {
  randomNumber = Math.floor(100000 + Math.random() * 900000);
  hostLobbyCode = randomNumber;
  gameCode = hostLobbyCode;

  isHost = true;
  firstTo = dropsInputMp.value;
  timerMpSetting = timerSelectMp.value;

  socket.emit("create lobby", randomNumber, firstTo, timerMpSetting);

  mpSettings.style.display = "none";
  waitingDisplay.style.display = "grid";

  codeText.textContent = "Game Code: " + randomNumber;
  firstToText.textContent = "First to " + firstTo;
  if (timerMpSetting === "off") {
    mpTimerSettingText.textContent = "Timer: OFF";
  } else {
    mpTimerSettingText.textContent = "Timer: " + timerMpSetting + " seconds";
  }
  hostTimerCheck = setInterval(function () {
    socket.emit("lobby check for player", hostLobbyCode);
  }, 3000);
});

socket.on("game can be started", () => {
  clearInterval(hostTimerCheck);
  gameTimer = timerMpSetting;
  mpMenu.style.display = "none";
  waitingDisplay.style.display = "none";
  mpDisplay.style.display = "grid";

  startGame(firstTo, timerMpSetting);
});

backToMpMenuButtonFromWaiting.addEventListener("click", (event) => {
  console.log("Destroying lobby with code:", hostLobbyCode);
  mpSettings.style.display = "grid";
  waitingDisplay.style.display = "none";
  socket.emit("destroy lobby", hostLobbyCode);
});

backToMenuButtonFromLobby.addEventListener("click", (event) => {
  mpDisplay.style.display = "none";
  mpMenu.style.display = "block";
  socket.emit("left lobby", lobbyCode);
});

joinButton.addEventListener("click", (event) => {
  lobbyCode = parseInt(lobbyCodeInput.value, 10);
  gameCode = lobbyCode;
  socket.emit("connect to lobby", lobbyCode);
});

socket.on("lobby check", (status, players, drops, timer) => {
  alert(status);
  if (players === 2) {
    mpMenu.style.display = "none";
    waitingDisplay.style.display = "none";
    mpDisplay.style.display = "grid";
    gameTimer = timer;
    startGame(drops, timer);
  }
});

function startGame(first2, tSetting) {
  hostCheckText.textContent = "HOST: " + isHost + " LOBBY: " + gameCode;
  mpTitleText.textContent = `First to ${first2}`;
  if (tSetting == "off") {
    mpTimerText.textContent = `FIGHT!`;
  } else {
    mpTimerText.textContent = `${tSetting} seconds remeaning`;
    mpTimerCheck(tSetting);
  }
}

function mpTimerCheck(sCounter) {
  mpTimer = setInterval(function () {
    sCounter--;
    mpTimerText.innerHTML = sCounter + " seconds remaining";

    if (sCounter <= 0) {
      if (player1Choice === 0) {
        player1Choice = Math.floor(Math.random() * 3) + 1;

        switch (player1Choice) {
          case 1:
            player1ChoiceImg.src = "/images/rock.png";
            break;

          case 2:
            player1ChoiceImg.src = "/images/paper.png";
            break;

          case 3:
            player1ChoiceImg.src = "/images/scissors.png";
            break;
        }
      } else if (player2Choice === 0) {
        player2Choice = Math.floor(Math.random() * 3) + 1;

        switch (player2Choice) {
          case 1:
            player2ChoiceImg.src = "/images/rock.png";
            break;

          case 2:
            player2ChoiceImg.src = "/images/paper.png";
            break;

          case 3:
            player2ChoiceImg.src = "/images/scissors.png";
            break;
        }
      }
      clearInterval(mpTimer);
      //sCounter = timerMpSetting;
      // getResult(player1Choice);
    }
  }, 1000);
}

function getPicture(pic) {
  switch (pic) {
    case 1:
      return "/images/rock.png";
    case 2:
      return "/images/paper.png";
    case 3:
      return "/images/scissors.png";
  }
}

function mpSelection(element) {
  if (isHost === true) {
    player1ChoiceImg.src = element;
  } else {
    player2ChoiceImg.src = element;
  }
  switch (element) {
    case "/images/rock.png":
      if (isHost === true) {
        player1Choice = 1;
      } else {
        player2Choice = 1;
      }
      break;

    case "/images/paper.png":
      if (isHost === true) {
        player1Choice = 2;
      } else {
        player2Choice = 2;
      }
      break;

    case "/images/scissors.png":
      if (isHost === true) {
        player1Choice = 3;
      } else {
        player2Choice = 3;
      }
      break;
  }
  test1.textContent = "player1: " + player1Choice;
  test2.textContent = "player2: " + player2Choice;

  if (gameTimer == "off") {
    if (isHost === true) {
      socket.emit("check result", gameCode, 1, player1Choice);
    } else {
      socket.emit("check result", gameCode, 2, player2Choice);
    }
  }
}

socket.on("waiting for other player", (waiting) => {
  if (waiting == 1) {
    if (isHost === true) {
      mpTimerText.textContent = "player 2 has chosen their piece";
      player2ChoiceImg.src = "/images/q.png";
      player1ChoiceImg.src = "/images/p.png";
    } else {
      mpTimerText.textContent = "Player 1 is still choosing...";
      player1ChoiceImg.src = "/images/p.png";
    }
  } else {
    if (isHost === true) {
      mpTimerText.textContent = "Player 2 is still choosing...";
      player2ChoiceImg.src = "/images/p.png";
    } else {
      mpTimerText.textContent = "player 1 has chosen their piece";
      player2ChoiceImg.src = "/images/p.png";
      player1ChoiceImg.src = "/images/q.png";
    }
  }
});

socket.on("game over", (player1Score, player2Score, winner) => {
  if (isHost === true) {
    if (winner === 1) {
      displayGameOver(player1Score, player2Score, "VICTORY!");
    } else {
      displayGameOver(player1Score, player2Score, "DEFEAT!");
    }
  } else {
    if (winner === 2) {
      displayGameOver(player2Score, player1Score, "VICTORY!");
    } else {
      displayGameOver(player2Score, player1Score, "DEFEAT!");
    }
  }
});

function displayGameOver(player1Score, player2Score, result) {
  resultTextMp.textContent = result;
  scoreTextMp.textContent = `${player1Score}-${player2Score}`;

  // Show modal
  gameOverModalMp.style.display = "flex";
  document.body.classList.add("modal-active");
}

backToMenuButtonFromMpGame.addEventListener("click", (event) => {
  socket.emit("destroy lobby", gameCode);
  isHost = false;
  mainMenu.style.display = "grid";
  mpDisplay.style.display = "none";
  gameOverModalMp.style.display = "none";
});

socket.on("result", (result, player1, player1score, player2, player2score) => {
  if (isHost === true) {
    if (result === 0) {
      mpTimerText.textContent = "Draw!";
    } else if (result === 1) {
      mpTimerText.textContent = "You won!";
    } else {
      mpTimerText.textContent = "You lost!";
    }
    player2ChoiceImg.src = getPicture(player2);
  } else {
    if (result === 0) {
      mpTimerText.textContent = "Draw!";
    } else if (result === 1) {
      mpTimerText.textContent = "You lost!";
    } else {
      mpTimerText.textContent = "You won!";
    }
    player1ChoiceImg.src = getPicture(player1);
  }

  player1ScoreText.textContent = player1score;
  player2ScoreText.textContent = player2score;
});

socket.on("players online", (count) => {
  console.log("Players online:", count);
  playersOnlineText.textContent = "Players Online: " + count;
});
