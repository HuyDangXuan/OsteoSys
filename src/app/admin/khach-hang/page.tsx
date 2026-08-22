"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  RotateCcw,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  Building2,
  Stethoscope,
  Briefcase,
  UserCheck,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  FileText,
  Wrench,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getPartners,
  createPartner,
  updatePartner,
  togglePartnerStatus,
  deletePartner,
  PartnerListItem,
} from "@/lib/actions/partners";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [partners, setPartners] = useState<PartnerListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerListItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "clinic" as "hospital" | "clinic" | "enterprise" | "doctor" | "individual",
    taxCode: "",
    address: "",
    city: "Hà Nội",
    contactName: "",
    phone: "",
    email: "",
    position: "Phụ trách Trang thiết bị Y tế",
    status: "active" as "active" | "inactive",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPartnersList = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPartners({
        search,
        type: typeFilter,
        status: statusFilter,
        page: 1,
        limit: 100,
      });
      setPartners(result.partners);
      setTotalCount(result.total);
    } catch (err) {
      console.error("Failed to load partners:", err);
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartnersList();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchPartnersList]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      type: "clinic",
      taxCode: "",
      address: "",
      city: "Hà Nội",
      contactName: "",
      phone: "",
      email: "",
      position: "Phụ trách Trang thiết bị Y tế",
      status: "active",
      notes: "",
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (partner: PartnerListItem) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      type: partner.type,
      taxCode: partner.taxCode || "",
      address: partner.address.split(",")[0] || partner.address,
      city: partner.city || "Hà Nội",
      contactName: partner.contactPerson,
      phone: partner.phone,
      email: partner.email || "",
      position: partner.position || "Phụ trách Thiết bị",
      status: partner.status,
      notes: partner.notes || "",
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (partner: PartnerListItem) => {
    setSelectedPartner(partner);
    setIsDeleteModalOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createPartner({
        name: formData.name,
        type: formData.type,
        taxCode: formData.taxCode || undefined,
        address: formData.address,
        city: formData.city,
        primaryContact: {
          name: formData.contactName,
          phone: formData.phone,
          email: formData.email || undefined,
          position: formData.position,
        },
        status: formData.status,
        notes: formData.notes,
      });

      if (res.success) {
        toast.success(res.message);
        setIsCreateModalOpen(false);
        fetchPartnersList();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo đối tác");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    setIsSubmitting(true);
    try {
      const res = await updatePartner(selectedPartner.code, {
        name: formData.name,
        type: formData.type,
        taxCode: formData.taxCode || undefined,
        address: formData.address,
        city: formData.city,
        primaryContact: {
          name: formData.contactName,
          phone: formData.phone,
          email: formData.email || undefined,
          position: formData.position,
        },
        status: formData.status,
        notes: formData.notes,
      });

      if (res.success) {
        toast.success(res.message);
        setIsEditModalOpen(false);
        fetchPartnersList();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật đối tác");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active / Inactive
  const handleToggleStatus = async (partner: PartnerListItem) => {
    try {
      const res = await togglePartnerStatus(partner.code);
      if (res.success) {
        toast.success(res.message);
        fetchPartnersList();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Lỗi chuyển đổi trạng thái đối tác");
    }
  };

  // Submit Delete / Soft Delete
  const handleDeleteSubmit = async (mode: "soft" | "hard") => {
    if (!selectedPartner) return;
    setIsSubmitting(true);
    try {
      const res = await deletePartner(selectedPartner.code, mode);
      if (res.success) {
        toast.success(res.message);
        setIsDeleteModalOpen(false);
        fetchPartnersList();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa đối tác");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (partners.length === 0) {
      toast.warning("Không có dữ liệu đối tác để xuất");
      return;
    }
    const headers = [
      "Mã đối tác",
      "Tên Cơ sở Y tế",
      "Loại hình",
      "Mã số thuế",
      "Người liên hệ",
      "Chức vụ",
      "Số điện thoại",
      "Email",
      "Địa chỉ",
      "Máy đang thuê",
      "Tổng hợp đồng",
      "Trạng thái",
    ];
    const rows = partners.map((p) => [
      p.code,
      `"${p.name}"`,
      p.typeLabel,
      p.taxCode || "",
      `"${p.contactPerson}"`,
      `"${p.position}"`,
      p.phone,
      p.email || "",
      `"${p.address}"`,
      p.activeRentals,
      p.totalContracts,
      p.statusLabel,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OsteoSys_Danh_Sach_Doi_Tac_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất thành công danh sách đối tác B2B!");
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
            Hệ Thống Quản Lý Khách Hàng B2B
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Dữ liệu trực tiếp MongoDB: Bệnh viện, phòng khám đa khoa, cơ sở y tế và doanh nghiệp sử dụng thiết bị Sonost 3000.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            title="Xuất file CSV / Excel"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-md transition-colors shadow-2xs"
          >
            <Download size={14} className="text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <Plus size={15} />
            <span>Thêm đối tác mới</span>
          </button>

          <button
            onClick={fetchPartnersList}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên bệnh viện, người liên hệ, SĐT, mã số thuế, địa chỉ..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0284c7] dark:focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200 outline-none font-medium"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="active">Đang hợp tác</option>
              <option value="inactive">Tạm ngừng</option>
            </select>
          </div>
        </div>

        {/* Facility Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {[
            { id: "all", label: "Tất cả đối tác" },
            { id: "hospital", label: "🏥 Bệnh viện Đa khoa" },
            { id: "clinic", label: "🩺 Phòng khám Chuyên khoa" },
            { id: "enterprise", label: "🏢 Doanh nghiệp / Khám đoàn" },
            { id: "doctor", label: "👨‍⚕️ Bác sĩ / Chuyên gia" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                typeFilter === tab.id
                  ? "bg-[#0284c7] dark:bg-cyan-950/80 text-white dark:text-cyan-300 border border-transparent dark:border-cyan-800/50 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {(search || typeFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="ml-auto text-xs text-[#0284c7] dark:text-cyan-400 hover:underline flex items-center gap-1 shrink-0 font-medium pl-2"
            >
              <RotateCcw size={12} /> Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* 3. Partner Data Table */}
      {isLoading ? (
        <SkeletonDataTable rows={8} />
      ) : partners.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-2xs">
          <TableEmptyState
            searchTerm={search}
            title="Không tìm thấy đối tác y tế nào"
            description={`Không có cơ sở y tế hay phòng khám nào khớp với từ khóa tìm kiếm "${search}".`}
            onReset={() => {
              setSearch("");
              setTypeFilter("all");
              setStatusFilter("all");
            }}
            createLabel="Thêm đối tác mới"
            onCreate={handleOpenCreateModal}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Mã &amp; Tên Cơ Sở Y Tế</th>
                  <th className="py-3 px-4">Đại Diện &amp; Liên Hệ</th>
                  <th className="py-3 px-4">Địa Chỉ</th>
                  <th className="py-3 px-4">Thiết Bị Đang Thuê</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                    {/* Facility Name & Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-data font-bold text-xs text-[#0284c7] dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/70 px-1.5 py-0.5 rounded border border-sky-100 dark:border-cyan-800/40">
                          {p.code}
                        </span>
                        <Link
                          href={`/admin/khach-hang/${p.code}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#0284c7] dark:hover:text-cyan-400 text-xs transition-colors"
                        >
                          {p.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {p.typeLabel}
                        </span>
                        {p.taxCode && (
                          <span className="text-[10px] font-mono-data text-slate-400 dark:text-slate-500">
                            • MST: {p.taxCode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact Person */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {p.contactPerson}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono-data mt-0.5">
                        <Phone size={10} className="text-slate-400" />
                        {p.phone}
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                      <span title={p.address}>{p.address}</span>
                    </td>

                    {/* Active Rentals */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono-data font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {p.activeRentals} máy
                        </span>
                        <span className="text-[10px] text-slate-400">({p.totalContracts} HĐ)</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap min-w-fit">
                      <StatusBadge status={p.status} label={p.statusLabel} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/khach-hang/${p.code}`}
                          className="flex items-center gap-1 px-2 py-1 bg-sky-50 dark:bg-cyan-950 text-[#0284c7] dark:text-cyan-300 hover:bg-sky-100 rounded text-[11px] font-medium transition-colors"
                        >
                          <ExternalLink size={11} />
                          <span>Hồ sơ</span>
                        </Link>

                        <button
                          onClick={() => handleOpenEditModal(p)}
                          title="Chỉnh sửa thông tin"
                          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded"
                        >
                          <Edit size={13} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(p)}
                          title={p.status === "active" ? "Tạm ngừng hợp tác" : "Kích hoạt lại đối tác"}
                          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded"
                        >
                          {p.status === "active" ? <ToggleRight size={15} className="text-emerald-500" /> : <ToggleLeft size={15} className="text-slate-400" />}
                        </button>

                        <button
                          onClick={() => handleOpenDeleteModal(p)}
                          title="Xóa / Ngừng đối tác"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Create / Edit Slide-over Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0b0f17]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0284c7] dark:bg-cyan-600 text-white flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {isCreateModalOpen ? "Thêm Mới Đối Tác Y Tế B2B" : `Chỉnh Sửa Đối Tác: ${formData.name}`}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Thông tin doanh nghiệp, phòng khám và người phụ trách thiết bị Sonost 3000
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleEditSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Bệnh viện / Phòng khám / Doanh nghiệp *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Bệnh viện Đa khoa Quốc tế Vinmec"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Loại hình cơ sở
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none font-medium"
                    >
                      <option value="clinic">Phòng khám Chuyên khoa</option>
                      <option value="hospital">Bệnh viện Đa khoa</option>
                      <option value="enterprise">Doanh nghiệp / Khám đoàn</option>
                      <option value="doctor">Bác sĩ / Chuyên gia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mã số thuế (nếu có)
                    </label>
                    <input
                      type="text"
                      value={formData.taxCode}
                      onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                      placeholder="VD: 0101234567"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Địa chỉ chi tiết *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Số nhà, tên đường, phường/xã"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tỉnh / Thành phố *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Primary Contact Section */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-[#0284c7] dark:text-cyan-400 uppercase tracking-wider font-mono-data block">
                    Thông tin Người phụ trách Thiết bị Y tế
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Họ và tên đại diện *
                      </label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="VD: BS. Trần Minh Khoa"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Chức vụ / Vị trí
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="VD: Trưởng khoa CĐHA / Kỹ sư Trưởng"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Số điện thoại Hotline / Zalo *
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="VD: 0904123456"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="khoa.tran@hospital.vn"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú về lịch bàn giao máy hoặc yêu cầu kết nối PACS..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsEditModalOpen(false);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg font-bold shadow-2xs"
                  >
                    {isSubmitting ? "Đang lưu..." : isCreateModalOpen ? "Tạo Mới Đối Tác" : "Cập Nhật Thông Tin"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Xác Nhận Xóa / Ngừng Hợp Tác
                  </h3>
                  <p className="text-xs text-slate-500 font-mono-data">
                    Đối tác: {selectedPartner.name} ({selectedPartner.code})
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs space-y-1.5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                <p>
                  <strong>Máy đang thuê:</strong> {selectedPartner.activeRentals} máy
                </p>
                <p>
                  <strong>Tổng số hợp đồng:</strong> {selectedPartner.totalContracts} hợp đồng
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  💡 <strong>Quy định bảo toàn dữ liệu y tế:</strong> Nếu đối tác có hợp đồng đang hoạt động, hệ thống sẽ chặn xóa. Với các đối tác đã thanh lý, dữ liệu sẽ được chuyển sang &ldquo;Tạm ngừng&rdquo; (Soft Delete) để lưu giữ lịch sử kiểm toán.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDeleteSubmit("soft")}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                >
                  {isSubmitting ? "Đang xử lý..." : "Tạm Ngừng (Soft Delete)"}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDeleteSubmit("hard")}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                >
                  Xóa Vĩnh Viễn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
