"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";

const tabs = [
  { id: "clinic", label: "Phòng Khám & Bệnh Viện" },
  { id: "enterprise", label: "Khám Sức Khỏe Doanh Nghiệp" },
];

const clinicPackages = [
  {
    name: "Thuê Máy Sonost 3000 (0đ vốn)",
    tagline: "Cho phòng khám đa khoa & trạm y tế",
    price: "15.000.000 đ / tháng",
    items: [
      "01 máy Sonost 3000 chính hãng mới 100%",
      "Kèm 01 khối chuẩn Phantom Hologic định kỳ",
      "Miễn phí vật tư gel & giấy in theo định mức",
      "Hỗ trợ kỹ thuật viên & đổi máy trong 24h",
      "Đào tạo cấp chứng chỉ vận hành thiết bị",
    ],
    cta: "Xem Gói Thuê Chi Tiết",
    link: "/dich-vu-cho-thue",
  },
  {
    name: "Mua Máy Sonost 3000 PRO",
    tagline: "Sở hữu toàn diện thiết bị y tế tiêu chuẩn",
    price: "Liên hệ chiết khấu B2B",
    highlight: true,
    badge: "Bán Chạy Nhất",
    items: [
      "Thân máy Sonost 3000 + Màn hình cảm ứng màu",
      "Tích hợp máy in nhiệt & cổng kết nối DICOM 3.0",
      "Bảo hành chính hãng 24 tháng toàn diện",
      "Tặng 05 can gel siêu âm y tế + 20 cuộn giấy in",
      "Miễn phí hiệu chuẩn Phantom năm đầu tiên",
      "Hỗ trợ thủ tục thẩm định của Sở Y Tế",
    ],
    cta: "Nhận Báo Giá Mua Máy",
    link: "/bao-gia?product=sonost-3000",
  },
  {
    name: "Bảo Dưỡng & Hiệu Chuẩn",
    tagline: "Cho các cơ sở đã có sẵn máy đo",
    price: "Theo thỏa thuận",
    items: [
      "Kiểm chuẩn sai số đầu dò siêu âm 0.5MHz",
      "Thay thế màng bóng dầu & bảo dưỡng bơm áp lực",
      "Hiệu chuẩn Phantom định kỳ chuẩn ISCD",
      "Cung cấp linh kiện chính hãng OsteoSys",
      "Cấp biên bản kiểm định an toàn y tế",
    ],
    cta: "Đặt Lịch Kiểm Định",
    link: "/dich-vu-sua-chua",
  },
];

const enterprisePackages = [
  {
    name: "Gói Khám Lưu Động 1 Ngày",
    tagline: "100–300 nhân viên doanh nghiệp",
    price: "1.500.000 đ / ngày",
    items: [
      "01 máy Sonost 3000 sẵn sàng vận hành",
      "Kỹ thuật viên giao nhận & hướng dẫn tận nơi",
      "Đo siêu âm nhanh dưới 15 giây/người",
      "In kết quả T-score & Z-score tại chỗ",
      "Kèm vật tư gel & giấy in nhiệt đầy đủ",
    ],
    cta: "Đăng Ký Thuê Sự Kiện",
    link: "/dich-vu-cho-thue",
  },
  {
    name: "Gói Khám Đoàn Toàn Diện",
    tagline: "300–2.000 nhân viên",
    price: "Liên hệ báo giá ưu đãi",
    highlight: true,
    badge: "Doanh Nghiệp Ưa Chuộng",
    items: [
      "Cung cấp đồng thời 2–4 máy Sonost 3000",
      "Bác sĩ & kỹ thuật viên y sinh hỗ trợ trực tiếp",
      "Dashboard số hóa thống kê sức khỏe xương đoàn",
      "Phân loại nguy cơ loãng xương theo độ tuổi/giới tính",
      "Báo cáo tổng hợp gửi phòng Nhân sự (HR)",
    ],
    cta: "Nhận Báo Giá Khám Đoàn",
    link: "/bao-gia?service=enterprise",
  },
  {
    name: "Đối Tác Y Tế Thường Niên",
    tagline: "Hợp đồng dài hạn định kỳ hàng năm",
    price: "Chiết khấu đặc biệt B2B",
    items: [
      "Khám định kỳ loãng xương hàng năm cho CBNV",
      "Theo dõi biểu đồ mật độ xương qua các năm",
      "Chính sách bảo trợ sức khỏe xương khớp nhân sự",
      "Kênh tư vấn chuyên khoa online riêng",
      "Ưu tiên điều phối thiết bị trong mùa cao điểm",
    ],
    cta: "Thương Lượng Hợp Đồng",
    link: "/bao-gia?service=longterm",
  },
];

export default function SolutionsSection() {
  const [activeTab, setActiveTab] = useState<"clinic" | "enterprise">("clinic");
  const packages = activeTab === "clinic" ? clinicPackages : enterprisePackages;

  return (
    <section
      id="solutions"
      className="py-20 bg-slate-50/70 dark:bg-[#0b0f17] border-y border-slate-200/80 dark:border-slate-800 transition-colors duration-200"
      aria-label="Giải pháp B2B OsteoSys"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mb-10 space-y-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#0284c7] dark:text-cyan-400 font-mono-data">
            Giải Pháp B2B Chuyên Nghiệp
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Gói Giải Pháp Theo Đối Tượng Khách Hàng
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            Thiết kế tối ưu cho từng mô hình: Từ phòng khám đa khoa, bệnh viện đến chiến dịch khám sức khỏe lưu động doanh nghiệp.
          </p>
        </motion.div>

        {/* Tab switcher with Framer Motion layoutId */}
        <div className="flex border border-slate-200 dark:border-slate-800 rounded-lg p-1 w-fit mb-10 bg-white dark:bg-slate-900 shadow-2xs relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "clinic" | "enterprise")}
              className={`relative px-5 py-2 text-xs font-semibold rounded-md transition-colors z-10 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeSolutionTab"
                  className="absolute inset-0 bg-[#0284c7] dark:bg-cyan-600 rounded-md shadow-xs"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Package cards with hover lift */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid md:grid-cols-3 gap-6 items-stretch"
          >
            {packages.map((pkg) => (
              <motion.div
                key={pkg.name}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`relative flex flex-col bg-white dark:bg-slate-900/90 border rounded-xl p-6 shadow-2xs transition-all justify-between ${
                  "highlight" in pkg && pkg.highlight
                    ? "border-[#0284c7] dark:border-cyan-500/60 ring-2 ring-[#0284c7]/20 dark:ring-cyan-500/20 shadow-md dark:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {"badge" in pkg && pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 bg-[#0284c7] dark:bg-cyan-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {pkg.tagline}
                    </p>
                  </div>

                  <div className="py-2.5 border-y border-slate-100 dark:border-slate-800">
                    <p className="font-mono-data text-base font-bold text-[#0284c7] dark:text-cyan-400">
                      {pkg.price}
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {pkg.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <Check size={14} className="text-[#0284c7] dark:text-cyan-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4">
                  <Link
                    href={pkg.link}
                    className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-md transition-colors ${
                      "highlight" in pkg && pkg.highlight
                        ? "bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{pkg.cta}</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
