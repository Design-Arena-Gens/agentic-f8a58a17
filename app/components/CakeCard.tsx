"use client";

import { useEffect, useRef, useState } from "react";

export type CakeSpec = {
  id: string;
  name: string;
  price: number;
  baseColor: string;
  frostingColor: string;
};

export default function CakeCard({ cake }: { cake: CakeSpec }) {
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frostCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [brush, setBrush] = useState<number>(26);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [frostedPct, setFrostedPct] = useState<number>(0);

  useEffect(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.scale(dpr, dpr);

    drawCake(ctx, rect.width, rect.height, cake.baseColor);
  }, [cake.baseColor]);

  useEffect(() => {
    const canvas = frostCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.scale(dpr, dpr);

    // Start with transparent frosting layer
    ctx.clearRect(0, 0, rect.width, rect.height);
  }, [cake.id]);

  function handlePointerDown(e: React.PointerEvent) {
    setIsPainting(true);
    drawStroke(e);
  }
  function handlePointerUp() { setIsPainting(false); }
  function handlePointerLeave() { setIsPainting(false); }
  function handlePointerMove(e: React.PointerEvent) {
    if (!isPainting) return;
    drawStroke(e);
  }

  function drawStroke(e: React.PointerEvent) {
    const canvas = frostCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = cake.frostingColor;
    ctx.lineWidth = brush;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();

    // Update frosted percentage approximately using sampling
    estimateFrosted();
  }

  function estimateFrosted() {
    const canvas = frostCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    const sampleW = 80;
    const sampleH = 50;
    const stepX = Math.max(1, Math.floor((rect.width / sampleW)));
    const stepY = Math.max(1, Math.floor((rect.height / sampleH)));

    const img = ctx.getImageData(0, 0, rect.width, rect.height).data;
    let painted = 0;
    let total = 0;
    for (let y = 0; y < rect.height; y += stepY) {
      for (let x = 0; x < rect.width; x += stepX) {
        const idx = ((y * rect.width) + x) * 4 + 3; // alpha channel
        const a = img[idx];
        if (a > 10) painted++;
        total++;
      }
    }
    setFrostedPct(Math.min(100, Math.round((painted / Math.max(1, total)) * 100)));
  }

  function resetFrosting() {
    const canvas = frostCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setFrostedPct(0);
  }

  return (
    <article className="card">
      <div className="cardHeader">
        <div className="title">{cake.name}</div>
        <div className="priceTag">${cake.price.toFixed(2)}</div>
      </div>
      <div className="canvasWrap"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
      >
        <canvas ref={baseCanvasRef} className="canvas" aria-hidden />
        <canvas ref={frostCanvasRef} className="canvas" aria-label={`Frosting for ${cake.name}`} />
      </div>
      <div className="controls" aria-label="Frosting controls">
        <button className="button" onClick={resetFrosting}>Reset</button>
        <button className="button secondary" onClick={() => setBrush((b) => Math.max(10, b - 6))}>- Brush</button>
        <button className="button secondary" onClick={() => setBrush((b) => Math.min(64, b + 6))}>+ Brush</button>
        <span style={{marginLeft: "auto", fontWeight: 700}}>{frostedPct}% frosted</span>
      </div>
    </article>
  );
}

function drawCake(ctx: CanvasRenderingContext2D, w: number, h: number, baseColor: string) {
  ctx.clearRect(0, 0, w, h);

  // Cake stand
  const standY = h * 0.82;
  ctx.fillStyle = "#e0d6d3";
  roundedRect(ctx, w * 0.15, standY, w * 0.7, h * 0.06, 12);
  ctx.fill();
  ctx.fillStyle = "#d1c5c1";
  roundedRect(ctx, w * 0.46, standY - h * 0.12, w * 0.08, h * 0.12, 6);
  ctx.fill();

  // Cake layers
  const cakeWidth = w * 0.68;
  const cakeX = (w - cakeWidth) / 2;
  const layerHeight = h * 0.14;
  const topY = standY - h * 0.16 - layerHeight * 2;

  ctx.fillStyle = shade(baseColor, -8);
  roundedRect(ctx, cakeX, topY + layerHeight * 2, cakeWidth, layerHeight, 14);
  ctx.fill();

  ctx.fillStyle = shade(baseColor, -4);
  roundedRect(ctx, cakeX + 6, topY + layerHeight, cakeWidth - 12, layerHeight, 14);
  ctx.fill();

  ctx.fillStyle = baseColor;
  roundedRect(ctx, cakeX + 12, topY, cakeWidth - 24, layerHeight, 14);
  ctx.fill();

  // Drips accent
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  for (let i = 0; i < 6; i++) {
    const dx = cakeX + (cakeWidth / 7) * (i + 0.8);
    drip(ctx, dx, topY + layerHeight, layerHeight * (0.5 + Math.random() * 0.5));
  }

  // Sprinkles
  for (let i = 0; i < 80; i++) {
    const sx = cakeX + Math.random() * (cakeWidth - 24) + 12;
    const sy = topY + Math.random() * (layerHeight * 3);
    ctx.fillStyle = sprinkleColor(i);
    roundedRect(ctx, sx, sy, 3, 1.4, 0.7);
    ctx.fill();
  }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drip(ctx: CanvasRenderingContext2D, x: number, y: number, len: number) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - 6, y + len * 0.6, x + 3, y + len);
  ctx.quadraticCurveTo(x + 10, y + len * 0.5, x + 6, y);
  ctx.closePath();
  ctx.fill();
}

function sprinkleColor(i: number) {
  const colors = ["#f49ab4", "#9dd2f6", "#f6d48f", "#98e0c5", "#b29df6"];
  return colors[i % colors.length];
}

function shade(hex: string, amt: number) {
  // simple hex shade: amt -100..100
  let c = hex.replace('#','');
  if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
  const num = parseInt(c, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00FF) + amt;
  let b = (num & 0x0000FF) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${(r<<16 | g<<8 | b).toString(16).padStart(6,'0')}`;
}
