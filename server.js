const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

//Port from env variable or default - 4001
const port = process.env.PORT || 4001;

//Setting up express and adding socketIo middleware
const app = express();

app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const server = http.createServer(app);

//CORS ref: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/index.html
const io = socketIo(server);

let players = [];

io.on("connection", (socket) => {
  socket.emit("login", { myId: socket.id, players });
  console.log("New client connected");

  socket.on("join", (data) => {
    const { id, name, x, y, room, destinationX, destinationY } = data;
    const player = {
      id: id,
      name: name,
      x: x,
      y: y,
      room: room,
      destinationX: destinationX,
      destinationY: destinationY,
    };
    players.push(player);
    console.log("We have a new client: " + player.id);

    console.log(players);
    socket.broadcast.emit("join", player);
    // socket.emit("join", players);
  });

  socket.on("move", (data) => {
    const { destinationX, destinationY } = data;
    const index = players.findIndex((e) => e.id === socket.id);
    if (index > -1) {
      players[index].destinationX = destinationX;
      players[index].destinationY = destinationY;
      console.log(socket.id + "moved");
    }
    socket.broadcast.emit("playerMoved", {
      id: socket.id,
      destinationX: destinationX,
      destinationY: destinationY,
    });
  });

  socket.on("sendMessage", (data) => {
    const { message } = data;
    const index = players.findIndex((e) => e.id === socket.id);
    if (index > -1) {
      players[index].message = message;
    }
    socket.broadcast.emit("onMessage", {
      id: socket.id,
      message: message,
    });
  });

  //client disconnect
  socket.on("disconnect", function () {
    //console.log("Client has disconnected " + socket.id);
    const index = players.findIndex((e) => e.id == socket.id);
    if (index > -1) {
      console.log(socket.id + " disconnected.");
      players.splice(index, 1);
    }
    socket.broadcast.emit("quit", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
