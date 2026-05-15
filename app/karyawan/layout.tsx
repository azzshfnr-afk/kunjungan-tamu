"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
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

function Avatar({
  user,
  size = "md",
}: {
  user: { name: string; pic?: string } | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
  };
  const cls = sizeMap[size];

  if (user?.pic) {
    return (
      <img
        src={user.pic}
        alt={user.name}
        className={`${cls} shrink-0 rounded-full object-cover ring-2 ring-white`}
      />
    );
  }
  return (
    <div
      className={`${cls} shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 font-semibold text-white ring-2 ring-white shadow-sm`}
    >
      {user ? getInitials(user.name) : "?"}
    </div>
  );
}

function SidebarProfileCard({
  user,
  onLogout,
}: {
  user: { name: string; organization: string; pic?: string } | null;
  onLogout: () => void;
}) {
  return (
    <div className="mx-3 mb-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">

        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-green-100/60 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <Avatar user={user} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name ?? "Loading..."}
            </p>
            <p className="truncate text-xs text-slate-400 mt-0.5">
              {user?.organization ?? "—"}
            </p>
          </div>
        </div>


        <div className="mt-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
            <Shield className="h-3 w-3" />
            Karyawan
          </span>
        </div>

        <div className="my-3 border-t border-slate-100" />


        <div className="flex flex-col gap-0.5">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

function NavbarProfileDropdown({
  user,
  onLogout,
}: {
  user: { name: string; organization: string; pic?: string } | null;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors ${
          open ? "bg-slate-100" : "hover:bg-slate-50"
        }`}
      >
        <Avatar user={user} size="sm" />
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-slate-700 leading-none">
            {user?.name ?? "Loading..."}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
            {user?.organization ?? "Karyawan"}
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 z-50 overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <div className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 rounded-full bg-green-200/40 blur-xl" />
            <div className="relative flex items-center gap-3">
              <Avatar user={user} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.name ?? "—"}
                </p>
                <p className="truncate text-xs text-slate-500 mt-0.5">
                  {user?.organization ?? "—"}
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-green-100 border border-green-200 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  <Shield className="h-2.5 w-2.5" />
                  Karyawan
                </span>
              </div>
            </div>
          </div>


          <div className="border-t border-slate-100 p-1.5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                <LogOut className="h-3.5 w-3.5 text-red-500" />
              </div>
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 shadow-sm">
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
                    ? "bg-green-600 text-white shadow-sm"
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

        <SidebarProfileCard user={user} onLogout={onLogout} />
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
  user: { name: string; organization: string; pic?: string } | null;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const currentPage = NAV_ITEMS.find((n) => n.href === pathname)?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-slate-700">{currentPage}</span>
      </div>

      <div className="flex items-center gap-1.5">
        

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <NavbarProfileDropdown user={user} onLogout={onLogout} />
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
  const [user, setUser] = useState<{
    name: string;
    organization: string;
    pic?: string;
  } | null>(null);
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

  if (isLoginPage) return <>{children}</>;

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