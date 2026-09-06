import { useEffect, useRef } from 'react';

interface HealthScoreGaugeProps {
  score: number;
  size?: number;
}

export function HealthScoreGauge({ score, size = 160 }: HealthScoreGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    ctx.clearRect(0, 0, size, size);

    // Background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score arc
    const normalizedScore = Math.max(0, Math.min(100, score));
    const angle = 0.75 * Math.PI + (normalizedScore / 100) * 1.5 * Math.PI;
    
    const gradient = ctx.createLinearGradient(0, size, size, 0);
    if (normalizedScore >= 70) {
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#059669');
    } else if (normalizedScore >= 40) {
      gradient.addColorStop(0, '#f59e0b');
      gradient.addColorStop(1, '#d97706');
    } else {
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(1, '#dc2626');
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, angle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score text
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${size * 0.25}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(normalizedScore.toString(), centerX, centerY - 5);

    ctx.fillStyle = '#64748b';
    ctx.font = `${size * 0.1}px system-ui`;
    ctx.fillText('Health Score', centerX, centerY + size * 0.15);
  }, [score, size]);

  return (
    <div className="flex items-center justify-center">
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </div>
  );
}
