"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  IdCard, 
  FileText, 
  X 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";


export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  const menus = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Visitor Card", href: "/visitor-card", icon: IdCard },
    { title: "Laporan", href: "/laporan", icon: FileText },
  ];

  return (
    <Sidebar className="border-r border-slate-50 bg-grey-50">
      <SidebarHeader className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <span className="h-6 w-4 text-white">𖥔</span>
            </div>
            {open && (
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                TamuApps<br />
                <span className="font-normal text-slate-400">Admin Panel</span>
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>


      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1">
          {menus.map((item) => {
            const Icon = item.icon;
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
    </Sidebar>
  );
}