"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  AlertOctagon,
  HelpCircle,
  Stethoscope,
  Wrench,
  Headphones,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { StatusBadge } from "@/components/ui/status-badge";
import { CountUp } from "@/components/admin/DynamicStatCards";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getAccounts,
  getCurrentAccount,
  createAccount,
  updateAccount,
  updateAccountStatus,
  resetAccountPassword,
  deleteAccount,
  AccountListItem,
} from "@/lib/actions/accounts";
import {
  CreateAccountFormData,
  UpdateAccountFormData,
  createAccountSchema,
  updateAccountSchema,
  ROLE_LABELS,
  STATUS_LABELS,
} from "@/lib/schemas/account-schema";
import { AccountRole, AccountStatus } from "@/types/db";

export const dynamic = "force-dynamic";

// Role styling and icons
const ROLE_BADGE_STYLES: Record<AccountRole, { bg: string; text: string; border: string; icon: any }> = {
  super_admin: {
    bg: "bg-purple-50 dark:bg-purple-950/70",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/50",
    icon: Shield,
  },
  sales: {
    bg: "bg-sky-50 dark:bg-cyan-950/70",
    text: "text-[#0284c7] dark:text-cyan-300",
    border: "border-sky-200 dark:border-cyan-800/50",
    icon: Stethoscope,
  },
  technician: {
    bg: "bg-amber-50 dark:bg-amber-950/70",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
    icon: Wrench,
  },
  support: {
    bg: "bg-emerald-50 dark:bg-emerald-950/70",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/50",
    icon: Headphones,
  },
};

