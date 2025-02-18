const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Socket } = require("socket.io-client");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let playersOnline = 0;

const lobbyTimers = new Map();
const lobbies = new Map();
let playerSelectionCounterForMpTimer = 0;

io.on("connection", (socket) => {
  playersOnline++;
  io.emit("players online", playersOnline);
  socket.emit("welcome", socket.id);

  socket.on("joined", (username) => {
    socket.username = username;
    console.log(socket.username + " connected. Players online:", playersOnline);
  });

  socket.on("name change request", () => {
    socket.emit("show name", socket.username);
  });

  socket.on("disconnect", () => {
    playersOnline--;
    console.log("A user disconnected. Players online:", playersOnline);
    io.emit("players online", playersOnline);

    const lobbyCode = socket.lobbyCode;
    if (lobbyCode) {
      console.log(
        "Player " + socket.id + " disconnected from lobby: " + lobbyCode
      );
      io.to(lobbyCode).emit("force leave");
      console.log(lobbyCode + " lobby destroyed");
      lobbies.delete(lobbyCode);
      socket.emit("destroy timer");
      console.log(lobbies.size + " left");

      lobbies.forEach((lobby, lobbyCode) => {
        console.log("Lobby: " + lobbyCode);
        console.log("Lobby Details: " + JSON.stringify(lobby));
      });
    } else {
      console.log(socket.id + " disconnected");
    }
  });

  socket.on("create lobby", (code, first2, timerSetting) => {
    socket.join(code);
    socket.lobbyCode = code;
    lobbies.set(code, {
      players: 1,
      drops: first2,
      duration: timerSetting,
      timer: timerSetting,
      gameOver: false,
      timerCreated: false,
      gotResult: false,
      player1Choice: 0,
      player2Choice: 0,
      player1Score: 0,
      player2Score: 0,
      player1Name: socket.username,
      player2Name: "",
    });
    console.log("Lobby created: " + code);
    console.log("First to: " + first2);
    console.log("Timer: " + timerSetting);
  });

  socket.on("connect to lobby", (code) => {
    if (lobbies.has(code)) {
      const lobby = lobbies.get(code);
      socket.join(code);
      socket.lobbyCode = code;

      if (lobby.players < 2) {
        lobby.players += 1;
        lobbies.set(code, lobby);

        lobby.player2Name = socket.username;
        lobbies.set(code, lobby);

        console.log(lobby);

        console.log(
          `${socket.id} joined lobby ${code}. Total players: ${lobby.players}`
        );
        socket.emit(
          "lobby check",
          `Joining lobby ${code}`,
          lobby.players,
          lobby.drops,
          lobby.timer,
          lobby.player1Name,
          lobby.player2Name
        );
      } else {
        console.log(`Lobby ${code} is full.`);
        socket.emit("lobby check", "Lobby is full.");
      }
    } else {
      console.log(`Lobby ${code} does not exist.`);
      socket.emit("lobby check", "Lobby does not exist.");
    }
  });

  socket.on("lobby check for player", (code) => {
    if (lobbies.has(code) && lobbies.get(code).players == 2) {
      const lobby = lobbies.get(code);
      console.log("game can be started!");
      socket.emit("game can be started", lobby.player1Name, lobby.player2Name);
    } else if (lobbies.has(code)) {
      console.log(code + " LOBBY CHECK: not enough players");
    }
  });

  socket.on("left lobby", (code) => {
    if (lobbies.has(code)) {
      const lobby = lobbies.get(code);
      socket.leave(code);
      lobbies.delete(code);
      socket.emit("destroy timer");
    }
  });

  socket.on("destroy lobby", (code) => {
    io.to(code).emit("force leave");
    console.log(code + " lobby destroyed");
    lobbies.delete(code);
    socket.emit("destroy timer");
    console.log(lobbies.size + " left");

    lobbies.forEach((lobby, lobbyCode) => {
      console.log("Lobby: " + lobbyCode);
      console.log("Lobby Details: " + JSON.stringify(lobby));
    });
  });

  socket.on("lobby test", (lobby, player, choice) => {
    console.log(
      "This is for lobby " +
        lobby +
        " player " +
        player +
        " has chosen " +
        choice
    );
    io.to(lobby).emit("send lobby test", lobby, player, choice);
  });

  socket.on("check result", (lobbyCode, player, choice) => {
    const lobby = lobbies.get(lobbyCode);

    if (player === 1) {
      lobby.player1Choice = choice;
    } else {
      lobby.player2Choice = choice;
    }

    if (lobby.player1Choice && lobby.player2Choice) {
      const result = getResult(lobby.player1Choice, lobby.player2Choice);

      if (result === 1) {
        lobby.player1Score++;
        //  io.to(lobbyCode).emit("game log", 1, lobby.player1Choice);
        if (gameOverCheck(lobby.player1Score, lobby.drops, lobbyCode) == true) {
          io.to(lobbyCode).emit(
            "game over",
            lobby.player1Score,
            lobby.player2Score,
            1,
            lobby.player1Name,
            lobby.player2Name
          );
        }
      } else if (result === 2) {
        lobby.player2Score++;
        //    io.to(lobbyCode).emit("game log", 2, lobby.player2Choice);
        if (gameOverCheck(lobby.player2Score, lobby.drops, lobbyCode) == true) {
          io.to(lobbyCode).emit(
            "game over",
            lobby.player1Score,
            lobby.player2Score,
            2,
            lobby.player1Name,
            lobby.player2Name
          );
        }
      }

      io.to(lobbyCode).emit(
        "result",
        result,
        lobby.player1Choice,
        lobby.player1Score,
        lobby.player2Choice,
        lobby.player2Score,
        lobby.player1Name,
        lobby.player2Name
      );

      console.log(
        `LOBBY: ${lobbyCode} RESULT --> ${result}  player1 chose ${lobby.player1Choice}, score: ${lobby.player1Score} player2 chose ${lobby.player2Choice}, score: ${lobby.player2Score}`
      );

      lobby.player1Choice = 0;
      lobby.player2Choice = 0;
    } else {
      let waiting;
      if (lobby.player1Choice === 0) {
        waiting = 1;
      } else {
        waiting = 2;
      }
      io.to(lobbyCode).emit(
        "waiting for other player",
        waiting,
        lobby.player1Name,
        lobby.player2Name
      );
      console.log("waiting for player" + waiting);
    }
  });

  socket.on("send player selection timer", (lobbyCode, player, choice) => {
    const lobby = lobbies.get(lobbyCode);
    if (!lobby) {
      return;
    }
    if (lobby.timerCreated === false) {
      mpTimerCheck(lobbyCode, lobby.duration);
    }

    if (player === 1) {
      lobby.player1Choice = choice;
      console.log("GOT PLAYER 1");
    } else {
      lobby.player2Choice = choice;
      console.log("GOT PLAYER 2");
    }

    if (lobby.player1Choice && lobby.player2Choice) {
      console.log("both oparties have selceted");
      io.to(lobbyCode).emit("both parties have selected");
    } else {
      let waiting = 0;
      if (lobby.player1Choice === 0) {
        waiting = 1;
      } else if (lobby.player2Choice === 0) {
        waiting = 2;
      }
      io.to(lobbyCode).emit("waiting for other player with timer", waiting);
      console.log("waiting for player" + waiting);
      waiting = 0;
    }
  });

  function getResult(player1, player2, lobbyCode) {
    if (player1 === player2) {
      return 0;
    } else if (
      (player1 == 1 && player2 == 3) ||
      (player1 == 2 && player2 == 1) ||
      (player1 == 3 && player2 == 2)
    ) {
      return 1;
    } else {
      return 2;
    }
  }

  function gameOverCheck(score, first2, lobbyCode) {
    if (score == first2) {
      const lobby = lobbies.get(lobbyCode);
      lobby.gameOver = true;

      lobbies.set(lobbyCode, lobby);
      return true;
    } else {
      return false;
    }
  }

  socket.on("rematch request", (lobbyCode, player) => {
    console.log(
      "Rematch request by player" + player + " for " + lobbyCode + " lobby"
    );

    io.to(lobbyCode).emit("display rematch request", player);
  });

  socket.on("rematch decline", (lobbyCode, player) => {
    io.to(lobbyCode).emit("rematch request rejected", player);
  });

  socket.on("rematch", (gameCode) => {
    const lobbyData = lobbies.get(gameCode);
    if (lobbyData) {
      lobbyData.player1Choice = 0;
      lobbyData.player2Choice = 0;
      lobbyData.player1Score = 0;
      lobbyData.player2Score = 0;
      lobbyData.gameOver = false;
      lobbyData.timerCreated = false;
      lobbyData.gotResult = false;

      playerSelectionCounterForMpTimer = 0;

      lobbies.set(gameCode, lobbyData);
    }
    io.to(gameCode).emit("rematch start");
  });

  function mpTimerCheck(lobbyCode, sCounter) {
    const lobby = lobbies.get(lobbyCode);

    if (!lobby.GameOver && !lobby.timerCreated) {
      console.log(
        "starting timer for  " + lobbyCode + " WITH " + sCounter + " seconds"
      );

      if (lobby.timer) {
        clearInterval(lobby.timer);
      }

      lobby.timerCreated = true;
      lobby.timer = setInterval(function () {
        sCounter--;
        io.to(lobbyCode).emit("timer started", sCounter, " seconds remaining");

        if (sCounter === 0) {
          clearInterval(lobby.timer);

          if (lobby.player1Choice === 0) {
            lobby.player1Choice = Math.floor(Math.random() * 3) + 1;
            console.log("randomized for player1 : " + lobby.player1Choice);
            io.to(lobbyCode).emit("random selection", 1, lobby.player1Choice);
          } else if (lobby.player2Choice === 0) {
            lobby.player2Choice = Math.floor(Math.random() * 3) + 1;
            console.log("randomized for player2 : " + lobby.player2Choice);
            io.to(lobbyCode).emit("random selection", 2, lobby.player2Choice);
          }
          const result = getResult(lobby.player1Choice, lobby.player2Choice);

          if (result === 1) {
            lobby.player1Score++;
            if (
              gameOverCheck(lobby.player1Score, lobby.drops, lobbyCode) == true
            ) {
              io.to(lobbyCode).emit(
                "game over",
                lobby.player1Score,
                lobby.player2Score,
                1
              );
              return;
            }
          } else if (result === 2) {
            lobby.player2Score++;
            if (
              gameOverCheck(lobby.player2Score, lobby.drops, lobbyCode) == true
            ) {
              io.to(lobbyCode).emit(
                "game over",
                lobby.player1Score,
                lobby.player2Score,
                2
              );
              return;
            }
          }

          io.to(lobbyCode).emit(
            "result timer",
            result,
            lobby.player1Choice,
            lobby.player1Score,
            lobby.player2Choice,
            lobby.player2Score,
            lobby.timer
          );
          lobby.timerCreated = false;
        }
      }, 1000);
    } else {
      console.log("Gm:" + lobby.gameOver + " TIMER: " + lobby.timerCreated);
    }
  }

  socket.on("chat message", (lobby, msg) => {
    console.log(socket.id + ": " + msg + " FROM " + lobby);
    //io.emit("display main chat", msg);
    io.to(lobby).emit("display chat", msg, socket.username);
  });
});

// Serve static files from the "public" directory
app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
