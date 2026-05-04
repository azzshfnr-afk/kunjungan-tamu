"use client";

import { useState, useEffect, useCallback } from "react";
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
  checkin: string | null;   // jam checkin dari satpam, sudah diformat "HH:mm WIB"
  checkout: string | null;  // jam checkout dari satpam, sudah diformat "HH:mm WIB"
  statusDb: string;         // status dari DB: "Menunggu" | "Diterima" | "Ditolak"
};


type VisitorApi = {
  id: string;
  name: string;
  instansi: string;
  email: string;
  departemen: string;
  karyawan: string;
  visitDate: string;        
  visitTime: string;
  checkin: string | null;   
  checkout: string | null;  
  status: string | null;    
  tanggalKunjungan: string | null;
};

type CardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red";
};


function getStatus(item: Visitor): StatusType {
  if (item.statusDb === "Ditolak") return "Ditolak";
  if (item.checkin && item.checkout) return "Selesai";
  if (item.checkin && !item.checkout) return "Check-in";
  return "Pending";
}


function formatJam(isoString: string | null): string | null {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null; // invalid date → null
    return (
      date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  } catch {
    return null;
  }
}

export default function Page() {
  const [search, setSearch] = useState("");
  const [dashboardData, setDashboardData] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) =>
    (currentYear - 2 + i).toString()
  );

  // Clock real-time
  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tamu");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const result: VisitorApi[] = await res.json();

      const parsed: Visitor[] = result.map((item) => ({
        id: item.id,
        name: item.name,
        instansi: item.instansi,
        email: item.email,
        departemen: item.departemen,
        karyawan: item.karyawan,
        visitTime: item.visitTime,
        visitDate: new Date(item.visitDate),
        statusDb: item.status ?? "Menunggu",
        checkin: formatJam(item.checkin),
        checkout: formatJam(item.checkout),
      }));

      setDashboardData(parsed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);


  const filteredByYear = dashboardData.filter(
    (item) => item.visitDate.getFullYear().toString() === selectedYear
  );

  const todayString = new Date().toDateString();

  // Tamu hari ini
  const todayData = dashboardData.filter((item) => {
    const isToday = item.visitDate.toDateString() === todayString;
    const keyword = search.toLowerCase();
    const matchesSearch =
      (item.name || "").toLowerCase().includes(keyword) ||
      String(item.id || "").toLowerCase().includes(keyword) ||
      (item.instansi || "").toLowerCase().includes(keyword);
    return isToday && matchesSearch;
  });

  // Tamu mendatang
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

  // Statistik
  const total = filteredByYear.length;
  const selesai = filteredByYear.filter((i) => getStatus(i) === "Selesai").length;
  const pending = filteredByYear.filter((i) => getStatus(i) === "Pending").length;
  const ditolak = filteredByYear.filter((i) => getStatus(i) === "Ditolak").length;

  return (
    <div className="flex flex-col space-y-6 w-full">

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LayoutDashboard size={16} />
        <span>›</span>
        <span className="font-medium text-foreground">Dashboard Management</span>
      </div>


      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-green-100 p-4 text-green-600">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dashboard Management</h1>
            <p className="text-sm text-muted-foreground">
              Monitor tamu periode tahun {selectedYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Periode:
            </span>
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
          <p className="text-sm font-medium border-l pl-4 py-1 hidden md:block">
            {currentDateTime.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchData} className="underline font-medium ml-2">
            Coba lagi
          </button>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div className="w-full mb-6">
          <TabsList className="h-8 w-fit rounded-lg bg-muted p-1">
            <TabsTrigger
              value="overview"
              className="px-4 text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              onClick={() => setSearch("")}
            >
              <Activity className="mr-2 h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger
              value="visitor"
              className="px-4 text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              onClick={() => setSearch("")}
            >
              <Users className="mr-2 h-3.5 w-3.5" /> Visitor (Mendatang)
            </TabsTrigger>
          </TabsList>
        </div>


        <TabsContent value="overview" className="flex flex-col space-y-6 m-0 outline-none">
          {/* Stat Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={`Total Tamu ${selectedYear}`}
              value={loading ? 0 : total}
              icon={<Users />}
              color="blue"
            />
            <StatCard
              title="Tamu Selesai"
              value={loading ? 0 : selesai}
              icon={<CheckCircle />}
              color="green"
            />
            <StatCard
              title="Tamu Pending"
              value={loading ? 0 : pending}
              icon={<Clock />}
              color="yellow"
            />
            <StatCard
              title="Tamu Ditolak"
              value={loading ? 0 : ditolak}
              icon={<XCircle />}
              color="red"
            />
          </div>


          <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b p-4 gap-4">
              <div>
                <h2 className="font-semibold">Aktivitas Hari Ini</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Data check-in & check-out diambil dari catatan satpam
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">No</TableHead>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground animate-pulse">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : todayData.length > 0 ? (
                    todayData.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.instansi}</TableCell>
                        <TableCell>{item.karyawan}</TableCell>
                        <TableCell>{item.departemen}</TableCell>

                        <TableCell>
                          {item.checkin ? (
                            <span className="text-green-600 font-medium">{item.checkin}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        {/* Jam checkout dari aktualCheckOut satpam */}
                        <TableCell>
                          {item.checkout ? (
                            <span className="text-blue-600 font-medium">{item.checkout}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getStatus(item)} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        {search
                          ? "Pencarian tidak ditemukan."
                          : "Tidak ada aktivitas kunjungan untuk hari ini."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>


        <TabsContent value="visitor" className="flex flex-col m-0 outline-none">
          <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b p-4 gap-4">
              <h2 className="font-semibold">
                Jadwal Kunjungan Mendatang ({selectedYear})
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari jadwal mendatang..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">No</TableHead>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground animate-pulse">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : upcomingData.length > 0 ? (
                    upcomingData.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.instansi}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.visitDate.toLocaleDateString("id-ID")}</TableCell>
                        <TableCell>{item.karyawan}</TableCell>
                        <TableCell>
                          <StatusBadge status={getStatus(item)} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                        {search
                          ? "Pencarian tidak ditemukan."
                          : `Tidak ada jadwal kunjungan mendatang untuk tahun ${selectedYear}.`}
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


function StatCard({ title, value, icon, color = "blue" }: CardProps) {
  const styles = {
    blue: { hover: "hover:bg-blue-50", iconBg: "bg-blue-500" },
    green: { hover: "hover:bg-green-50", iconBg: "bg-green-500" },
    yellow: { hover: "hover:bg-yellow-50", iconBg: "bg-yellow-400" },
    red: { hover: "hover:bg-red-50", iconBg: "bg-red-500" },
  };
  return (
    <div className={`flex items-center justify-between rounded-xl border bg-white p-4 transition hover:shadow-lg ${styles[color].hover}`}>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h2 className="mt-1 text-2xl font-semibold">{value}</h2>
      </div>
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
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}