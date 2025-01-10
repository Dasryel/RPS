const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Socket } = require("socket.io-client");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let playersOnline = 0;

/*
let player1Choice = 0;
let player2Choice = 0;

let player1Score = 0;
let player2Score = 0;
*/

const lobbies = new Map();

io.on("connection", (socket) => {
  playersOnline++;
  console.log("A user connected. Players online:", playersOnline);

  // Emit the updated players count
  io.emit("players online", playersOnline);

  socket.on("disconnect", () => {
    playersOnline--;
    console.log("A user disconnected. Players online:", playersOnline);
    io.emit("players online", playersOnline);
  });

  socket.on("create lobby", (code, first2, timerSetting) => {
    socket.join(code);
    lobbies.set(code, {
      players: 1,
      drops: first2,
      timer: timerSetting,
      player1Choice: 0,
      player2Choice: 0,
      player1Score: 0,
      player2Score: 0,
    });
    console.log("Lobby created: " + code);
    console.log("First to: " + first2);
    console.log("Timer: " + timerSetting);
  });

  socket.on("connect to lobby", (code) => {
    if (lobbies.has(code)) {
      const lobby = lobbies.get(code);
      socket.join(code);

      if (lobby.players < 2) {
        lobby.players += 1;
        lobbies.set(code, lobby);

        console.log(
          `Player joined lobby ${code}. Total players: ${lobby.players}`
        );
        socket.emit(
          "lobby check",
          `Joining lobby ${code}`,
          lobby.players,
          lobby.drops,
          lobby.timer
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
      console.log("game can be started!");
      socket.emit("game can be started");
    } else {
      console.log("not enough players");
    }
  });

  socket.on("left lobby", (code) => {
    if (lobbies.has(code)) {
      const lobby = lobbies.get(code);
      socket.leave(code);
      lobby.players -= 1;
      lobbies.set(code, lobby);
      console.log("Player left " + code + " lobby");
    }
  });

  socket.on("destroy lobby", (code) => {
    console.log(code + " lobby destroyed");
    lobbies.delete(code);
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
        if (gameOverCheck(lobby.player1Score, lobby.drops) == true) {
          io.to(lobbyCode).emit(
            "game over",
            lobby.player1Score,
            lobby.player2Score,
            1
          );
        }
      } else if (result === 2) {
        lobby.player2Score++;
        if (gameOverCheck(lobby.player2Score, lobby.drops) == true) {
          io.to(lobbyCode).emit(
            "game over",
            lobby.player1Score,
            lobby.player2Score,
            2
          );
        }
      }

      io.to(lobbyCode).emit(
        "result",
        result,
        lobby.player1Choice,
        lobby.player1Score,
        lobby.player2Choice,
        lobby.player2Score
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
      io.to(lobbyCode).emit("waiting for other player", waiting);
      console.log("waiting for player" + waiting);
    }
  });

  function getResult(player1, player2) {
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

  function gameOverCheck(score, first2) {
    if (score == first2) {
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
    io.to(lobbyCode).emit("rematch request denied", player);

    lobbies.delete(lobbyCode);
    console.log(lobbies.size + " left");

    lobbies.forEach((lobby, lobbyCode) => {
      console.log("Lobby: " + lobbyCode);
      console.log("Lobby Details: " + JSON.stringify(lobby));
    });
  });
});

// Serve static files from the "public" directory
app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
