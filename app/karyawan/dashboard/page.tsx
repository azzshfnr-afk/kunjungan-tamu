"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, Bell, X, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

interface HistoryGuest extends Guest {
  status: GuestStatus;
  processedAt: string;
}

// ─── Mock Data 

const MOCK_WAITING: Guest[] = [
  { id: 1, name: "Budi Santoso", purpose: "Presentasi produk kepada tim marketing", room: "Ruang Meeting A", time: "09:45", type: "regular", initials: "BS" },
  { id: 2, name: "Siti Rahayu", purpose: "Pertemuan dengan Direktur", room: "Ruang Direksi", time: "10:00", type: "vip", initials: "SR" },
  { id: 3, name: "Dian Permata", purpose: "Pengambilan dokumen kontrak", room: "Ruang Administrasi", time: "10:15", type: "regular", initials: "DP" },
];

// ─── Notification Banner

function NotifBanner({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-4 py-3 mb-6">
      <Bell className="mt-0.5 h-4 w-4 text-green-700 shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-green-700 mb-0.5">Tamu baru telah check-in!</p>
        <p className="text-green-600">
          <span className="font-semibold">{guest.name}</span> ingin mengunjungi{" "}
          <span className="font-semibold">{guest.room}</span> — {guest.purpose} | Pukul {guest.time}
        </p>
      </div>
      <button onClick={onClose} className="text-blue-400 hover:text-blue-600 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Guest Card

function GuestCard({ guest, onAccept, onReject }: { guest: Guest; onAccept: (id: number) => void; onReject: (id: number) => void }) {
  const isVip = guest.type === "vip";
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${isVip ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
            {guest.initials}
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isVip ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
            {isVip ? "★ VIP" : "Reguler"}
          </span>
        </div>
        <p className="font-semibold text-slate-800 mb-1">{guest.name}</p>
        <p className="text-sm text-slate-500 mb-3 leading-relaxed">{guest.purpose}</p>
        <div className="flex gap-4 text-xs text-slate-400 mb-4">
          <span>📍 <span className="text-slate-600 font-medium">{guest.room}</span></span>
          <span>🕐 <span className="text-slate-600 font-medium">{guest.time}</span></span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onAccept(guest.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 border border-green-200 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
            <Check className="h-3.5 w-3.5" /> Terima
          </button>
          <button onClick={() => onReject(guest.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 border border-red-200 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors">
            <X className="h-3.5 w-3.5" /> Tolak
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── History Table 

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
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{h.purpose}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${h.type === "vip" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {h.type === "vip" ? "★ VIP" : "Reguler"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{h.time}</td>
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

// ─── Main Page 

export default function DashboardPage() {
  const [waitingGuests, setWaitingGuests] = useState<Guest[]>(MOCK_WAITING);
  const [history, setHistory] = useState<HistoryGuest[]>([]);
  const [notifVisible, setNotifVisible] = useState(true);

  useEffect(() => {
    if (waitingGuests.length > 0) setNotifVisible(true);
  }, [waitingGuests]);

  const handleGuest = (id: number, status: GuestStatus) => {
    const guest = waitingGuests.find((g) => g.id === id);
    if (!guest) return;
    const now = new Date();
    const processedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setHistory((prev) => [{ ...guest, status, processedAt }, ...prev]);
    setWaitingGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const totalHari = waitingGuests.length + history.length;
  const diterima = history.filter((h) => h.status === "Diterima").length;
  const menunggu = waitingGuests.length;

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Ringkasan Aktivitas</h2>
        <p className="text-sm text-slate-500">Berikut adalah data kunjungan tamu untuk hari ini.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Tamu</p>
              <p className="text-3xl font-bold text-slate-800">{totalHari}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-2.5">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 mb-1">Menunggu</p>
              <p className="text-3xl font-bold text-slate-800">{menunggu}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-2.5">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 mb-1">Diterima</p>
              <p className="text-3xl font-bold text-slate-800">{diterima}</p>
            </div>
            <div className="rounded-full bg-green-100 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notif Banner */}
      {notifVisible && waitingGuests.length > 0 && (
        <NotifBanner guest={waitingGuests[0]} onClose={() => setNotifVisible(false)} />
      )}

      {/* Waiting Guests */}
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
              />
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h3 className="text-base font-semibold text-slate-700 mb-3">Riwayat Tamu Hari Ini</h3>
        <HistoryTable history={history} />
      </div>
    </div>
  );
}
