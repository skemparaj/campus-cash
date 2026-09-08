import React, { useEffect, useRef } from 'react';

export default function Canvas3DBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- SMART CAMPUS ECOSYSTEM NETWORK NODES ---
    // Nodes represent Campus Ecosystem Entities: Student, Wallet, QR, Vendor, Receipt, Parent, Admin
    const nodeTypes = ['STUDENT', 'WALLET', 'QR', 'VENDOR', 'RECEIPT', 'PARENT', 'CAMPUS'];
    const nodes = [];

    const NODE_COUNT = Math.min(Math.floor(width / 140), 12);
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        id: i,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        label: nodeTypes[i % nodeTypes.length],
        type: i % 2 === 0 ? 'ORANGE' : 'NAVY'
      });
    }

    // --- TRAVELING PAYMENT PULSES (Node to Node Transaction Flow) ---
    const pulses = [
      { from: 0, to: 1, progress: 0, speed: 0.006 },
      { from: 1, to: 2, progress: 0.3, speed: 0.008 },
      { from: 2, to: 3, progress: 0.6, speed: 0.005 },
      { from: 3, to: 4, progress: 0.1, speed: 0.007 },
      { from: 4, to: 5, progress: 0.5, speed: 0.006 }
    ];

    // --- FLOATING CAMPUS FINTECH SHAPES (College Buildings, QR Grid, Wallet, Coins) ---
    const shapes = [
      { type: 'BUILDING', x: width * 0.08, y: height * 0.82, scale: 0.8 },
      { type: 'BUILDING', x: width * 0.88, y: height * 0.85, scale: 0.7 },
      { type: 'WALLET', x: width * 0.15, y: height * 0.25, scale: 0.6, angle: 0.1 },
      { type: 'QR', x: width * 0.82, y: height * 0.2, scale: 0.55, angle: -0.1 },
      { type: 'COIN', x: width * 0.48, y: height * 0.12, scale: 0.5 }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Campus Isometric Grid Lines
      ctx.strokeStyle = 'rgba(16, 27, 61, 0.04)';
      ctx.lineWidth = 1;
      const stepSize = 80;
      for (let x = 0; x < width; x += stepSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += stepSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Subtle College Building Silhouettes in Background (Low Opacity)
      shapes.forEach(shape => {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.angle || 0);

        if (shape.type === 'BUILDING') {
          ctx.fillStyle = 'rgba(16, 27, 61, 0.04)';
          ctx.strokeStyle = 'rgba(16, 27, 61, 0.08)';
          ctx.lineWidth = 1.5;

          // Main Building Pillar Structure
          ctx.fillRect(-60 * shape.scale, -80 * shape.scale, 120 * shape.scale, 80 * shape.scale);
          ctx.strokeRect(-60 * shape.scale, -80 * shape.scale, 120 * shape.scale, 80 * shape.scale);

          // Roof Triangle / Pediment
          ctx.beginPath();
          ctx.moveTo(-70 * shape.scale, -80 * shape.scale);
          ctx.lineTo(0, -115 * shape.scale);
          ctx.lineTo(70 * shape.scale, -80 * shape.scale);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Campus Pillars
          for (let p = -45; p <= 45; p += 30) {
            ctx.fillRect(p * shape.scale - 6, -75 * shape.scale, 12 * shape.scale, 65 * shape.scale);
          }
        } else if (shape.type === 'WALLET') {
          ctx.strokeStyle = 'rgba(255, 107, 53, 0.09)';
          ctx.lineWidth = 2;
          ctx.strokeRect(-40 * shape.scale, -25 * shape.scale, 80 * shape.scale, 50 * shape.scale);
          ctx.beginPath();
          ctx.arc(20 * shape.scale, 0, 8 * shape.scale, 0, Math.PI * 2);
          ctx.stroke();
        } else if (shape.type === 'QR') {
          ctx.strokeStyle = 'rgba(16, 27, 61, 0.08)';
          ctx.lineWidth = 2;
          ctx.strokeRect(-30 * shape.scale, -30 * shape.scale, 60 * shape.scale, 60 * shape.scale);
          ctx.strokeRect(-20 * shape.scale, -20 * shape.scale, 15 * shape.scale, 15 * shape.scale);
          ctx.strokeRect(5 * shape.scale, -20 * shape.scale, 15 * shape.scale, 15 * shape.scale);
          ctx.strokeRect(-20 * shape.scale, 5 * shape.scale, 15 * shape.scale, 15 * shape.scale);
        }

        ctx.restore();
      });

      // 3. Move & Render Smart Campus Network Nodes
      nodes.forEach(n => {
        if (!prefersReducedMotion) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 40 || n.x > width - 40) n.vx *= -1;
          if (n.y < 40 || n.y > height - 40) n.vy *= -1;
        }

        // Node Glow Ring
        ctx.fillStyle = n.type === 'ORANGE' ? 'rgba(255, 107, 53, 0.07)' : 'rgba(16, 27, 61, 0.05)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Inner Node Core
        ctx.fillStyle = n.type === 'ORANGE' ? '#FF6B35' : '#101B3D';
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Label
        ctx.font = '700 9px "Outfit", sans-serif';
        ctx.fillStyle = n.type === 'ORANGE' ? 'rgba(255, 107, 53, 0.45)' : 'rgba(16, 27, 61, 0.35)';
        ctx.fillText(n.label, n.x - 18, n.y + 18);
      });

      // 4. Connect Nearby Network Nodes with Subtle Lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 260) {
            const alpha = (1 - dist / 260) * 0.09;
            ctx.strokeStyle = '#FF6B35';
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // 5. Render Animated Payment Pulses Traveling Along Connection Lines
      pulses.forEach(p => {
        const n1 = nodes[p.from % nodes.length];
        const n2 = nodes[p.to % nodes.length];
        if (!n1 || !n2) return;

        if (!prefersReducedMotion) {
          p.progress += p.speed;
          if (p.progress >= 1) p.progress = 0;
        }

        const px = n1.x + (n2.x - n1.x) * p.progress;
        const py = n1.y + (n2.y - n1.y) * p.progress;

        // Traveling Payment Node Dot (Electric Orange Glow)
        ctx.fillStyle = '#FF6B35';
        ctx.shadowColor = '#FF6B35';
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.95
      }}
    />
  );
}
