let imageRock = document.getElementById("rock");
let imagePaper = document.getElementById("paper");
let imageScissors = document.getElementById("scissors");

let timerText = document.getElementById("timerText");
let selfScoreText = document.getElementById("selfScoreText");
let enemyScoreText = document.getElementById("enemyScoreText");
let titleText = document.getElementById("titleText");

let count = 5;
let selected = 0;
let computerChoice = 0;
let selfScore = 0;
let enemyScore = 0;

imageRock.addEventListener("click", highlightFunctionRock);
imagePaper.addEventListener("click", highlightFunctionPaper);
imageScissors.addEventListener("click", highlightFunctionScissors);

function highlightFunctionRock() {
  if (selected == 0) {
    selected = 1;
    let timer = setInterval(function () {
      count--;
      timerText.innerHTML = count + " seconds remeaning";

      if (count == 0) {
        count = 5;
        clearInterval(timer);
        getResult(selected);
      }
    }, 1000);
    imageRock.classList.toggle("mystyle");
  } else if (selected == 1) {
    selected = 0;
    imageRock.classList.toggle("mystyle");
  } else {
    alreadySelected(selected);
  }
}

function highlightFunctionPaper() {
  if (selected == 0) {
    selected = 2;
    let timer = setInterval(function () {
      count--;
      timerText.innerHTML = count + " seconds remeaning";

      if (count == 0) {
        count = 5;
        clearInterval(timer);
        getResult(selected);
      }
    }, 1000);
    imagePaper.classList.toggle("mystyle");
  } else if (selected == 2) {
    selected = 0;
    imagePaper.classList.toggle("mystyle");
  } else {
    alreadySelected(selected);
  }
}

function highlightFunctionScissors() {
  if (selected == 0) {
    selected = 3;
    let timer = setInterval(function () {
      count--;
      timerText.innerHTML = count + " seconds remeaning";

      if (count == 0) {
        count = 5;
        clearInterval(timer);
        getResult(selected);
      }
    }, 1000);
    imageScissors.classList.toggle("mystyle");
  } else if (selected == 3) {
    selected = 0;
    imageScissors.classList.toggle("mystyle");
  } else {
    alreadySelected(selected);
  }
}

function alreadySelected(s) {
  switch (s) {
    case 1:
      alert("You have already selected ROCK!");
      break;

    case 2:
      alert("You have already selected PAPERS!");
      break;

    case 3:
      alert("You have already selected SCISSORS!");
      break;
  }
}

function getResult(playerChoice) {
  computerChoice = Math.floor(Math.random() * 3) + 1;

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
      imageRock.classList.toggle("mystyle");
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
      imagePaper.classList.toggle("mystyle");

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
      imageScissors.classList.toggle("mystyle");

      break;
  }
  selected = 0;
  selfScoreText.innerHTML = selfScore;
  enemyScoreText.innerHTML = enemyScore;
}

function check(playerScore, computerScore) {
  if (playerScore == 3) {
    titleText.innerHTML = "VICTORY!";
  } else if (computerScore == 3) {
    titleText.innerHTML = "DEFEAT!";
  }
  return;
}
