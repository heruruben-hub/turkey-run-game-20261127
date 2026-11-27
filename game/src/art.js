// Gobble Dash — every sprite is drawn fresh in code: no images, no files.
// The turkey is Tom, a plump brown bird with a fanned tail; the farmer is
// Bram, in overalls and a straw hat, pitchfork in hand.

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Tom the turkey. pose: 'run' | 'jump' | 'duck' | 'caught'. t is the run clock.
export function drawTurkey(ctx, x, y, w, h, pose, t, facing = 1) {
  ctx.save();
  ctx.translate(x + w / 2, y + h);
  ctx.scale(facing, 1);
  const run = pose === 'run' ? Math.sin(t * 16) : 0;
  const squash = pose === 'duck' ? 0.62 : 1;

  // Tail fan: five feathers fanning behind.
  ctx.save();
  ctx.translate(-w * 0.42, -h * 0.55 * squash);
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.34 + Math.sin(t * 6 + i) * 0.03);
    ctx.fillStyle = ['#c96a1e', '#a84e12', '#e07b28', '#8f3f0e', '#d96f1f'][i + 2];
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.42, 7, h * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a2e08';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.52, 3.5, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Legs: two scrawny orange legs, pedalling when running, tucked when jumping.
  ctx.strokeStyle = '#e08a1e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  if (pose === 'jump') {
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-10, 2);
    ctx.moveTo(6, -4);
    ctx.lineTo(10, 2);
    ctx.stroke();
  } else {
    const a = run * 9;
    const b = -run * 9;
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(-6 + a, 0);
    ctx.moveTo(6, -6);
    ctx.lineTo(6 + b, 0);
    ctx.stroke();
    // Little three-toed feet.
    ctx.fillStyle = '#e08a1e';
    ellipse(ctx, -6 + a, 1, 7, 2.5);
    ellipse(ctx, 6 + b, 1, 7, 2.5);
  }

  // Body: plump brown ellipse, lighter belly.
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.45 * squash, w * 0.5, h * 0.42 * squash, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b5773a';
  ctx.beginPath();
  ctx.ellipse(4, -h * 0.36 * squash, w * 0.32, h * 0.26 * squash, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing: flaps hard when running, tucked when ducking.
  const flap = pose === 'run' ? Math.sin(t * 16) * 0.35 : pose === 'jump' ? -0.5 : 0.1;
  ctx.save();
  ctx.translate(-2, -h * 0.5 * squash);
  ctx.rotate(flap);
  ctx.fillStyle = '#6e4520';
  ctx.beginPath();
  ctx.ellipse(-2, 0, w * 0.26, h * 0.2 * squash, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Neck and head, bobbing with the run.
  const bob = pose === 'run' ? Math.sin(t * 16 + 1) * 2 : 0;
  const neckX = w * 0.34;
  const neckTop = -h * (0.78 * squash + 0.12) + bob;
  ctx.strokeStyle = '#a84e12';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(w * 0.26, -h * 0.55 * squash);
  ctx.lineTo(neckX, neckTop + 8);
  ctx.stroke();
  ctx.fillStyle = '#c96a1e';
  circle(ctx, neckX + 2, neckTop, 11);
  // Beak.
  ctx.fillStyle = '#f2a007';
  ctx.beginPath();
  ctx.moveTo(neckX + 9, neckTop - 2);
  ctx.lineTo(neckX + 22, neckTop + 3);
  ctx.lineTo(neckX + 9, neckTop + 7);
  ctx.closePath();
  ctx.fill();
  // Wattle and snood.
  ctx.fillStyle = '#d92b2b';
  ctx.beginPath();
  ctx.ellipse(neckX + 12, neckTop + 9, 4, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eye: wide and worried while running.
  ctx.fillStyle = '#ffffff';
  circle(ctx, neckX + 5, neckTop - 4, 4.5);
  ctx.fillStyle = '#1a1a1a';
  circle(ctx, neckX + 6.5, neckTop - 4, 2.2);
  ctx.restore();
}

// Farmer Bram, chasing from the left with his pitchfork.
export function drawFarmer(ctx, x, y, w, h, t, close) {
  ctx.save();
  ctx.translate(x + w / 2, y + h);
  const run = Math.sin(t * 14);
  // Legs in blue overalls, pounding.
  ctx.strokeStyle = '#2b4a8f';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-7, -h * 0.42);
  ctx.lineTo(-7 + run * 10, 0);
  ctx.moveTo(7, -h * 0.42);
  ctx.lineTo(7 - run * 10, 0);
  ctx.stroke();
  // Body: red checked shirt under blue overalls.
  ctx.fillStyle = '#c23b2e';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.62, w * 0.42, h * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b4a8f';
  ctx.fillRect(-w * 0.3, -h * 0.62, w * 0.6, h * 0.3);
  ctx.fillRect(-w * 0.3, -h * 0.86, 6, h * 0.26);
  ctx.fillRect(w * 0.3 - 6, -h * 0.86, 6, h * 0.26);
  // Arm reaching forward, pitchfork in hand.
  ctx.strokeStyle = '#e8b88a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(6, -h * 0.72);
  ctx.lineTo(w * 0.52, -h * 0.58 + run * 3);
  ctx.stroke();
  drawPitchfork(ctx, w * 0.52, -h * 0.58 + run * 3, h * 0.7);
  // Head: beard, nose, angry eyes.
  ctx.fillStyle = '#e8b88a';
  circle(ctx, 4, -h * 0.9, 12);
  ctx.fillStyle = '#f5f0e6';
  ctx.beginPath();
  ctx.ellipse(6, -h * 0.86, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  circle(ctx, 8, -h * 0.93, 2);
  circle(ctx, 14, -h * 0.93, 2);
  // Straw hat.
  ctx.fillStyle = '#e8c85a';
  ctx.beginPath();
  ctx.ellipse(4, -h * 0.97, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4, -h * 1.0, 12, 7, 0, Math.PI, 0);
  ctx.fill();
  // Shout bubble when he is closing in.
  if (close) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w * 0.55, -h * 1.28, 34, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c23b2e';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOBBLE!', w * 0.55, -h * 1.28 + 5);
  }
  ctx.restore();
}

