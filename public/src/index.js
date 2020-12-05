// var state = require('./State.js');


//ref to other players
let players = state.players;
// ref to my player
let me;
//give canvas a global variable
let sprite_sheet;
let explode_animation;
let entranceBg;

let canvasScale;
let canvas;

var ASSETS_FOLDER = "./assets/";

var NATIVE_WIDTH = 128;
var NATIVE_HEIGHT = 100;

var ASSET_SCALE = 2;

var WIDTH = NATIVE_WIDTH * ASSET_SCALE;
var HEIGHT = NATIVE_HEIGHT * ASSET_SCALE;

let socket = io.connect();

function setup() {
  canvas = createCanvas(WIDTH, HEIGHT);
  scaleCanvas();
  canvas.parent("canvas-container");
  // background(200);
  //adapt it to the browser window
  
  const { name, x, y, destinationX, destinationY, message } = state.me;
  me = new Player(name, x, y, name, destinationX, destinationY, message);
  console.log(me);
}

function draw() {
  if(state.gameStart){
    update();
  }
}

function update(){
  background(0);
  fill(255);
  displayMe();
  displayPlayers();
}

function windowResized() {
  scaleCanvas();
}

const handleSubmit = (event) => {
  let text = document.getElementById("username-input");
  userName = text.value;

  let me = state.me;
  me.name = userName;
  me.id = socket.id;
  me.x = 200;
  me.y = 200;
  me.destinationX = me.x;
  me.destinationY = me.y;
  me.room = "frontDoor";
  socket.emit("join", {
    id: me.id,
    name: me.name,
    x: me.x,
    y: me.y,
    destinationX: me.destinationX,
    destinationY: me.destinationY,
    room: me.room,
  });
  state.gameStart = true;
};

function scaleCanvas() {
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

function displayMe(){
  me.move();
  me.display();
  me.displayName();
  me.displayMessage();
}

function displayPlayers(){
  players.forEach((player) => {
    player.move(p5);
    player.display(p5);
    player.displayName(p5);
    player.displayOtherMessage(p5);
  });
}

function move() {
  let prevX, prevY;
  if (p.x != null && p.y != null) {
    prevX = p.x;
    prevY = p.y;

    //position and destination are different, move
    if (p.x !== p.destinationX || p.y !== p.destinationY) {
      //a series of vector operations to move toward a point at a linear speed

      // create vectors for position and dest.
      let destination = p5.createVector(p.destinationX, p.destinationY);

      let position = p5.createVector(p.x, p.y);

      // Calculate the distance between your destination and position
      let distance = destination.dist(position);

      // this is where you actually calculate the direction
      // of your target towards your rect. subtraction dx-px, dy-py.
      //   let delta = destination.sub(p.pos);
      destination.sub(position);

      // then you're going to normalize that value
      // (normalize sets the length of the vector to 1)
      destination.normalize();

      // then you can multiply that vector by the desired speed
      let increment = destination.mult((p.speed * p5.deltaTime) / 10);

      /*
      IMPORTANT
      deltaTime The system variable deltaTime contains the time difference between 
      the beginning of the previous frame and the beginning of the current frame in milliseconds.
      the speed is not based on the client framerate which can be variable but on the actual time that passes
      between frames.
      */
      console.log(increment);
      position.add(increment);
      //   console.log(p.pos);
      p.x = position.x;
      p.y = position.y;
    }
  }
}

//================================= Socket.on =================================

// listen to websocket
socket.on("connect", () => {
  console.log(`socket ${socket.id} connected`);
});

// load all the existed player
socket.on("login", (data) => {
  let myId = data.myId;
  data.players
    .filter((e) => e.id !== myId)
    .forEach((player) => {
      getData().players.push(
        new Player(
          player.id,
          player.x,
          player.y,
          player.name,
          player.destinationX,
          player.destinationY
        )
      );
    });
});

socket.on("join", (data) => {
  console.log(data);
  getData().players.push(
    new Player(
      data.id,
      data.x,
      data.x,
      data.name,
      data.destinationX,
      data.destinationY
    )
  );
});

socket.on("playerMoved", (data) => {
  //find the player and update the destination value
  const index = getData().players.findIndex((e) => e.id === data.id);
  if (index > -1) {
    getData().players[index].destinationX = data.destinationX;
    getData().players[index].destinationY = data.destinationY;
  }
});

socket.on("onMessage", (data) => {
  //receive message from players
  const index = getData().players.findIndex((e) => e.id === data.id);
  if (index > -1) {
    getData().players[index].message = data.message;
  }
});

socket.on("quit", (id) => {
  const index = getData().players.findIndex((e) => e.id === id);

  if (index > -1) {
    getData().players.splice(index, 1);
  }
});