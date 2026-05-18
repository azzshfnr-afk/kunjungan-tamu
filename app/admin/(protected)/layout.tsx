import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminToken  = cookieStore.get("admin_token")?.value;

  if (!adminToken) {
    redirect("/admin/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full bg-gray-50 min-h-screen p-3 md:p-2">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden min-h-[calc(100vh-40px)]">
          <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-100">
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