function drawPitchfork(ctx, x, y, len) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#8a6a3b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -len);
  ctx.stroke();
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 3;
  for (const dx of [-7, 0, 7]) {
    ctx.beginPath();
    ctx.moveTo(dx, -len);
    ctx.lineTo(dx, -len - 14);
    ctx.stroke();
  }
  ctx.restore();
}

// The oven: a big black kitchen oven, door glowing, waiting for a turkey.
export function drawOven(ctx, x, y, w, h) {
  ctx.fillStyle = '#22201e';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#3a3633';
  ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
  // Glowing door window with a little flame.
  const glow = 0.7 + Math.sin(Date.now() / 180) * 0.3;
  ctx.fillStyle = `rgba(255, ${Math.floor(90 + 60 * glow)}, 20, ${0.75 + 0.25 * glow})`;
  ctx.fillRect(x + w * 0.18, y + h * 0.3, w * 0.64, h * 0.34);
  ctx.fillStyle = '#ffd23e';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.34);
  ctx.quadraticCurveTo(x + w * 0.62, y + h * 0.5, x + w * 0.5, y + h * 0.6);
  ctx.quadraticCurveTo(x + w * 0.38, y + h * 0.5, x + w * 0.5, y + h * 0.34);
  ctx.fill();
  // Handle and knobs.
  ctx.fillStyle = '#c9c9c9';
  ctx.fillRect(x + w * 0.12, y + h * 0.12, w * 0.76, 6);
  for (const kx of [0.3, 0.5, 0.7]) {
    ctx.beginPath();
    ctx.arc(x + w * kx, y + h * 0.76, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Little legs and a warning sign.
  ctx.fillStyle = '#111';
  ctx.fillRect(x + 6, y + h - 4, 8, 6);
  ctx.fillRect(x + w - 14, y + h - 4, 8, 6);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', x + w / 2, y + h * 0.94);
}

// The carving knife, stuck blade-up in the dirt.
export function drawKnife(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x + w / 2, y + h);
  // Handle.
  ctx.fillStyle = '#5e2f16';
  ctx.fillRect(-w * 0.32, -h * 0.22, w * 0.64, h * 0.22);
  ctx.fillStyle = '#d9b06a';
  circle(ctx, 0, -h * 0.2, 3);
  // Blade, glinting.
  const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  grad.addColorStop(0, '#dfe6ea');
  grad.addColorStop(0.5, '#ffffff');
  grad.addColorStop(1, '#9fb2bd');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.42, -h * 0.22);
  ctx.lineTo(-w * 0.42, -h * 0.92);
  ctx.quadraticCurveTo(0, -h * 1.06, w * 0.42, -h * 0.92);
  ctx.lineTo(w * 0.42, -h * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7d929e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.3, -h * 0.3);
  ctx.lineTo(-w * 0.3, -h * 0.86);
  ctx.stroke();
  ctx.restore();
}

