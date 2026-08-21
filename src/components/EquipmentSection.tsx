"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ExternalLink, Radio, Activity, CheckCircle2, ArrowRight } from "lucide-react";

type Spec = { label: string; value: string };
type SpecGroup = { group: string; specs: Spec[] };

type Device = {
  id: string;
  category: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  svgColor: string;
  detailUrl?: string;
  specGroups: SpecGroup[];
};

const devices: Device[] = [
  {
    id: "sonost-3000",
    category: "Ultrasound Sonometer",
    name: "OsteoSys Sonost 3000",
    tagline: "Máy đo loãng xương siêu âm gót chân không tia X",
    description:
      "Thiết bị đo mật độ xương siêu âm chuyên dụng hàng đầu từ Hàn Quốc. Tích hợp máy in nhiệt, bóng dầu silicone êm ái và cơ sở dữ liệu chuẩn người Việt Nam & ISCD.",
    badge: "Phổ Biến Nhất",
    svgColor: "#0284c7",
    detailUrl: "/san-pham/sonost-3000",
    specGroups: [
      {
        group: "Kỹ thuật đo siêu âm",
        specs: [
          { label: "Vị trí đo", value: "Xương gót chân (Calcaneus)" },
          { label: "Thông số đo", value: "SOS (Vận tốc âm), BUA (Độ suy giảm), BQI (Chỉ số chất lượng)" },
          { label: "Thời gian đo", value: "< 15 giây (Siêu tốc, không xâm lấn)" },
          { label: "Độ chính xác lặp lại (CV)", value: "SOS ≤ 0.2%, BUA ≤ 1.5%, BQI ≤ 1.5%" },
        ],
      },
      {
        group: "Phần cứng & Thiết kế",
        specs: [
          { label: "Đầu dò siêu âm", value: "Đầu dò đôi 0.5 MHz xuyên thấu cao" },
          { label: "Màn hình", value: "Cảm ứng màu TFT LCD 7.0 inch" },
          { label: "Máy in", value: "Máy in nhiệt tích hợp khổ 58mm" },
          { label: "Trọng lượng", value: "12.0 kg (Thiết kế xách tay lưu động)" },
        ],
      },
      {
        group: "Phần mềm & Kết nối",
        specs: [
          { label: "Tham chiếu chuẩn", value: "T-score, Z-score (NHANES III / ISCD / WHO)" },
          { label: "Bộ nhớ", value: "> 10.000 hồ sơ bệnh nhân" },
          { label: "Kết nối mạng", value: "Cổng LAN, USB, Tùy chọn DICOM 3.0" },
        ],
      },
    ],
  },
  {
    id: "dexa-central",
    category: "Central DEXA",
    name: "OsteoSys DXA-Pro 7000",
    tagline: "Hệ thống đo mật độ xương toàn thân & cột sống",
    description:
      "Thiết bị DEXA fan-beam thế hệ mới, tích hợp phần mềm phân tích BMD tự động theo chuẩn ISCD cho bệnh viện lớn và trung tâm y học hạt nhân.",
    badge: "Flagship Bệnh Viện",
    svgColor: "#0f766e",
    detailUrl: "/bao-gia?product=dxa-7000",
    specGroups: [
      {
        group: "Quét & Chẩn đoán",
        specs: [
          { label: "Nguyên lý quét", value: "Fan-beam dual-energy X-ray" },
          { label: "Vùng quét hỗ trợ", value: "Cột sống, Xương đùi, Toàn thân, Cẳng tay" },
          { label: "Thời gian quét (Spine AP)", value: "≈ 60 giây" },
          { label: "Độ chính xác (CV in vivo)", value: "< 1.0 %" },
        ],
      },
      {
        group: "Bức xạ & Kết nối",
        specs: [
          { label: "Liều bức xạ bệnh nhân", value: "1.4 μSv (Rất thấp)" },
          { label: "Chuẩn dữ liệu", value: "DICOM 3.0 / HL7 FHIR" },
          { label: "Tích hợp", value: "HIS / RIS / PACS bệnh viện" },
        ],
      },
    ],
  },
  {
    id: "ai-suite",
    category: "AI Software Suite",
    name: "OsteoSys AI Cloud Suite",
    tagline: "Phần mềm phân tích BMD & cảnh báo nguy cơ gãy xương FRAX",
    description:
      "Nền tảng phần mềm phân tích kết quả DEXA/QUS tự động bằng AI, tích hợp bảng tính nguy cơ FRAX 10 năm và xuất báo cáo chẩn đoán theo chuẩn WHO.",
    badge: "Cloud-Ready",
    svgColor: "#0369a1",
    detailUrl: "/bao-gia?product=ai-suite",
    specGroups: [
      {
        group: "Phân tích & AI",
        specs: [
          { label: "Auto-ROI detection", value: "Deep learning — độ chính xác ≥ 97%" },
          { label: "FRAX tích hợp", value: "Tính nguy cơ gãy xương 10 năm" },
          { label: "Chuẩn báo cáo", value: "WHO, ISCD, IOF Quốc tế" },
        ],
      },
      {
        group: "Hệ thống & Bảo mật",
        specs: [
          { label: "Mô hình triển khai", value: "Cloud SaaS / On-premise" },
          { label: "Chuẩn an toàn thông tin", value: "HIPAA, ISO 27001, AES-256" },
        ],
      },
    ],
  },
];

export default function EquipmentSection() {
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);

  return (
    <section
      id="equipment"
      className="py-20 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-200/80 dark:border-slate-800"
      aria-label="Danh mục thiết bị OsteoSys"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mb-12 space-y-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#0284c7] dark:text-sky-400 font-mono-data">
            Danh Mục Thiết Bị &amp; Công Nghệ
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Giải Pháp Đo Loãng Xương Toàn Diện
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            Từ máy siêu âm gót chân Sonost 3000 linh hoạt cho khám lưu động đến hệ thống DEXA trung tâm, OsteoSys đáp ứng trọn vẹn mọi nhu cầu y tế.
          </p>
        </motion.div>

        {/* Device cards grid */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {devices.map((device, idx) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-[#0284c7] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-mono-data font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ background: `${device.svgColor}15`, color: device.svgColor }}
                  >
                    {device.category}
                  </span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {device.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {device.name}
                  </h3>
                  <p className="text-xs font-medium text-[#0284c7] dark:text-sky-400 mt-0.5">
                    {device.tagline}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {device.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setActiveDevice(device)}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0284c7] flex items-center gap-1 transition-colors"
                >
                  <span>Xem thông số</span>
                  <ChevronRight size={13} />
                </button>

                {device.detailUrl && (
                  <Link
                    href={device.detailUrl}
                    className="text-xs font-bold text-[#0284c7] dark:text-sky-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Chi tiết máy</span>
                    <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spec Drawer Modal */}
      <AnimatePresence>
        {activeDevice && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDevice(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between will-change-transform"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono-data font-bold uppercase tracking-wider text-[#0284c7]">
                    {activeDevice.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {activeDevice.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeDevice.tagline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDevice(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Spec list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {activeDevice.specGroups.map((grp) => (
                  <div key={grp.group} className="space-y-2.5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">
                      {grp.group}
                    </h4>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                      {grp.specs.map((s, i) => (
                        <div
                          key={i}
                          className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
                          <span className="font-mono-data font-semibold text-slate-900 dark:text-slate-100 text-right">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <Link
                  href={`/bao-gia?product=${activeDevice.id}`}
                  onClick={() => setActiveDevice(null)}
                  className="flex-1 py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md text-center shadow-sm"
                >
                  Yêu Cầu Báo Giá Thiết Bị Này
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveDevice(null)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
