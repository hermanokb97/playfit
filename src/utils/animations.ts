export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

export function hslToString(h: number, s: number, l: number, a = 1): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export function createParticles(
  x: number,
  y: number,
  count: number,
  color?: string
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + randomBetween(-0.3, 0.3);
    const speed = randomBetween(2, 8);
    const hue = color ? 0 : randomBetween(0, 360);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: randomBetween(4, 12),
      color: color || hslToString(hue, 80, 60),
      life: 1,
      maxLife: randomBetween(30, 60),
    });
  }
  return particles;
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.15,
      vx: p.vx * 0.98,
      life: p.life - 1 / p.maxLife,
      radius: p.radius * 0.97,
    }))
    .filter((p) => p.life > 0);
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
) {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0, p.radius), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

const RAINBOW_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC857', '#A0E77D',
  '#69D2E7', '#7C83FD', '#D980FA',
];

export function getRainbowColor(index: number): string {
  return RAINBOW_COLORS[index % RAINBOW_COLORS.length];
}
