"use client";

import { useState } from "react";
import DashboardSidebar from "../../components/DashboardSidebar";
import DashboardNav from "../../components/DashboardNav";
import PlanModal from "@/views/dashboard/PlanModal";

interface DashboardShellProps {
  locale: string;
  userName?: string | null;
  avatarUrl?: string | null;
  children: React.ReactNode;
}

export default function DashboardShell({
  locale,
  userName,
  avatarUrl,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[var(--background)]">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onUpgrade={() => setPlanModalOpen(true)}
      />
      <div className="md:ml-[220px] h-screen flex flex-col">
        <DashboardNav
          locale={locale}
          userName={userName}
          avatarUrl={avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <PlanModal open={planModalOpen} onClose={() => setPlanModalOpen(false)} />
    </div>
  );
}
