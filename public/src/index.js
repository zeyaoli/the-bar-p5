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
var bartender;
var avatars_c = ["pink", "blue", "green", "orange", "yellow"];
var avatars_ss = [];
var avatars = [];
let audio = new Audio("./src/assets/Style - AShamaluevMusic.mp3");

let BUBBLE_TIME = 8;
let BUBBLE_MARGIN = 3;
let bubbles = state.bubbles;

var TEXT_H = 8;
var TEXT_PADDING = 3;
var TEXT_LEADING = TEXT_H + 4;

var ASSETS_FOLDER = "src/assets/";

var NATIVE_WIDTH = 128;
var NATIVE_HEIGHT = 100;

var ASSET_SCALE = 2;

var WIDTH = NATIVE_WIDTH * ASSET_SCALE;
var HEIGHT = NATIVE_HEIGHT * ASSET_SCALE;

let socket = io.connect();

function preload() {
  //preload avatar sprite
  for (var i = 0; i < avatars_c.length; i++) {
    avatars_ss.push(
      loadSpriteSheet(ASSETS_FOLDER + `avatar_${avatars_c[i]}.png`, 17, 17, 4)
    );
    avatars.push(loadAnimation(avatars_ss[i]));
    avatars[i].frameDelay = 15;
  }

  var bartender_ss = loadSpriteSheet(
    ASSETS_FOLDER + "bartender.png",
    17,
    17,
    4
  );

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
  bartender = loadAnimation(bartender_ss);

  bar_areas = loadImage(ASSETS_FOLDER + state.bar.area);
  // entrance_areas = loadImage(ASSETS_FOLDER + state.entrance.area);
}

function setup() {
  canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("canvas-container");

  canvas.mouseReleased(canvasReleased);
  //adapt it to the browser window
  ScaleCanvas();
  noSmooth();

  if (state.entrance.frameDelay != null) {
    entrance_bg.frameDelay = state.entrance.frameDelay;
    bartender.frameDelay = 15;
  }
}

function draw() {
  GameStart();
}

function GameStart() {
  background(0);
  imageMode(CORNER);

  push();
  scale(ASSET_SCALE);
  translate(-NATIVE_WIDTH / 2, -NATIVE_HEIGHT / 2);

  if (state.me.room == "bar") {
    animation(bar_bg, floor(WIDTH / 2), floor(HEIGHT / 2));
  } else {
    animation(entrance_bg, floor(WIDTH / 2), floor(HEIGHT / 2));
  }

  pop();

  if (state.gameStart) {
    //draw other players
    DisplayPlayers();
    //draw me
    DisplayMe();
    //draw bartender
    DisplayBartender();
  }

  // draw lines connect with bubble
  for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];
    // console.log(me.id);
    if (b.id == me.id && !b.orphan) {
      if (round(me.x) == b.x && round(me.y) == b.y) {
        strokeWeight(2);
        stroke(30);
        strokeCap(SQUARE);
        line(floor(me.x), floor(me.y - BUBBLE_MARGIN), floor(me.x), floor(b.y));
      } else {
        b.orphan = true;
      }
    }
  }

  for (var i = 0; i < bubbles.length; i++) {
    bubbles[i].update();
  }

  for (var i = 0; i < bubbles.length; i++) {
    if (bubbles[i].counter < 0) {
      bubbles.splice(i, 1);
      i--; //decrement
    }
  }
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
  m.avatar = Math.floor(Math.random() * 5);
  m.x = 50 + Math.floor(Math.random() * WIDTH);
  m.y = HEIGHT / 2 + 50 + Math.floor(Math.random() * 25);
  m.destinationX = m.x;
  m.destinationY = m.y;
  m.room = "bar";
  // m.room = "entrance";
  socket.emit("join", {
    id: m.id,
    name: m.name,
    avatar: m.avatar,
    x: m.x,
    y: m.y,
    room: m.room,
    destinationX: m.destinationX,
    destinationY: m.destinationY,
  });
  me = new Player(
    m.id,
    m.name,
    m.avatar,
    m.x,
    m.y,
    m.destinationX,
    m.destinationY
  );
  state.gameStart = true;
  // hide join and show message
  joinForm.style.display = "none";
  messageForm.style.display = "block";

  audio.volume = 0.1;
  audio.play();
  audio.loop = true;
};

