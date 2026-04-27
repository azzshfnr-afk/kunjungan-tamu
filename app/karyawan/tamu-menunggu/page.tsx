"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X, Check, Search, Filter } from "lucide-react";

// ─── Types 

type GuestType = "regular" | "vip";
type GuestStatus = "Diterima" | "Ditolak";

interface Guest {
  id: number;
  name: string;
  purpose: string;
  room: string;
  time: string;
  type: GuestType;
  initials: string;
  phone: string;
  host: string;
}

// ─── Mock Data 

const MOCK_WAITING: Guest[] = [
  { id: 1, name: "Budi Santoso", purpose: "Presentasi produk kepada tim marketing", room: "Ruang Meeting A", time: "09:45", type: "regular", initials: "BS", phone: "0812-3456-7890", host: "Pak Hendra" },
  { id: 2, name: "Siti Rahayu", purpose: "Pertemuan dengan Direktur", room: "Ruang Direksi", time: "10:00", type: "vip", initials: "SR", phone: "0821-9876-5432", host: "Bu Direktur" },
  { id: 3, name: "Dian Permata", purpose: "Pengambilan dokumen kontrak", room: "Ruang Administrasi", time: "10:15", type: "regular", initials: "DP", phone: "0857-1122-3344", host: "Pak Agus" },
  { id: 4, name: "Reza Firmansyah", purpose: "Wawancara kerja posisi Engineer", room: "Ruang HRD", time: "10:30", type: "regular", initials: "RF", phone: "0878-5566-7788", host: "Bu Sari" },
  { id: 5, name: "Mega Puspita", purpose: "Diskusi kerjasama vendor IT", room: "Ruang Meeting B", time: "11:00", type: "vip", initials: "MP", phone: "0831-2233-4455", host: "Pak Direktur Teknologi" },
];

// ─── Notification Banner 

function NotifBanner({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-blue-200 border-l-4 border-l-blue-500 bg-blue-50 px-4 py-3">
      <Bell className="mt-0.5 h-4 w-4 text-blue-500 shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-blue-700 mb-0.5">Tamu baru telah check-in!</p>
        <p className="text-blue-600">
          <span className="font-semibold">{guest.name}</span> menunggu di{" "}
          <span className="font-semibold">{guest.room}</span> sejak pukul {guest.time}
        </p>
      </div>
      <button onClick={onClose} className="text-blue-400 hover:text-blue-600 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Guest Card 

function GuestCard({
  guest,
  onAccept,
  onReject,
}: {
  guest: Guest;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const isVip = guest.type === "vip";

  return (
    <Card className="border shadow-sm hover:shadow-md transition-all duration-150">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isVip ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {guest.initials}
            </div>
            <div>
              <p className="font-semibold text-slate-800 leading-tight">{guest.name}</p>
              <p className="text-xs text-slate-400">{guest.phone}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${
              isVip
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-blue-100 text-blue-700 border border-blue-200"
            }`}
          >
            {isVip ? "★ VIP" : "Reguler"}
          </span>
        </div>

        {/* Detail */}
        <div className="rounded-lg bg-slate-50 p-3 mb-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Keperluan</span>
            <span className="text-slate-700 font-medium text-right max-w-[60%]">{guest.purpose}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ruangan</span>
            <span className="text-slate-700 font-medium">{guest.room}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Bertemu</span>
            <span className="text-slate-700 font-medium">{guest.host}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Tiba pukul</span>
            <span className="text-orange-600 font-semibold">{guest.time}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(guest.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 border border-green-200 py-2 text-sm font-medium text-green-700 hover:bg-green-100 active:scale-95 transition-all"
          >
            <Check className="h-3.5 w-3.5" />
            Terima
          </button>
          <button
            onClick={() => onReject(guest.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 border border-red-200 py-2 text-sm font-medium text-red-700 hover:bg-red-100 active:scale-95 transition-all"
          >
            <X className="h-3.5 w-3.5" />
            Tolak
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page 

export default function TamuMenungguPage() {
  const [guests, setGuests] = useState<Guest[]>(MOCK_WAITING);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | GuestType>("all");
  const [notifVisible, setNotifVisible] = useState(true);
  const [processed, setProcessed] = useState<{ name: string; status: GuestStatus } | null>(null);

  useEffect(() => {
    if (guests.length > 0) setNotifVisible(true);
  }, [guests]);

  // Auto-hide toast
  useEffect(() => {
    if (!processed) return;
    const t = setTimeout(() => setProcessed(null), 3000);
    return () => clearTimeout(t);
  }, [processed]);

  const handleGuest = (id: number, status: GuestStatus) => {
    const guest = guests.find((g) => g.id === id);
    if (!guest) return;
    setProcessed({ name: guest.name, status });
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const filtered = guests.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.room.toLowerCase().includes(search.toLowerCase()) ||
      g.purpose.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || g.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Tamu Menunggu</h2>
        <p className="text-sm text-slate-500">Proses tamu yang sedang menunggu persetujuan masuk.</p>
      </div>

      {/* Notif Banner */}
      {notifVisible && guests.length > 0 && (
        <NotifBanner guest={guests[0]} onClose={() => setNotifVisible(false)} />
      )}

      {/* Toast feedback */}
      {processed && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            processed.status === "Diterima"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {processed.status === "Diterima" ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          {processed.name} telah {processed.status.toLowerCase()}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, ruangan, atau keperluan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | GuestType)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">Semua Tipe</option>
            <option value="regular">Reguler</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">
          Menampilkan <strong className="text-slate-800">{filtered.length}</strong> dari{" "}
          <strong className="text-slate-800">{guests.length}</strong> tamu menunggu
        </span>
        {guests.length > 0 && (
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">
            {guests.length} menunggu
          </span>
        )}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center shadow-sm">
          <p className="text-slate-400 text-sm">
            {guests.length === 0
              ? "Tidak ada tamu yang menunggu saat ini."
              : "Tidak ada tamu yang cocok dengan pencarian."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onAccept={(id) => handleGuest(id, "Diterima")}
              onReject={(id) => handleGuest(id, "Ditolak")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
