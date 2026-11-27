// Gobble Dash — the game itself: states, turkey physics, Farmer Bram's
// chase, scoring, the HUD, and the title / caught / escaped screens.
// States: 'title' | 'playing' | 'paused' | 'caught' | 'escaped'.

import { GOAL_DISTANCE, MAX_LIVES, PLAYER_X, VIEW, clamp, mulberry32, stageFor } from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { World } from './world.js';
import { Entities } from './entities.js';
import { drawFarmer, drawFeather, drawTurkey } from './art.js';

const GRAVITY = 2400;
const JUMP_VEL = 840;
const TURKEY_W = 64;
const TURKEY_H = 56;
const DUCK_H = 34;

export class Game {
  constructor(canvas, shotMode) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sound = new SoundBank();
    this.shotMode = shotMode || null;
    this.best = 0;
    try {
      this.best = Number(window.localStorage.getItem('gobble-dash-best') || 0) || 0;
    } catch (e) {
      this.best = 0;
    }
    this.state = 'title';
    this.time = 0;
    this.resetRun(1);
    this.titleT = 0;
    this.endT = 0;
    this.shake = 0;
    this.flash = 0;
    this.showHint = true;
  }

  resetRun(seed) {
    this.random = mulberry32(seed || ((Math.random() * 1e9) | 0));
    this.world = new World(this.random);
    this.entities = new Entities(this.random);
    this.distance = 0; // metres
    this.score = 0;
    this.corn = 0;
    this.lives = MAX_LIVES;
    this.speed = 260;
    this.turkey = {
      x: PLAYER_X,
      y: VIEW.groundY - TURKEY_H,
      vy: 0,
      jumps: 0,
      ducking: false,
      duckT: 0,
      invuln: 0,
      pose: 'run',
    };
    this.farmerX = -30; // just peeking in at the left edge: he is always there
    this.farmerMood = 'calm';
    this.slowT = 0;
    this.spawnedIntro = false;
  }

  get stage() {
    return stageFor(this.distance);
  }

  startRun(seed) {
    this.resetRun(seed);
    this.state = 'playing';
    this.sound.unlock();
    this.sound.startMusic();
    this.sound.gobble();
  }

  turkeyBox() {
    const t = this.turkey;
    const h = t.ducking ? DUCK_H : TURKEY_H;
    return { x: t.x + 6, y: t.y + (TURKEY_H - h), w: TURKEY_W - 12, h };
  }

  jump() {
    const t = this.turkey;
    if (this.state !== 'playing') return;
    if (t.jumps === 0) {
      t.vy = -JUMP_VEL;
      t.jumps = 1;
      t.ducking = false;
      this.sound.jump();
    } else if (t.jumps === 1) {
      t.vy = -JUMP_VEL * 0.94;
      t.jumps = 2;
      this.sound.doubleJump();
    }
  }

  stumble(obstacle) {
    const t = this.turkey;
    if (t.invuln > 0) return;
    this.lives -= 1;
    this.farmerX += 78;
    this.slowT = 0.9;
    this.shake = 10;
    this.flash = 0.45;
    t.invuln = 1.4;
    this.sound.thud();
    this.sound.gobble();
    if (this.lives <= 0 || this.farmerX >= PLAYER_X - 34) {
      this.getCaught();
    }
  }

  getCaught() {
    this.state = 'caught';
    this.endT = 0;
    this.sound.stopMusic();
    this.sound.caughtSting();
    this.saveBest();
  }

  escape() {
    this.state = 'escaped';
    this.endT = 0;
    this.sound.stopMusic();
    this.sound.fanfare();
    this.saveBest();
  }

  saveBest() {
    if (this.score > this.best) {
      this.best = this.score;
      try {
        window.localStorage.setItem('gobble-dash-best', String(this.best));
      } catch (e) {}
    }
  }

  // One fixed simulation step. Rendering is separate so screenshots can
  // stage a scene by stepping the real game forward.
  step(dt) {
    this.time += dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 30);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 1.6);
    if (this.state === 'title') {
      this.titleT += dt;
      return;
    }
    if (this.state === 'caught' || this.state === 'escaped') {
      this.endT += dt;
      return;
    }
    if (this.state !== 'playing') return;

    const t = this.turkey;
    // Speed ramps with distance, and dips briefly after a stumble.
    const target = this.stage.speed + this.distance * 0.28;
    this.speed = Math.min(640, target) * (this.slowT > 0 ? 0.55 : 1);
    if (this.slowT > 0) this.slowT -= dt;
    if (t.invuln > 0) t.invuln -= dt;

    // Ducking: hold Down to slide low; lasts while held (min 0.25 s).
    const wantDuck = this.input.duckHeld() && t.jumps === 0;
    if (wantDuck) {
      t.ducking = true;
      t.duckT += dt;
    } else if (t.duckT > 0.25 || !this.input.duckHeld()) {
      t.ducking = false;
      t.duckT = 0;
    }

    // Gravity and landing.
    t.vy += GRAVITY * dt;
    t.y += t.vy * dt;
    const floor = VIEW.groundY - TURKEY_H;
    if (t.y >= floor) {
      t.y = floor;
      t.vy = 0;
      t.jumps = 0;
    }
    t.pose = t.ducking ? 'duck' : t.jumps > 0 ? 'jump' : 'run';

    // Distance and score: metres run, plus snacks.
    this.distance += (this.speed * dt) / 50;
    this.score = Math.floor(this.distance) + this.corn * 10;

    // Farmer Bram: falls back while Tom runs clean, lunges on a stumble.
    this.farmerX -= 11 * dt;
    if (this.farmerX < -30) this.farmerX = -30;
    this.farmerMood = this.farmerX > 60 ? 'close' : 'calm';

    this.entities.update(dt, this.speed, this.distance, this.stage.key);

    // Pickups.
    const box = this.turkeyBox();
    for (const p of this.entities.pickups) {
      if (p.taken) continue;
      const pb = { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 };
      if (Entities.overlaps(box, pb)) {
        p.taken = true;
        if (p.kind === 'corn') {
          this.corn += 1;
          this.sound.pickup();
        } else {
          this.corn += 5;
          this.farmerX = Math.max(-30, this.farmerX - 26);
          this.sound.drumstick();
        }
        this.score = Math.floor(this.distance) + this.corn * 10;
      }
    }

    // Obstacles: a stumble costs a life and lets Bram close in.
    for (const o of this.entities.obstacles) {
      if (o.hit) continue;
      if (Entities.overlaps(box, o)) {
        o.hit = true;
        this.stumble(o);
        if (this.state !== 'playing') return;
      }
    }

    if (this.distance >= GOAL_DISTANCE) this.escape();
  }

  // Buttons drawn on the title and end screens. Clicks are consumed here.
  button(label, x, y, w, h) {
    const ctx = this.ctx;
    const hover =
      this.input.mouse.x >= x && this.input.mouse.x <= x + w &&
      this.input.mouse.y >= y && this.input.mouse.y <= y + h;
    ctx.fillStyle = hover ? '#ffb347' : '#e2722b';
    ctx.strokeStyle = '#7a2e08';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    ctx.textBaseline = 'alphabetic';
    let clicked = false;
    let click = this.input.nextClick();
    while (click) {
      if (click.x >= x && click.x <= x + w && click.y >= y && click.y <= y + h) clicked = true;
      click = this.input.nextClick();
    }
    return clicked;
  }

  handleInput() {
    const input = this.input;
    if (this.state === 'title') {
      if (input.jumpPressed() || input.wasPressed('Enter')) {
        this.sound.unlock();
        this.sound.click();
        this.startRun();
        return;
      }
      if (this.button('▶  START THE ESCAPE', 330, 428, 300, 54)) {
        this.sound.unlock();
        this.sound.click();
        this.startRun();
        return;
      }
      if (input.wasPressed('KeyM')) this.sound.toggleMute();
      return;
    }
    if (this.state === 'playing') {
      if (input.jumpPressed()) this.jump();
      if (input.nextClick()) this.jump(); // tap anywhere to hop
      if (input.wasPressed('KeyP', 'Escape')) {
        this.state = 'paused';
        this.sound.stopMusic();
      }
      if (input.wasPressed('KeyM')) this.sound.toggleMute();
      return;
    }
    if (this.state === 'paused') {
      if (input.wasPressed('KeyP', 'Escape', 'Enter')) {
        this.state = 'playing';
        this.sound.startMusic();
      }
      return;
    }
    // caught / escaped
    if (input.wasPressed('KeyR', 'Enter', 'Space') || this.button('↻  RUN AGAIN', 350, 428, 260, 54)) {
      this.sound.click();
      this.startRun();
    }
    if (input.wasPressed('KeyM')) this.sound.toggleMute();
  }

  frame(dt) {
    this.handleInput();
    this.step(dt);
    this.render();
    this.input.endFrame();
  }

  render() {
    const ctx = this.ctx;
    const { width, height, groundY } = VIEW;
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    this.world.draw(ctx, this.distance, this.time);
    this.entities.draw(ctx, this.time);

    // Farmer Bram, chasing from the left.
    if (this.state === 'playing' || this.state === 'paused' || this.state === 'caught') {
      const blink = this.turkey.invuln > 0 && Math.floor(this.time * 12) % 2 === 0;
      if (!blink || this.state === 'caught') {
        drawTurkey(ctx, this.turkey.x, this.turkey.y, TURKEY_W, TURKEY_H, this.state === 'caught' ? 'caught' : this.turkey.pose, this.time);
      }
      drawFarmer(ctx, this.farmerX, groundY - 96, 66, 96, this.time, this.farmerMood === 'close');
    }

    if (this.state === 'playing' || this.state === 'paused') this.drawHud();
    if (this.state === 'title') this.drawTitle();
    if (this.state === 'paused') this.drawPaused();
    if (this.state === 'caught') this.drawEnd(false);
    if (this.state === 'escaped') this.drawEnd(true);
    ctx.restore();

    // Red flash on a stumble.
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(200, 30, 20, ${this.flash * 0.5})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  drawHud() {
    const ctx = this.ctx;
    const { width } = VIEW;
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    ctx.beginPath();
    ctx.roundRect(12, 10, width - 24, 64, 12);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('SCORE', 26, 30);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(String(this.score), 26, 58);
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('DISTANCE', 190, 30);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${Math.floor(this.distance)} m / ${GOAL_DISTANCE} m`, 190, 58);
    // Progress bar to the woods.
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(430, 22, 200, 12);
    ctx.fillStyle = '#7ed957';
    ctx.fillRect(430, 22, 200 * clamp(this.distance / GOAL_DISTANCE, 0, 1), 12);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('TO THE WOODS', 430, 52);
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(this.stage.name, 650, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '13px sans-serif';
    ctx.fillText('Corn x' + this.corn, 650, 52);
    // Lives as feathers.
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('LIVES', 800, 30);
    for (let i = 0; i < MAX_LIVES; i++) {
      drawFeather(ctx, 816 + i * 26, 50, 11, i < this.lives);
    }
    // Farmer proximity: how close Bram is.
    const closeness = clamp((this.farmerX + 30) / (PLAYER_X - 34 + 30), 0, 1);
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('FARMER BRAM', width - 26, 92);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(width - 226, 98, 200, 10);
    ctx.fillStyle = closeness > 0.66 ? '#ff3b2d' : closeness > 0.33 ? '#ff9f1a' : '#7ed957';
    ctx.fillRect(width - 226, 98, 200 * closeness, 10);
    ctx.textAlign = 'left';
    if (this.farmerMood === 'close') {
      ctx.fillStyle = '#ff5a4a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('! HE IS RIGHT BEHIND YOU !', width - 226, 128);
    }
  }

  drawTitle() {
    const ctx = this.ctx;
    const { width, height } = VIEW;
    ctx.fillStyle = 'rgba(30, 14, 4, 0.45)';
    ctx.fillRect(0, 0, width, height);
    // Big Tom, bobbing on the title screen, standing on the ground at left.
    const bob = Math.sin(this.titleT * 2.4) * 6;
    drawTurkey(ctx, 110, 365 + bob, 120, 105, 'run', this.titleT);
    drawFarmer(ctx, 30, 470 - 96, 66, 96, this.titleT, false);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px sans-serif';
    ctx.shadowColor = '#7a2e08';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillText('GOBBLE DASH', width / 2, 120);
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText("A TURKEY'S GREAT ESCAPE", width / 2, 158);
    ctx.fillStyle = '#fff';
    ctx.font = '19px sans-serif';
    ctx.fillText('Thanksgiving is coming. Farmer Bram has the oven hot', width / 2, 210);
    ctx.fillText('and the carving knife sharpened. Run, Tom, run!', width / 2, 238);
    ctx.font = 'bold 17px sans-serif';
    ctx.fillStyle = '#ffe9b0';
    ctx.fillText('↑ / SPACE / CLICK — jump (twice for a double jump)', width / 2, 300);
    ctx.fillText('↓ — slide under the hanging pans    •    P — pause    •    M — mute', width / 2, 328);
    ctx.fillText('Grab corn for points. Reach the woods, 1000 m away, to escape!', width / 2, 356);
    ctx.fillText('Three stumbles and Bram catches you.', width / 2, 384);
    if (this.best > 0) {
      ctx.fillStyle = '#ffd23e';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`BEST SCORE: ${this.best}`, width / 2, 414);
    }
    // The START button is drawn by handleInput's button() call each frame.
    this.button('▶  START THE ESCAPE', 330, 428, 300, 54);
  }

  drawPaused() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(20, 12, 6, 0.6)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('PAUSED', VIEW.width / 2, 250);
    ctx.font = '19px sans-serif';
    ctx.fillText('Press P to keep running. The oven stays hot.', VIEW.width / 2, 290);
  }

  drawEnd(escaped) {
    const ctx = this.ctx;
    const { width, height, groundY } = VIEW;
    ctx.fillStyle = escaped ? 'rgba(20, 60, 25, 0.55)' : 'rgba(40, 8, 4, 0.6)';
    ctx.fillRect(0, 0, width, height);
    if (escaped) {
      drawTurkey(ctx, 120, 320, 120, 105, 'run', this.endT);
      ctx.fillStyle = '#7ed957';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FREE AT LAST', 180, 300);
    } else {
      drawFarmer(ctx, 120, groundY - 96, 66, 96, this.endT, false);
      drawTurkey(ctx, 210, groundY - TURKEY_H, TURKEY_W, TURKEY_H, 'caught', this.endT);
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#000';
    ctx.shadowOffsetY = 3;
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', width / 2, 130);
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(
      escaped ? 'Tom made it to the woods. No dinner today!' : 'Farmer Bram got you. The oven was already hot…',
      width / 2,
      172,
    );
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`SCORE  ${this.score}`, width / 2, 240);
    ctx.font = '20px sans-serif';
    ctx.fillText(`Distance: ${Math.floor(this.distance)} m  •  Corn: ${this.corn}`, width / 2, 276);
    ctx.fillText(`Best score: ${this.best}`, width / 2, 306);
    if (!escaped) {
      ctx.fillStyle = '#ffe9b0';
      ctx.font = '17px sans-serif';
      ctx.fillText('Tip: double-jump the ovens, slide under the pans,', width / 2, 350);
      ctx.fillText('and grab drumsticks to push Bram back.', width / 2, 374);
    }
    this.button('↻  RUN AGAIN', 350, 428, 260, 54);
  }
}
