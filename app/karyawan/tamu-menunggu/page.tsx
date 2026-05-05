"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Search, Filter } from "lucide-react";

type GuestType = "regular" | "vip";

interface UpcomingGuest {
  id: number;
  name: string;
  tujuanKunjungan: string;
  departemen: string;
  visitTime: string;
  visitDate: Date;
  tipeTamu: GuestType;
  phone: string;
  karyawan: string;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function formatTanggal(date: Date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  });
}

function isTomorrow(date: Date) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

// Hanya besok sampai 7 hari ke depan (TIDAK termasuk hari ini)
function isWithin7DaysExcludeToday(date: Date) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  in7Days.setHours(23, 59, 59, 999);

  return date >= tomorrow && date <= in7Days;
}

function getDayLabel(date: Date) {
  if (isTomorrow(date)) return "Besok";
  return formatTanggal(date);
}

function UpcomingGuestCard({ guest }: { guest: UpcomingGuest }) {
  const isVip    = guest.tipeTamu === "vip";
  const isBesok  = isTomorrow(guest.visitDate);
  const dayLabel = getDayLabel(guest.visitDate);

  return (
    <Card className={`border shadow-sm hover:shadow-md transition-all duration-150 ${isBesok ? "border-orange-200 bg-orange-50/30" : ""}`}>
      <CardContent className="p-4">
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

        <div className="rounded-lg bg-slate-50 p-3 space-y-1.5 text-xs">
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
          <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
            <span className="text-slate-400">Tanggal</span>
            <span className={`font-semibold ${isBesok ? "text-orange-600" : "text-slate-700"}`}>
              {dayLabel}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Pukul</span>
            <span className="text-orange-600 font-semibold">{guest.visitTime}</span>
          </div>
        </div>

        {isBesok && (
          <div className="mt-3 rounded-lg bg-orange-100 py-1.5 text-center text-xs font-medium text-orange-700">
            🗓️ Kunjungan besok
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function JadwalTamuPage() {
  const [guests, setGuests]         = useState<UpcomingGuest[]>([]);
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState<"all" | GuestType>("all");
  const [filterHari, setFilterHari] = useState<"semua" | "besok" | "lainnya">("semua");
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError]           = useState<string | null>(null);


  const namaKaryawan: string | null = null;

  const fetchTamu = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/tamu");
      if (!res.ok) throw new Error("Gagal mengambil data tamu.");
      const data: any[] = await res.json();

      const upcoming: UpcomingGuest[] = data
        .filter((t) => {
          const raw = t.tanggalKunjungan || t.visitDate;
          if (!raw) return false;
          const date = new Date(raw);
          date.setHours(0, 0, 0, 0);

          if (!isWithin7DaysExcludeToday(date)) return false;

          if (namaKaryawan && t.karyawan !== namaKaryawan) return false;

          return true;
        })
        .map((t) => {
          const raw  = t.tanggalKunjungan || t.visitDate;
          const date = new Date(raw);
          date.setHours(0, 0, 0, 0);
          return {
            id:              t.id,
            name:            t.name            || "-",
            tujuanKunjungan: t.tujuanKunjungan || t.instansi || "-",
            departemen:      t.departemen      || "-",
            visitTime:       t.visitTime       || "-",
            visitDate:       date,
            tipeTamu:        t.tipeTamu === "vip" ? "vip" : "regular",
            phone:           t.phone           || "-",
            karyawan:        t.karyawan        || "-",
          };
        })
        .sort((a, b) => a.visitDate.getTime() - b.visitDate.getTime());

      setGuests(upcoming);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsFetching(false);
    }
  }, [namaKaryawan]);

  useEffect(() => {
    fetchTamu();
    const interval = setInterval(fetchTamu, 60_000);
    return () => clearInterval(interval);
  }, [fetchTamu]);

  const filtered = guests.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.departemen.toLowerCase().includes(search.toLowerCase()) ||
      g.tujuanKunjungan.toLowerCase().includes(search.toLowerCase());

    const matchType = filterType === "all" || g.tipeTamu === filterType;

    const matchHari =
      filterHari === "semua"   ? true :
      filterHari === "besok"   ? isTomorrow(g.visitDate) :
      !isTomorrow(g.visitDate);

    return matchSearch && matchType && matchHari;
  });

  const totalMendatang = guests.length;
  const besokCount     = guests.filter((g) => isTomorrow(g.visitDate)).length;

  
  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-bold text-slate-800">Jadwal Tamu Mendatang</h2>
        <p className="text-sm text-slate-500">
          Daftar tamu yang akan berkunjung dalam 7 hari ke depan.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ {error}{" "}
          <button onClick={fetchTamu} className="underline font-medium ml-1">Coba lagi</button>
        </div>
      )}

      {!isFetching && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-slate-800">{totalMendatang}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total (7 hari ke depan)</p>
          </div>
          <div className="rounded-xl border bg-orange-50 border-orange-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-600">{besokCount}</p>
            <p className="text-xs text-orange-500 mt-0.5">Besok</p>
          </div>
        </div>
      )}

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
            value={filterHari}
            onChange={(e) => setFilterHari(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="semua">Semua Hari</option>
            <option value="besok">Besok</option>
            <option value="lainnya">Hari Lainnya</option>
          </select>
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
        <p className="text-sm text-slate-500">
          Menampilkan <strong className="text-slate-800">{filtered.length}</strong> dari{" "}
          <strong className="text-slate-800">{totalMendatang}</strong> tamu mendatang
        </p>
      )}

      {isFetching ? (
        <div className="rounded-xl border bg-white py-16 text-center text-sm text-slate-400 shadow-sm animate-pulse">
          Memuat jadwal tamu...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center shadow-sm">
          <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            {totalMendatang === 0
              ? "Tidak ada tamu yang dijadwalkan dalam 7 hari ke depan."
              : "Tidak ada tamu yang cocok dengan filter."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((guest) => (
            <UpcomingGuestCard key={guest.id} guest={guest} />
          ))}
        </div>
      )}
    </div>
  );
}