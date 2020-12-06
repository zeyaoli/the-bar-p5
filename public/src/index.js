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

var entrance_bg;
var bar_bg;
var gameBg;
var avatar;
var bar_areas;

var ASSETS_FOLDER = "src/assets/";

var NATIVE_WIDTH = 128;
var NATIVE_HEIGHT = 100;

var ASSET_SCALE = 2;

var WIDTH = NATIVE_WIDTH * ASSET_SCALE;
var HEIGHT = NATIVE_HEIGHT * ASSET_SCALE;

let socket = io.connect();

function preload() {
  var avatar_ss = loadSpriteSheet(ASSETS_FOLDER + "avatar_ss.png", 17,17,4);
  var entrance_ss = loadSpriteSheet(
    ASSETS_FOLDER + state.entrance.bg,
    NATIVE_WIDTH,
    NATIVE_HEIGHT,
    2
  );
  var bar_ss = loadSpriteSheet(
    ASSETS_FOLDER + state.bar.bg,
    NATIVE_WIDTH,
    NATIVE_HEIGHT,
    2
  );
  entrance_bg = loadAnimation(entrance_ss);
  bar_bg = loadAnimation(bar_ss);
  avatar = loadAnimation(avatar_ss);

  bar_areas = state.bar.area;
}

function setup() {
  canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("canvas-container");

  //adapt it to the browser window

  ScaleCanvas();

  noSmooth();

  if (state.entrance.frameDelay != null) {
    entrance_bg.frameDelay = state.entrance.frameDelay;
    avatar.frameDelay = 15;
  }
}

function draw() {
  // if (state.gameStart) {
    GameStart();
  // }
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
  // background(0);
  // fill(255);

  background(0);
  imageMode(CORNER);

  push();
  scale(ASSET_SCALE);
  translate(-NATIVE_WIDTH / 2, -NATIVE_HEIGHT / 2);

  if(state.me.room == "bar"){
    animation(bar_bg, floor(WIDTH / 2), floor(HEIGHT / 2));
  }else {
    animation(entrance_bg, floor(WIDTH / 2), floor(HEIGHT / 2));
  }

  pop();

  if(state.gameStart){
    //draw other players
    DisplayPlayers();
    //draw me
    DisplayMe();
  }

  
// for(var playerID in state.players){
//   var p = state.players[playerID];

//   var illegal = isObstacle(p.x, p.y, p.room, areas);
//   if (illegal) {
//       //print(">>>>>>>>>>>" + p.id + " is in an illegal position<<<<<<<<<<<<<<<");
//       p.ignore = true;
//       if (p.sprite != null)
//           p.sprite.ignore = true;
//   }
//   else {
//       p.ignore = false;
//       if (p.sprite != null)
//           p.sprite.ignore = false;
//   }

// }
  
  
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
  m.room = "bar";
  socket.emit("join", {
    id: m.id,
    name: m.name,
    x: m.x,
    y: m.y,
    room: m.room,
    destinationX: m.destinationX,
    destinationY: m.destinationY,
  });
  me = new Player(m.id, m.name, m.x, m.y, m.destinationX, m.destinationY);
  state.gameStart = true;
  // hide join and show message
  joinForm.style.display = "none";
  messageForm.style.display = "block";
};

function isObstacle(x, y, room, a) {
  var obs = true;

  if (room != null && a != null) {

      //you know, at this point I"m not sure if you are using assets scaled by 2 for the areas
      //so I"m just gonna stretch the coordinates ok
      var px = floor(map(x, 0, WIDTH, 0, a.width));
      var py = floor(map(y, 0, HEIGHT, 0, a.height));

      var c1 = a.get(px, py);

      //if not white check if color is obstacle
      if (c1[0] != 255 || c1[1] != 255 || c1[2] != 255) {
          // var cmd = getCommand(c1, room);

          // if (cmd != null)
          //     if (cmd.obstacle != null)
          //         obs = cmd.obstacle;
          obs = true;
      }
      else
          obs = false; //if white

  }
  return obs;
}

// send message from message form
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
