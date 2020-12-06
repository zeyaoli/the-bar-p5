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
    tint: "#fdeac8",
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
};

// const getData = () => {
//   return data;
// };

// export { getData };
