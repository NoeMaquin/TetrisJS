// CONSTANTS
const CONSTANTS = {
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20,
  BLOCK_SIZE: 30,
  INITIAL_SPEED: 1000,
  COLORS: {
    I: "#00ffff",
    O: "#ffff00",
    T: "#ff00ff",
    S: "#00ff00",
    Z: "#ff0000",
    J: "#0000ff",
    L: "#ff8800",
    MALWARE: "#ff00ff",
    GARBAGE: "#666666",
  },
  SHAPES: {
    I: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
    ],
    O: [
      [
        [1, 1],
        [1, 1],
      ],
    ],
    T: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
    S: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
    ],
    Z: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
    ],
    J: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    ],
    L: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ],
    MALWARE: [
      [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
      ],
    ],
  },
  POINTS: { SINGLE: 100, DOUBLE: 300, TRIPLE: 500, TETRIS: 800 },
};

// ABILITIES CONFIG
const ABILITIES = {
  red: [
    {
      id: "ddos",
      name: "ddos_attack.sh",
      cost: 3,
      key: "7",
      cooldown: 0,
    },
    {
      id: "malware",
      name: "malware_inject.py",
      cost: 4,
      key: "8",
      cooldown: 0,
    },
    {
      id: "spoof",
      name: "spoof_queue.exe",
      cost: 2,
      key: "9",
      cooldown: 0,
    },
    { id: "ransom", name: "ransom.bat", cost: 5, key: "0", cooldown: 0 },
  ],
  blue: [
    {
      id: "firewall",
      name: "firewall_up.sh",
      cost: 3,
      key: "1",
      cooldown: 0,
    },
    {
      id: "patch",
      name: "patch_vulnerability.py",
      cost: 4,
      key: "2",
      cooldown: 0,
    },
    {
      id: "decrypt",
      name: "decrypt.exe",
      cost: 2,
      key: "3",
      cooldown: 0,
    },
    {
      id: "honeypot",
      name: "honeypot.bat",
      cost: 5,
      key: "4",
      cooldown: 0,
    },
  ],
};
