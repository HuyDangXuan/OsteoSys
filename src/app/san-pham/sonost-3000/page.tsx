"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Radio,
  Download,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Printer,
  ChevronRight,
  Activity,
  Layers,
  Award,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

export default function Sonost3000ProductPage() {
  const [activeTab, setActiveTab] = useState<"measurement" | "hardware" | "software">("measurement");
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const handleDownloadBrochure = () => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadProgress(null), 1200);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const specs = {
    measurement: [
      { label: "Vị trí đo lường (Measurement Site)", value: "Gót chân (Xương gót Calcaneus)" },
      { label: "Thông số lâm sàng (Clinical Parameters)", value: "SOS (Vận tốc âm), BUA (Độ suy giảm dải rộng), BQI (Chỉ số chất lượng xương)" },
      { label: "Chỉ số tham chiếu chẩn đoán", value: "T-score, Z-score, Tỷ lệ phần trăm người trẻ (% Young Adult), Tỷ lệ theo tuổi (% Age Matched)" },
      { label: "Thời gian thực hiện phép đo", value: "< 15 giây (Siêu nhanh, không xâm lấn)" },
      { label: "Độ chính xác & Độ lặp lại (CV)", value: "SOS: CV ≤ 0.2%, BUA: CV ≤ 1.5%, BQI: CV ≤ 1.5%" },
      { label: "Phương pháp tiếp xúc siêu âm", value: "Bóng chứa dầu silicone tự động ôm khít gót chân (Waterless Gel Pad)" },
      { label: "Cơ sở dữ liệu tham chiếu chuẩn", value: "Dữ liệu người Châu Á / Việt Nam & Chuẩn Quốc tế NHANES III / ISCD" },
    ],
    hardware: [
      { label: "Đầu dò siêu âm (Transducer)", value: "Đầu dò đôi tần số trung tâm 0.5 MHz (Độ xuyên thấu cao)" },
      { label: "Màn hình hiển thị", value: "Màn hình cảm ứng màu TFT LCD 7.0 inch độ phân giải cao" },
      { label: "Máy in tích hợp (Built-in Printer)", value: "Máy in nhiệt tích hợp khổ 58mm (In kết quả & đồ thị phân loại tức thì)" },
      { label: "Cổng giao tiếp ngoại vi", value: "2x USB 2.0, 1x Cổng LAN RJ45, 1x Cổng kết nối máy in Laser ngoài" },
      { label: "Kích thước & Trọng lượng", value: "300 (W) x 620 (D) x 390 (H) mm — Trọng lượng: 12.0 kg (Dễ dàng di chuyển lưu động)" },
      { label: "Nguồn điện vận hành", value: "AC 100~240V, 50/60Hz, Công suất tiêu thụ 130W" },
    ],
    software: [
      { label: "Phần mềm chẩn đoán chuyên dụng", value: "Sonost Diagnosis Suite (Tích hợp AI phân loại mức độ loãng xương)" },
      { label: "Khả năng lưu trữ dữ liệu", value: "Bộ nhớ trong lưu trữ hơn 10.000 hồ sơ bệnh nhân kèm lịch sử theo dõi" },
      { label: "Chuẩn kết nối bệnh viện (PACS/HIS)", value: "Hỗ trợ đầy đủ chuẩn DICOM 3.0 (Tùy chọn nâng cao kết nối mạng y tế)" },
      { label: "Báo cáo chẩn đoán hình ảnh", value: "Xuất file PDF, in đồ thị màu phân loại WHO (Xanh: Bình thường, Vàng: Thiếu xương, Đỏ: Loãng xương)" },
      { label: "Chế độ sao lưu dữ liệu", value: "Tự động sao lưu ra USB Flash Drive hoặc máy chủ trung tâm" },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      <Header />

      <main className="pt-24 pb-16">
        {/* 1. Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Col */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 space-y-5"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#0284c7] dark:text-sky-400 text-xs font-semibold uppercase tracking-wider font-mono-data">
                <Award size={14} />
                <span>Tiêu Chuẩn Vàng Siêu Âm Đo Loãng Xương</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Máy Đo Loãng Xương Siêu Âm Gót Chân{" "}
                <span className="text-[#0284c7] dark:text-sky-400">Sonost 3000</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Thiết bị chẩn đoán mật độ xương gót chân bằng sóng siêu âm không tia X, an toàn tuyệt đối cho mọi đối tượng từ phụ nữ có thai đến người cao tuổi. Thời gian đo dưới 15 giây, tích hợp màn hình cảm ứng màu và máy in nhiệt tiện lợi.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/bao-gia?product=sonost-3000"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
                >
                  <span>Yêu Cầu Báo Giá &amp; Demo</span>
                  <ChevronRight size={14} />
                </Link>

                <button
                  onClick={handleDownloadBrochure}
                  disabled={downloadProgress !== null}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-md shadow-2xs transition-colors"
                >
                  {downloadProgress !== null ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#0284c7]" />
                      <span>Đang tải Brochure ({downloadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} className="text-[#0284c7]" />
                      <span>Tải Tài Liệu Kỹ Thuật (PDF)</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3 Value Pillars */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-xs font-mono-data">
                <div className="space-y-0.5">
                  <span className="text-[#0284c7] font-bold text-base">&lt; 15s</span>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-sans">Thời gian đo siêu tốc</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-emerald-600 font-bold text-base">CV &le; 1.5%</span>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-sans">Độ lặp lại chuẩn ISCD</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-amber-600 font-bold text-base">0 Rad</span>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-sans">100% Không tia X</p>
                </div>
              </div>
            </motion.div>

            {/* Right Col: Interactive Visual Scanner Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-md relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Radio size={16} className="text-[#0284c7]" />
                    <span>Sonost 3000 Sonometer</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-xs font-mono-data rounded font-semibold">
                    ISO 13485 / CE
                  </span>
                </div>

                {/* SVG Visual Exhibit */}
                <div className="bg-slate-950 rounded-lg p-6 text-white flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                    <Activity size={36} className="text-sky-400 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-sm block">Đo Vận Tốc Âm SOS &amp; BUA</span>
                    <span className="text-xs text-slate-400 font-mono-data">Mật độ xương gót chân Calcaneus</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Bàn giao bao gồm:</p>
                  <p>• 01 Thân máy Sonost 3000 chính hãng OsteoSys</p>
                  <p>• 01 Khối chuẩn Phantom hiệu chuẩn hàng ngày</p>
                  <p>• 05 Cuộn giấy in nhiệt + 02 Can gel siêu âm y tế</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. Key Clinical Features (Staggered Animation) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Đặc Điểm Nổi Bật Vượt Trội
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Giải pháp chẩn đoán loãng xương hiệu quả cao cho phòng khám, bệnh viện và khám sức khỏe lưu động.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: "Tuyệt đối Không tia X",
                desc: "Sử dụng sóng siêu âm hoàn toàn an toàn cho phụ nữ mang thai, trẻ em và người già đo nhiều lần.",
                color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60",
              },
              {
                icon: Zap,
                title: "Đo nhanh dưới 15 giây",
                desc: "Thao tác đo gót chân siêu tốc, tối ưu hóa công suất khám đoàn doanh nghiệp hàng trăm người/ngày.",
                color: "text-sky-600 bg-sky-50 dark:bg-sky-950/60",
              },
              {
                icon: Printer,
                title: "Máy in nhiệt tích hợp",
                desc: "In ngay kết quả T-score, Z-score và đồ thị phân loại loãng xương WHO mà không cần kết nối máy tính.",
                color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60",
              },
              {
                icon: Layers,
                title: "Bóng dầu Waterless",
                desc: "Công nghệ màng bóng tiếp xúc êm ái, định vị gót chân tự động, vệ sinh nhanh chỉ với 1 lần lau.",
                color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs space-y-3"
                >
                  <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 3. Interactive Specifications Tabs with LayoutId */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileSpreadsheet className="text-[#0284c7]" size={20} />
                  Bảng Thông Số Kỹ Thuật Chi Tiết
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dữ liệu kỹ thuật chuẩn theo hồ sơ đăng ký lưu hành thiết bị y tế Bộ Y Tế.
                </p>
              </div>

              {/* Tabs with layoutId indicator */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold relative">
                {[
                  { id: "measurement", label: "Đo lường lâm sàng" },
                  { id: "hardware", label: "Phần cứng & Thiết kế" },
                  { id: "software", label: "Kết nối & Phần mềm" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`relative px-3.5 py-1.5 rounded-md transition-colors z-10 ${
                      activeTab === tab.id
                        ? "text-[#0284c7] dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeSpecTab"
                        className="absolute inset-0 bg-white dark:bg-slate-900 rounded-md shadow-xs"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spec rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-0"
                >
                  {specs[activeTab].map((row, idx) => (
                    <div
                      key={idx}
                      className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded transition-colors"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-300 sm:w-1/3">
                        {row.label}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100 font-medium sm:w-2/3 font-mono-data sm:text-right">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
