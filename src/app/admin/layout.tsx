import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
  title: "Quản trị Hệ thống Sonost 3000 — OsteoSys",
  description: "Trung tâm quản lý thuê máy, sửa chữa, bảo dưỡng và kho thiết bị Sonost 3000 OsteoSys.",
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
