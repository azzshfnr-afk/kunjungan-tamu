
"use client";

import * as React from "react";
import { PanelLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SidebarContext = React.createContext<any>(null);

export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const toggleSidebar = () => setOpen(!open);

  return (
    <SidebarContext.Provider value={{ open, toggleSidebar }}>
      <div className="flex min-h-screen w-full bg-gray-100">{children}</div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  return (
    <aside className={cn("transition-all duration-300", open ? "w-72" : "w-20")}>
      {children}
    </aside>
  );
}

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
      <PanelLeftIcon className="h-5 w-5" />
    </Button>
  );
}

export const SidebarHeader = ({ className, ...props }: any) => <div className={cn(className)} {...props} />;
export const SidebarContent = ({ className, ...props }: any) => <div className={cn("flex-1", className)} {...props} />;
export const SidebarFooter = ({ className, ...props }: any) => <div className={cn(className)} {...props} />;
export const SidebarMenu = ({ className, ...props }: any) => <div className={cn(className)} {...props} />;
export const SidebarMenuItem = ({ className, ...props }: any) => <div className={cn(className)} {...props} />;
export const SidebarMenuButton = ({ className, ...props }: any) => <div className={cn("flex items-center gap-3 cursor-pointer transition", className)} {...props} />;