//when I click to move
function canvasReleased() {
  if (mouseButton == LEFT) {
    if (bar_areas != null) {
      //you know, at this point I'm not sure if you are using assets scaled by 2 for the areas
      //so I'm just gonna stretch the coordinates ok
      var mx = floor(map(mouseX, 0, WIDTH, 0, bar_areas.width));
      var my = floor(map(mouseY, 0, HEIGHT, 0, bar_areas.height));

      var c = bar_areas.get(mx, my);

      // console.log("color: " + c);
      //if transparent or semitransparent do nothing
      if (alpha(c) != 255) {
        //cancel command
        // nextCommand = null;
        //stop if moving
        if (me.x != me.destinationX && me.y != me.destinationY)
          socket.emit("move", { destinationX: me.x, destinationY: me.y });
      } else if (c[0] == 255 && c[1] == 255 && c[2] == 255) {
        //if white, generic walk stop command
        // nextCommand = null;
        me.destinationX = round(mouseX);
        me.destinationY = round(mouseY);
        socket.emit("move", {
          destinationX: me.destinationX,
          destinationY: me.destinationY,
        });
      }
      // else if(c[0] == 0 && c[1] == 0 && c[2] == 0){
      //   //if black, enter the bar

      //   socket.emit("move", {
      //     destinationX: me.destinationX,
      //     destinationY: me.destinationY,
      //   });

      //   if(me.x == me.destinationX && me.y == me.destinationY){
      //     let m = state.me;
      //     m.room = "bar";

      //     socket.emit("changeRoom", {
      //       id: m.id,
      //       // name: m.name,
      //       x: m.x,
      //       y: m.y,
      //       room: m.room
      //     });
      //   }

      // }
    }
  }
}

// send message from message form
const sendMessage = (event) => {
  const messageInput = document.getElementById("message-input");
  state.me.message = messageInput.value;
  socket.emit("sendMessage", { message: state.me.message, x: me.x, y: me.y });
  console.log(me.x);
  let offY = 100;
  //create text bubble for myself
  let newBubble = new Bubble(messageInput.value, me.x, me.y, me.id, 100);
  bubbles.push(newBubble);
  console.log(bubbles);
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
  // me.displayMessage();
}

//draw other players
function DisplayPlayers() {
  players.map((player) => {
    player.move();
    player.display();
    player.displayName();
    // player.displayOtherMessage();
  });
}

//draw bartender
function DisplayBartender() {
  animation(bartender, floor(WIDTH / 2), floor(HEIGHT / 2));
  // setInterval(DisplayBartenderMessage(), 5000);
  if (frameCount % 500 == 0) {
    DisplayBartenderMessage();
  }
}

function DisplayBartenderMessage() {
  let ranLength = floor(random(state.bartender.message.length));
  let randomMessage = state.bartender.message[ranLength];
  console.log(randomMessage);
  let offY = 50;
  let newBubble = new Bubble(
    randomMessage,
    floor(WIDTH / 2),
    floor(HEIGHT / 2),
    state.bartender.id,
    offY
  );
  bubbles.push(newBubble);
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
          person.avatar,
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
      data.avatar,
      data.x,
      data.y,
      data.destinationX,
      data.destinationY
    )
  );
  bubbles = state.bubbles;
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
  let offY = 100;
  //create text bubble
  let newBubble = new Bubble(data.message, data.x, data.y, data.id, offY);
  bubbles.push(newBubble);
});

// socket.on("changeRoom", (data) => {

// });

socket.on("quit", (id) => {
  const index = state.players.findIndex((e) => e.id === id);

  if (index > -1) {
    state.players.splice(index, 1);
  }
});
