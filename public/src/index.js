// var state = require('./State.js');

//ref to other players
let players = state.players;
// ref to my player
let me;
let myId;
//give canvas a global variable
let sprite_sheet;
let explode_animation;
let entranceBg;

let canvasScale;
let canvas;

var bg;
var gameBg;

var ASSETS_FOLDER = "src/assets/";

var NATIVE_WIDTH = 128;
var NATIVE_HEIGHT = 100;

var ASSET_SCALE = 2;

var WIDTH = NATIVE_WIDTH * ASSET_SCALE;
var HEIGHT = NATIVE_HEIGHT * ASSET_SCALE;

let socket = io.connect();

function preload() {
  var ss = loadSpriteSheet(
    ASSETS_FOLDER + state.entrance.bg,
    NATIVE_WIDTH,
    NATIVE_HEIGHT,
    2
  );
  bg = loadAnimation(ss);
}

function setup() {
  canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("canvas-container");

  //adapt it to the browser window

  ScaleCanvas();

  noSmooth();

  // var ss = loadSpriteSheet(gameBg, NATIVE_WIDTH, NATIVE_HEIGHT, 2);
  // bg = loadAnimation(ss);

  if (state.entrance.frameDelay != null) {
    bg.frameDelay = state.entrance.frameDelay;
  }

  // background(0);
  // imageMode(CORNER);

  // push();
  // scale(ASSET_SCALE);
  // translate(-NATIVE_WIDTH / 2, -NATIVE_HEIGHT / 2);
  // animation(bg, floor(WIDTH / 2), floor(HEIGHT / 2));
  // pop();
  // background(200);
  //adapt it to the browser window

  // const { id, name, x, y, destinationX, destinationY, message } = state.me;
  // name = "";
  // id = "";
  // x = 200;
  // y = 200;
  // destinationX = 200;
  // destinationY = 200;
  // room = "frontDoor";

  // me = new Player(id, name, x, y, destinationX, destinationY);
}

function draw() {
  if (state.gameStart) {
    GameStart();
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    me.destinationX = round(mouseX);
    me.destinationY = round(mouseY);
    console.log(me.destinationX);
    socket.emit("move", {
      destinationX: me.destinationX,
      destinationY: me.destinationY,
    });
  }
}

function GameStart() {
  background(0);
  fill(255);

  background(0);
  imageMode(CORNER);

  push();
  scale(ASSET_SCALE);
  translate(-NATIVE_WIDTH / 2, -NATIVE_HEIGHT / 2);
  animation(bg, floor(WIDTH / 2), floor(HEIGHT / 2));
  pop();

  //draw other players
  DisplayPlayers();
  //draw me
  DisplayMe();
  // console.log(typeof state.me.x);
}

function WindowResized() {
  // ScaleCanvas();
}

const HandleSubmit = (event) => {
  let joinForm = document.getElementById("join-form");
  let messageForm = document.getElementById("message-form");
  let text = document.getElementById("username-input");
  userName = text.value;

  let m = state.me;
  m.name = userName;
  m.id = socket.id;
  m.x = WIDTH / 2 + Math.floor(Math.random() * 25);
  m.y = HEIGHT / 2 + Math.floor(Math.random() * 25);
  m.destinationX = m.x;
  m.destinationY = m.y;
  m.room = "frontDoor";
  socket.emit("join", {
    id: m.id,
    name: m.name,
    x: m.x,
    y: m.y,
    destinationX: m.destinationX,
    destinationY: m.destinationY,
    room: m.room,
  });
  me = new Player(m.id, m.name, m.x, m.y, m.destinationX, m.destinationY);
  state.gameStart = true;
  joinForm.style.display = "none";
  messageForm.style.display = "block";
};

const sendMessage = (event) => {
  const messageInput = document.getElementById("message-input");
  state.me.message = messageInput.value;
  socket.emit("sendMessage", { message: me.message });
};

function ScaleCanvas() {
  //landscape scale to height
  if (windowWidth > windowHeight) {
    canvasScale = windowHeight / WIDTH; //scale to W because I want to leave room for chat and instructions (squareish)
    canvas.style("width", WIDTH * canvasScale + "px");
    canvas.style("height", HEIGHT * canvasScale + "px");
  } else {
    canvasScale = windowWidth / WIDTH;
    canvas.style("width", WIDTH * canvasScale + "px");
    canvas.style("height", HEIGHT * canvasScale + "px");
  }

  var container = document.getElementById("canvas-container");
  container.setAttribute(
    "style",
    "width:" +
      WIDTH * canvasScale +
      "px; height: " +
      HEIGHT * canvasScale +
      "px"
  );

  var form = document.getElementById("interface");
  form.setAttribute("style", "width:" + WIDTH * canvasScale + "px;");
}

//draw me
function DisplayMe() {
  me.move();
  me.display();
  me.displayName();
  me.displayMessage();
}

//draw other players
function DisplayPlayers() {
  players.map((player) => {
    player.move();
    player.display();
    player.displayName();
    player.displayOtherMessage();
  });
}

//initial other players that already in this map
function InitPlayers(people) {
  // state.players = [];

  people
    .filter((e) => e.id != myId)
    .forEach((person) => {
      state.players.push(
        new Player(
          person.id,
          person.name,
          person.x,
          person.y,
          person.destinationX,
          person.destinationY
        )
      );
    });

  // console.log(players);
}

//================================= Socket.on =================================

// listen to websocket
socket.on("connect", () => {
  console.log(`socket ${socket.id} connected`);
});

// load all the existed player
socket.on("login", (data) => {
  myId = data.myId;
  InitPlayers(data.players);
});

socket.on("join", (data) => {
  // console.log(data);
  state.players.push(
    new Player(
      data.id,
      data.name,
      data.x,
      data.y,
      data.destinationX,
      data.destinationY
    )
  );
});

socket.on("playerMoved", (data) => {
  //find the player and update the destination value
  const index = state.players.findIndex((e) => e.id === data.id);
  if (index > -1) {
    state.players[index].destinationX = data.destinationX;
    state.players[index].destinationY = data.destinationY;
  }
});

socket.on("onMessage", (data) => {
  //receive message from players
  const index = state.players.findIndex((e) => e.id === data.id);
  if (index > -1) {
    state.players[index].message = data.message;
  }
});

socket.on("quit", (id) => {
  const index = state.players.findIndex((e) => e.id === id);

  if (index > -1) {
    state.players.splice(index, 1);
  }
});
