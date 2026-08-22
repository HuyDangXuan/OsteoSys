"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  Clock,
  RotateCcw,
  Sliders,
  MessageSquare,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getAccounts,
  updateAccountStatus,
  AccountListItem,
} from "@/lib/actions/accounts";
import { AccountRole, AccountStatus } from "@/types/db";

interface AccountManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function AccountManagementDrawer({
  isOpen,
  onClose,
  onRefresh,
}: AccountManagementDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, active: 0, suspended: 0 });

  // Suspend Dialog State
  const [suspendingAccount, setSuspendingAccount] = useState<AccountListItem | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAccountsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAccounts({
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });
      setAccounts(res.accounts);
      setCounts(res.counts);
    } catch (err) {
      console.error("Failed to load accounts:", err);
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, roleFilter]);

  useEffect(() => {
    if (isOpen) {
      fetchAccountsList();
    }
  }, [isOpen, fetchAccountsList]);

  // Handle Quick Status Change
  const handleStatusChange = async (
    targetAccount: AccountListItem,
    newStatus: AccountStatus,
    reason?: string
  ) => {
    if (newStatus === "suspended" && !reason) {
      setSuspendingAccount(targetAccount);
      setSuspensionReason("Tài khoản tạm ngưng hoạt động theo chính sách bảo mật hoặc dịch vụ.");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateAccountStatus(targetAccount.id, {
        status: newStatus,
        suspensionReason: reason,
      });

      if (res.success) {
        toast.success(res.message);
        setSuspendingAccount(null);
        fetchAccountsList();
        onRefresh?.();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật tài khoản");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = async (targetAccount: AccountListItem, newRole: AccountRole) => {
    setIsUpdating(true);
    try {
      const res = await updateAccountStatus(targetAccount.id, {
        role: newRole,
      });

      if (res.success) {
        toast.success(res.message);
        fetchAccountsList();
        onRefresh?.();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật quyền hạn");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Slide-over Right Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-xl bg-white dark:bg-[#0b0f17] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10"
          >
            {/* 1. Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 dark:bg-cyan-950/70 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center shrink-0 border border-sky-200 dark:border-cyan-800/40">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Quản Trị Nhân Sự &amp; Tài Khoản
                    </h2>
                    {counts.pending > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-mono-data text-[11px] font-bold border border-amber-300 dark:border-amber-700 animate-pulse">
                        {counts.pending} chờ duyệt
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dành riêng cho Super Admin: Duyệt tài khoản, phân quyền vai trò và khóa/mở khóa.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={fetchAccountsList}
                  title="Tải lại danh sách"
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 2. Search & Filter Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900/60">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo email, họ tên, số điện thoại, cơ sở..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                {[
                  { id: "all", label: `Tất cả (${counts.total})` },
                  { id: "pending", label: `Chờ duyệt (${counts.pending})` },
                  { id: "active", label: `Hoạt động (${counts.active})` },
                  { id: "suspended", label: `Đã khóa (${counts.suspended})` },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setStatusFilter(chip.id)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                      statusFilter === chip.id
                        ? "bg-[#0284c7] dark:bg-cyan-950 text-white dark:text-cyan-300 border border-transparent dark:border-cyan-800"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Account List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-2.5"
                    >
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : accounts.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                  <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p>Không tìm thấy tài khoản nào khớp với bộ lọc.</p>
                </div>
              ) : (
                accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className={`p-4 bg-white dark:bg-slate-900/90 rounded-xl border shadow-2xs space-y-3 transition-all ${
                      acc.status === "pending"
                        ? "border-amber-300 dark:border-amber-800/80 bg-amber-50/10"
                        : acc.status === "suspended"
                        ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/10"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {/* Top Row: Avatar, Name, Role, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            acc.role === "super_admin"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                              : acc.role === "technician"
                              ? "bg-sky-100 text-sky-700 dark:bg-cyan-950 dark:text-cyan-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {acc.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {acc.fullName}
                            </span>
                            {acc.role === "super_admin" && (
                              <span title="Super Admin (Toàn quyền)">
                                <Shield size={12} className="text-purple-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {acc.email}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={acc.status} label={acc.statusLabel} />
                    </div>

                    {/* Meta: Clinic & Contact info */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1 truncate">
                        <Building2 size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate" title={acc.clinicName}>
                          {acc.clinicName || "Chưa gán đơn vị"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-mono-data text-right justify-end">
                        {acc.phone ? (
                          <>
                            <Phone size={10} className="text-slate-400" />
                            <span>{acc.phone}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Chưa có SĐT</span>
                        )}
                      </div>
                    </div>

                    {/* Suspension Reason Warning Banner if suspended */}
                    {acc.status === "suspended" && acc.suspensionReason && (
                      <div className="p-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-lg text-[11px] text-rose-800 dark:text-rose-300 space-y-0.5">
                        <span className="font-bold flex items-center gap-1">
                          <Lock size={10} /> Lý do khóa:
                        </span>
                        <p>{acc.suspensionReason}</p>
                      </div>
                    )}

                    {/* Appeal Notes alert if user submitted appeal */}
                    {acc.appealCount > 0 && (
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold">
                          <MessageSquare size={11} /> Có {acc.appealCount} đơn khiếu nại mở khóa
                        </span>
                        <span className="text-[10px] underline cursor-pointer font-bold">Xem đơn</span>
                      </div>
                    )}

                    {/* Bottom Actions: Role Selector & Status Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      {/* Role Dropdown */}
                      <select
                        value={acc.role}
                        onChange={(e) => handleRoleChange(acc, e.target.value as AccountRole)}
                        disabled={isUpdating}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-300 outline-none"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="sales">Kinh doanh (Sales)</option>
                        <option value="technician">Kỹ sư bảo trì</option>
                        <option value="support">CSKH &amp; Hỗ trợ</option>
                      </select>

                      {/* Status Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {acc.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(acc, "active")}
                              disabled={isUpdating}
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-2xs transition-colors"
                            >
                              <UserCheck size={12} />
                              <span>Duyệt</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(acc, "suspended")}
                              disabled={isUpdating}
                              className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-semibold transition-colors"
                            >
                              <UserX size={12} />
                              <span>Khóa</span>
                            </button>
                          </>
                        )}

                        {acc.status === "active" && (
                          <button
                            onClick={() => handleStatusChange(acc, "suspended")}
                            disabled={isUpdating}
                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded text-[11px] font-semibold transition-colors"
                          >
                            <Lock size={11} />
                            <span>Khóa tài khoản</span>
                          </button>
                        )}

                        {acc.status === "suspended" && (
                          <button
                            onClick={() => handleStatusChange(acc, "active")}
                            disabled={isUpdating}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded text-[11px] font-bold transition-colors"
                          >
                            <Unlock size={11} />
                            <span>Mở khóa kích hoạt</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 4. Footer info */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Mọi thay đổi trạng thái đều được ghi vào Audit Logs.</span>
              <span className="font-mono-data font-semibold">OsteoSys Auth Guard</span>
            </div>
          </motion.div>

          {/* Suspend Reason Dialog Modal */}
          <AnimatePresence>
            {suspendingAccount && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4"
                >
                  <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <ShieldAlert size={18} />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Khóa Tài Khoản: {suspendingAccount.fullName}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Nhập lý do tạm ngưng hoạt động cho tài khoản{" "}
                    <strong className="font-mono-data">{suspendingAccount.email}</strong>. Lý do này sẽ được hiển thị cho người dùng khi họ đăng nhập.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Lý do khóa tài khoản *
                    </label>
                    <textarea
                      rows={3}
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      placeholder="VD: Hết hạn hợp đồng thuê máy Sonost 3000 hoặc chưa hoàn tất kiểm định hiệu chuẩn định kỳ..."
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSuspendingAccount(null)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating || !suspensionReason.trim()}
                      onClick={() =>
                        handleStatusChange(suspendingAccount, "suspended", suspensionReason)
                      }
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                    >
                      {isUpdating ? "Đang xử lý..." : "Xác Nhận Khóa Tài Khoản"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
