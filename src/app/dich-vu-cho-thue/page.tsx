"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Wrench,
  Building2,
  Users,
  Award,
} from "lucide-react";

export default function RentalServicePage() {
  const [selectedMonths, setSelectedMonths] = useState(6);

  const packages = [
    {
      id: "event",
      name: "Gói Khám Đoàn / Sự Kiện",
      tagline: "Dành cho chiến dịch khám sức khỏe lưu động doanh nghiệp",
      price: "1.500.000 đ",
      unit: "/ ngày",
      badge: "Linh Hoạt 24h",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      features: [
        "Cung cấp máy Sonost 3000 kiểm chuẩn sẵn",
        "Kèm 02 can gel siêu âm y tế + 05 cuộn giấy in",
        "Kỹ thuật viên giao nhận & hướng dẫn tận nơi",
        "Hỗ trợ máy dự phòng trong 30 phút tại HN & TP.HCM",
      ],
      popular: false,
    },
    {
      id: "clinic",
      name: "Gói Phòng Khám Tiêu Chuẩn",
      tagline: "Tối ưu chi phí đầu tư ban đầu cho phòng khám đa khoa",
      price: "15.000.000 đ",
      unit: "/ tháng",
      badge: "Phổ Biến Nhất",
      badgeColor: "bg-sky-100 text-[#0284c7] dark:bg-sky-950 dark:text-sky-300",
      features: [
        "Thuê máy Sonost 3000 PRO đời mới nhất",
        "Miễn phí hiệu chuẩn Phantom định kỳ 3 tháng/lần",
        "Cung cấp giấy in nhiệt & gel siêu âm định mức",
        "Đổi máy tương đương ngay nếu phát sinh sự cố",
        "Hỗ trợ kỹ thuật 24/7 từ kỹ sư OsteoSys",
      ],
      popular: true,
    },
    {
      id: "hospital",
      name: "Gói Bệnh Viện Dài Hạn",
      tagline: "Hợp đồng từ 12 tháng trở lên với nhiều đặc quyền B2B",
      price: "13.500.000 đ",
      unit: "/ tháng",
      badge: "Tiết Kiệm 15%",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      features: [
        "Cam kết máy mới 100% nguyên thùng",
        "Tích hợp kết nối mạng bệnh viện HIS/PACS (DICOM 3.0)",
        "Gel siêu âm & giấy in nhiệt không giới hạn",
        "Bảo trì, bảo dưỡng toàn diện miễn phí 100%",
        "Chuyển giao quyền sở hữu sau 36 tháng thuê",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      <Header />

      <main className="pt-24 pb-16">
        {/* 1. Header Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#0284c7] dark:text-sky-400 text-xs font-semibold uppercase tracking-wider font-mono-data">
            <CalendarCheck size={14} />
            <span>Giải Pháp Cho Thuê Thiết Bị Y Tế B2B</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dịch Vụ Cho Thuê Máy Đo Loãng Xương Sonost 3000
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Giúp bệnh viện và phòng khám mở rộng dịch vụ đo mật độ xương ngay lập tức với chi phí 0đ đầu tư ban đầu, đầy đủ bảo dưỡng và hỗ trợ kỹ thuật chuyên nghiệp.
          </p>
        </section>

        {/* 2. 3 Rental Packages Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.35 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border transition-all flex flex-col justify-between relative ${
                  pkg.popular
                    ? "border-[#0284c7] ring-2 ring-[#0284c7]/20 shadow-md"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0284c7] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    Lựa Chọn Đề Xuất
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full font-mono-data ${pkg.badgeColor}`}>
                      {pkg.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {pkg.tagline}
                    </p>
                  </div>

                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold font-mono-data text-slate-900 dark:text-white">
                      {pkg.price}
                    </span>
                    <span className="text-xs text-slate-500 font-mono-data">
                      {pkg.unit}
                    </span>
                  </div>

                  {/* Bullet points */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                    {pkg.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={15} className="text-[#0284c7] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/bao-gia?package=${pkg.id}`}
                    className={`w-full py-2.5 px-4 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      pkg.popular
                        ? "bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span>Đăng Ký Thuê Gói Này</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. 4-Step Rental Process */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white text-center">
              Quy Trình Bàn Giao &amp; Hỗ Trợ Thuê Máy
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "01", title: "Tư vấn & Báo giá", desc: "Xác định nhu cầu theo số lượng ca đo và địa điểm khám." },
                { step: "02", title: "Ký hợp đồng B2B", desc: "Thủ tục nhanh gọn, xuất hóa đơn VAT đầy đủ theo quy định." },
                { step: "03", title: "Giao máy & Đào tạo", desc: "Kỹ sư y sinh bàn giao máy, hướng dẫn đo và cấp chứng nhận vận hành." },
                { step: "04", title: "Đồng hành 24/7", desc: "Hiệu chuẩn định kỳ, cấp phát vật tư gel/giấy và hỗ trợ kỹ thuật liên tục." },
              ].map((s, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-2">
                  <span className="text-xl font-mono-data font-bold text-[#0284c7]">{s.step}</span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{s.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
