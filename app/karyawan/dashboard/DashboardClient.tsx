"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, Bell, X, Check } from "lucide-react";


type GuestType   = "regular" | "vip";
type GuestStatus = "Diterima" | "Ditolak" | "Menunggu";

interface AnggotaRombongan {
  nama: string;
  email: string;
  noTelp: string;
}

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
  anggotaRombongan: AnggotaRombongan[];
}

interface HistoryGuest extends Guest {
  processedAt: string;
}

interface Props {
  namaKaryawan: string | null;
}


function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function isToday(dateString: string | null | undefined) {
  if (!dateString) return false;
  const date  = new Date(dateString);
  const today = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return (
    date.toLocaleDateString("id-ID", opts) ===
    today.toLocaleDateString("id-ID", opts)
  );
}

function isWaiting(t: any) {
  if (t.status === "Diterima" || t.status === "Ditolak") return false;
  return (
    t.status === "Menunggu" ||
    t.status === "Menunggu Kedatangan" ||
    t.statusKunjungan === "MENUNGGU_GATE_1"
  );
}

function isProcessed(t: any) {
  return (
    t.status === "Diterima" ||
    t.status === "Ditolak" ||
    t.statusKunjungan === "DIIZINKAN" ||
    t.statusKunjungan === "DITOLAK"
  );
}

