// Gobble Dash — tuning, stages and helpers shared by every module.
// The turkey runs from the farmyard, through the barn, into the kitchen,
// and must reach the woods 1000 m away before Farmer Bram catches it.

export const VIEW = { width: 960, height: 540, groundY: 470 };

export const GOAL_DISTANCE = 1000; // metres to the woods: reach it and escape
export const MAX_LIVES = 3;
export const PLAYER_X = 180; // the turkey's fixed screen x while it runs

// One stage per stretch of the escape. Each stage retunes the palette,
// the speed and which dangers show up.
export const STAGES = [
  {
    key: 'farmyard',
    name: 'THE FARMYARD',
    from: 0,
    skyTop: '#ffd98a',
    skyBottom: '#f7a94b',
    hillFar: '#c98a3d',
    hillNear: '#a86a28',
    ground: '#8a5a2b',
    groundTop: '#b5773a',
    accent: '#e2722b',
    speed: 260,
  },
  {
    key: 'barn',
    name: 'THE BARN',
    from: 300,
    skyTop: '#e8975a',
    skyBottom: '#b95c33',
    hillFar: '#8f4a26',
    hillNear: '#6e3418',
    ground: '#6b4423',
    groundTop: '#96602f',
    accent: '#d94f2b',
    speed: 330,
  },
  {
    key: 'kitchen',
    name: 'THE KITCHEN',
    from: 650,
    skyTop: '#c96a4a',
    skyBottom: '#7e2f22',
    hillFar: '#5e2418',
    hillNear: '#451a10',
    ground: '#4a2a1c',
    groundTop: '#7a4630',
    accent: '#ff5a2a',
    speed: 400,
  },
];

export function stageFor(distance) {
  let stage = STAGES[0];
  for (const s of STAGES) if (distance >= s.from) stage = s;
  return stage;
}

// Small deterministic RNG so a screenshot seed always stages the same run.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
