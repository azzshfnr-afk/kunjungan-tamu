"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, IdCard, FileText, X, LogOut, Shield,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar,
} from "@/components/ui/sidebar";

type AdminUser = {
  name: string;
  username: string;
  pic?: string;
  organization?: { name: string };
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function Avatar({ user, size = "md" }: { user: AdminUser | null; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-11 w-11 text-base" };
  if (user?.pic) {
    return (
      <img src={user.pic} alt={user.name}
        className={`${sizeMap[size]} shrink-0 rounded-full object-cover ring-2 ring-white`} />
    );
  }
  return (
    <div className={`${sizeMap[size]} shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 font-semibold text-white ring-2 ring-white shadow-sm`}>
      {user ? getInitials(user.name) : "?"}
    </div>
  );
}

export function AppSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { open, setOpen } = useSidebar();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_user="))
      ?.split("=")[1];
    if (raw) {
      try { setUser(JSON.parse(decodeURIComponent(raw))); }
      catch { setUser(null); }
    }
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/admin-logout", { method: "POST" });
    router.push("/admin/login");
  };

  const menus = [
    { title: "Dashboard",    href: "/admin/dashboard",    icon: LayoutDashboard },
    { title: "Visitor Card", href: "/admin/visitor-card", icon: IdCard },
    { title: "Laporan",      href: "/admin/laporan",      icon: FileText },
  ];

  return (
    <Sidebar className="border-r border-slate-100 bg-white">
      <SidebarHeader className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 shadow-sm">
              <span className="h-6 w-4 text-white">𖥔</span>
            </div>
            {open && (
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                TamuApps<br />
                <span className="font-normal text-slate-400">Admin Panel</span>
              </span>
            )}
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1">
          {menus.map((item) => {
            const Icon   = item.icon;
            const active = pathname === item.href;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors h-10
                    ${active
                      ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  <Link href={item.href}>
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                    {open && <span>{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {open && (
        <SidebarFooter className="px-3 pb-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
            {/* Decorative blob */}
            <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-green-100/60 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <Avatar user={user} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.name ?? "Loading..."}
                </p>
                <p className="truncate text-xs text-slate-400 mt-0.5">
                  {user?.organization?.name ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                <Shield className="h-3 w-3" />
                Super Admin
              </span>
            </div>

            <div className="my-3 border-t border-slate-100" />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        </SidebarFooter>
      )}

      {!open && (
        <SidebarFooter className="px-3 pb-4 flex flex-col items-center gap-2">
          <Avatar user={user} size="sm" />
          <button
            onClick={handleLogout}
            className="flex items-center justify-center h-7 w-7 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Keluar"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}