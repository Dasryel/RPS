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

const player1name = document.getElementById("player1name");
const player2name = document.getElementById("player2name");

//sounds

let muted = false;
const status = document.getElementById("status");

const muteAudio = new Audio("sounds/muted.mp3");
const unmuteAudio = new Audio("sounds/unmute.mp3");

const sounds = {
  click: new Audio("sounds/back.mp3"),
  back: new Audio("sounds/click.mp3"),
  rock: new Audio("sounds/rock.mp3"),
  paper: new Audio("sounds/paper.mp3"),
  scissors: new Audio("sounds/scissors.mp3"),
  victory: new Audio("sounds/victory.mp3"),
  defeat: new Audio("sounds/defeat.mp3"),
};

function playSound(sound) {
  if (muted === false) {
    if (sounds[sound]) {
      sounds[sound].currentTime = 0;
      sounds[sound].play();
    }
  }
}

function muteFunction() {
  if (muted === false) {
    muted = true;
    muteImg.src = "images/muted.png";
    muteAudio.play();
  } else {
    muted = false;
    muteImg.src = "images/unmuted.png";
    unmuteAudio.play();
  }
  status.textContent = "MUTED:" + muted;
}

//chat
const chatMessage = document.getElementById("chatMessage");
const ChatForm = document.getElementById("ChatForm");
const sendMessage = document.getElementById("sendMessage");
const chatLog = document.getElementById("chatLog");
const chatLogUsername = document.getElementById("chatLogUsername");
const channelId = document.getElementById("channelId");

const welcomeDiv = document.getElementById("welcomeDiv");
const Username = document.getElementById("Username");
const enterGameButton = document.getElementById("enterGameButton");

socket.on("display chat", (msg, id) => {
  const item = document.createElement("li");

  // Set text content with socket.id + message
  item.textContent = id + ": " + msg;

  chatLog.appendChild(item);
  lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
});

ChatForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent form submission refresh

  if (chatMessage.value.trim()) {
    console.log(chatMessage.value);
    socket.emit("chat message", gameCode, chatMessage.value);
    chatMessage.value = ""; // Clear input after sending
  } else {
    alert("Message box is empty!");
  }
});

const resultTextMp = document.getElementById("resultTextMp");
const scoreTextMp = document.getElementById("scoreTextMp");

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

muteImg = document.getElementById("muteImg");
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
const changeUsernameButton = document.getElementById("changeUsernameButton");

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
  playSound("click");
  randomNumber = Math.floor(100000 + Math.random() * 900000);
  hostLobbyCode = randomNumber;
  gameCode = hostLobbyCode;
  channelId.textContent = gameCode;
  isHost = true;
  firstTo = dropsInputMp.value;
  timerMpSetting = timerSelectMp.value;

  TimerForBothPlayers = timerMpSetting;

  socket.emit("create lobby", randomNumber, firstTo, timerMpSetting);

  mpSettings.style.display = "none";
  waitingDisplay.style.display = "grid";

  codeText.textContent = "Game Code: " + randomNumber;
  firstToText.textContent = "First to " + firstTo;
  console.log("TIMER: TYPE");
  console.log(typeof timerMpSetting);
  if (timerMpSetting === "off") {
    mpTimerSettingText.textContent = "Timer: OFF";
  } else {
    const seconds = Number(timerMpSetting) - 1;

    mpTimerSettingText.textContent = "Timer: " + seconds + " seconds";
  }
  hostTimerCheck = setInterval(function () {
    socket.emit("lobby check for player", hostLobbyCode);
  }, 1000);
});

socket.on("destroy timer", () => {
  clearInterval(hostTimerCheck);
});
socket.on("game can be started", (player1, player2) => {
  clearInterval(hostTimerCheck);
  gameTimer = timerMpSetting;
  mpMenu.style.display = "none";
  waitingDisplay.style.display = "none";
  mpDisplay.style.display = "grid";

  player1name.textContent = player1;
  player2name.textContent = player2;

  startGame(firstTo, timerMpSetting);
});

backToMpMenuButtonFromWaiting.addEventListener("click", (event) => {
  playSound("back");
  console.log("Destroying lobby with code:", hostLobbyCode);
  waitingDisplay.style.display = "none";
  socket.emit("destroy lobby", hostLobbyCode);
});

/*backToMenuButtonFromLobby.addEventListener("click", (event) => {
  mpDisplay.style.display = "none";
  mpMenu.style.display = "none";
  socket.emit("destroy lobby", gameCode);
});
*/
joinButton.addEventListener("click", (event) => {
  playSound("click");
  lobbyCode = parseInt(lobbyCodeInput.value, 10);
  gameCode = lobbyCode;
  channelId.textContent = gameCode;
  socket.emit("connect to lobby", lobbyCode);
});

