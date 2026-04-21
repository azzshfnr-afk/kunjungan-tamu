"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
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
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

type VisitorApi = Omit<Visitor, "visitDate"> & {
  visitDate: string;
};

type DetailProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

export default function VisitorPage() {
  const router = useRouter();

  const [selectedData, setSelectedData] =
    useState<Visitor | null>(null);

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
        const result: VisitorApi[] = await res.json();

        if (!res.ok) {
          setError("Gagal ambil data");
          setData([]);
          return;
        }

        const parsed: Visitor[] = result.map(
          (item: VisitorApi) => ({
            ...item,
            visitDate: new Date(item.visitDate),
          })
        );

        setData(parsed);
      } catch {
        setError("Terjadi kesalahan");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedData = [...data].sort(
    (a, b) =>
      a.visitDate.getTime() -
      b.visitDate.getTime()
  );

  const filteredData = sortedData.filter(
    (item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.instansi
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.email
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.karyawan
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={16} />
          <span>›</span>
          <span className="font-medium text-foreground">
            Visitor
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-blue-100 p-4 text-blue-600">
            <Users size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Visitor Management
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage and monitor guest data
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visitor">
        <TabsList>
          <TabsTrigger
            value="overview"
            onClick={() => router.push("/")}
          >
            <Activity className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>

          <TabsTrigger value="visitor">
            <Users className="mr-2 h-4 w-4" />
            Visitor
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <div className="rounded-xl border bg-background shadow-sm">
        <div className="flex justify-between border-b p-4">
          <div>
            <h2 className="font-semibold">
              Daftar Tamu
            </h2>

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
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading...
            </p>
          )}

          {!loading && error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            filteredData.length > 0 && (
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
                  {filteredData.map(
                    (item, index) => (
                      <Row key={item.id}>
                        <TableCell>
                          {index + 1}
                        </TableCell>

                        <TableCell>
                          {item.name}
                        </TableCell>

                        <TableCell>
                          {item.instansi}
                        </TableCell>

                        <TableCell>
                          {item.email}
                        </TableCell>

                        <TableCell>
                          {item.karyawan}
                        </TableCell>

                        <TableCell>
                          {item.departemen}
                        </TableCell>

                        <TableCell>
                          {item.tujuan}
                        </TableCell>

                        <TableCell>
                          {formatDate(
                            item.visitDate
                          )}
                        </TableCell>

                        <TableCell>
                          {item.visitTime}
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <MoreVertical size={16} />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  setSelectedData(
                                    item
                                  )
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Detail
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </Row>
                    )
                  )}
                </TableBody>
              </Table>
            )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog
        open={!!selectedData}
        onOpenChange={(open) => {
          if (!open)
            setSelectedData(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Detail Kunjungan
            </DialogTitle>
          </DialogHeader>

          {selectedData && (
            <div className="mt-4 space-y-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <User size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    {selectedData.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {selectedData.instansi}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail
                  icon={<Building2 size={14} />}
                  label="Instansi"
                  value={selectedData.instansi}
                />

                <Detail
                  icon={<Phone size={14} />}
                  label="No HP"
                  value={selectedData.phone}
                />

                <Detail
                  icon={<IdCard size={14} />}
                  label="No KTP"
                  value={selectedData.ktp}
                />

                <Detail
                  icon={<Users size={14} />}
                  label="Karyawan"
                  value={selectedData.karyawan}
                />

                <Detail
                  icon={<Activity size={14} />}
                  label="Departemen"
                  value={selectedData.departemen}
                />

                <Detail
                  icon={<Mail size={14} />}
                  label="Email"
                  value={selectedData.email}
                />

                <Detail
                  icon={<Calendar size={14} />}
                  label="Tanggal"
                  value={formatDate(
                    selectedData.visitDate
                  )}
                />

                <Detail
                  icon={<Clock size={14} />}
                  label="Waktu"
                  value={selectedData.visitTime}
                />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Tujuan
                </p>

                <p className="font-medium">
                  {selectedData.tujuan}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: DetailProps) {
  return (
    <div className="flex items-start gap-2">
      {icon}

      <div>
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}