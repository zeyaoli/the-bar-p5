//ref: https://github.com/MaxBittker/walky/blob/master/src/state.ts
var state = {
  gameStart: false,
  me: {
    name: "",
    id: "",
    avatar: null,
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
    // bg: "bar.png",
    frames: 2,
    frameDelay: 30,
    avatarScale: 2,
    tint: "#fdeac8",
  },
  bubbles: [],
};

// const getData = () => {
//   return data;
// };

// export { getData };
