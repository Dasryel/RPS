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
const rematchDisplay = document.getElementById("rematchDisplay");

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

const replayButtonMp = document.getElementById("replayButtonMp");
const rematchAcceptButton = document.getElementById("rematchAcceptButton");
const rematchDeclineButton = document.getElementById("rematchDeclineButton");

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

//player 2
let gameTimer;
let gameFirst2;

let hostTimerCheck;
let TimerForBothPlayers;
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

  TimerForBothPlayers = timerMpSetting;

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
  mpMenu.style.display = "none";
  socket.emit("destroy lobby", gameCode);
});

joinButton.addEventListener("click", (event) => {
  lobbyCode = parseInt(lobbyCodeInput.value, 10);
  gameCode = lobbyCode;
  socket.emit("connect to lobby", lobbyCode);
});

function mpReset() {
  player2ScoreText.textContent = "0";
  player1ScoreText.textContent = "0";
  player1ChoiceImg.src = "/images/p.png";
  player2ChoiceImg.src = "/images/p.png";
}

socket.on("lobby check", (status, players, drops, timer) => {
  alert(status);
  if (players === 2) {
    mpReset();
    mpMenu.style.display = "none";
    waitingDisplay.style.display = "none";
    mpDisplay.style.display = "grid";
    gameTimer = timer;
    gameFirst2 = drops;

    TimerForBothPlayers = timer;

    startGame(drops, timer);
  }
});

function getPicture(pic) {
  switch (pic) {
    case 0:
      return "/images/p.png";
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
  } else {
    if (isHost === true) {
      socket.emit("check result timer", gameCode, 1, player1Choice);
    } else {
      socket.emit("check result timer", gameCode, 2, player2Choice);
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

socket.on("waiting for other player with timer", (waiting) => {
  if (waiting === 1) {
    mpTimerText.textContent = "We are waiting for player1";
    if (isHost === true) {
      player2ChoiceImg.src = "/images/q.png";
    }
  } else {
    mpTimerText.textContent = "We are waiting for player2";
    if (isHost === false) {
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

socket.on(
  "result timer",
  (result, player1, player1score, player2, player2score, timer) => {
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
  }
);

replayButtonMp.addEventListener("click", (event) => {
  let player = 0;
  if (isHost === true) {
    player = 1;
    socket.emit("rematch request", gameCode, player);
  } else {
    player = 2;
    socket.emit("rematch request", gameCode, player);
  }
});

socket.on("display rematch request", (player) => {
  if (player === 1) {
    if (isHost === false) {
      rematchDisplay.style.display = "block";
    }
  } else {
    if (isHost === true) {
      rematchDisplay.style.display = "block";
    }
  }
});

rematchDeclineButton.addEventListener("click", (event) => {
  let player = 0;
  if (isHost === true) {
    player = 1;
    socket.emit("rematch decline", gameCode, player);
  } else {
    player = 2;
    socket.emit("rematch decline", gameCode, player);
  }
});

socket.on("rematch request denied", (player) => {
  if (player === 1) {
    if (isHost === false) {
      alert("Other player declined the rematch request!");
    } else {
      rematchDisplay.style.display = "none";
    }
  } else {
    if (isHost === true) {
      alert("Other player declined the rematch request!");
    } else {
      rematchDisplay.style.display = "none";
    }
  }
});

socket.on("force leave", () => {
  alert("Lobby has been destroyed!");
  mpDisplay.style.display = "none";
  rematchDisplay.style.display = "none";
  gameOverModalMp.style.display = "none";
  mainMenu.style.display = "grid";
  isHost = false;
});

/*
socket.on("rematch request denied", (player) => {
  if (player === 1) {
    if (isHost === false) {
      alert("Other player declined the rematch request!");
      mpDisplay.style.display = "none";
      rematchDisplay.style.display = "none";
      gameOverModalMp.style.display = "none";
      mainMenu.style.display = "grid";
    } else {
      mpDisplay.style.display = "none";
      rematchDisplay.style.display = "none";
      gameOverModalMp.style.display = "none";
      mainMenu.style.display = "grid";
    }
  } else {
    if (isHost === true) {
      alert("Other player declined the rematch request!");
      mpDisplay.style.display = "none";
      rematchDisplay.style.display = "none";
      gameOverModalMp.style.display = "none";
      mainMenu.style.display = "grid";
    } else {
      mpDisplay.style.display = "none";
      rematchDisplay.style.display = "none";
      gameOverModalMp.style.display = "none";
      mainMenu.style.display = "grid";
    }
  }
  isHost = false;
});

*/
rematchAcceptButton.addEventListener("click", (event) => {
  socket.emit("rematch", gameCode);
});

socket.on("rematch start", () => {
  if (isHost === true) {
    console.log("player1gggggg");
    startGame(firstTo, timerMpSetting);
  } else {
    console.log("player2gggggg");
    startGame(gameFirst2, gameTimer);
  }

  mpDisplay.style.display = "grid";
  gameOverModalMp.style.display = "none";
  rematchDisplay.style.display = "none";
});

socket.on("players online", (count) => {
  console.log("Players online:", count);
  playersOnlineText.textContent = "Players Online: " + count;
});

socket.on("timer started", (timer, status) => {
  mpTimerText.textContent = timer + status;
});

socket.on("time is up", () => {
  if (isHost === true) {
    if (player1Choice === 0) {
      player1Choice = Math.floor(Math.random() * 3) + 1;
      player1ChoiceImg.src = getPicture(player1Choice);
      console.log("randomized for player1 : " + player1Choice);
    }
    socket.emit("check result timer", gameCode, 1, player1Choice);
  } else {
    if (player2Choice === 0) {
      player2Choice = Math.floor(Math.random() * 3) + 1;
      player2ChoiceImg.src = getPicture(player2Choice);
      console.log("randomized for player2 : " + player2Choice);
    }
    socket.emit("check result timer", gameCode, 2, player2Choice);
  }
});

function startGame(first2, timer) {
  mpReset();
  hostCheckText.textContent = "HOST: " + isHost + " LOBBY: " + gameCode;
  mpTitleText.textContent = `First to ${first2}`;
  if (timer == "off") {
    mpTimerText.textContent = `FIGHT!`;
  } else {
    socket.emit("start timer", gameCode, timer);

    mpTimerText.textContent = `Starting timer...`;
  }
}
