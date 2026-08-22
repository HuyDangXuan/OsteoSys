"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  FileText,
  CheckCircle2,
  Send,
  Loader2,
  Building2,
  Phone,
  Mail,
  User,
  Radio,
  Sparkles,
} from "lucide-react";
import { getCmsContent } from "@/lib/actions/cms";

function QuoteFormContent() {
  const searchParams = useSearchParams();
  const initialPackage = searchParams.get("package") || searchParams.get("product") || "rental";

  const [selectedService, setSelectedService] = useState<string>(
    initialPackage.includes("sonost") ? "buy" : "rental"
  );
  const [formData, setFormData] = useState({
    facility: "",
    fullName: "",
    email: "",
    phone: "",
    location: "Hà Nội",
    estimatedScans: "100-300 ca/tháng",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [globalData, setGlobalData] = useState<any>(null);

  useEffect(() => {
    async function loadGlobal() {
      try {
        const res = await getCmsContent("global");
        setGlobalData(res.data);
      } catch (e) {
        console.error("Failed to load global CMS data:", e);
      }
    }
    loadGlobal();
  }, []);

  const services = [
    { id: "rental", label: "🏢 Thuê máy Sonost 3000 (0đ vốn ban đầu)" },
    { id: "buy", label: "📦 Mua máy Sonost 3000 chính hãng" },
    { id: "repair", label: "🔧 Sửa chữa / Hiệu chuẩn Phantom" },
    { id: "supplies", label: "📄 Đặt mua Can Gel & Giấy in nhiệt" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      <Header globalData={globalData} />

      <main className="pt-24 pb-16">
        {/* 1. Header Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#0284c7] dark:text-sky-400 text-xs font-semibold uppercase tracking-wider font-mono-data">
            <FileText size={14} />
            <span>Tư Vấn &amp; Báo Giá Giải Pháp Y Tế B2B</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Yêu Cầu Báo Giá Thiết Bị &amp; Dịch Vụ Sonost 3000
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Nhận bảng phân tích chi phí, hợp đồng mẫu và chính sách chiết khấu tốt nhất cho cơ sở y tế của bạn trong vòng 1 giờ làm việc.
          </p>
        </section>

        {/* 2. Interactive Form Container */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Service Selection Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                1. Chọn nhu cầu dịch vụ của đơn vị:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedService(s.id)}
                    className={`p-3 rounded-lg border text-xs font-semibold text-left transition-all relative ${
                      selectedService === s.id
                        ? "border-[#0284c7] bg-sky-50/70 dark:bg-sky-950/50 text-[#0284c7] dark:text-sky-300 ring-2 ring-[#0284c7]/20"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Building2 size={13} className="text-[#0284c7]" />
                      Tên Phòng khám / Bệnh viện <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Phòng khám Đa khoa Việt Hàn"
                      value={formData.facility}
                      onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <User size={13} className="text-[#0284c7]" />
                      Họ tên người liên hệ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: BS. Nguyễn Văn C"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Phone size={13} className="text-[#0284c7]" />
                      Số điện thoại nhận báo giá <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0901 234 567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Mail size={13} className="text-[#0284c7]" />
                      Email công vụ nhận bảng giá
                    </label>
                    <input
                      type="email"
                      placeholder="bacsi@viethan.vn"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Địa điểm cơ sở y tế
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                    >
                      <option value="Hà Nội">Khu vực Hà Nội &amp; Miền Bắc</option>
                      <option value="TP.HCM">Khu vực TP. Hồ Chí Minh &amp; Miền Nam</option>
                      <option value="Đà Nẵng">Khu vực Đà Nẵng &amp; Miền Trung</option>
                      <option value="Tỉnh khác">Các tỉnh thành khác toàn quốc</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Quy mô ca đo dự kiến hàng tháng
                    </label>
                    <select
                      value={formData.estimatedScans}
                      onChange={(e) => setFormData({ ...formData, estimatedScans: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                    >
                      <option value="<100 ca/tháng">Dưới 100 ca/tháng</option>
                      <option value="100-300 ca/tháng">Từ 100 đến 300 ca/tháng (Phòng khám vừa)</option>
                      <option value="300-1000 ca/tháng">Từ 300 đến 1.000 ca/tháng (Bệnh viện lớn)</option>
                      <option value=">1000 ca/tháng">Khám đoàn doanh nghiệp số lượng lớn (&gt;1.000 ca)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Ghi chú yêu cầu đặc thù (nếu có)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Cần máy gấp trước ngày 28/08 cho chiến dịch khám sức khỏe trường học..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Đang tổng hợp báo giá...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Nhận Báo Giá Chi Tiết &amp; Hợp Đồng Mẫu</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-8 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center space-y-3 text-xs text-emerald-900 dark:text-emerald-200">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-300 mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="font-bold text-base text-emerald-800 dark:text-emerald-100">
                  Đã gửi yêu cầu báo giá thành công!
                </h4>
                <p className="max-w-md mx-auto leading-relaxed">
                  Chuyên viên phụ trách giải pháp B2B OsteoSys sẽ gửi bảng báo giá chi tiết và gọi điện thoại hỗ trợ qua số <span className="font-mono-data font-bold">{formData.phone}</span> trong vòng 30–60 phút.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-xs font-semibold text-[#0284c7] dark:text-sky-400 hover:underline"
                  >
                    ← Gửi thêm yêu cầu báo giá khác
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer globalData={globalData} />
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
          <Loader2 className="animate-spin text-[#0284c7]" size={28} />
        </div>
      }
    >
      <QuoteFormContent />
    </Suspense>
  );
}