function mpReset() {
  player2ScoreText.textContent = "0";
  player1ScoreText.textContent = "0";
  player1ChoiceImg.src = "/images/p.png";
  player2ChoiceImg.src = "/images/p.png";
}

socket.on("lobby check", (status, players, drops, timer, player1, player2) => {
  alert(status);
  if (players === 2) {
    mpReset();
    mpMenu.style.display = "none";
    waitingDisplay.style.display = "none";
    mpDisplay.style.display = "grid";
    gameTimer = timer;
    gameFirst2 = drops;

    player1name.textContent = player1;
    player2name.textContent = player2;

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

function processSelection(choice) {
  if (isHost === true) {
    player1Choice = choice;
    player1ChoiceImg.src = getPicture(choice);
  } else {
    player2Choice = choice;
    player2ChoiceImg.src = getPicture(choice);
  }

  if (gameTimer == "off") {
    if (isHost === true) {
      socket.emit("check result", gameCode, 1, player1Choice);
    } else {
      socket.emit("check result", gameCode, 2, player2Choice);
    }
  } else {
    if (isHost === true) {
      socket.emit("send player selection timer", gameCode, 1, player1Choice);
    } else {
      socket.emit("send player selection timer", gameCode, 2, player2Choice);
    }
  }
}

document.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "Numpad1":
      processSelection(1);
      break;
    case "Numpad2":
      processSelection(2);
      break;
    case "Numpad3":
      processSelection(3);
      break;
    default:
      break;
  }
});

function mpSelection(element) {
  let choice = 0;

  switch (element) {
    case "/images/rock.png":
      playSound("rock");
      choice = 1;
      break;
    case "/images/paper.png":
      playSound("paper");
      choice = 2;
      break;
    case "/images/scissors.png":
      playSound("scissors");
      choice = 3;
      break;
    default:
      return;
  }

  processSelection(choice);
}

socket.on("waiting for other player", (waiting, player1, player2) => {
  if (waiting == 1) {
    if (isHost === true) {
      mpTimerText.textContent = player2 + " has chosen their piece";
      player2ChoiceImg.src = "/images/q.png";
      player1ChoiceImg.src = "/images/p.png";
    } else {
      mpTimerText.textContent = player1 + " is still choosing...";
      player1ChoiceImg.src = "/images/p.png";
    }
  } else {
    if (isHost === true) {
      mpTimerText.textContent = player2 + " is still choosing...";
      player2ChoiceImg.src = "/images/p.png";
    } else {
      mpTimerText.textContent = player1 + " has chosen their piece";
      player2ChoiceImg.src = "/images/p.png";
      player1ChoiceImg.src = "/images/q.png";
    }
  }
});

socket.on("waiting for other player with timer", (waiting) => {
  if (waiting === 1) {
    if (isHost === true) {
      player1ChoiceImg.src = "/images/p.png";
      player2ChoiceImg.src = "/images/q.png";
    } else {
      player1ChoiceImg.src = "/images/p.png";
    }
  } else {
    if (isHost === false) {
      player1ChoiceImg.src = "/images/q.png";
      player2ChoiceImg.src = "/images/p.png";
    } else {
      player2ChoiceImg.src = "/images/p.png";
    }
  }
});

socket.on("both parties have selected", () => {
  if (isHost === true) {
    player2ChoiceImg.src = "/images/q.png";
  } else {
    player1ChoiceImg.src = "/images/q.png";
  }
});

socket.on(
  "game over",
  (player1Score, player2Score, winner, player1, player2) => {
    setTimeout(() => {
      const log = document.createElement("h4");

      if (isHost === true) {
        if (winner === 1) {
          log.textContent = player1 + " HAS WON THE GAME!!";
          displayGameOver(player1Score, player2Score, "VICTORY!");
          playSound("victory");
        } else {
          log.textContent = player2 + " HAS WON THE GAME!!";
          displayGameOver(player1Score, player2Score, "DEFEAT!");
          playSound("defeat");
        }
      } else {
        if (winner === 2) {
          log.textContent = player2 + " HAS WON THE GAME!!";
          displayGameOver(player2Score, player1Score, "VICTORY!");
          playSound("victory");
        } else {
          log.textContent = player1 + " HAS WON THE GAME!!";
          displayGameOver(player2Score, player1Score, "DEFEAT!");
          playSound("defeat");
        }
      }
      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
    }, 200);
  }
);

function displayGameOver(player1Score, player2Score, result) {
  resultTextMp.textContent = result;
  scoreTextMp.textContent = `${player1Score}-${player2Score}`;

  gameOverModalMp.style.display = "flex";
  document.body.classList.add("modal-active");
}