function formatJam(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function mapStatus(t: any): GuestStatus {
  if (t.status === "Diterima" || t.statusKunjungan === "DIIZINKAN") return "Diterima";
  if (t.status === "Ditolak"  || t.statusKunjungan === "DITOLAK")   return "Ditolak";
  return "Menunggu";
}

function normalizeNama(name: string) {
  return name.trim().toLowerCase();
}


function NotifBanner({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-4 py-3 mb-6">
      <Bell className="mt-0.5 h-4 w-4 text-green-700 shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-green-700 mb-0.5">Tamu baru menunggu konfirmasi!</p>
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


function RombonganList({ anggota }: { anggota: AnggotaRombongan[] }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {anggota.map((a, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
            {i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">{a.nama}</p>
            <p className="truncate text-xs text-slate-400">{a.email}</p>
            <p className="text-xs text-slate-400">{a.noTelp}</p>
          </div>
        </div>
      ))}
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
  const [expanded, setExpanded] = useState(false);
  const isVip                   = guest.tipeTamu === "vip";
  const isProcessing            = loading === guest.id;
  const hasRombongan            = guest.anggotaRombongan.length > 0;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${isVip ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
            {getInitials(guest.name)}
          </div>
          <div className="flex items-center gap-1.5">
            {hasRombongan && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                👥 +{guest.anggotaRombongan.length} orang
              </span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isVip ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
              {isVip ? "★ VIP" : "Reguler"}
            </span>
          </div>
        </div>

        <p className="font-semibold text-slate-800 mb-1">{guest.name}</p>
        <p className="text-sm text-slate-500 mb-3 leading-relaxed">{guest.tujuanKunjungan}</p>
        <div className="flex gap-4 text-xs text-slate-400 mb-4">
          <span>📍 <span className="text-slate-600 font-medium">{guest.departemen}</span></span>
          <span>🕐 <span className="text-slate-600 font-medium">{guest.visitTime}</span></span>
        </div>

        {hasRombongan && (
          <div className="mb-3">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span>Anggota Rombongan ({guest.anggotaRombongan.length} orang)</span>
              <span className="text-slate-400 text-[10px]">{expanded ? "▲" : "▼"}</span>
            </button>
            {expanded && (
              <div className="mt-2">
                <RombonganList anggota={guest.anggotaRombongan} />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onAccept(guest.id)}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 border border-green-200 py-2 text-sm font-medium text-green-700 hover:bg-green-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? <span className="h-3.5 w-3.5 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
              : <Check className="h-3.5 w-3.5" />}
            Terima
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


function HistoryTable({ history }: { history: HistoryGuest[] }) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Nama Tamu</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Keperluan</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Tipe</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Jam</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Diproses</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                Belum ada riwayat tamu hari ini.
              </td>
            </tr>
          ) : (
            history.map((h) => {
              const hasRombongan = h.anggotaRombongan && h.anggotaRombongan.length > 0;
              const rowKey       = `${h.id}-${h.processedAt}`;
              const isExpanded   = expandedKey === rowKey;

              return (
                <Fragment key={rowKey}>
                  <tr
                    onClick={() => hasRombongan && setExpandedKey(isExpanded ? null : rowKey)}
                    className={`border-b last:border-0 transition-colors hover:bg-slate-50 ${hasRombongan ? "cursor-pointer" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {h.name}
                        {hasRombongan && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            👥 +{h.anggotaRombongan.length}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{h.tujuanKunjungan}</td>

                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${h.tipeTamu === "vip" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                        {h.tipeTamu === "vip" ? "★ VIP" : "Reguler"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-500">{h.visitTime}</td>

                    <td className="px-4 py-3 text-slate-500">{h.processedAt}</td>

                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${h.status === "Diterima" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {h.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center text-slate-400 text-xs">
                      {hasRombongan && (isExpanded ? "▲" : "▶")}
                    </td>
                  </tr>

                  {hasRombongan && isExpanded && (
                    <tr key={`${rowKey}-expand`} className="border-b border-dashed border-slate-200 bg-slate-50/80">
                      <td colSpan={7} className="px-6 py-3">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            👥 Anggota Rombongan ({h.anggotaRombongan.length} orang)
                          </span>
                        </div>
                        <RombonganList anggota={h.anggotaRombongan} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}


export default function DashboardClient({ namaKaryawan }: Props) {
  const [waitingGuests, setWaitingGuests] = useState<Guest[]>([]);
  const [history, setHistory]             = useState<HistoryGuest[]>([]);
  const [notifVisible, setNotifVisible]   = useState(false);
  const [loadingId, setLoadingId]         = useState<string | null>(null);
  const [isFetching, setIsFetching]       = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const fetchTamu = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/tamu");
      if (!res.ok) throw new Error("Gagal mengambil data tamu.");
      const data: any[] = await res.json();
      console.log("raw status:", data.slice(0, 3).map(t => ({ id: t.id, status: t.status, statusKunjungan: t.statusKunjungan })));

      const waiting:   Guest[]        = [];
      const processed: HistoryGuest[] = [];

      data.forEach((t) => {
        const hariIni = isToday(t.tanggalKunjungan) || isToday(t.visitDate);
        if (!hariIni) return;

        if (namaKaryawan) {
          const namaField = t.karyawan || t.namaKaryawan || t.employee || "";
          if (normalizeNama(namaField) !== normalizeNama(namaKaryawan)) return;
        }

        const guest: Guest = {
          id:               String(t.id),
          name:             t.name             || "-",
          tujuanKunjungan:  t.tujuanKunjungan  || t.instansi || "-",
          departemen:       t.departemen       || "-",
          visitTime:        t.visitTime        || "-",
          tipeTamu:         t.tipeTamu === "vip" ? "vip" : "regular",
          phone:            t.phone            || "-",
          karyawan:         t.karyawan         || "-",
          status:           mapStatus(t),
          anggotaRombongan: t.anggotaRombongan || [],
        };

        if (isWaiting(t)) {
          waiting.push(guest);
        } else if (isProcessed(t)) {
          const waktuProses = t.checkout ? new Date(t.checkout) : new Date();
          processed.push({ ...guest, processedAt: formatJam(waktuProses) });
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
  }, [namaKaryawan]);

  useEffect(() => {
    fetchTamu();
    const interval = setInterval(fetchTamu, 30_000);
    return () => clearInterval(interval);
  }, [fetchTamu]);

  const handleGuest = async (id: string, status: "Diterima" | "Ditolak") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/tamu/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal mengupdate status.");

      const guest = waitingGuests.find((g) => g.id === id);
      if (!guest) return;

      const now = new Date();
      setHistory((prev) => [{ ...guest, status, processedAt: formatJam(now) }, ...prev]);
      setWaitingGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memproses tamu.");
    } finally {
      setLoadingId(null);
    }
  };

  const totalHari = waitingGuests.length + history.length;
  const diterima  = history.filter((h) => h.status === "Diterima").length;
  const menunggu  = waitingGuests.length;

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-xl font-bold text-slate-800">Ringkasan Aktivitas</h2>
        <p className="text-sm text-slate-500">
          {namaKaryawan ? (
            <>Menampilkan tamu untuk: <span className="font-semibold text-slate-700">{namaKaryawan}</span></>
          ) : (
            "Berikut adalah data kunjungan tamu untuk hari ini."
          )}
        </p>
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
              <h3 className="text-base font-semibold text-slate-700">Tamu Menunggu Konfirmasi</h3>
              {menunggu > 0 && (
                <span className="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-600">
                  {menunggu} menunggu
                </span>
              )}
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