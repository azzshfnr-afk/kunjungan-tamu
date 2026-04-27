"use client";

import { useState, useEffect } from "react";
import {
  IdCardLanyard,
  Trash2,
  Eye,
  Search,
  IdCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Visitor = {
  id: string;
  name: string;
  instansi: string;
  email: string;
  phone: string;
  visitDate: string;
  visitTime: string;
  checkin: string | null;
};

const formatDateTime = (date: string | null) => {
  if (!date) return "-";

  const d = new Date(date);

  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function VisitorCardPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("today");
  const [data, setData] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const res = await fetch("/api/tamu");
        
        if (!res.ok) throw new Error("Gagal mengambil data");
        
        const result = await res.json();

        if (Array.isArray(result)) {
          setData(result);
        } else if (Array.isArray(result.data)) {
          setData(result.data);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error(error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  const filteredTab = Array.isArray(data)
    ? data.filter((item) => {
        // Ambil bagian tanggal saja (YYYY-MM-DD)
        const itemDateISO = new Date(item.visitDate).toISOString().split('T')[0];

        if (tab === "today") return itemDateISO === todayISO;
        if (tab === "upcoming") return itemDateISO > todayISO;

        return true;
      })
    : [];

  const filteredData = filteredTab.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(keyword) ||
      item.instansi.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    );
  });

  const deleteCard = async (id: string) => {
    try {
      // alamat delete disesuaikan ke api/tamu
      await fetch(`/api/tamu/${id}`, {
        method: "DELETE",
      });

      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <IdCard size={16} />
        <span>›</span>
        <span className="font-medium text-foreground">
          Visitor Card
        </span>
      </div>

      <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-xl">
            <IdCardLanyard size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Visitor Card</h1>
            <p className="text-gray-400 text-sm">
              Data kartu tamu
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TAB */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="today" className="text-xs">
            Hari Ini
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs">
            Mendatang
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">
            Semua
          </TabsTrigger>
        </TabsList>
      </Tabs>


      {/* CONTENT */}
      {loading ? (
        <p className="mt-6 text-muted-foreground">
          Loading...
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredData.length > 0 ? (
            filteredData.map((card) => (
              <div
                key={card.id}
                className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition"
              >
                {/* TOP */}
                <div className="flex justify-between mb-4">
                  <IdCardLanyard />

                  <div className="flex gap-2">
                    {/* DETAIL */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="p-2 hover:bg-muted rounded">
                          <Eye size={16} />
                        </button>
                      </SheetTrigger>

                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>
                            Detail Tamu
                          </SheetTitle>

                          <SheetDescription>
                            Informasi lengkap
                          </SheetDescription>
                        </SheetHeader>
                      
                        <div className="p-5 mt-6 space-y-3 text-sm">
                          <Detail
                            label="Nama"
                            value={card.name}
                          />
                          <Detail
                            label="Instansi"
                            value={card.instansi}
                          />
                          <Detail
                            label="Email"
                            value={card.email}
                          />
                          <Detail
                            label="No HP"
                            value={card.phone}
                          />
                          <Detail
                            label="Tanggal Kunjungan"
                            value={formatDateTime(
                              card.visitDate
                            )}
                          />
                          <Detail
                            label="Check-in"
                            value={formatDateTime(
                              card.checkin
                            )}
                          />
                        </div>

                        <SheetFooter className="mt-6">
                          <SheetClose asChild>
                            <Button variant="outline">
                              Tutup
                            </Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>

                    {/* DELETE */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Hapus data?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            Data {card.name} akan
                            dihapus
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Batal
                          </AlertDialogCancel>

                          <AlertDialogAction
                            onClick={() =>
                              deleteCard(card.id)
                            }
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* BODY */}
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">
                    {card.name}
                  </p>

                  <p className="text-gray-500">
                    {card.instansi}
                  </p>

                  <p className="text-gray-500">
                    {formatDateTime(card.visitDate)}
                  </p>

                  <p className="text-xs text-gray-400">
                    Check-in:{" "}
                    {formatDateTime(card.checkin)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-muted-foreground">
              Data tidak ditemukan
            </p>
          )}
        </div>
      )}
    </>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}