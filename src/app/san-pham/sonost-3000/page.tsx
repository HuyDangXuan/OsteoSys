"use client";

import React, { useState, useEffect } from "react";
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
  Rotate3d,
  Box,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { getCmsContent } from "@/lib/actions/cms";

export default function Sonost3000ProductPage() {
  const [activeTab, setActiveTab] = useState<string>("measurement");
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [cmsSpecs, setCmsSpecs] = useState<any>(null);
  const [globalData, setGlobalData] = useState<any>(null);

  useEffect(() => {
    async function loadCms() {
      try {
        const [specsRes, globalRes] = await Promise.all([
          getCmsContent("sonost_specs"),
          getCmsContent("global"),
        ]);
        setCmsSpecs(specsRes.data);
        setGlobalData(globalRes.data);
      } catch (e) {
        console.error("Failed to load CMS specs:", e);
      }
    }
    loadCms();
  }, []);

  const handleDownloadBrochure = () => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadProgress(null);
            const brochureUrl = cmsSpecs?.brochureUrl || "/catalog-osteosys.pdf";
            window.open(brochureUrl, "_blank");
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const defaultSpecs = {
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
      { label: "Máy in nhiệt tích hợp (Built-in Printer)", value: "Máy in nhiệt 58mm tích hợp sẵn tại mặt sau thân máy (không chiếm diện tích mặt trước, dễ dàng thay cuộn giấy in)" },
      { label: "Cổng giao tiếp ngoại vi", value: "2x USB 2.0, 1x Cổng LAN RJ45, 1x RS-232C, 1x Cổng kết nối máy in Laser ngoài" },
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

  const specGroupsMap: Record<string, Array<{ label: string; value: string }>> = { ...defaultSpecs };
  if (cmsSpecs?.specGroups && Array.isArray(cmsSpecs.specGroups)) {
    cmsSpecs.specGroups.forEach((g: any) => {
      if (g.groupKey && g.items) {
        specGroupsMap[g.groupKey] = g.items;
      }
    });
  }

  const deliverables = cmsSpecs?.deliverables || [
    "01 Thân máy Sonost 3000 chính hãng OsteoSys",
    "01 Khối chuẩn Phantom hiệu chuẩn hàng ngày",
    "05 Cuộn giấy in nhiệt + 02 Can gel siêu âm y tế",
  ];

  const currentSpecs = specGroupsMap[activeTab] || specGroupsMap.measurement || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      <Header globalData={globalData} />

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
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#0284c7] dark:text-sky-400 text-xs font-semibold uppercase tracking-wider font-mono-data">
                  <Award size={14} />
                  <span>Tiêu Chuẩn Vàng Siêu Âm Đo Loãng Xương</span>
                </div>

                <Link
                  href="/san-pham/sonost-3000/3d-viewer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 text-xs font-bold font-mono-data hover:scale-105 transition-transform"
                >
                  <Rotate3d size={14} className="animate-spin" style={{ animationDuration: "8s" }} />
                  <span>Trải Nghiệm 3D 360° Studio</span>
                </Link>
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

                <Link
                  href="/san-pham/sonost-3000/3d-viewer"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 border border-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
                >
                  <Box size={14} className="text-cyan-400" />
                  <span>Khám Phá Mô Hình 3D</span>
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

            {/* Right Col: High-End Clinical Exhibit & 3D Studio Gateway Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Radio size={16} className="text-[#0284c7]" />
                    <span>Sonost 3000 Sonometer</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-xs font-mono-data rounded-full font-semibold">
                    ISO 13485 / CE Validated
                  </span>
                </div>

                {/* Interactive Scanner Exhibit & Sonometer Visual */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 rounded-xl p-6 text-white flex flex-col items-center justify-center space-y-4 relative overflow-hidden border border-sky-500/20 shadow-inner group">
                  {/* Decorative Glowing Rings */}
                  <div className="relative flex items-center justify-center w-24 h-24 my-1">
                    <div className="absolute inset-0 rounded-full border border-sky-400/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border border-cyan-400/40 animate-pulse" />
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/40 group-hover:scale-110 transition-transform duration-300">
                      <Activity size={32} className="text-white" />
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <span className="font-bold text-base block text-white">Đo Siêu Âm Gót Chân Calcaneus</span>
                    <span className="text-xs text-sky-300 font-mono-data">QUS Parameters: SOS (m/s) &bull; BUA (dB/MHz) &bull; BQI</span>
                  </div>

                  {/* High-Impact 3D Studio Launcher Button */}
                  <Link
                    href="/san-pham/sonost-3000/3d-viewer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-600 hover:from-sky-500 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
                  >
                    <Rotate3d size={18} className="animate-spin" style={{ animationDuration: "6s" }} />
                    <span>Mở Không Gian 3D Studio 360° (Toàn Màn Hình)</span>
                    <ExternalLink size={15} />
                  </Link>
                </div>

                {/* Deliverables summary */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Quy cách bàn giao tiêu chuẩn y tế:</span>
                  </p>
                  {deliverables.map((item: string, idx: number) => (
                    <p key={idx} className="pl-4 text-[11px] text-slate-500 dark:text-slate-400">• {item}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. Dedicated 3D Interactive Showcase Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-mono-data font-bold uppercase">
                <Sparkles size={13} />
                <span>Trải Nghiệm Studio 3D Toàn Diện</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Khám Phá Cấu Trúc Y Khoa Sonost 3000 Trên Không Gian 3D
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tương tác xoay 360°, phóng to chi tiết 4 điểm neo lâm sàng (Đầu dò Calcaneus, Khay định vị, Màn hình LCD 7" hiển thị đồ thị T-Score, Máy in nhiệt tích hợp) và bật chế độ X-Ray/Wireframe để nghiên cứu cấu trúc bên trong.
              </p>
            </div>

            <Link
              href="/san-pham/sonost-3000/3d-viewer"
              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
            >
              <Rotate3d size={16} />
              <span>Vào 3D Studio Toàn Màn Hình</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* 3. Key Clinical Features (Staggered Animation) */}
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

        {/* 4. Interactive Specifications Tabs with LayoutId */}
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
                  {currentSpecs.map((row: any, idx: number) => (
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

      <Footer globalData={globalData} />
    </div>
  );
}
