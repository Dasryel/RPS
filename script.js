let imageRock = document.getElementById("rock");
let imagePaper = document.getElementById("paper");
let imageScissors = document.getElementById("scissors");
let playerChoiceImage = document.getElementById("playerChoice");
let computerChoiceImage = document.getElementById("computerChoice");

let timerText = document.getElementById("timerText");
let selfScoreText = document.getElementById("selfScoreText");
let enemyScoreText = document.getElementById("enemyScoreText");
let titleText = document.getElementById("titleText");

let count = 3;
let selected = 0;
let computerChoice = 0;
let selfScore = 0;
let enemyScore = 0;
let timer;
let anotherTimer;

function selection(element) {
  clearInterval(timer);
  playerChoiceImage.src = element;

  switch (element) {
    case "rock.png":
      selected = 1;
      break;

    case "paper.png":
      selected = 2;
      break;

    case "scissors.png":
      selected = 3;
      break;
  }

  timer = setInterval(function () {
    count--;
    timerText.innerHTML = count + " seconds remaining";

    if (count == 0) {
      count = 3;
      clearInterval(timer);
      getResult(selected);
    }
  }, 1000);
}

function getResult(playerChoice) {
  computerChoice = Math.floor(Math.random() * 3) + 1;

  switch (computerChoice) {
    case 1:
      computerChoiceImage.src = "rock.png";
      break;

    case 2:
      computerChoiceImage.src = "paper.png";
      break;

    case 3:
      computerChoiceImage.src = "scissors.png";
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

  anotherTimer = setInterval(function () {
    clearInterval(anotherTimer);
    computerChoiceImage.src = "q.png";
    playerChoiceImage.src = "q.png";
  }, 1000);
}

function check(playerScore, computerScore) {
  if (playerScore == 3) {
    titleText.innerHTML = "VICTORY!";
  } else if (computerScore == 3) {
    titleText.innerHTML = "DEFEAT!";
  }
  return;
}
