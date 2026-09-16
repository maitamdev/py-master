/**
 * High-resolution Certificate Generator using HTML5 Canvas
 * Renders a completion certificate issued by the PYTHON-MASTER platform,
 * built and developed by MaiTamDev.
 */

export interface CertificateDetails {
  studentName: string;
  title: string;
  subtitle: string;
  dateStr: string;
  certId: string;
}

export function drawCertificateToCanvas(canvas: HTMLCanvasElement, details: CertificateDetails): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1200;
  const height = 850;
  canvas.width = width;
  canvas.height = height;

  // 1. Background Gradient (Deep Luxury Navy)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#070a12');
  bgGrad.addColorStop(0.5, '#0b1120');
  bgGrad.addColorStop(1, '#060a14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle radial glow in the center
  const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 550);
  radialGlow.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. Gold Border Lines
  const pad = 35;
  const goldGrad = ctx.createLinearGradient(pad, pad, width - pad, height - pad);
  goldGrad.addColorStop(0, '#fbbf24');
  goldGrad.addColorStop(0.3, '#d97706');
  goldGrad.addColorStop(0.7, '#f59e0b');
  goldGrad.addColorStop(1, '#fef08a');

  // Outer gold frame
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 3.5;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  // Inner thin frame
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(pad + 12, pad + 12, width - (pad + 12) * 2, height - (pad + 12) * 2);

  // Corner decorative marks
  const corners = [
    [pad + 12, pad + 12],
    [width - pad - 12, pad + 12],
    [pad + 12, height - pad - 12],
    [width - pad - 12, height - pad - 12],
  ];

  ctx.fillStyle = '#f59e0b';
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Platform Brand Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('PYTHON-MASTER', width / 2, 105);
  ctx.letterSpacing = '0px';

  // 4. Main Certificate Title
  ctx.fillStyle = goldGrad;
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText('CHỨNG NHẬN HOÀN THÀNH', width / 2, 165);

  // Small line under title
  const lineGrad = ctx.createLinearGradient(width / 2 - 120, 0, width / 2 + 120, 0);
  lineGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
  lineGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
  lineGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, 185);
  ctx.lineTo(width / 2 + 120, 185);
  ctx.stroke();

  // 5. "Chứng nhận"
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText('Chứng nhận', width / 2, 235);

  // 6. Student Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px Georgia, serif';
  ctx.fillText(details.studentName.toUpperCase() || 'HỌC VIÊN PYTHON-MASTER', width / 2, 300);

  // Name underline
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 320);
  ctx.lineTo(width / 2 + 200, 320);
  ctx.stroke();

  // 7. Statement & Curriculum Details
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillText('đã hoàn thành lộ trình', width / 2, 365);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(details.title || 'Python Programming', width / 2, 410);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px system-ui, -apple-system, sans-serif';
  ctx.fillText(details.subtitle || '14 phần • 78 bài học • 283 bài tập thực hành', width / 2, 445);

  // 8. Seal / Badge (Center-lower)
  const sealX = width / 2;
  const sealY = 540;

  ctx.save();
  ctx.beginPath();
  ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Inner dashed circle
  ctx.beginPath();
  ctx.arc(sealX, sealY, 37, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Seal Icon / Text
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText('★ 2026 ★', sealX, sealY - 4);
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('HOÀN THÀNH', sealX, sealY + 13);
  ctx.restore();

  // 9. Issuer Authority
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Được cấp bởi nền tảng PYTHON-MASTER', width / 2, 620);

  // 10. Verification ID & Date info
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`Ngày hoàn thành: ${details.dateStr}`, pad + 35, height - pad - 80);

  ctx.textAlign = 'right';
  ctx.fillText(`Mã chứng nhận: ${details.certId}`, width - pad - 35, height - pad - 80);

  // 11. Disclaimer & Attribution at bottom (Small & Clear)
  const sepY = height - pad - 58;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad + 35, sepY);
  ctx.lineTo(width - pad - 35, sepY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    'Chứng nhận hoàn thành được cấp bởi nền tảng PYTHON-MASTER • Xây dựng và phát triển bởi MaiTamDev',
    width / 2,
    height - pad - 28
  );
}

export function downloadCertificateImage(canvas: HTMLCanvasElement, filename: string): void {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
