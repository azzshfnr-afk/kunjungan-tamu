"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  LayoutDashboard,
  Search,
  CalendarDays,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusType = "Pending" | "Check-in" | "Selesai" | "Ditolak";

type Visitor = {
  id: string;
  name: string;
  instansi: string;
  email: string;
  departemen: string;
  karyawan: string;
  visitDate: Date;
  visitTime: string;
  checkin: string | null;
  checkout: string | null;
  rejected?: boolean;
};

type VisitorApi = Omit<Visitor, "visitDate"> & {
  visitDate: string;
};

type CardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red";
};

export default function Page() {
  const [search, setSearch] = useState("");
  const [dashboardData, setDashboardData] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => (currentYear - 2 + i).toString());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/tamu");
        if (!res.ok) throw new Error("Gagal mengambil data");
        const result: VisitorApi[] = await res.json();

        const parsed: Visitor[] = result.map((item) => ({
          ...item,
          visitDate: new Date(item.visitDate),
          checkin: item.checkin
            ? new Date(item.checkin).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
            : null,
          checkout: item.checkout
            ? new Date(item.checkout).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
            : null,
        }));
        setDashboardData(parsed);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatus = (item: Visitor): StatusType => {
    if (item.rejected) return "Ditolak";
    if (item.checkin && item.checkout) return "Selesai";
    if (item.checkin && !item.checkout) return "Check-in";
    return "Pending";
  };

  const filteredByYear = dashboardData.filter((item) => 
    item.visitDate.getFullYear().toString() === selectedYear
  );

  const now = new Date();
  const todayString = now.toDateString();

  // Filter Aktivitas Hari Ini
  const todayData = dashboardData.filter((item) => {
    const isToday = item.visitDate.toDateString() === todayString;
    const keyword = search.toLowerCase();
    const matchesSearch = 
      (item.name || "").toLowerCase().includes(keyword) || 
      String(item.id || "").toLowerCase().includes(keyword) || 
      (item.instansi || "").toLowerCase().includes(keyword);

    return isToday && matchesSearch;
  });

  // Filter Jadwal Mendatang
  const upcomingData = filteredByYear.filter((item) => {
    const itemDate = new Date(item.visitDate.toDateString());
    const currentDate = new Date(todayString);
    
    const keyword = search.toLowerCase();
    const matchesSearch = 
      (item.name || "").toLowerCase().includes(keyword) || 
      String(item.id || "").toLowerCase().includes(keyword) || 
      (item.instansi || "").toLowerCase().includes(keyword);

    return itemDate > currentDate && matchesSearch;
  });

  const total = filteredByYear.length;
  const selesai = filteredByYear.filter((i) => getStatus(i) === "Selesai").length;
  const pending = filteredByYear.filter((i) => getStatus(i) === "Pending").length;
  const ditolak = filteredByYear.filter((i) => getStatus(i) === "Ditolak").length;

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutDashboard size={16} />
          <span>›</span>
          <span className="font-medium text-foreground">
            Dashboard Management
          </span>
        </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-green-100 p-4 text-green-600"><LayoutDashboard size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold">Dashboard Management</h1>
            <p className="text-sm text-muted-foreground">Monitor tamu periode tahun {selectedYear}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Periode:</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[160px] h-9">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    Tahun {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm font-medium border-l pl-4 py-1">
            {currentDateTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-8 w-fit rounded-lg bg-muted p-1">
          <TabsTrigger value="overview" className="h-6 px-3 text-xs">
            <Activity className="mr-1 h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="visitor" className="h-6 px-3 text-xs">
            <Users className="mr-1 h-3.5 w-3.5" /> Visitor (Mendatang)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card title={`Total Tamu ${selectedYear}`} value={total} icon={<Users />} color="blue" />
            <Card title="Tamu Selesai" value={selesai} icon={<CheckCircle />} color="green" />
            <Card title="Tamu Pending" value={pending} icon={<Clock />} color="yellow" />
            <Card title="Tamu Ditolak" value={ditolak} icon={<XCircle />} color="red" />
          </div>

          <div className="rounded-xl border bg-background shadow-sm">
            {/* Header Tabel dengan Search di Dalamnya */}
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">Aktivitas Hari Ini (Recent Activity)</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
            </div>
            <div className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>ID (PKC)</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Instansi</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{item.id}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.instansi}</TableCell>
                      <TableCell>{item.karyawan}</TableCell>
                      <TableCell>{item.departemen}</TableCell>
                      <TableCell>{item.checkin || "-"}</TableCell>
                      <TableCell>{item.checkout || "-"}</TableCell>
                      <TableCell><StatusBadge status={getStatus(item)} /></TableCell>
                    </TableRow>
                  ))}
                  {todayData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        {search ? "Pencarian tidak ditemukan." : "Tidak ada aktivitas kunjungan untuk hari ini."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="visitor" className="mt-6">
          <div className="rounded-xl border bg-background shadow-sm">
            {/* Header Tabel dengan Search di Dalamnya */}
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">Jadwal Kunjungan Mendatang ({selectedYear})</h2>
              <div className="relative w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari jadwal mendatang..." 
                  className="pl-9" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
            </div>
            <div className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>ID (PKC)</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Instansi</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tgl Kunjungan</TableHead>
                    <TableHead>Karyawan Dituju</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{item.id}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.instansi}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.visitDate.toLocaleDateString("id-ID")}</TableCell>
                      <TableCell>{item.karyawan}</TableCell>
                      <TableCell><StatusBadge status={getStatus(item)} /></TableCell>
                    </TableRow>
                  ))}
                  {upcomingData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                        {search ? "Pencarian tidak ditemukan." : `Tidak ada jadwal kunjungan mendatang untuk tahun ${selectedYear}.`}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, value, icon, color = "blue" }: CardProps) {
  const styles = {
    blue: { hover: "hover:bg-blue-50", iconBg: "bg-blue-500" },
    green: { hover: "hover:bg-green-50", iconBg: "bg-green-500" },
    yellow: { hover: "hover:bg-yellow-50", iconBg: "bg-yellow-400" },
    red: { hover: "hover:bg-red-50", iconBg: "bg-red-500" },
  };
  return (
    <div className={`flex items-center justify-between rounded-xl border bg-white p-4 transition hover:shadow-lg ${styles[color].hover}`}>
      <div><p className="text-sm text-gray-600">{title}</p><h2 className="mt-1 text-2xl font-semibold">{value}</h2></div>
      <div className={`rounded-lg p-3 text-white ${styles[color].iconBg}`}>{icon}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusType }) {
  const styles: Record<StatusType, string> = {
    Pending: "bg-yellow-100 text-yellow-600",
    "Check-in": "bg-green-100 text-green-600",
    Selesai: "bg-blue-100 text-blue-600",
    Ditolak: "bg-red-100 text-red-600",
  };
  return <span className={`rounded-full px-2 py-1 text-xs ${styles[status]}`}>{status}</span>;
}