export function drawFence(ctx, x, y, w, h) {
  ctx.fillStyle = '#7a4a22';
  ctx.fillRect(x + 4, y + h * 0.3, w - 8, 7);
  ctx.fillRect(x + 4, y + h * 0.62, w - 8, 7);
  for (const px of [x + 8, x + w / 2 - 4, x + w - 16]) {
    ctx.fillRect(px, y, 9, h);
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px + 4.5, y - 8);
    ctx.lineTo(px + 9, y);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawHay(ctx, x, y, w, h) {
  ctx.fillStyle = '#d9a53a';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a87a1e';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 6 - i * 3, h / 2 - 6 - i * 3, 0, 0.4, Math.PI * 1.4);
    ctx.stroke();
  }
  ctx.fillStyle = '#c23b2e';
  ctx.fillRect(x + w * 0.42, y + h * 0.42, w * 0.16, 5);
}

// A cast-iron pan hanging from above: slide under it.
export function drawPan(ctx, x, y, w, h) {
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - 220);
  ctx.lineTo(x + w / 2, y + 6);
  ctx.stroke();
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a4a4a';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 6, h / 2 - 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a8a8a';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 - 8, y + h / 2 - 8, 8, 5, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCorn(ctx, x, y, r, t) {
  const bob = Math.sin(t * 5 + x * 0.05) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = '#2f7d32';
  ctx.beginPath();
  ctx.ellipse(-r * 0.7, 0, r * 0.5, r * 1.1, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 0.7, 0, r * 0.5, r * 1.1, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd23e';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.75, r * 1.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e0a800';
  for (let row = -1; row <= 1; row++) {
    for (let col = -1; col <= 1; col++) {
      circle(ctx, col * r * 0.4, row * r * 0.6, r * 0.12);
    }
  }
  ctx.restore();
}

export function drawDrumstick(ctx, x, y, r, t) {
  const bob = Math.sin(t * 4 + x * 0.05) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(Math.sin(t * 3) * 0.15);
  ctx.fillStyle = '#c96a1e';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.3, r, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a84e12';
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, r * 0.2, r * 0.7, r * 0.5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f5f0e6';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(r * 1.1, -r * 0.3);
  ctx.lineTo(r * 1.7, -r * 0.9);
  ctx.moveTo(r * 1.1, r * 0.3);
  ctx.lineTo(r * 1.7, r * 0.9);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  circle(ctx, r * 1.75, -r * 0.95, 4);
  circle(ctx, r * 1.75, r * 0.95, 4);
  ctx.restore();
}

// A single feather, used as a life icon in the HUD.
export function drawFeather(ctx, x, y, size, lit) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = lit ? '#e07b28' : '#5a4632';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.45, size, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = lit ? '#a84e12' : '#3a2c1e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.stroke();
  ctx.restore();
}

// Background props.
export function drawPumpkin(ctx, x, y, s) {
  ctx.fillStyle = '#e07b28';
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c96a1e';
  ctx.beginPath();
  ctx.ellipse(x - s * 0.4, y, s * 0.5, s * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.4, y, s * 0.5, s * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2f7d32';
  ctx.fillRect(x - 2, y - s * 0.95, 5, 10);
}

export function drawTree(ctx, x, y, s, color) {
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x - s * 0.08, y - s * 0.5, s * 0.16, s * 0.5);
  ctx.fillStyle = color;
  circle(ctx, x, y - s * 0.7, s * 0.42);
  circle(ctx, x - s * 0.3, y - s * 0.5, s * 0.3);
  circle(ctx, x + s * 0.3, y - s * 0.5, s * 0.3);
}
