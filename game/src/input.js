// Gobble Dash — keyboard and mouse input with edge detection, so a jump
// fires once per press and a click on a button never double-fires.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.down = new Set();
    this.pressed = new Set();
    this.clickQueue = [];
    this.mouse = { x: 0, y: 0 };

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (!e.repeat) this.pressed.add(e.code);
      this.down.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => {
      this.down.clear();
      this.pressed.clear();
    });

    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      this.mouse = { x, y };
      this.clickQueue.push({ x, y });
    });
    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse = {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    });
  }

  isDown(...codes) {
    return codes.some((c) => this.down.has(c));
  }

  // True once, on the frame the key went down.
  wasPressed(...codes) {
    return codes.some((c) => this.pressed.has(c));
  }

  jumpPressed() {
    return this.wasPressed('ArrowUp', 'KeyW', 'Space');
  }

  duckHeld() {
    return this.isDown('ArrowDown', 'KeyS');
  }

  // Returns the next unhandled click, or null. Buttons consume clicks.
  nextClick() {
    return this.clickQueue.shift() || null;
  }

  // Called at the end of each frame: pressed keys live for exactly one step.
  endFrame() {
    this.pressed.clear();
  }
}
