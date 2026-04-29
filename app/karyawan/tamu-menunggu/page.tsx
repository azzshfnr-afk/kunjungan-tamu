"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X, Check, Search, Filter } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type GuestType = "regular" | "vip";

interface Guest {
  id: number;
  name: string;
  tujuanKunjungan: string;
  departemen: string;
  visitTime: string;
  tipeTamu: GuestType;
  phone: string;
  karyawan: string;
  statusKunjungan: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function isTodayVisit(tanggalKunjungan: string | null, visitDate: string | null) {
  const raw = tanggalKunjungan || visitDate;
  if (!raw) return false;
  const today = new Date().toDateString();
  return new Date(raw).toDateString() === today;
}

// ─── Notification Banner ──────────────────────────────────────────────────────

function NotifBanner({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-blue-200 border-l-4 border-l-blue-500 bg-blue-50 px-4 py-3">
      <Bell className="mt-0.5 h-4 w-4 text-blue-500 shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-blue-700 mb-0.5">Tamu menunggu konfirmasi!</p>
        <p className="text-blue-600">
          <span className="font-semibold">{guest.name}</span> ingin mengunjungi{" "}
          <span className="font-semibold">{guest.departemen}</span> — {guest.tujuanKunjungan} | Pukul {guest.visitTime}
        </p>
      </div>
      <button onClick={onClose} className="text-blue-400 hover:text-blue-600 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Guest Card ───────────────────────────────────────────────────────────────

function GuestCard({
  guest, onConfirm, onReject, loading,
}: {
  guest: Guest;
  onConfirm: (id: number) => void;
  onReject: (id: number) => void;
  loading: number | null;
}) {
  const isVip = guest.tipeTamu === "vip";
  const isProcessing = loading === guest.id;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-all duration-150">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isVip ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
              {getInitials(guest.name)}
            </div>
            <div>
              <p className="font-semibold text-slate-800 leading-tight">{guest.name}</p>
              <p className="text-xs text-slate-400">{guest.phone}</p>
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${isVip ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
            {isVip ? "★ VIP" : "Reguler"}
          </span>
        </div>

        {/* Detail */}
        <div className="rounded-lg bg-slate-50 p-3 mb-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Keperluan</span>
            <span className="text-slate-700 font-medium text-right max-w-[60%]">{guest.tujuanKunjungan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Departemen</span>
            <span className="text-slate-700 font-medium">{guest.departemen}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Bertemu</span>
            <span className="text-slate-700 font-medium">{guest.karyawan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Tiba pukul</span>
            <span className="text-orange-600 font-semibold">{guest.visitTime}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(guest.id)}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 border border-green-200 py-2 text-sm font-medium text-green-700 hover:bg-green-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? <span className="h-3.5 w-3.5 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
              : <Check className="h-3.5 w-3.5" />}
            Izinkan Masuk
          </button>
          <button
            onClick={() => onReject(guest.id)}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 border border-red-200 py-2 text-sm font-medium text-red-700 hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? <span className="h-3.5 w-3.5 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
              : <X className="h-3.5 w-3.5" />}
            Tolak
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KonfirmasiTamuPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | GuestType>("all");
  const [notifVisible, setNotifVisible] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState<{ name: string; status: "DIIZINKAN" | "DITOLAK" } | null>(null);

  const fetchTamu = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/tamu");
      if (!res.ok) throw new Error("Gagal mengambil data tamu.");
      const data: any[] = await res.json();

      // Filter: hari H + belum dikonfirmasi (MENUNGGU_GATE_1)
      const waiting: Guest[] = data
        .filter((t) =>
          isTodayVisit(t.tanggalKunjungan, t.visitDate) &&
          (!t.statusKunjungan || t.statusKunjungan === "MENUNGGU_GATE_1")
        )
        .map((t) => ({
          id: t.id,
          name: t.name,
          tujuanKunjungan: t.tujuanKunjungan || "-",
          departemen: t.departemen || "-",
          visitTime: t.visitTime || "-",
          tipeTamu: t.tipeTamu === "vip" ? "vip" : "regular",
          phone: t.phone || "-",
          karyawan: t.karyawan || "-",
          statusKunjungan: t.statusKunjungan || "MENUNGGU_GATE_1",
        }));

      setGuests(waiting);
      if (waiting.length > 0) setNotifVisible(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchTamu();
    const interval = setInterval(fetchTamu, 30_000);
    return () => clearInterval(interval);
  }, [fetchTamu]);

  useEffect(() => {
    if (!processed) return;
    const t = setTimeout(() => setProcessed(null), 3000);
    return () => clearTimeout(t);
  }, [processed]);

  const handleGuest = async (id: number, statusKunjungan: "DIIZINKAN" | "DITOLAK") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/tamu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusKunjungan }),
      });
      if (!res.ok) throw new Error("Gagal mengupdate status.");

      const guest = guests.find((g) => g.id === id);
      if (guest) setProcessed({ name: guest.name, status: statusKunjungan });
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memproses tamu.");
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = guests.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.departemen.toLowerCase().includes(search.toLowerCase()) ||
      g.tujuanKunjungan.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || g.tipeTamu === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Konfirmasi Tamu</h2>
        <p className="text-sm text-slate-500">
          Tamu hari ini yang menunggu persetujuan masuk dari karyawan.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ {error}{" "}
          <button onClick={fetchTamu} className="underline font-medium ml-1">Coba lagi</button>
        </div>
      )}

      {notifVisible && guests.length > 0 && (
        <NotifBanner guest={guests[0]} onClose={() => setNotifVisible(false)} />
      )}

      {/* Toast */}
      {processed && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${processed.status === "DIIZINKAN" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {processed.status === "DIIZINKAN" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {processed.name} telah {processed.status === "DIIZINKAN" ? "diizinkan masuk" : "ditolak"}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, departemen, atau keperluan..."
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

      {!isFetching && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            Menampilkan <strong className="text-slate-800">{filtered.length}</strong> dari{" "}
            <strong className="text-slate-800">{guests.length}</strong> tamu menunggu konfirmasi
          </span>
          {guests.length > 0 && (
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">
              {guests.length} menunggu
            </span>
          )}
        </div>
      )}

      {isFetching ? (
        <div className="rounded-xl border bg-white py-16 text-center text-sm text-slate-400 shadow-sm animate-pulse">
          Memuat data tamu...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center shadow-sm">
          <p className="text-slate-400 text-sm">
            {guests.length === 0
              ? "Tidak ada tamu yang menunggu konfirmasi hari ini."
              : "Tidak ada tamu yang cocok dengan pencarian."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onConfirm={(id) => handleGuest(id, "DIIZINKAN")}
              onReject={(id) => handleGuest(id, "DITOLAK")}
              loading={loadingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}