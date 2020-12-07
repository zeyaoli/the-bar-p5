//ref: https://github.com/MaxBittker/walky/blob/master/src/state.ts
var state = {
  gameStart: false,
  me: {
    name: "",
    id: "",
    avatar: null,
    room: "entrance",
    room: null,
    x: null,
    y: null,
    destinationX: null,
    destinationY: null,
    message: "",
  },
  players: [],
  entrance: {
    bg: "entrance_ani.png",
    frames: 2,
    frameDelay: 30,
    avatarScale: 2,
    // tint: "#fdeac8",
    area: "barEntrance_area.png",
  },
  bar: {
    bg: "bar.png",
    frames: 2,
    frameDelay: 30,
    avatarScale: 2,
    // tint: "#fdeac8",
    area: "bar_area.png",
  },
  bubbles: [],
  bartender: {
    id: "bartender",
    message: [
      "Hi there, do you want anything?",
      "Vodka Soda?",
      "Too loud, say it again?",
      "Can I get something for you?",
      "Do you want gin tonic?",
      "Welcome to the bar!",
      "Will grab a drink for you",
    ],
  },
};

// const getData = () => {
//   return data;
// };

// export { getData };
