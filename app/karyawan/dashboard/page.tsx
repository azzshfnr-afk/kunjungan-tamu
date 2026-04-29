"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, Bell, X, Check } from "lucide-react";

type GuestType = "regular" | "vip";
type GuestStatus = "Diterima" | "Ditolak" | "Menunggu";

interface Guest {
  id: string;
  name: string;
  tujuanKunjungan: string;
  departemen: string;
  visitTime: string;
  tipeTamu: GuestType;
  phone: string;
  karyawan: string;
  status: GuestStatus;
}

interface HistoryGuest extends Guest {
  processedAt: string;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function NotifBanner({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-4 py-3 mb-6">
      <Bell className="mt-0.5 h-4 w-4 text-green-700 shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-green-700 mb-0.5">Tamu baru telah check-in!</p>
        <p className="text-green-600">
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

function GuestCard({
  guest, onAccept, onReject, loading,
}: {
  guest: Guest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  loading: string | null;
}) {
  const isVip = guest.tipeTamu === "vip";
  const isProcessing = loading === guest.id;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${isVip ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
            {getInitials(guest.name)}
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isVip ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
            {isVip ? "★ VIP" : "Reguler"}
          </span>
        </div>
        <p className="font-semibold text-slate-800 mb-1">{guest.name}</p>
        <p className="text-sm text-slate-500 mb-3 leading-relaxed">{guest.tujuanKunjungan}</p>
        <div className="flex gap-4 text-xs text-slate-400 mb-4">
          <span>📍 <span className="text-slate-600 font-medium">{guest.departemen}</span></span>
          <span>🕐 <span className="text-slate-600 font-medium">{guest.visitTime}</span></span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(guest.id)}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 border border-green-200 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-3.5 w-3.5" /> Terima
          </button>
          <button
            onClick={() => onReject(guest.id)}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 border border-red-200 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-3.5 w-3.5" /> Tolak
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryTable({ history }: { history: HistoryGuest[] }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Nama Tamu</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Keperluan</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Tipe</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Jam</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Belum ada riwayat tamu hari ini.</td></tr>
          ) : (
            history.map((h) => (
              <tr key={`${h.id}-${h.processedAt}`} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{h.name}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{h.tujuanKunjungan}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${h.tipeTamu === "vip" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {h.tipeTamu === "vip" ? "★ VIP" : "Reguler"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{h.visitTime}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${h.status === "Diterima" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {h.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const [waitingGuests, setWaitingGuests] = useState<Guest[]>([]);
  const [history, setHistory] = useState<HistoryGuest[]>([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTamu = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/tamu");
      if (!res.ok) throw new Error("Gagal mengambil data tamu.");
      const data: any[] = await res.json();

      const waiting: Guest[] = [];
      const processed: HistoryGuest[] = [];

      data.forEach((t) => {
        const guest: Guest = {
          id: t.id,
          name: t.name,
          tujuanKunjungan: t.tujuanKunjungan || t.instansi || "-",
          departemen: t.departemen || "-",
          visitTime: t.visitTime || "-",
          tipeTamu: t.tipeTamu === "vip" ? "vip" : "regular",
          phone: t.phone || "-",
          karyawan: t.karyawan || "-",
          status: t.status || "Menunggu",
        };

        if (guest.status === "Menunggu") {
          waiting.push(guest);
        } else {
          const checkoutDate = t.checkout ? new Date(t.checkout) : new Date();
          const processedAt = `${String(checkoutDate.getHours()).padStart(2, "0")}:${String(checkoutDate.getMinutes()).padStart(2, "0")}`;
          processed.push({ ...guest, processedAt });
        }
      });

      setWaitingGuests(waiting);
      setHistory(processed);
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

  const handleGuest = async (id: string, status: "Diterima" | "Ditolak") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/tamu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal mengupdate status.");

      const guest = waitingGuests.find((g) => g.id === id);
      if (!guest) return;

      const now = new Date();
      const processedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setHistory((prev) => [{ ...guest, status, processedAt }, ...prev]);
      setWaitingGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memproses tamu.");
    } finally {
      setLoadingId(null);
    }
  };

  const totalHari = waitingGuests.length + history.length;
  const diterima = history.filter((h) => h.status === "Diterima").length;
  const menunggu = waitingGuests.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Ringkasan Aktivitas</h2>
        <p className="text-sm text-slate-500">Berikut adalah data kunjungan tamu untuk hari ini.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ {error}{" "}
          <button onClick={fetchTamu} className="underline font-medium ml-1">Coba lagi</button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Tamu</p>
              <p className="text-3xl font-bold text-slate-800">{isFetching ? "..." : totalHari}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-2.5"><Users className="h-5 w-5 text-blue-500" /></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 mb-1">Menunggu</p>
              <p className="text-3xl font-bold text-slate-800">{isFetching ? "..." : menunggu}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-2.5"><Clock className="h-5 w-5 text-orange-500" /></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 mb-1">Diterima</p>
              <p className="text-3xl font-bold text-slate-800">{isFetching ? "..." : diterima}</p>
            </div>
            <div className="rounded-full bg-green-100 p-2.5"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>
          </CardContent>
        </Card>
      </div>

      {notifVisible && waitingGuests.length > 0 && (
        <NotifBanner guest={waitingGuests[0]} onClose={() => setNotifVisible(false)} />
      )}

      {isFetching ? (
        <div className="rounded-xl border bg-white py-16 text-center text-sm text-slate-400 shadow-sm animate-pulse">
          Memuat data tamu...
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-700">Tamu Menunggu</h3>
              <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">
                {waitingGuests.length} menunggu
              </span>
            </div>
            {waitingGuests.length === 0 ? (
              <div className="rounded-xl border bg-white py-10 text-center text-sm text-slate-400 shadow-sm">
                Tidak ada tamu yang menunggu saat ini.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {waitingGuests.map((guest) => (
                  <GuestCard
                    key={guest.id}
                    guest={guest}
                    onAccept={(id) => handleGuest(id, "Diterima")}
                    onReject={(id) => handleGuest(id, "Ditolak")}
                    loading={loadingId}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-700 mb-3">Riwayat Tamu Hari Ini</h3>
            <HistoryTable history={history} />
          </div>
        </>
      )}
    </div>
  );
}