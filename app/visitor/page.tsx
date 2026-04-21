"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Activity,
  MoreVertical,
  Eye,
  Search,
  Calendar,
  User,
  Building2,
  Phone,
  IdCard,
  Clock,
  Mail,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow as Row,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Visitor = {
  id: string;
  name: string;
  instansi: string;
  email: string;
  phone: string;
  ktp: string;
  karyawan: string;
  departemen: string;
  tujuan: string;
  visitDate: Date;
  visitTime: string;
};

export default function VisitorPage() {
  const router = useRouter();

  const [selectedData, setSelectedData] = useState<Visitor | null>(null);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/visitor");
        const result = await res.json();

        console.log("API RESULT:", result);

        if (!res.ok) {
          setError(result.message || "Gagal ambil data");
          setData([]);
          return;
        }

        if (!Array.isArray(result)) {
          setError("Format data tidak valid");
          setData([]);
          return;
        }

        const parsed: Visitor[] = result.map((item: any) => ({
          ...item,
          visitDate: new Date(item.visitDate),
        }));

        setData(parsed);
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat fetch data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedData = [...data].sort(
    (a, b) => a.visitDate.getTime() - b.visitDate.getTime()
  );

  const filteredData = sortedData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.instansi.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase()) ||
    item.karyawan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Home size={16} />
        <span>›</span>
        <span className="text-foreground font-medium">Visitor</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Visitor Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor guest data
          </p>
        </div>
      </div>

      <div className="bg-muted p-1 rounded-xl flex w-fit">
        <Tab
          active={false}
          icon={<Activity size={14} />}
          label="Overview"
          onClick={() => router.push("/")}
        />
        <Tab active icon={<Users size={14} />} label="Visitor" />
      </div>

      <div className="rounded-xl border bg-background shadow-sm">

        <div className="p-4 border-b flex justify-between">
          <div>
            <h2 className="font-semibold">Daftar Tamu</h2>
            <p className="text-sm text-muted-foreground">
              Kunjungan terdekat
            </p>
          </div>

          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 overflow-x-auto">

          {loading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}

          {!loading && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg font-medium">Tidak ada data masuk</p>
              <p className="text-sm">Silakan tambahkan data baru</p>
            </div>
          )}

          {!loading && !error && data.length > 0 && filteredData.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              Data tidak ditemukan
            </div>
          )}

          {!loading && !error && filteredData.length > 0 && (
            <Table>
              <TableHeader>
                <Row>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Instansi</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead></TableHead>
                </Row>
              </TableHeader>

              <TableBody>
                {filteredData.map((item, index) => (
                  <Row key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.instansi}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.karyawan}</TableCell>
                    <TableCell>{item.departemen}</TableCell>
                    <TableCell>{item.tujuan}</TableCell>
                    <TableCell>{formatDate(item.visitDate)}</TableCell>
                    <TableCell>{item.visitTime}</TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setSelectedData(item)}>
                            <Eye size={14} className="mr-2" />
                            Detail
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </Row>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog
        open={!!selectedData}
        onOpenChange={(open) => {
          if (!open) setSelectedData(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Kunjungan</DialogTitle>
          </DialogHeader>

          {selectedData && (
            <div className="space-y-6 mt-4">

              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-semibold">{selectedData.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedData.instansi}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail icon={<Building2 size={14} />} label="Instansi" value={selectedData.instansi} />
                <Detail icon={<Phone size={14} />} label="No HP" value={selectedData.phone} />
                <Detail icon={<IdCard size={14} />} label="No KTP" value={selectedData.ktp} />
                <Detail icon={<Users size={14} />} label="Karyawan Tujuan" value={selectedData.karyawan} />
                <Detail icon={<Activity size={14} />} label="Departemen" value={selectedData.departemen} />
                <Detail icon={<Mail size={14} />} label="Email" value={selectedData.email} />
                <Detail icon={<Calendar size={14} />} label="Tanggal" value={formatDate(selectedData.visitDate)} />
                <Detail icon={<Clock size={14} />} label="Waktu" value={selectedData.visitTime} />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Tujuan</p>
                <p className="font-medium">{selectedData.tujuan}</p>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Tab({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex gap-2 px-4 py-2 text-sm rounded-lg transition ${
        active
          ? "bg-white shadow text-foreground"
          : "text-muted-foreground hover:bg-white/80"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Detail({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}