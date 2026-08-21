"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CalendarCheck,
  Wrench,
  Clock,
  Check,
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "maintenance" | "rental" | "system" | "warning";
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "maintenance" | "rental">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      type: "warning",
      title: "Hiệu chuẩn định kỳ Sonost 3000 (#OST-3000-8842)",
      description: "Đầu dò gót chân cần kiểm chuẩn bằng Phantom Hologic trước ngày 25/08.",
      time: "10 phút trước",
      read: false,
    },
    {
      id: "notif-2",
      type: "rental",
      title: "Yêu cầu gia hạn hợp đồng thuê Sonost 3000",
      description: "BV Đa khoa Hồng Ngọc đề xuất gia hạn thêm 06 tháng (Máy #SN-3000-4102).",
      time: "1 giờ trước",
      read: false,
    },
    {
      id: "notif-3",
      type: "maintenance",
      title: "Hoàn tất sửa chữa board nguồn Sonost 3000",
      description: "Kỹ sư Nguyễn Văn Tuấn đã test đạt chuẩn SOS/BUA, sẵn sàng trả máy.",
      time: "3 giờ trước",
      read: false,
    },
    {
      id: "notif-4",
      type: "rental",
      title: "Hợp đồng thuê mới: BV Quốc tế Vinmec",
      description: "Đã ký biên bản bàn giao 02 máy Sonost 3000 kèm giấy in nhiệt.",
      time: "Hôm qua",
      read: true,
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "maintenance") return n.type === "maintenance" || n.type === "warning";
    if (activeTab === "rental") return n.type === "rental";
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none"
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#0284c7] text-white text-xs font-bold rounded-full flex items-center justify-center font-mono-data animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown with Scale-In Transform Origin */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden will-change-transform"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Thông báo hệ thống
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-mono-data bg-sky-100 dark:bg-sky-950 text-[#0284c7] dark:text-sky-400 rounded font-medium">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#0284c7] hover:text-[#0369a1] dark:hover:text-sky-300 flex items-center gap-1 font-medium"
                >
                  <Check size={12} /> Đã đọc tất cả
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-2 pt-2 bg-slate-50/50 dark:bg-slate-950/50 text-xs">
              {[
                { id: "all", label: "Tất cả" },
                { id: "maintenance", label: "Bảo trì & Sự cố" },
                { id: "rental", label: "Hợp đồng thuê" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1.5 font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-[#0284c7] text-[#0284c7] dark:text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  Không có thông báo nào trong mục này
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 sm:p-3.5 flex gap-3 transition-colors cursor-pointer ${
                      n.read
                        ? "hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75"
                        : "bg-sky-50/40 dark:bg-sky-950/20 hover:bg-sky-50/70 dark:hover:bg-sky-950/40"
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {n.type === "warning" && (
                        <div className="w-7 h-7 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <AlertTriangle size={14} />
                        </div>
                      )}
                      {n.type === "maintenance" && (
                        <div className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Wrench size={14} />
                        </div>
                      )}
                      {n.type === "rental" && (
                        <div className="w-7 h-7 rounded bg-sky-100 dark:bg-sky-950 text-[#0284c7] dark:text-sky-400 flex items-center justify-center">
                          <CalendarCheck size={14} />
                        </div>
                      )}
                      {n.type === "system" && (
                        <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#0284c7] shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {n.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400 font-mono-data">
                        <Clock size={10} />
                        <span>{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
              <a
                href="/admin/sua-chua"
                className="text-xs font-medium text-[#0284c7] dark:text-sky-400 hover:underline block py-1"
              >
                Xem nhật ký bảo dưỡng &amp; cảnh báo →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
