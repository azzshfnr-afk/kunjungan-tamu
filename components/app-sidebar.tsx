
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, IdCard, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  const menus = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    // { title: "Visitor", href: "/visitor", icon: Users }, //matiin hela ach
    { title: "Visitor Card", href: "/visitor-card", icon: IdCard },
    { title: "Laporan", href: "/laporan", icon: FileText },
  ];

  return (
    <Sidebar>
      <div className="h-full m-3 rounded-3xl bg-gray-50 shadow-sm flex flex-col">
        <SidebarHeader className={open ? "px-5 pt-5 pb-4" : "px-2 pt-5 pb-4 flex justify-center"}>
          {open ? (
            <div>
              <h2 className="text-lg font-bold">Visitor Apps</h2>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-2xl bg-green-600 text-white flex items-center justify-center font-bold">V</div>
          )}
        </SidebarHeader>

        <SidebarContent className="px-3">
          <p className="px-2 pb-2 text-sm text-muted-foreground">Menu</p>
          <SidebarMenu className="space-y-2">
            {menus.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={`h-11 rounded-xl ${open ? "px-4 justify-start" : "justify-center px-0"} ${active ? "bg-green-600 text-white hover:bg-green-600" : "hover:bg-gray-100 text-gray-700"}`}
                  >
                    <Link href={item.href}>
                      <Icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="mt-auto px-5 pb-5">
          {open && <p className="text-xs text-muted-foreground">© 2025 Visitor System</p>}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
