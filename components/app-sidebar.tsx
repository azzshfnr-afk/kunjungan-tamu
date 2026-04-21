"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  IdCard,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const menus = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Visitor",
      url: "/visitor",
      icon: Users,
    },
    {
      title: "Visitor Card",
      url: "/visitor-card",
      icon: IdCard,
    },
    {
      title: "Laporan",
      url: "/laporan",
      icon: FileText,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 text-lg font-bold">
        Visitor App
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menus.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}