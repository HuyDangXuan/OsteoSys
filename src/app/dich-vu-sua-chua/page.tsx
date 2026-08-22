"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Phone,
  MessageSquare,
  ShieldAlert,
  Loader2,
  Clock,
  Send,
  ShieldCheck,
} from "lucide-react";
import { getCmsContent } from "@/lib/actions/cms";

export default function RepairServicePage() {
  const [formData, setFormData] = useState({
    facility: "",
    contactPerson: "",
    phone: "",
    deviceSerial: "",
    issueDescription: "",
    isUrgent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cmsRepair, setCmsRepair] = useState<any>(null);
  const [globalData, setGlobalData] = useState<any>(null);

  const defaultSteps = [
    { num: "01", title: "Tiếp Nhận Yêu Cầu", desc: "Ghi nhận mã máy Sonost 3000, triệu chứng lỗi và địa chỉ cơ sở y tế." },
    { num: "02", title: "Kiểm Tra & Đo BUA/SOS", desc: "Kỹ sư đo kiểm tín hiệu xung đầu dò siêu âm và áp suất bóng khí tiếp xúc." },
    { num: "03", title: "Báo Giá Linh Kiện", desc: "Minh bạch chi phí linh kiện chính hãng OsteoSys kèm thời gian bảo hành." },
    { num: "04", title: "Sửa Chữa & Thay Thế", desc: "Thay thế màng bóng dầu, board nguồn, máy in nhiệt hoặc đầu dò 0.5MHz." },
    { num: "05", title: "Hiệu Chuẩn Phantom ISCD", desc: "Kiểm định sai số với Phantom chuẩn và dán tem kiểm định chất lượng." },
  ];

  const defaultFaults = [
    { title: "1. Nhiễu tín hiệu BUA / SOS:", desc: "Do suy hao đầu dò siêu âm 0.5MHz hoặc bong bóng khí trong màng dầu." },
    { title: "2. Màng bóng dầu bị xẹp / không căng:", desc: "Bơm dầu tự động bị kẹt van khí hoặc màng silicon bị chai cứng sau thời gian dài sử dụng." },
    { title: "3. Lỗi in nhiệt hoặc không kết nối PACS:", desc: "Kẹt trục cuốn giấy in nhiệt 58mm hoặc sai cấu hình IP máy chủ DICOM." },
  ];

  useEffect(() => {
    async function loadCms() {
      try {
        const [repairRes, globalRes] = await Promise.all([
          getCmsContent("repair_services"),
          getCmsContent("global"),
        ]);
        setCmsRepair(repairRes.data);
        setGlobalData(globalRes.data);
      } catch (e) {
        console.error("Failed to load repair services CMS:", e);
      }
    }
    loadCms();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  const stepsToRender = cmsRepair?.steps && Array.isArray(cmsRepair.steps) && cmsRepair.steps.length > 0
    ? cmsRepair.steps.map((s: any, idx: number) => ({
        num: String(s.stepNumber || idx + 1).padStart(2, "0"),
        title: s.title,
        desc: s.description || s.desc,
      }))
    : defaultSteps;

  const faultsToRender = cmsRepair?.commonFaults && Array.isArray(cmsRepair.commonFaults) && cmsRepair.commonFaults.length > 0
    ? cmsRepair.commonFaults.map((f: any, idx: number) => ({
        title: f.title.startsWith(`${idx + 1}.`) ? f.title : `${idx + 1}. ${f.title}`,
        desc: f.description || f.desc,
      }))
    : defaultFaults;

  const hotline = globalData?.hotline || "0904 000 000";
  const hotlineTel = hotline.replace(/\s+/g, "");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      <Header globalData={globalData} />

      <main className="pt-24 pb-16">
        {/* 1. Hero Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider font-mono-data">
            <Wrench size={14} />
            <span>Trung Tâm Kỹ Thuật Y Sinh OsteoSys</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dịch Vụ Sửa Chữa &amp; Hiệu Chuẩn Máy Sonost 3000
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Đội ngũ kỹ sư y sinh chuyên trách Sonost 3000 với đầy đủ linh kiện chính hãng, khối chuẩn Phantom đạt chuẩn kiểm định y tế ISCD và WHO.
          </p>
        </section>

        {/* 2. 5-Step Process */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white text-center">
              Quy Trình {stepsToRender.length} Bước Tiếp Nhận &amp; Kiểm Chuẩn Thiết Bị
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {stepsToRender.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-2 border border-slate-100 dark:border-slate-800"
                >
                  <span className="text-lg font-mono-data font-bold text-[#0284c7]">{s.num}</span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{s.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Common Issues Diagnosis & Emergency Request Form */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Col (5 cols): Common Issues */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={16} className="text-[#0284c7]" />
                Các Lỗi Kỹ Thuật Thường Gặp
              </h3>

              <div className="space-y-3 text-xs">
                {faultsToRender.map((fault: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{fault.title}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">{fault.desc}</p>
                  </div>
                ))}
              </div>

              {/* Warranty Commitment if present */}
              {cmsRepair?.warrantyCommitment && (
                <div className="p-3 rounded-md bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2">
                  <ShieldCheck size={16} className="text-[#0284c7] shrink-0 mt-0.5" />
                  <p>{cmsRepair.warrantyCommitment}</p>
                </div>
              )}

              {/* Fast Emergency Contact */}
              <div className="pt-2">
                <a
                  href={`tel:${hotlineTel}`}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <Phone size={14} />
                  <span>Hotline Cứu Hộ Thiết Bị: {hotline}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Col (7 cols): Request Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Gửi Yêu Cầu Sửa Chữa &amp; Kiểm Định Máy
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kỹ sư phụ trách khu vực sẽ liên hệ tư vấn và xếp lịch kiểm tra trong 30 phút.
                </p>
              </div>

              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Cơ sở y tế / Bệnh viện <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: PK Đa khoa Tâm Anh"
                        value={formData.facility}
                        onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Người liên hệ phụ trách máy <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: BS. Nguyễn Văn B"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Số điện thoại liên hệ <span className="text-rose-500">*</span>
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
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Số Serial máy (nếu có)
                      </label>
                      <input
                        type="text"
                        placeholder="VD: SN-3000-8842"
                        value={formData.deviceSerial}
                        onChange={(e) => setFormData({ ...formData, deviceSerial: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7] font-mono-data"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Mô tả chi tiết tình trạng sự cố <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="VD: Máy đo báo lỗi Calibrating Timeout, kết quả SOS nhảy thất thường..."
                      value={formData.issueDescription}
                      onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="urgentCheck"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="urgentCheck" className="text-xs text-rose-700 dark:text-rose-400 font-semibold cursor-pointer">
                      Yêu cầu xử lý khẩn cấp trong ngày (Máy đang phục vụ lịch khám bệnh nhân)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Đang gửi thông tin yêu cầu...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Gửi Yêu Cầu Kỹ Thuật</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center space-y-3 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-300 mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-100">
                    Đã tiếp nhận yêu cầu sửa chữa thành công!
                  </h4>
                  <p className="max-w-md mx-auto leading-relaxed">
                    Kỹ sư trưởng OsteoSys đã nhận thông tin và sẽ gọi điện cho bạn qua số <span className="font-mono-data font-bold">{formData.phone}</span> trong vòng 15–30 phút.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer globalData={globalData} />
    </div>
  );
}
