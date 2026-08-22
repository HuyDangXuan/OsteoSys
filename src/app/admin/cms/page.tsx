"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Home,
  Cpu,
  CreditCard,
  Wrench,
  HelpCircle,
  Save,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  GripVertical,
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  Bell,
  FileText,
  Image,
  Link2,
  ChevronUp,
  ChevronDown,
  Settings2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllCmsContents,
  updateCmsSection,
} from "@/lib/actions/cms";
import { CmsSectionKey } from "@/types/db";

export const dynamic = "force-dynamic";

interface CmsTabConfig {
  id: CmsSectionKey;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const CMS_TABS: CmsTabConfig[] = [
  { id: "global", title: "Cấu hình Chung & SEO", icon: Globe, color: "text-slate-600 dark:text-slate-400" },
  { id: "home_hero", title: "Trang Chủ & Hero", icon: Home, color: "text-sky-600 dark:text-sky-400" },
  { id: "sonost_specs", title: "Thông Số Kỹ Thuật", icon: Cpu, color: "text-cyan-600 dark:text-cyan-400" },
  { id: "rental_packages", title: "Gói Thuê Máy", icon: CreditCard, color: "text-amber-600 dark:text-amber-400" },
  { id: "repair_services", title: "Dịch Vụ Sửa Chữa", icon: Wrench, color: "text-indigo-600 dark:text-indigo-400" },
  { id: "faqs", title: "Câu Hỏi Thường Gặp", icon: HelpCircle, color: "text-emerald-600 dark:text-emerald-400" },
  { id: "clinical_evidence", title: "Bằng Chứng Lâm Sàng", icon: ShieldCheck, color: "text-teal-600 dark:text-teal-400" },
];

export default function CmsManagementPage() {
  const [activeTab, setActiveTab] = useState<CmsSectionKey>("global");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cmsData, setCmsData] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllCmsContents();
      setCmsData(data);
      // Initialize form data for current tab
      if (data[activeTab]) {
        setFormData(JSON.parse(JSON.stringify(data[activeTab].data)));
      }
    } catch (err) {
      console.error("Failed to load CMS data:", err);
      toast.error("Không thể tải dữ liệu CMS");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When tab changes, update formData from cmsData
  useEffect(() => {
    if (cmsData[activeTab]) {
      setFormData(JSON.parse(JSON.stringify(cmsData[activeTab].data)));
    }
  }, [activeTab, cmsData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateCmsSection(activeTab, formData);
      if (res.success) {
        toast.success(res.message);
        // Update local cmsData cache
        setCmsData((prev) => ({
          ...prev,
          [activeTab]: { ...prev[activeTab], data: JSON.parse(JSON.stringify(formData)) },
        }));
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu nội dung CMS");
    } finally {
      setIsSaving(false);
    }
  };

  // Generic field updater for nested formData
  const updateField = (path: string, value: any) => {
    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const lastUpdated = cmsData[activeTab]?.lastUpdatedBy
    ? `Cập nhật bởi ${cmsData[activeTab].lastUpdatedBy.fullName} lúc ${cmsData[activeTab].updatedAt ? new Date(cmsData[activeTab].updatedAt).toLocaleString("vi-VN") : "N/A"}`
    : "Đang sử dụng dữ liệu mặc định (chưa tùy chỉnh)";

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings2 className="text-[#0284c7]" size={24} />
            Hệ thống Quản trị Nội dung Website (CMS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tùy biến nội dung, thông số kỹ thuật và bảng giá dịch vụ hiển thị cho khách hàng.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium shadow-2xs transition-colors"
          >
            <ExternalLink size={14} />
            <span>Xem trang chủ</span>
          </a>
          <button
            onClick={loadData}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 rounded-lg shadow-2xs transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            <span>{isSaving ? "Đang lưu..." : "Lưu & Xuất bản"}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-2xs">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {CMS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-[#0284c7] text-white shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : tab.color} />
                <span>{tab.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-cms-tab"
                    className="absolute inset-0 border-2 border-sky-400 rounded-lg pointer-events-none"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 px-1">
        <Sparkles size={12} />
        <span>{lastUpdated}</span>
      </div>

      {/* Tab Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs p-6 space-y-6"
        >
          {/* RENDER TAB-SPECIFIC CONTENT */}
          
          {/* ===== TAB 1: GLOBAL & SEO ===== */}
          {activeTab === "global" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe size={18} className="text-slate-500" />
                Cấu hình Chung & SEO Website
              </h2>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone size={13} /> Hotline chính
                  </label>
                  <input type="text" value={formData.hotline || ""} onChange={(e) => updateField("hotline", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nhãn Hotline</label>
                  <input type="text" value={formData.hotlineLabel || ""} onChange={(e) => updateField("hotlineLabel", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail size={13} /> Email hỗ trợ
                  </label>
                  <input type="email" value={formData.email || ""} onChange={(e) => updateField("email", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Số Zalo liên hệ</label>
                  <input type="text" value={formData.zaloNumber || ""} onChange={(e) => updateField("zaloNumber", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin size={13} /> Địa chỉ Showroom / Kho tổng
                </label>
                <input type="text" value={formData.showroomAddress || ""} onChange={(e) => updateField("showroomAddress", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
              </div>

              {/* Top Announcement Banner */}
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Bell size={14} /> Banner Thông Báo Đầu Trang
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-slate-500">{formData.topBanner?.enabled ? "Đang bật" : "Đang tắt"}</span>
                    <div
                      onClick={() => updateField("topBanner.enabled", !formData.topBanner?.enabled)}
                      className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                        formData.topBanner?.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        formData.topBanner?.enabled ? "translate-x-4" : "translate-x-0.5"
                      }`} />
                    </div>
                  </label>
                </div>
                <input type="text" value={formData.topBanner?.text || ""} onChange={(e) => updateField("topBanner.text", e.target.value)} placeholder="Nội dung banner thông báo..." className="w-full p-2.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={formData.topBanner?.linkUrl || ""} onChange={(e) => updateField("topBanner.linkUrl", e.target.value)} placeholder="URL liên kết" className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                  <input type="text" value={formData.topBanner?.linkLabel || ""} onChange={(e) => updateField("topBanner.linkLabel", e.target.value)} placeholder="Nhãn nút" className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Search size={14} /> Cài đặt SEO & Meta Tags
                </h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tiêu đề SEO (Title Tag)</label>
                  <input type="text" value={formData.seo?.title || ""} onChange={(e) => updateField("seo.title", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mô tả SEO (Meta Description)</label>
                  <textarea rows={2} value={formData.seo?.description || ""} onChange={(e) => updateField("seo.description", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">OG Image URL</label>
                  <input type="text" value={formData.seo?.ogImage || ""} onChange={(e) => updateField("seo.ogImage", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                </div>

                {/* Google Preview */}
                <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                  <p className="text-xs text-slate-400">Xem trước kết quả Google:</p>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 truncate">{formData.seo?.title || "OsteoSys — Giải pháp đo mật độ xương"}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-500 font-mono">https://osteosys.vn</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{formData.seo?.description || "Mô tả SEO sẽ hiển thị ở đây..."}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB 2: HOME HERO ===== */}
          {activeTab === "home_hero" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Home size={18} className="text-sky-500" />
                Trang Chủ & Hero Banner
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Badge Overline</label>
                    <input type="text" value={formData.badge || ""} onChange={(e) => updateField("badge", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tiêu đề H1 chính</label>
                    <input type="text" value={formData.headline || ""} onChange={(e) => updateField("headline", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Đoạn mô tả lâm sàng</label>
                    <textarea rows={3} value={formData.description || ""} onChange={(e) => updateField("description", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Image size={12} /> URL ảnh render 3D máy</label>
                    <input type="text" value={formData.heroImageUrl || ""} onChange={(e) => updateField("heroImageUrl", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CTA 1 — Nhãn</label>
                      <input type="text" value={formData.cta1?.label || ""} onChange={(e) => updateField("cta1.label", e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CTA 1 — URL</label>
                      <input type="text" value={formData.cta1?.url || ""} onChange={(e) => updateField("cta1.url", e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CTA 2 — Nhãn</label>
                      <input type="text" value={formData.cta2?.label || ""} onChange={(e) => updateField("cta2.label", e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CTA 2 — URL</label>
                      <input type="text" value={formData.cta2?.url || ""} onChange={(e) => updateField("cta2.url", e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] font-mono" />
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-800 dark:to-sky-950/30 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] dark:text-cyan-400">{formData.badge || "BADGE"}</p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{formData.headline || "Tiêu đề chính"}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{formData.description || "Mô tả sẽ hiển thị ở đây..."}</p>
                  <div className="flex gap-2 pt-2">
                    <span className="px-3 py-1.5 bg-[#0284c7] text-white text-xs font-semibold rounded-md">{formData.cta1?.label || "CTA 1"}</span>
                    <span className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-xs font-semibold rounded-md text-slate-700 dark:text-slate-200">{formData.cta2?.label || "CTA 2"}</span>
                  </div>
                </div>
              </div>

              {/* 3 Pillars Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">3 Trụ cột lâm sàng nổi bật</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const pillars = [...(formData.pillars || [])];
                      pillars.push({ icon: "ShieldCheck", title: "Tiêu đề mới", description: "Mô tả trụ cột" });
                      updateField("pillars", pillars);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-[#0284c7] hover:text-[#0369a1]"
                  >
                    <Plus size={13} /> Thêm trụ cột
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.pillars || []).map((pillar: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input type="text" value={pillar.title || ""} onChange={(e) => { const p = [...formData.pillars]; p[idx] = { ...p[idx], title: e.target.value }; updateField("pillars", p); }} placeholder="Tiêu đề" className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7] font-semibold" />
                        <input type="text" value={pillar.description || ""} onChange={(e) => { const p = [...formData.pillars]; p[idx] = { ...p[idx], description: e.target.value }; updateField("pillars", p); }} placeholder="Mô tả" className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]" />
                      </div>
                      <button type="button" onClick={() => { const p = [...formData.pillars]; p.splice(idx, 1); updateField("pillars", p); }} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB 3: SONOST SPECS ===== */}
          {activeTab === "sonost_specs" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu size={18} className="text-cyan-500" />
                Thông Số Kỹ Thuật Sonost 3000 — Dynamic Specs Builder
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"><FileText size={12} /> Link tải Brochure PDF</label>
                <input type="text" value={formData.brochureUrl || ""} onChange={(e) => updateField("brochureUrl", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] font-mono" />
              </div>

              {/* Spec Groups */}
              {(formData.specGroups || []).map((group: any, gIdx: number) => (
                <div key={gIdx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <input type="text" value={group.groupTitle || ""} onChange={(e) => { const gs = [...formData.specGroups]; gs[gIdx] = { ...gs[gIdx], groupTitle: e.target.value }; updateField("specGroups", gs); }} className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none focus:underline" />
                    <button type="button" onClick={() => { const gs = [...formData.specGroups]; gs[gIdx].items.push({ label: "Thông số mới", value: "Giá trị" }); updateField("specGroups", gs); }} className="flex items-center gap-1 text-xs font-medium text-[#0284c7] hover:text-[#0369a1]">
                      <Plus size={12} /> Thêm dòng
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(group.items || []).map((item: any, iIdx: number) => (
                      <div key={iIdx} className="flex items-center gap-2">
                        <input type="text" value={item.label || ""} onChange={(e) => { const gs = [...formData.specGroups]; gs[gIdx].items[iIdx] = { ...gs[gIdx].items[iIdx], label: e.target.value }; updateField("specGroups", gs); }} className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7] font-semibold" />
                        <input type="text" value={item.value || ""} onChange={(e) => { const gs = [...formData.specGroups]; gs[gIdx].items[iIdx] = { ...gs[gIdx].items[iIdx], value: e.target.value }; updateField("specGroups", gs); }} className="flex-[2] p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]" />
                        <button type="button" onClick={() => { const gs = [...formData.specGroups]; gs[gIdx].items.splice(iIdx, 1); updateField("specGroups", gs); }} className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Deliverables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Bộ sản phẩm đi kèm (Deliverables)</h3>
                  <button type="button" onClick={() => { const d = [...(formData.deliverables || [])]; d.push("Mục mới"); updateField("deliverables", d); }} className="flex items-center gap-1 text-xs font-medium text-[#0284c7]">
                    <Plus size={12} /> Thêm mục
                  </button>
                </div>
                {(formData.deliverables || []).map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="text" value={item} onChange={(e) => { const d = [...formData.deliverables]; d[idx] = e.target.value; updateField("deliverables", d); }} className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]" />
                    <button type="button" onClick={() => { const d = [...formData.deliverables]; d.splice(idx, 1); updateField("deliverables", d); }} className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== TAB 4: RENTAL PACKAGES ===== */}
          {activeTab === "rental_packages" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard size={18} className="text-amber-500" />
                Bảng Gói Thuê Máy Sonost 3000
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {(formData.packages || []).map((pkg: any, pIdx: number) => (
                  <div key={pIdx} className={`p-4 rounded-xl border space-y-3 ${pkg.isPopular ? "border-[#0284c7] dark:border-cyan-700 bg-sky-50/30 dark:bg-sky-950/20 ring-1 ring-sky-400/20" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"}`}>
                    <div className="space-y-1.5">
                      <input type="text" value={pkg.name || ""} onChange={(e) => { const ps = [...formData.packages]; ps[pIdx] = { ...ps[pIdx], name: e.target.value }; updateField("packages", ps); }} className="w-full text-sm font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={pkg.price || ""} onChange={(e) => { const ps = [...formData.packages]; ps[pIdx] = { ...ps[pIdx], price: e.target.value }; updateField("packages", ps); }} placeholder="Giá" className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7] font-mono font-bold" />
                        <input type="text" value={pkg.priceUnit || ""} onChange={(e) => { const ps = [...formData.packages]; ps[pIdx] = { ...ps[pIdx], priceUnit: e.target.value }; updateField("packages", ps); }} placeholder="Đơn vị" className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" value={pkg.badge || ""} onChange={(e) => { const ps = [...formData.packages]; ps[pIdx] = { ...ps[pIdx], badge: e.target.value }; updateField("packages", ps); }} placeholder="Badge" className="flex-1 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]" />
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input type="checkbox" checked={pkg.isPopular || false} onChange={(e) => { const ps = [...formData.packages]; ps[pIdx] = { ...ps[pIdx], isPopular: e.target.checked }; updateField("packages", ps); }} className="w-3.5 h-3.5 rounded" />
                          <span className="text-slate-600 dark:text-slate-400">Nổi bật</span>
                        </label>
                      </div>
                    </div>
                    {/* Features List */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quyền lợi:</span>
                        <button type="button" onClick={() => { const ps = [...formData.packages]; ps[pIdx].features.push("Quyền lợi mới"); updateField("packages", ps); }} className="text-[#0284c7] hover:text-[#0369a1]">
                          <Plus size={13} />
                        </button>
                      </div>
                      {(pkg.features || []).map((f: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-center gap-1.5">
                          <input type="text" value={f} onChange={(e) => { const ps = [...formData.packages]; ps[pIdx].features[fIdx] = e.target.value; updateField("packages", ps); }} className="flex-1 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]" />
                          <button type="button" onClick={() => { const ps = [...formData.packages]; ps[pIdx].features.splice(fIdx, 1); updateField("packages", ps); }} className="p-0.5 text-rose-500"><Trash2 size={11} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== TAB 5: REPAIR SERVICES ===== */}
          {activeTab === "repair_services" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Wrench size={18} className="text-indigo-500" />
                Dịch Vụ Sửa Chữa & Quy Trình Tiếp Nhận
              </h2>

              {/* Steps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Các bước quy trình</h3>
                  <button type="button" onClick={() => { const s = [...(formData.steps || [])]; s.push({ stepNumber: s.length + 1, title: "Bước mới", description: "Mô tả bước" }); updateField("steps", s); }} className="flex items-center gap-1 text-xs font-medium text-[#0284c7]">
                    <Plus size={12} /> Thêm bước
                  </button>
                </div>
                {(formData.steps || []).map((step: any, sIdx: number) => (
                  <div key={sIdx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">{step.stepNumber || sIdx + 1}</div>
                    <div className="flex-1 space-y-1.5">
                      <input type="text" value={step.title || ""} onChange={(e) => { const s = [...formData.steps]; s[sIdx] = { ...s[sIdx], title: e.target.value }; updateField("steps", s); }} className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold outline-none focus:border-[#0284c7]" />
                      <textarea rows={2} value={step.description || ""} onChange={(e) => { const s = [...formData.steps]; s[sIdx] = { ...s[sIdx], description: e.target.value }; updateField("steps", s); }} className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]" />
                    </div>
                    <button type="button" onClick={() => { const s = [...formData.steps]; s.splice(sIdx, 1); updateField("steps", s); }} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>

              {/* Common Faults */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Lỗi thường gặp</h3>
                  <button type="button" onClick={() => { const f = [...(formData.commonFaults || [])]; f.push({ title: "Lỗi mới", description: "Mô tả lỗi" }); updateField("commonFaults", f); }} className="flex items-center gap-1 text-xs font-medium text-[#0284c7]">
                    <Plus size={12} /> Thêm lỗi
                  </button>
                </div>
                {(formData.commonFaults || []).map((fault: any, fIdx: number) => (
                  <div key={fIdx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 space-y-1.5">
                      <input type="text" value={fault.title || ""} onChange={(e) => { const f = [...formData.commonFaults]; f[fIdx] = { ...f[fIdx], title: e.target.value }; updateField("commonFaults", f); }} className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold outline-none focus:border-[#0284c7]" />
                      <input type="text" value={fault.description || ""} onChange={(e) => { const f = [...formData.commonFaults]; f[fIdx] = { ...f[fIdx], description: e.target.value }; updateField("commonFaults", f); }} className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]" />
                    </div>
                    <button type="button" onClick={() => { const f = [...formData.commonFaults]; f.splice(fIdx, 1); updateField("commonFaults", f); }} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>

              {/* Warranty */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"><ShieldCheck size={13} /> Cam kết bảo hành</label>
                <textarea rows={2} value={formData.warrantyCommitment || ""} onChange={(e) => updateField("warrantyCommitment", e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7]" />
              </div>
            </div>
          )}

          {/* ===== TAB 6: FAQs ===== */}
          {activeTab === "faqs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HelpCircle size={18} className="text-emerald-500" />
                  Câu Hỏi Thường Gặp (FAQs)
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const items = [...(formData.items || [])];
                    items.push({ question: "Câu hỏi mới?", answer: "Nội dung trả lời..." });
                    updateField("items", items);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  <Plus size={13} /> Thêm câu hỏi
                </button>
              </div>

              <div className="space-y-3">
                {(formData.items || []).map((faq: any, fIdx: number) => (
                  <div key={fIdx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Câu hỏi #{fIdx + 1}</label>
                          <input type="text" value={faq.question || ""} onChange={(e) => { const items = [...formData.items]; items[fIdx] = { ...items[fIdx], question: e.target.value }; updateField("items", items); }} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-[#0284c7]" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Câu trả lời</label>
                          <textarea rows={3} value={faq.answer || ""} onChange={(e) => { const items = [...formData.items]; items[fIdx] = { ...items[fIdx], answer: e.target.value }; updateField("items", items); }} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] leading-relaxed" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {fIdx > 0 && (
                          <button type="button" onClick={() => { const items = [...formData.items]; [items[fIdx - 1], items[fIdx]] = [items[fIdx], items[fIdx - 1]]; updateField("items", items); }} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                            <ChevronUp size={13} />
                          </button>
                        )}
                        {fIdx < (formData.items?.length || 0) - 1 && (
                          <button type="button" onClick={() => { const items = [...formData.items]; [items[fIdx], items[fIdx + 1]] = [items[fIdx + 1], items[fIdx]]; updateField("items", items); }} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                            <ChevronDown size={13} />
                          </button>
                        )}
                        <button type="button" onClick={() => { const items = [...formData.items]; items.splice(fIdx, 1); updateField("items", items); }} className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== TAB 7: CLINICAL EVIDENCE ===== */}
          {activeTab === "clinical_evidence" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-teal-500" />
                  Tiêu Chuẩn &amp; Bằng Chứng Lâm Sàng
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const stds = [...(formData.standards || [])];
                    stds.push({ title: "Tiêu chuẩn mới", body: "Mô tả tiêu chuẩn lâm sàng..." });
                    updateField("standards", stds);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
                >
                  <Plus size={13} /> Thêm tiêu chuẩn
                </button>
              </div>

              {/* Standards list */}
              <div className="space-y-3">
                {(formData.standards || []).map((std: any, sIdx: number) => (
                  <div key={sIdx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={std.title || ""}
                          onChange={(e) => {
                            const stds = [...formData.standards];
                            stds[sIdx] = { ...stds[sIdx], title: e.target.value };
                            updateField("standards", stds);
                          }}
                          placeholder="Tiêu đề tiêu chuẩn..."
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-[#0284c7]"
                        />
                        <textarea
                          rows={3}
                          value={std.body || ""}
                          onChange={(e) => {
                            const stds = [...formData.standards];
                            stds[sIdx] = { ...stds[sIdx], body: e.target.value };
                            updateField("standards", stds);
                          }}
                          placeholder="Nội dung chứng cứ lâm sàng..."
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] leading-relaxed"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const stds = [...formData.standards];
                          stds.splice(sIdx, 1);
                          updateField("standards", stds);
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Badges &amp; Chứng chỉ y tế</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const b = [...(formData.badges || [])];
                      b.push("CHỨNG CHỈ MỚI");
                      updateField("badges", b);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-[#0284c7]"
                  >
                    <Plus size={12} /> Thêm badge
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.badges || []).map((badge: string, bIdx: number) => (
                    <div key={bIdx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => {
                          const b = [...formData.badges];
                          b[bIdx] = e.target.value;
                          updateField("badges", b);
                        }}
                        className="bg-transparent border-none outline-none font-mono-data font-bold text-[#0284c7] dark:text-cyan-400 w-28"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const b = [...formData.badges];
                          b.splice(bIdx, 1);
                          updateField("badges", b);
                        }}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
