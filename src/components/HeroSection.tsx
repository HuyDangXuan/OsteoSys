"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Download,
  Radio,
  ShieldCheck,
  Zap,
  Printer,
  Activity,
  ArrowRight,
} from "lucide-react";

const SCAN_METRICS = [
  { label: "SOS (Vận tốc âm)", value: "1,542", unit: "m/s" },
  { label: "BUA (Độ suy giảm)", value: "68.4", unit: "dB/MHz" },
  { label: "T-score Gót chân", value: "−1.1", unit: "SD" },
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="pt-20 min-h-[calc(100svh-80px)] flex items-center bg-white dark:bg-slate-950"
      aria-label="Giới thiệu Máy đo loãng xương Sonost 3000"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
        <div className="grid lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-center">
          {/* Left: Headline + Clinical Value Props + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {/* Overline Badge */}
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-[#0284c7]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#0284c7] dark:text-sky-400 font-mono-data">
                Máy Đo Loãng Xương Siêu Âm Y Khoa
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] text-slate-900 dark:text-white tracking-tight">
              Chẩn đoán loãng xương chuẩn xác.{" "}
              <span className="text-[#0284c7] dark:text-sky-400 block sm:inline">
                An toàn tuyệt đối 0% tia X.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Giải pháp thiết bị đo mật độ xương siêu âm gót chân <strong>Sonost 3000 (OsteoSys Korea)</strong>.
              Thời gian đo dưới 15 giây, tích hợp máy in nhiệt, phù hợp khám lưu động và phòng khám đa khoa.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  href="/bao-gia"
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors shadow-sm"
                >
                  <span>Nhận Báo Giá &amp; Tư Vấn Thuê Máy</span>
                  <ChevronRight size={15} />
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  href="/san-pham/sonost-3000"
                  className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <Radio size={14} className="text-[#0284c7]" />
                  <span>Xem Chi Tiết Sonost 3000</span>
                </Link>
              </motion.div>
            </div>

            {/* 3 Quick Data Rows */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
              {[
                { metric: "Độ chính xác lặp lại (CV)", value: "< 1.5 %", note: "Chuẩn ISCD & WHO quốc tế" },
                { metric: "Thời gian thực hiện phép đo", value: "< 15 giây", note: "Nhanh gấp 4 lần phương pháp truyền thống" },
                { metric: "An toàn bức xạ", value: "0 Rad / Không tia X", note: "Đo an toàn cho phụ nữ có thai & trẻ em" },
              ].map((row) => (
                <div
                  key={row.metric}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{row.metric}</span>
                    <span className="text-slate-400 text-xs ml-2 hidden sm:inline">({row.note})</span>
                  </div>
                  <span className="font-mono-data font-bold text-[#0284c7] dark:text-sky-400 text-sm">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Sonost 3000 Interactive Visual Exhibit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative"
          >
            <div
              className="relative bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800"
              style={{ aspectRatio: "4/3" }}
              aria-label="Hình ảnh mô phỏng máy đo loãng xương Sonost 3000"
            >
              {/* Dynamic Sonometer Visual SVG */}
              <Sonost3DExhibit />

              {/* Floating Clinical Data Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono-data">
                    Phiếu Đo Mẫu · Kết Quả Trực Quan
                  </span>
                  <span className="text-xs font-mono-data font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Bình Thường (Normal)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {SCAN_METRICS.map((m) => (
                    <div key={m.label} className="border-r border-slate-100 dark:border-slate-800 last:border-0 pr-2">
                      <p className="font-mono-data tabular-nums text-base font-bold text-[#0284c7] dark:text-sky-400 leading-none">
                        {m.value}
                        <span className="text-xs font-normal text-slate-400 ml-0.5">{m.unit}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Certificate Badges */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="text-xs font-mono-data font-bold px-2 py-0.5 bg-slate-900/90 text-sky-300 border border-sky-700/60 rounded">
                  ISCD · WHO Compliant
                </span>
              </div>
            </div>

            {/* Sub note */}
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thiết bị tích hợp máy in nhiệt in kết quả và đồ thị phân loại ngay sau khi đo.
              </p>
            </div>
          </motion.div>
        </div>

        {/* 4-Step Measurement Timeline Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="text-center mb-6 space-y-1">
            <span className="text-xs font-bold text-[#0284c7] uppercase tracking-wider font-mono-data">
              Quy Trình Đo Khám Nhanh
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              4 Bước Thực Hiện Phép Đo Mật Độ Xương Trên Sonost 3000
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Thoa Gel Siêu Âm", desc: "Thoa 1 lớp gel mỏng lên gót chân bệnh nhân để truyền sóng tối ưu." },
              { step: "02", title: "Đặt Gót Chân Vào Khay", desc: "Khay định vị tự động ôm khít bàn chân với bóng dầu silicone êm ái." },
              { step: "03", title: "Siêu Âm Đo < 15 Giây", desc: "Đầu dò 0.5MHz quét chéo tự động đo đồng thời vận tốc âm SOS & BUA." },
              { step: "04", title: "In Phiếu T-Score Tức Thì", desc: "Máy in nhiệt xuất kết quả, đồ thị phân loại loãng xương WHO ngay lập tức." },
            ].map((s, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-data font-bold px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-[#0284c7] rounded">
                    Bước {s.step}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{s.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Simulated Sonost 3000 Ultrasound Wave Graphic */
function Sonost3DExhibit() {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full" aria-hidden="true" role="img">
      <rect width="800" height="600" fill="#080e1a" />
      {/* Ultrasound Transducer Cone Waves */}
      <defs>
        <radialGradient id="waveGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#0369a1" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#080e1a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="400" cy="240" r="160" fill="url(#waveGlow)" />

      {/* Heel Calcaneus Silhouette */}
      <path
        d="M 280 180 C 320 120, 480 120, 520 180 C 540 220, 530 320, 460 360 C 390 390, 310 370, 280 300 Z"
        fill="#0f2744"
        stroke="#0284c7"
        strokeWidth="2"
        opacity="0.9"
      />

      {/* Ultrasound beam paths */}
      <g opacity="0.6" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4">
        <line x1="200" y1="240" x2="600" y2="240" />
        <line x1="240" y1="200" x2="560" y2="280" />
        <line x1="240" y1="280" x2="560" y2="200" />
      </g>

      {/* Transducers on Left & Right */}
      <rect x="180" y="190" width="40" height="100" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="200" y="245" fontSize="10" fontFamily="monospace" fill="#ffffff" textAnchor="middle" fontWeight="bold">TX</text>

      <rect x="580" y="190" width="40" height="100" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="600" y="245" fontSize="10" fontFamily="monospace" fill="#ffffff" textAnchor="middle" fontWeight="bold">RX</text>

      {/* Measurement Telemetry Text Top */}
      <text x="30" y="40" fontSize="11" fontFamily="monospace" fill="#7dd3fc" fontWeight="bold">OsteoSys Sonost 3000 PRO</text>
      <text x="30" y="58" fontSize="10" fontFamily="monospace" fill="#64748b">Transducer: 0.5MHz / Waterless Balloon Pad</text>
      <text x="30" y="74" fontSize="10" fontFamily="monospace" fill="#64748b">Calculated: BQI = α·SOS + β·BUA</text>
    </svg>
  );
}