backToMenuButtonFromMpGame.addEventListener("click", (event) => {
  playSound("back");
  socket.emit("destroy lobby", gameCode);
  isHost = false;
  mainMenu.style.display = "grid";
  mpDisplay.style.display = "none";
  gameOverModalMp.style.display = "none";
  document.getElementById("chatLog").innerHTML = "";
});

function getWinPicture(pic) {
  switch (pic) {
    case 1:
      return "/images/rockwin.png";

    case 2:
      return "/images/paperwin.png";
    case 3:
      return "/images/scissorswin.png";
  }
}

socket.on(
  "result",
  (
    result,
    player1,
    player1score,
    player2,
    player2score,
    player1name,
    player2name
  ) => {
    const log = document.createElement("li");
    const player1Text = document.createElement("span");
    const winImage = document.createElement("img");
    const player2Text = document.createElement("span");
    let winType;
    if (result === 0) {
      log.textContent = "DRAW!";
      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
    } else if (result === 1) {
      player1Text.textContent = player1name;
      player2Text.textContent = player2name;
      winType = getWinPicture(player1);
      winImage.src = winType;
      winImage.className = "winImage";
      if (isHost === true) {
        log.style.backgroundColor = "green";
      } else {
        log.style.backgroundColor = "red";
      }

      log.appendChild(player1Text);
      log.appendChild(winImage);
      log.appendChild(player2Text);

      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
    } else {
      player1Text.textContent = player2name;
      player2Text.textContent = player1name;
      winType = getWinPicture(player2);
      winImage.src = winType;
      winImage.className = "winImage";

      if (isHost === true) {
        log.style.backgroundColor = "red";
      } else {
        log.style.backgroundColor = "green";
      }
      log.appendChild(player1Text);
      log.appendChild(winImage);
      log.appendChild(player2Text);

      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
    }
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
  playSound("click");
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
  const log = document.createElement("li");

  if (player === 1) {
    if (isHost === false) {
      log.textContent = "Match request by other player!";
      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;

      rematchDisplay.style.display = "block";
    } else {
      log.textContent = "Request sent";
      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
    }
  } else {
    if (isHost === true) {
      log.textContent = "Match request by other player!";
      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
      rematchDisplay.style.display = "block";
    } else {
      log.textContent = "Request sent";
      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
    }
  }
});

rematchDeclineButton.addEventListener("click", (event) => {
  playSound("click");
  let player = 0;
  if (isHost === true) {
    player = 1;
    socket.emit("rematch decline", gameCode, player);
  } else {
    player = 2;
    socket.emit("rematch decline", gameCode, player);
  }
});

socket.on("rematch request rejected", (player) => {
  const log = document.createElement("li");
  if (player === 1) {
    if (isHost === false) {
      log.textContent = "Match request denied!";
      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
    } else {
      rematchDisplay.style.display = "none";
    }
  } else {
    if (isHost === true) {
      log.textContent = "Match request denied!";
      chatLog.append(log);
      lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;
    } else {
      rematchDisplay.style.display = "none";
    }
  }
});

socket.on("force leave", () => {
  document.getElementById("chatLog").innerHTML = "";
  alert("Lobby has been destroyed!");
  mpDisplay.style.display = "none";
  rematchDisplay.style.display = "none";
  gameOverModalMp.style.display = "none";
  mainMenu.style.display = "grid";
  isHost = false;
});

rematchAcceptButton.addEventListener("click", (event) => {
  playSound("click");
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

  const log = document.createElement("li");
  log.textContent = "New match has begun!";

  chatLog.append(log);
  lobbyChatDisplay.scrollTop = lobbyChatDisplay.scrollHeight;

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

function startGame(first2, timer) {
  mpReset();
  hostCheckText.textContent = "LOBBY: " + gameCode;
  mpTitleText.textContent = `First to ${first2}`;
  if (timer == "off") {
    mpTimerText.textContent = `FIGHT!`;
  } else {
    mpTimerText.textContent = `Timer starts when a player chooses piece...`;
  }
}

socket.on("random selection", (player, choice) => {
  if (player === 1) {
    if (isHost === true) {
      player1ChoiceImg.src = getPicture(choice);
    }
  } else {
    if (isHost === false) {
      player2ChoiceImg.src = getPicture(choice);
    }
  }
});

socket.on("welcome", (id) => {
  let newId = id.slice(0, 6);
  Username.placeholder = newId;
  Username.value = newId;
});

enterGameButton.addEventListener("click", (event) => {
  playSound("click");
  welcomeDiv.style.display = "none";

  socket.emit("joined", Username.value);
});

changeUsernameButton.addEventListener("click", (event) => {
  playSound("click");
  socket.emit("name change request");
});

socket.on("show name", (name) => {
  welcomeDiv.style.display = "grid";

  Username.placeholder = name;
  Username.value = name;
});
