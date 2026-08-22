"use client";

import React from "react";
import { AdminProvider, useAdmin } from "./AdminThemeContext";
import { AuthProvider } from "@/components/providers/auth-provider";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import CommandPalette from "./CommandPalette";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useAdmin();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Sidebar */}
      <AdminSidebar />

      {/* 2. Topbar */}
      <AdminTopbar />

      {/* 3. Main Area: responsive dynamic margin */}
      <main
        className={`transition-all duration-200 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-[17rem]"
        }`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* 4. Global Cmd+K Command Palette Modal */}
      <CommandPalette />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </AdminProvider>
    </AuthProvider>
  );
}
