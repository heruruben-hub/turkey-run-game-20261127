// Gobble Dash — the scrolling world: sky, sun, clouds, hills, trees and
// stage props, all parallaxed against the distance the turkey has run.

import { VIEW, stageFor } from './config.js';
import { drawPumpkin, drawTree } from './art.js';

export class World {
  constructor(random) {
    this.random = random;
    this.clouds = [];
    this.hillsFar = [];
    this.hillsNear = [];
    this.props = [];
    for (let i = 0; i < 7; i++) {
      this.clouds.push({ x: random() * 1200, y: 30 + random() * 110, s: 0.7 + random() * 0.9 });
    }
    for (let i = 0; i < 9; i++) {
      this.hillsFar.push({ x: i * 160 + random() * 60, h: 60 + random() * 70 });
      this.hillsNear.push({ x: i * 190 + random() * 80, h: 40 + random() * 50 });
    }
    for (let i = 0; i < 14; i++) {
      this.props.push({
        x: i * 260 + random() * 160,
        kind: random() < 0.5 ? 'pumpkin' : 'tree',
        s: 14 + random() * 18,
      });
    }
  }

  draw(ctx, distance, time) {
    const stage = stageFor(distance);
    const { width, height, groundY } = VIEW;

    // Sky.
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, stage.skyTop);
    sky.addColorStop(1, stage.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, groundY);

    // Low autumn sun.
    ctx.fillStyle = 'rgba(255, 236, 170, 0.95)';
    ctx.beginPath();
    ctx.arc(width - 130, 84, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 236, 170, 0.35)';
    ctx.beginPath();
    ctx.arc(width - 130, 84, 62, 0, Math.PI * 2);
    ctx.fill();

    // Clouds drift slowly.
    ctx.fillStyle = 'rgba(255, 250, 235, 0.85)';
    for (const c of this.clouds) {
      const cx = (((c.x - distance * 8 - time * 4) % 1200) + 1200) % 1200 - 120;
      ctx.beginPath();
      ctx.ellipse(cx, c.y, 46 * c.s, 16 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 30 * c.s, c.y + 6, 30 * c.s, 12 * c.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Far hills.
    ctx.fillStyle = stage.hillFar;
    for (const h of this.hillsFar) {
      const hx = (((h.x - distance * 20) % 1440) + 1440) % 1440 - 240;
      ctx.beginPath();
      ctx.moveTo(hx - 110, groundY);
      ctx.quadraticCurveTo(hx, groundY - h.h, hx + 110, groundY);
      ctx.closePath();
      ctx.fill();
    }

    // Stage props: barn silhouette, kitchen chimney, or farmhouse.
    this.drawStageBackdrop(ctx, stage, distance, time);

    // Near hills.
    ctx.fillStyle = stage.hillNear;
    for (const h of this.hillsNear) {
      const hx = (((h.x - distance * 45) % 1710) + 1710) % 1710 - 300;
      ctx.beginPath();
      ctx.moveTo(hx - 130, groundY);
      ctx.quadraticCurveTo(hx, groundY - h.h, hx + 130, groundY);
      ctx.closePath();
      ctx.fill();
    }

    // Ground.
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.fillStyle = stage.groundTop;
    ctx.fillRect(0, groundY, width, 10);
    // Scrolling ground dashes.
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    const dashGap = 90;
    const off = (distance * 50) % dashGap;
    for (let x = -off; x < width; x += dashGap) {
      ctx.fillRect(x, groundY + 26, 44, 5);
      ctx.fillRect(x + 20, groundY + 48, 30, 4);
    }

    // Foreground props: pumpkins and trees whipping past.
    for (const p of this.props) {
      const px = (((p.x - distance * 50) % 3640) + 3640) % 3640 - 200;
      if (p.kind === 'pumpkin') drawPumpkin(ctx, px, groundY - p.s * 0.7, p.s);
      else drawTree(ctx, px, groundY, p.s * 2.2, stage.key === 'kitchen' ? '#7a4a2a' : '#c96a1e');
    }
  }

  drawStageBackdrop(ctx, stage, distance, time) {
    const { groundY } = VIEW;
    if (stage.key === 'farmyard') {
      // A red farmhouse with a smoking chimney.
      const bx = 760 - ((distance * 30) % 1400);
      ctx.fillStyle = '#a33327';
      ctx.fillRect(bx, groundY - 120, 150, 120);
      ctx.fillStyle = '#6e2019';
      ctx.beginPath();
      ctx.moveTo(bx - 12, groundY - 120);
      ctx.lineTo(bx + 75, groundY - 165);
      ctx.lineTo(bx + 162, groundY - 120);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7a4a22';
      ctx.fillRect(bx + 120, groundY - 150, 16, 40);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(bx + 128, groundY - 165 - i * 16 - Math.sin(time + i) * 3, 7 + i * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffd23e';
      ctx.fillRect(bx + 24, groundY - 92, 26, 26);
      ctx.fillRect(bx + 100, groundY - 92, 26, 26);
    } else if (stage.key === 'barn') {
      // A big barn with the classic X-braced door.
      const bx = 720 - ((distance * 30) % 1500);
      ctx.fillStyle = '#8f2f22';
      ctx.fillRect(bx, groundY - 150, 190, 150);
      ctx.beginPath();
      ctx.moveTo(bx, groundY - 150);
      ctx.quadraticCurveTo(bx + 95, groundY - 210, bx + 190, groundY - 150);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffd23e';
      ctx.lineWidth = 5;
      ctx.strokeRect(bx + 70, groundY - 100, 50, 100);
      ctx.beginPath();
      ctx.moveTo(bx + 70, groundY - 100);
      ctx.lineTo(bx + 120, groundY);
      ctx.moveTo(bx + 120, groundY - 100);
      ctx.lineTo(bx + 70, groundY);
      ctx.stroke();
    } else {
      // The kitchen: a brick wall with a window and a hanging sign.
      ctx.fillStyle = '#5e2418';
      ctx.fillRect(0, groundY - 190, VIEW.width, 190);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 16; col++) {
          ctx.fillRect(col * 64 + (row % 2) * 32, groundY - 182 + row * 38, 58, 4);
        }
      }
      ctx.fillStyle = '#ffd98a';
      ctx.fillRect(120, groundY - 150, 90, 70);
      ctx.fillStyle = '#3a3633';
      ctx.fillRect(116, groundY - 154, 98, 8);
      ctx.fillStyle = '#fff3d6';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('THANKSGIVING', 620, groundY - 158);
      ctx.fillText('DINNER  •  6 PM', 620, groundY - 136);
    }
  }
}
