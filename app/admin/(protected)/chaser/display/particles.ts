// Tiny canvas particle system for the audience display: spark bursts,
// shockwave rings and confetti. Runs its rAF loop only while something is
// alive.

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
  drag: number;
  confetti: boolean;
  rot: number;
  spin: number;
}

interface Ring {
  x: number;
  y: number;
  life: number;
  max: number;
  radius: number;
  color: string;
}

const MAX_PARTICLES = 1600;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export class ParticleField {
  private ctx: CanvasRenderingContext2D | null;
  private parts: Particle[] = [];
  private rings: Ring[] = [];
  private raf = 0;
  private dpr = 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(window.innerWidth * this.dpr);
    this.canvas.height = Math.round(window.innerHeight * this.dpr);
  }

  /** Sparks flying out of (x, y) in CSS pixels. */
  burst(
    x: number,
    y: number,
    colors: string[],
    { count = 80, speed = 14, angle = -Math.PI / 2, spread = Math.PI * 2, gravity = 0.32 } = {},
  ) {
    for (let i = 0; i < count && this.parts.length < MAX_PARTICLES; i++) {
      const a = angle + rand(-spread / 2, spread / 2);
      const v = rand(speed * 0.3, speed);
      const max = rand(35, 75);
      this.parts.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: max,
        max,
        size: rand(1.5, 4.5),
        color: pick(colors),
        gravity,
        drag: 0.955,
        confetti: false,
        rot: 0,
        spin: 0,
      });
    }
    this.start();
  }

  /** Expanding shockwave ring. */
  ring(x: number, y: number, color: string, radius = 260) {
    this.rings.push({ x, y, life: 40, max: 40, radius, color });
    this.start();
  }

  /** Confetti raining from the top edge. */
  confetti(colors: string[], count = 160) {
    const w = window.innerWidth;
    for (let i = 0; i < count && this.parts.length < MAX_PARTICLES; i++) {
      const max = rand(140, 240);
      this.parts.push({
        x: rand(0, w),
        y: rand(-120, -10),
        vx: rand(-2.5, 2.5),
        vy: rand(2, 6),
        life: max,
        max,
        size: rand(6, 12),
        color: pick(colors),
        gravity: 0.06,
        drag: 0.995,
        confetti: true,
        rot: rand(0, Math.PI),
        spin: rand(-0.2, 0.2),
      });
    }
    this.start();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.parts = [];
    this.rings = [];
  }

  private start() {
    if (!this.raf && this.ctx) this.raf = requestAnimationFrame(this.frame);
  }

  private frame = () => {
    const ctx = this.ctx!;
    const { dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const r of this.rings) {
      const t = 1 - r.life / r.max;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 14 * (1 - t) + 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius * (0.15 + t * 0.85), 0, Math.PI * 2);
      ctx.stroke();
      r.life--;
    }
    this.rings = this.rings.filter((r) => r.life > 0);

    for (const p of this.parts) {
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      const alpha = Math.min(1, (p.life / p.max) * 1.6);
      if (p.confetti) {
        p.rot += p.spin;
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x + Math.sin(p.life / 9) * 2, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.life / 6));
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      } else {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
        ctx.stroke();
      }
    }
    this.parts = this.parts.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
    ctx.globalAlpha = 1;

    this.raf = this.parts.length || this.rings.length ? requestAnimationFrame(this.frame) : 0;
    if (!this.raf) ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
}
