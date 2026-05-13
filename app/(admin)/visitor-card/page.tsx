"use client";

import { useState, useEffect } from "react";
import {
  IdCardLanyard,
  Trash2,
  Eye,
  Search,
  IdCard,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetTrigger, SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TipeTamu   = "regular" | "vip";
type FilterTipe = "semua" | "vip" | "regular";

type Visitor = {
  id: string;
  name: string;
  instansi: string;
  email: string;
  phone: string;
  visitDate: string;
  visitTime: string;
  checkin: string | null;
  tipeTamu: TipeTamu;
};

const formatDateTime = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function RegularCard({ card, onDelete }: { card: Visitor; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <IdCardLanyard size={18} />
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Reguler
          </span>
        </div>
        <Actions card={card} onDelete={onDelete} />
      </div>
      <div className="space-y-1 text-sm">
        <p className="font-semibold text-slate-800">{card.name}</p>
        <p className="text-gray-500">{card.instansi}</p>
        <p className="text-gray-500">{formatDateTime(card.visitDate)}</p>
        <p className="text-xs text-gray-400">Check-in: {formatDateTime(card.checkin)}</p>
      </div>
    </div>
  );
}

function VipCard({ card, onDelete }: { card: Visitor; onDelete: (id: string) => void }) {
  return (
    <div className="relative bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-xl shadow-md border border-amber-200 hover:shadow-lg transition overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 rounded-bl-full opacity-50" />
      <div className="flex justify-between items-center mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
            <Star size={18} className="fill-amber-400 text-amber-500" />
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            ★ VIP
          </span>
        </div>
        <Actions card={card} onDelete={onDelete} />
      </div>
      <div className="space-y-1 text-sm relative">
        <p className="font-bold text-slate-800 text-base">{card.name}</p>
        <p className="text-amber-700 font-medium">{card.instansi}</p>
        <p className="text-gray-500">{formatDateTime(card.visitDate)}</p>
        <p className="text-xs text-gray-400">Check-in: {formatDateTime(card.checkin)}</p>
      </div>
    </div>
  );
}

function Actions({ card, onDelete }: { card: Visitor; onDelete: (id: string) => void }) {
  return (
    <div className="flex gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 hover:bg-muted rounded">
            <Eye size={16} />
          </button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              Detail Tamu
              {card.tipeTamu === "vip" && (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  ★ VIP
                </span>
              )}
            </SheetTitle>
            <SheetDescription>Informasi lengkap tamu</SheetDescription>
          </SheetHeader>
          <div className="p-5 mt-6 space-y-3 text-sm">
            <Detail label="Nama"              value={card.name} />
            <Detail label="Instansi"          value={card.instansi} />
            <Detail label="Email"             value={card.email} />
            <Detail label="No HP"             value={card.phone} />
            <Detail label="Tipe Tamu"         value={card.tipeTamu === "vip" ? "VIP" : "Reguler"} />
            <Detail label="Tanggal Kunjungan" value={formatDateTime(card.visitDate)} />
            <Detail label="Check-in"          value={formatDateTime(card.checkin)} />
          </div>
          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <Button variant="outline">Tutup</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="p-2 text-red-500 hover:bg-red-50 rounded">
            <Trash2 size={16} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data?</AlertDialogTitle>
            <AlertDialogDescription>
              Data <strong>{card.name}</strong> akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(card.id)}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CardGrid({ data, onDelete }: { data: Visitor[]; onDelete: (id: string) => void }) {
  const vipData     = data.filter((d) => d.tipeTamu === "vip");
  const regularData = data.filter((d) => d.tipeTamu !== "vip");

  return (
    <div className="space-y-8">
      {vipData.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="fill-amber-400 text-amber-500" />
            <h2 className="text-sm font-semibold text-amber-700">Tamu VIP</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600 border border-amber-200">
              {vipData.length} tamu
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vipData.map((card) => (
              <VipCard key={card.id} card={card} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
      {regularData.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IdCardLanyard size={16} className="text-blue-500" />
            <h2 className="text-sm font-semibold text-blue-700">Tamu Reguler</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 border border-blue-200">
              {regularData.length} tamu
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularData.map((card) => (
              <RegularCard key={card.id} card={card} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VisitorCardPage() {
  const [search, setSearch]         = useState("");
  const [tab, setTab]               = useState("today");
  const [filterTipe, setFilterTipe] = useState<FilterTipe>("semua");
  const [data, setData]             = useState<Visitor[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/tamu");
        if (!res.ok) throw new Error("Gagal mengambil data");
        const result = await res.json();
        const raw = Array.isArray(result) ? result : Array.isArray(result.data) ? result.data : [];
        setData(raw);
      } catch (error) {
        console.error(error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset filter tipe saat pindah tab
  const handleTabChange = (val: string) => {
    setTab(val);
    setFilterTipe("semua");
  };

  const todayISO = new Date().toISOString().split("T")[0];

  const filteredTab = data.filter((item) => {
    const itemDateISO = new Date(item.visitDate).toISOString().split("T")[0];
    if (tab === "today")    return itemDateISO === todayISO;
    if (tab === "upcoming") return itemDateISO > todayISO;
    return true;
  });

  const filteredData = filteredTab.filter((item) => {
    const keyword     = search.toLowerCase();
    const matchSearch =
      (item.name || "").toLowerCase().includes(keyword) ||
      (item.instansi || "").toLowerCase().includes(keyword) ||
      (item.email || "").toLowerCase().includes(keyword);
    const matchTipe =
      filterTipe === "semua" ? true : item.tipeTamu === filterTipe;
    return matchSearch && matchTipe;
  });

  const deleteCard = async (id: string) => {
    try {
      await fetch(`/api/tamu/${id}`, { method: "DELETE" });
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const totalVip     = filteredTab.filter((d) => d.tipeTamu === "vip").length;
  const totalRegular = filteredTab.filter((d) => d.tipeTamu !== "vip").length;

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <IdCard size={16} />
        <span>›</span>
        <span className="font-medium text-foreground">Visitor Card</span>
      </div>

      <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-xl">
            <IdCardLanyard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Visitor Card</h1>
            <p className="text-gray-400 text-sm">Data kartu tamu</p>
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="today" className="text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Hari Ini
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Mendatang
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Semua
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Toggle filter tipe — muncul di semua tab */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {([
            { val: "semua",   label: "Semua",   count: totalVip + totalRegular },
            { val: "vip",     label: "★ VIP",   count: totalVip },
            { val: "regular", label: "Reguler", count: totalRegular },
          ] as { val: FilterTipe; label: string; count: number }[]).map(({ val, label, count }) => (
            <button
              key={val}
              onClick={() => setFilterTipe(val)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                filterTipe === val
                  ? val === "vip"
                    ? "bg-amber-100 text-amber-700 shadow-sm"
                    : "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                filterTipe === val
                  ? val === "vip" ? "bg-amber-200 text-amber-800" : "bg-slate-100 text-slate-600"
                  : "bg-muted-foreground/20 text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-muted-foreground animate-pulse">Memuat data...</p>
      ) : filteredData.length === 0 ? (
        <p className="mt-6 text-center text-muted-foreground">Data tidak ditemukan</p>
      ) : (
        <div className="mt-6">
          <CardGrid data={filteredData} onDelete={deleteCard} />
        </div>
      )}
    </>
  );
}