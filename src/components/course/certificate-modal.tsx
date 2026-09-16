'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Download, Award } from 'lucide-react';
import {
  drawCertificateToCanvas,
  downloadCertificateImage,
  type CertificateDetails,
} from '@/lib/certificates/generate-certificate';

export function CertificateModal({
  isOpen,
  onClose,
  partTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  partTitle?: string;
  completedCount?: number;
}) {
  const [studentName, setStudentName] = useState<string>('Học viên Xuất sắc');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [certId] = useState(
    () =>
      `PYMASTER-2026-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const [dateStr] = useState(() =>
    new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  );

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const details: CertificateDetails = {
        studentName,
        title: partTitle ? `Chuyên đề: ${partTitle}` : 'Python Programming',
        subtitle: partTitle
          ? `Đã hoàn thành các bài học và bài tập của ${partTitle}`
          : '14 phần • 78 bài học • 283 bài tập thực hành',
        dateStr,
        certId,
      };
      drawCertificateToCanvas(canvas, details);
    }
  }, [isOpen, studentName, partTitle, dateStr, certId]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const cleanName = studentName.trim().replace(/\s+/g, '-').toLowerCase() || 'student';
      downloadCertificateImage(canvas, `chung-chi-python-master-${cleanName}.png`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
            <Award className="w-5 h-5" />
            <span>Chứng nhận Hoàn thành PYTHON-MASTER</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Name input */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-slate-300">
                Họ và tên hiển thị trên chứng nhận:
              </label>
              <p className="text-[11px] text-slate-400">
                Nhập tên của bạn để tạo chứng chỉ cá nhân hóa độ phân giải cao.
              </p>
            </div>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Nhập họ và tên của bạn..."
              className="px-3.5 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-white font-medium text-xs outline-none focus:ring-2 focus:ring-amber-500/40 min-w-[240px]"
            />
          </div>

          {/* Certificate Canvas Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-black flex justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-[420px] object-contain rounded-2xl"
            />
          </div>

          {/* Attribution Notice */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 text-center leading-relaxed">
            <p>
              Website & Nền tảng PYTHON-MASTER do <strong className="text-amber-400 font-semibold">MaiTamDev</strong> xây dựng và phát triển.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono">
            Mã xác thực: <span className="text-amber-400 font-bold">{certId}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Tải ảnh chứng chỉ (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
