"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  ClipboardList,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

// ─── Nav items 

const NAV_ITEMS = [
  { label: "Dashboard", href: "/karyawan/dashboard", icon: LayoutDashboard },
  { label: "Tamu menunggu", href: "/karyawan/tamu-menunggu", icon: Clock },
  { label: "Riwayat", href: "/karyawan/riwayat", icon: ClipboardList },
];

// ─── Mock user 

const CURRENT_USER = {
  name: "Yusuf Hebat",
  role: "karyawan",
  department: "IT",
  initials: "YH",
  avatar: null, // ganti dengan URL foto jika ada
};

// ─── Sidebar 

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-slate-100
          flex flex-col transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <span className="h-5 w-4 text-white">𖥔</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 leading-tight">
              Visitor<br />
              <span className="font-normal text-slate-400">Management</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-600 text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                {label}
                {label === "Tamu Menunggu" && (
                  <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile card di sidebar */}
        <div className="mx-3 mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
              {CURRENT_USER.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {CURRENT_USER.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {CURRENT_USER.role} · {CURRENT_USER.department}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-white hover:text-red-600 transition-colors">
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Navbar (top)

function Navbar({
  onMenuToggle,
  notifCount,
}: {
  onMenuToggle: () => void;
  notifCount: number;
}) {
  const pathname = usePathname();
  const currentPage = NAV_ITEMS.find((n) => n.href === pathname)?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-100 bg-white px-4 lg:px-6">
      {/* Kiri: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-slate-700">{currentPage}</span>
      </div>

      {/* Kanan: notif + profil */}
      <div className="flex items-center gap-2">
        {/* Bell */}
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-4 w-4" />
          {notifCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notifCount}
            </span>
          )}
        </button>

        {/* Profil ringkas */}
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 cursor-pointer transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
            {CURRENT_USER.initials}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {CURRENT_USER.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TODO: ganti dengan data real dari API/state global
  const pendingCount = 3;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          notifCount={pendingCount}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
