// Gobble Dash — the dangers and the snacks: fences, hay bales, carving
// knives, ovens and hanging pans, plus corn and golden drumsticks.
// Spawning is distance-based and stage-weighted, so the run gets meaner
// as the turkey gets closer to the kitchen.

import { VIEW } from './config.js';
import { drawCorn, drawDrumstick, drawFence, drawHay, drawKnife, drawOven, drawPan } from './art.js';

// Each obstacle kind: size, what beats it, and how often it appears per stage.
export const KINDS = {
  fence: { w: 48, h: 56, beat: 'jump', weights: { farmyard: 0.34, barn: 0.24, kitchen: 0.1 } },
  hay: { w: 66, h: 74, beat: 'jump', weights: { farmyard: 0.3, barn: 0.24, kitchen: 0.14 } },
  knife: { w: 30, h: 112, beat: 'jump', weights: { farmyard: 0.16, barn: 0.2, kitchen: 0.26 } },
  oven: { w: 96, h: 122, beat: 'double-jump', weights: { farmyard: 0, barn: 0.16, kitchen: 0.3 } },
  pan: { w: 84, h: 78, beat: 'duck', weights: { farmyard: 0, barn: 0.16, kitchen: 0.2 } },
};

const DRAW = { fence: drawFence, hay: drawHay, knife: drawKnife, oven: drawOven, pan: drawPan };

export class Entities {
  constructor(random) {
    this.random = random;
    this.obstacles = [];
    this.pickups = [];
    this.nextSpawnAt = 320; // distance (px travelled) of the next spawn
    this.travelled = 0;
  }

  reset() {
    this.obstacles = [];
    this.pickups = [];
    this.nextSpawnAt = 320;
    this.travelled = 0;
  }

  pickKind(stageKey) {
    const entries = Object.entries(KINDS).filter(([, k]) => k.weights[stageKey] > 0);
    let total = 0;
    for (const [, k] of entries) total += k.weights[stageKey];
    let roll = this.random() * total;
    for (const [name, k] of entries) {
      roll -= k.weights[stageKey];
      if (roll <= 0) return name;
    }
    return entries[0][0];
  }

  update(dt, speed, distance, stageKey) {
    this.travelled += speed * dt;
    if (this.travelled >= this.nextSpawnAt) {
      this.spawn(distance, stageKey, speed);
      // Gaps shrink as speed grows: faster runs, tighter timing.
      const gap = 380 + this.random() * 260 - Math.min(140, speed * 0.12);
      this.nextSpawnAt = this.travelled + Math.max(300, gap);
    }
    const dx = speed * dt;
    for (const o of this.obstacles) o.x -= dx;
    for (const p of this.pickups) p.x -= dx;
    this.obstacles = this.obstacles.filter((o) => o.x + o.w > -80);
    this.pickups = this.pickups.filter((p) => p.x > -40 && !p.taken);
  }

  spawn(distance, stageKey, speed) {
    const kind = this.pickKind(stageKey);
    const def = KINDS[kind];
    const groundY = VIEW.groundY;
    const y = kind === 'pan' ? groundY - 128 : groundY - def.h;
    this.obstacles.push({ kind, x: VIEW.width + 40, y, w: def.w, h: def.h });
    // Corn arcs reward the jump over (or the duck under) each obstacle.
    if (this.random() < 0.65) {
      const cx = VIEW.width + 40 + def.w / 2;
      if (kind === 'pan') {
        for (let i = 0; i < 3; i++) {
          this.pickups.push({ kind: 'corn', x: cx - 40 + i * 40, y: groundY - 26, r: 11 });
        }
      } else {
        const arcH = def.h + 46;
        for (let i = 0; i < 4; i++) {
          const t = i / 3;
          this.pickups.push({
            kind: 'corn',
            x: cx - 60 + t * 120,
            y: groundY - 30 - Math.sin(t * Math.PI) * arcH,
            r: 11,
          });
        }
      }
    }
    // A golden drumstick sometimes floats high above the danger.
    if (this.random() < 0.14) {
      this.pickups.push({
        kind: 'drumstick',
        x: VIEW.width + 40 + def.w / 2,
        y: groundY - def.h - 110,
        r: 13,
      });
    }
    // A lone corn trail between obstacles, low and easy.
    if (this.random() < 0.3) {
      const base = VIEW.width + 40 + def.w + 120;
      for (let i = 0; i < 3; i++) {
        this.pickups.push({ kind: 'corn', x: base + i * 42, y: groundY - 30, r: 11 });
      }
    }
  }

  // AABB test with a little forgiveness on both sides.
  static overlaps(a, b) {
    return a.x + 5 < b.x + b.w - 5 && a.x + a.w - 5 > b.x + 5 && a.y + 4 < b.y + b.h && a.y + a.h > b.y;
  }

  draw(ctx, time) {
    for (const o of this.obstacles) DRAW[o.kind](ctx, o.x, o.y, o.w, o.h);
    for (const p of this.pickups) {
      if (p.kind === 'corn') drawCorn(ctx, p.x, p.y, p.r, time);
      else drawDrumstick(ctx, p.x, p.y, p.r, time);
    }
  }
}