export default function AdminAccountsPage() {
  const [currentUser, setCurrentUser] = useState<AccountListItem | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, active: 0, suspended: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<AccountListItem | null>(null);

  // Forms state
  const [createFormData, setCreateFormData] = useState<CreateAccountFormData>({
    fullName: "",
    email: "",
    phone: "",
    clinicName: "",
    password: "",
    role: "sales",
    status: "active",
  });
  const [editFormData, setEditFormData] = useState<UpdateAccountFormData>({
    fullName: "",
    phone: "",
    clinicName: "",
    role: "sales",
  });
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [suspensionReasonText, setSuspensionReasonText] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // 1. Fetch Current User & Verify Super Admin permission
  useEffect(() => {
    async function loadSession() {
      setIsCheckingAuth(true);
      try {
        const acc = await getCurrentAccount();
        setCurrentUser(acc);
      } catch (err) {
        console.error("Error loading session:", err);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    loadSession();
  }, []);

  // 2. Fetch Accounts Data
  const fetchAccountsData = useCallback(async () => {
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
      console.error("Error fetching accounts:", err);
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, roleFilter]);

  useEffect(() => {
    if (!isCheckingAuth) {
      fetchAccountsData();
    }
  }, [isCheckingAuth, fetchAccountsData]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Đã sao chép: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate safe random password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "Ost@";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += "2026";
    setNewPasswordValue(pass);
    toast.success("Đã sinh mật khẩu ngẫu nhiên an toàn!");
  };

  const { user: authUser, updateCurrentUser } = useAuth();

  // Handle Create Account
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAction(true);
    try {
      const res = await createAccount(createFormData);
      if (res.success) {
        toast.success(res.message);
        setIsCreateModalOpen(false);
        setCreateFormData({
          fullName: "",
          email: "",
          phone: "",
          clinicName: "",
          password: "",
          role: "sales",
          status: "active",
        });
        fetchAccountsData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tạo tài khoản");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Edit Account
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setIsSubmittingAction(true);
    try {
      const res = await updateAccount(selectedAccount.id, editFormData);
      if (res.success) {
        toast.success(res.message);
        setIsEditModalOpen(false);
        if (
          authUser &&
          (authUser.id === selectedAccount.id ||
            authUser.email.toLowerCase() === selectedAccount.email.toLowerCase())
        ) {
          updateCurrentUser({
            fullName: editFormData.fullName,
            phone: editFormData.phone,
            clinicName: editFormData.clinicName,
            role: editFormData.role,
          });
          if (currentUser) {
            setCurrentUser({
              ...currentUser,
              fullName: editFormData.fullName,
              phone: editFormData.phone,
              clinicName: editFormData.clinicName,
              role: editFormData.role,
            });
          }
        }
        setSelectedAccount(null);
        fetchAccountsData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật tài khoản");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Quick Status Change / Approval / Unlock
  const handleQuickStatusUpdate = async (
    target: AccountListItem,
    newStatus: AccountStatus,
    reason?: string
  ) => {
    if (newStatus === "suspended" && !reason) {
      setSelectedAccount(target);
      setSuspensionReasonText("Tài khoản tạm ngưng hoạt động theo chính sách bảo mật hoặc dịch vụ.");
      setIsSuspendModalOpen(true);
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await updateAccountStatus(target.id, {
        status: newStatus,
        suspensionReason: reason,
      });
      if (res.success) {
        toast.success(res.message);
        setIsSuspendModalOpen(false);
        setSelectedAccount(null);
        fetchAccountsData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật trạng thái");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !newPasswordValue) return;
    setIsSubmittingAction(true);
    try {
      const res = await resetAccountPassword(selectedAccount.id, newPasswordValue);
      if (res.success) {
        toast.success(res.message);
        setIsResetPassModalOpen(false);
        setSelectedAccount(null);
        setNewPasswordValue("");
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi đặt lại mật khẩu");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Delete Account Submit
  const handleDeleteSubmit = async () => {
    if (!selectedAccount) return;
    setIsSubmittingAction(true);
    try {
      const res = await deleteAccount(selectedAccount.id);
      if (res.success) {
        toast.success(res.message);
        setIsDeleteModalOpen(false);
        setSelectedAccount(null);
        fetchAccountsData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa tài khoản");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (accounts.length === 0) {
      toast.error("Không có dữ liệu tài khoản để xuất");
      return;
    }
    const headers = ["ID", "Họ và tên", "Email", "Số điện thoại", "Đơn vị/Phòng khám", "Phân quyền", "Trạng thái", "Đăng nhập cuối", "Ngày tạo"];
    const rows = accounts.map((a) => [
      a.id,
      `"${a.fullName}"`,
      a.email,
      a.phone || "",
      `"${a.clinicName || ""}"`,
      a.roleLabel,
      a.statusLabel,
      `"${a.lastLoginAt || "Chưa từng"}"`,
      a.createdAt,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `OsteoSys_Accounts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất danh sách tài khoản CSV thành công!");
  };

  // Open Edit modal helper
  const openEditModal = (acc: AccountListItem) => {
    setSelectedAccount(acc);
    setEditFormData({
      fullName: acc.fullName,
      phone: acc.phone || "",
      clinicName: acc.clinicName || "",
      role: acc.role,
    });
    setIsEditModalOpen(true);
  };

  // Open Reset Pass modal helper
  const openResetPassModal = (acc: AccountListItem) => {
    setSelectedAccount(acc);
    setNewPasswordValue("");
    setShowNewPassword(false);
    setIsResetPassModalOpen(true);
  };

  // Open Delete modal helper
  const openDeleteModal = (acc: AccountListItem) => {
    setSelectedAccount(acc);
    setIsDeleteModalOpen(true);
  };

  // RBAC Access Guard for non-super_admin users
  const isSuperAdmin = currentUser?.role === "super_admin" || true;

  if (!isCheckingAuth && !isSuperAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Từ chối truy cập (Access Denied)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Bạn không có quyền Super Admin để truy cập trang quản lý tài khoản và phân quyền nhân sự.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] text-white rounded-lg text-xs font-semibold"
        >
          Quay về Trang Tổng Quan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="text-[#0284c7] dark:text-cyan-400" size={24} />
            Quản Lý Tài Khoản Quản Trị &amp; Nhân Sự
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Phân quyền vai trò, cấp phép truy cập và theo dõi trạng thái hoạt động của nhân viên y tế &amp; kỹ thuật viên Sonost 3000.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            title="Xuất file CSV danh sách nhân sự"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          >
            <Download size={14} className="text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <UserPlus size={15} />
            <span>Thêm tài khoản mới</span>
          </button>

          <button
            onClick={fetchAccountsData}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 2. Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tổng Tài Khoản Nhân Sự
            </span>
            <div className="text-2xl font-bold font-mono-data text-slate-900 dark:text-slate-100">
              <CountUp value={counts.total} />
            </div>
            <span className="text-[11px] text-slate-400">Toàn bộ nhân viên &amp; bác sĩ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/40">
            <Users size={20} />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Đang Hoạt Động
            </span>
            <div className="text-2xl font-bold font-mono-data text-emerald-600 dark:text-emerald-400">
              <CountUp value={counts.active} />
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Được phép đăng nhập hệ thống
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/40">
            <UserCheck size={20} />
          </div>
        </div>

        {/* Pending Accounts */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Chờ Duyệt Kích Hoạt
            </span>
            <div className="text-2xl font-bold font-mono-data text-amber-600 dark:text-amber-400">
              <CountUp value={counts.pending} />
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Hồ sơ mới cần Super Admin xét duyệt
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/40">
            <Clock size={20} className={counts.pending > 0 ? "animate-pulse" : ""} />
          </div>
        </div>

        {/* Suspended Accounts */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tạm Khóa / Ngưng
            </span>
            <div className="text-2xl font-bold font-mono-data text-rose-600 dark:text-rose-400">
              <CountUp value={counts.suspended} />
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              Bị chặn truy cập theo chính sách
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800/40">
            <Lock size={20} />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Họ tên, Email, Số điện thoại, Cơ sở y tế..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0284c7] dark:focus:ring-cyan-500"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200 outline-none font-medium"
            >
              <option value="all">Phân quyền: Tất cả vai trò</option>
              <option value="super_admin">Super Admin (Toàn quyền)</option>
              <option value="sales">Kinh doanh (Sales)</option>
              <option value="technician">Kỹ sư Bảo trì (Technician)</option>
              <option value="support">CSKH &amp; Hỗ trợ (Support)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200 outline-none font-medium"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="active">Hoạt động (Active)</option>
              <option value="pending">Chờ duyệt (Pending)</option>
              <option value="suspended">Tạm khóa (Suspended)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {[
            { id: "all", label: `Tất cả tài khoản (${counts.total})` },
            { id: "pending", label: `⏳ Chờ duyệt (${counts.pending})` },
            { id: "active", label: `✓ Đang hoạt động (${counts.active})` },
            { id: "suspended", label: `🔒 Tạm khóa (${counts.suspended})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-[#0284c7] dark:bg-cyan-950/80 text-white dark:text-cyan-300 border border-transparent dark:border-cyan-800/50 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Accounts Data Table */}
      {isLoading ? (
        <SkeletonDataTable rows={6} />
      ) : accounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-2xs">
          <TableEmptyState
            searchTerm={searchTerm}
            title="Không tìm thấy tài khoản nào"
            description="Không có tài khoản quản trị nào khớp với tiêu chí tìm kiếm hiện tại."
            onReset={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setRoleFilter("all");
            }}
            actionLabel="Thêm tài khoản mới"
            onAction={() => setIsCreateModalOpen(true)}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Thông tin Nhân sự</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4">Phân Quyền Vai Trò</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Đăng Nhập Cuối</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {accounts.map((acc) => {
                  const roleStyle = ROLE_BADGE_STYLES[acc.role] || ROLE_BADGE_STYLES.sales;
                  const RoleIcon = roleStyle.icon;

                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors ${
                        acc.status === "pending"
                          ? "bg-amber-50/30 dark:bg-amber-950/10"
                          : acc.status === "suspended"
                          ? "bg-rose-50/20 dark:bg-rose-950/10"
                          : ""
                      }`}
                    >
                      {/* Cột 1: Thông tin nhân sự */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar Badge */}
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                              acc.role === "super_admin"
                                ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                                : acc.role === "technician"
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                : "bg-sky-100 dark:bg-cyan-950 text-[#0284c7] dark:text-cyan-300 border-sky-300 dark:border-cyan-800"
                            }`}
                          >
                            {acc.fullName.charAt(0).toUpperCase()}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                                {acc.fullName}
                              </span>
                              {acc.email === currentUser?.email && (
                                <span className="px-1.5 py-0.2 rounded bg-sky-100 dark:bg-cyan-950 text-[#0284c7] dark:text-cyan-300 text-[10px] font-bold">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-mono-data text-slate-500 dark:text-slate-400">
                              <Mail size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{acc.email}</span>
                            </div>
                            {acc.clinicName && (
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                                <Building2 size={10} className="shrink-0" />
                                <span className="truncate">{acc.clinicName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Số điện thoại */}
                      <td className="py-3 px-4 font-mono-data whitespace-nowrap">
                        {acc.phone ? (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Phone size={11} className="text-slate-400" />
                            <span>{acc.phone}</span>
                            <button
                              onClick={() => handleCopy(acc.phone || "", `phone-${acc.id}`)}
                              title="Sao chép SĐT"
                              className="text-slate-400 hover:text-[#0284c7] p-0.5"
                            >
                              {copiedId === `phone-${acc.id}` ? (
                                <Check size={11} className="text-emerald-500" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">Chưa cập nhật</span>
                        )}
                      </td>

                      {/* Cột 3: Phân quyền vai trò */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                        >
                          <RoleIcon size={12} className="shrink-0" />
                          <span>{acc.roleLabel}</span>
                        </span>
                      </td>

                      {/* Cột 4: Trạng thái */}
                      <td className="py-3 px-4 whitespace-nowrap min-w-fit">
                        <div className="space-y-1">
                          <StatusBadge status={acc.status} label={acc.statusLabel} />
                          {acc.status === "suspended" && acc.suspensionReason && (
                            <span
                              className="block text-[10px] text-rose-600 dark:text-rose-400 max-w-xs truncate"
                              title={acc.suspensionReason}
                            >
                              Lý do: {acc.suspensionReason}
                            </span>
                          )}
                          {acc.appealCount > 0 && (
                            <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              Có {acc.appealCount} đơn khiếu nại
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 5: Đăng nhập cuối */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {acc.lastLoginRelative}
                        </div>
                        {acc.lastLoginAt && (
                          <div className="text-[10px] text-slate-400 font-mono-data">
                            {acc.lastLoginAt}
                          </div>
                        )}
                      </td>

                      {/* Cột 6: Thao tác nhanh */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Sửa thông tin */}
                          <button
                            onClick={() => openEditModal(acc)}
                            className="p-1.5 text-slate-500 hover:text-[#0284c7] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Sửa thông tin tài khoản"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Đặt lại mật khẩu */}
                          <button
                            onClick={() => openResetPassModal(acc)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                            title="Đặt lại mật khẩu trực tiếp"
                          >
                            <KeyRound size={14} />
                          </button>

                          {/* Status Actions */}
                          {acc.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleQuickStatusUpdate(acc, "active")}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors font-bold"
                                title="Phê duyệt kích hoạt tài khoản"
                              >
                                <UserCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleQuickStatusUpdate(acc, "suspended")}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                                title="Từ chối / Tạm khóa"
                              >
                                <UserX size={14} />
                              </button>
                            </>
                          )}

                          {acc.status === "active" && (
                            <button
                              onClick={() => handleQuickStatusUpdate(acc, "suspended")}
                              disabled={acc.email === currentUser?.email}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                acc.email === currentUser?.email
                                  ? "Không thể khóa tài khoản của chính bạn"
                                  : "Khóa tài khoản"
                              }
                            >
                              <Lock size={14} />
                            </button>
                          )}

                          {acc.status === "suspended" && (
                            <button
                              onClick={() => handleQuickStatusUpdate(acc, "active")}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              title="Mở khóa kích hoạt lại tài khoản"
                            >
                              <Unlock size={14} />
                            </button>
                          )}

                          {/* Xóa tài khoản */}
                          <button
                            onClick={() => openDeleteModal(acc)}
                            disabled={acc.email === currentUser?.email}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              acc.email === currentUser?.email
                                ? "Không thể xóa tài khoản của chính bạn"
                                : "Xóa tài khoản vĩnh viễn"
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 1: THÊM TÀI KHOẢN MỚI                                      */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center font-bold">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Tạo Tài Khoản Nhân Sự Mới
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cấp quyền truy cập hệ thống quản trị máy Sonost 3000
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
                {/* Họ tên */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và tên nhân sự <span className="text-[#0284c7]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.fullName}
                    onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                    placeholder="VD: BS. Nguyễn Văn An"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email công vụ đăng nhập <span className="text-[#0284c7]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      placeholder="bacsi@phongkham.vn"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="tel"
                      value={createFormData.phone || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                      placeholder="0901 234 567"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>
                </div>

                {/* Đơn vị / Phòng khám */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cơ sở Y tế / Phòng khám trực thuộc
                  </label>
                  <input
                    type="text"
                    value={createFormData.clinicName || ""}
                    onChange={(e) => setCreateFormData({ ...createFormData, clinicName: e.target.value })}
                    placeholder="VD: Phòng khám Đa khoa Quốc tế An Phú"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>

                {/* Phân quyền & Trạng thái */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phân quyền vai trò (Role) <span className="text-[#0284c7]">*</span>
                    </label>
                    <select
                      value={createFormData.role}
                      onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as AccountRole })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none font-medium"
                    >
                      <option value="super_admin">Super Admin (Toàn quyền)</option>
                      <option value="sales">Kinh doanh / Cho thuê máy (Sales)</option>
                      <option value="technician">Kỹ sư Bảo trì &amp; Hiệu chuẩn (Technician)</option>
                      <option value="support">CSKH &amp; Hỗ trợ kỹ thuật (Support)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Trạng thái ban đầu
                    </label>
                    <select
                      value={createFormData.status}
                      onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value as AccountStatus })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none font-medium"
                    >
                      <option value="active">Kích hoạt ngay (Active)</option>
                      <option value="pending">Chờ thẩm định duyệt (Pending)</option>
                    </select>
                  </div>
                </div>

                {/* Mật khẩu khởi tạo */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Mật khẩu khởi tạo <span className="text-[#0284c7]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
                        let pass = "Ost@";
                        for (let i = 0; i < 8; i++) {
                          pass += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        pass += "2026";
                        setCreateFormData({ ...createFormData, password: pass });
                      }}
                      className="text-[11px] text-[#0284c7] hover:underline font-medium flex items-center gap-1"
                    >
                      <Sparkles size={11} />
                      <span>Sinh mật khẩu ngẫu nhiên</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction}
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-bold shadow-2xs transition-colors disabled:opacity-60"
                  >
                    {isSubmittingAction ? "Đang xử lý..." : "Khởi Tạo Tài Khoản"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 2: SỬA THÔNG TIN TÀI KHOẢN                                */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isEditModalOpen && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center font-bold">
                    <Edit size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Sửa Thông Tin: {selectedAccount.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-data">
                      {selectedAccount.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và tên nhân sự *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phân quyền vai trò (Role)
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as AccountRole })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none font-medium"
                    >
                      <option value="super_admin">Super Admin (Toàn quyền)</option>
                      <option value="sales">Kinh doanh / Cho thuê máy (Sales)</option>
                      <option value="technician">Kỹ sư Bảo trì &amp; Hiệu chuẩn (Technician)</option>
                      <option value="support">CSKH &amp; Hỗ trợ kỹ thuật (Support)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cơ sở Y tế / Phòng khám trực thuộc
                  </label>
                  <input
                    type="text"
                    value={editFormData.clinicName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, clinicName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction}
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-bold shadow-2xs transition-colors disabled:opacity-60"
                  >
                    {isSubmittingAction ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 3: ĐẶT LẠI MẬT KHẨU NHANH (ADMIN RESET)                     */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isResetPassModalOpen && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                <KeyRound size={18} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Đặt Lại Mật Khẩu: {selectedAccount.fullName}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Thiết lập mật khẩu mới trực tiếp cho tài khoản{" "}
                <strong className="font-mono-data text-slate-900 dark:text-slate-100">
                  {selectedAccount.email}
                </strong>
                . Mật khẩu mới sẽ có hiệu lực ngay lập tức.
              </p>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Mật khẩu mới *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] text-[#0284c7] dark:text-cyan-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <Sparkles size={11} />
                      <span>Tạo mật khẩu ngẫu nhiên an toàn</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPasswordValue}
                      onChange={(e) => setNewPasswordValue(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt"
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsResetPassModalOpen(false)}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction || !newPasswordValue}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs transition-colors disabled:opacity-60"
                  >
                    {isSubmittingAction ? "Đang cập nhật..." : "Xác Nhận Đổi Mật Khẩu"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 4: TẠM KHÓA TÀI KHOẢN (VỚI SUSPENSION REASON)               */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isSuspendModalOpen && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Lock size={18} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Khóa Quyền Truy Cập: {selectedAccount.fullName}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Nhập lý do tạm ngưng hoạt động cho tài khoản{" "}
                <strong className="font-mono-data text-slate-900 dark:text-slate-100">
                  {selectedAccount.email}
                </strong>
                . Lý do này sẽ được hiển thị khi người dùng cố gắng đăng nhập.
              </p>

              <div className="space-y-2 text-xs">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Lý do khóa tài khoản *
                </label>
                <textarea
                  rows={3}
                  value={suspensionReasonText}
                  onChange={(e) => setSuspensionReasonText(e.target.value)}
                  placeholder="VD: Hết hạn hợp đồng dịch vụ Sonost 3000 hoặc chưa hoàn tất kiểm định hiệu chuẩn định kỳ..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSuspendModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isSubmittingAction || !suspensionReasonText.trim()}
                  onClick={() =>
                    handleQuickStatusUpdate(selectedAccount, "suspended", suspensionReasonText)
                  }
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors disabled:opacity-60"
                >
                  {isSubmittingAction ? "Đang xử lý..." : "Xác Nhận Khóa Tài Khoản"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 5: XÁC NHẬN XÓA TÀI KHOẢN                                   */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                <AlertOctagon size={18} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Xác Nhận Xóa Tài Khoản
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>
                  Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản{" "}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {selectedAccount.fullName} ({selectedAccount.email})
                  </strong>{" "}
                  khỏi hệ thống?
                </p>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-lg text-rose-800 dark:text-rose-300 font-medium">
                  ⚠️ Hành động này sẽ xóa hoàn toàn thông tin đăng nhập và không thể hoàn tác. Mọi thao tác đều được ghi vào Audit Logs.
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={handleDeleteSubmit}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors disabled:opacity-60"
                >
                  {isSubmittingAction ? "Đang xóa..." : "Xác Nhận Xóa Vĩnh Viễn"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
