"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const NAV_ITEMS = [
  { label: "Dashboard", href: "/karyawan/dashboard", icon: LayoutDashboard },
  { label: "Tamu menunggu", href: "/karyawan/tamu-menunggu", icon: Clock },
  { label: "Riwayat", href: "/karyawan/riwayat", icon: ClipboardList },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function Sidebar({
  open,
  onClose,
  user,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  user: { name: string; organization: string; pic?: string } | null;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
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

        <div className="mx-3 mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            {user?.pic ? (
              <img
                src={user.pic}
                alt={user.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                {user ? getInitials(user.name) : "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {user?.name ?? "Loading..."}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.organization ?? ""}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-white hover:text-red-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Navbar({
  onMenuToggle,
  notifCount,
  user,
  onLogout,
}: {
  onMenuToggle: () => void;
  notifCount: number;
  user: { name: string; pic?: string } | null;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const currentPage = NAV_ITEMS.find((n) => n.href === pathname)?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-100 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-slate-700">{currentPage}</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-4 w-4" />
          {notifCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notifCount}
            </span>
          )}
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 cursor-pointer transition-colors"
        >
          {user?.pic ? (
            <img
              src={user.pic}
              alt={user.name}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
              {user ? getInitials(user.name) : "?"}
            </div>
          )}
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {user?.name ?? "Loading..."}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
}

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; organization: string; pic?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/karyawan/login";

  useEffect(() => {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sso_user="))
      ?.split("=")[1];

    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        setUser({
          name: parsed.name,
          organization: parsed.organization?.name ?? "",
          pic: parsed.pic,
        });
      } catch {
        setUser(null);
      }
    }
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/karyawan/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          notifCount={3}
          user={user}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}