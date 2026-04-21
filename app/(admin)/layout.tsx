import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="w-full bg-gray-50 min-h-screen p-3 md:p-2">
        
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden min-h-[calc(100vh-40px)]">
          
          
          <div className=" px-4 py-4 flex items-center gap-3">
            <SidebarTrigger />
          </div>

          
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}