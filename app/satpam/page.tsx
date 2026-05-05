"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from "next/dynamic";
import {
    ScanLine, CreditCard, LogOut, SearchIcon,
    Eye, QrCode, LogIn,
} from "lucide-react";
import { FaCrown, } from "react-icons/fa";

const Scanner = dynamic(
    () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-black flex items-center justify-center text-white text-xs">
                Menyiapkan Kamera...
            </div>
        ),
    }
);

function InfoRow({ label, nilai }: { label: string; nilai?: any }) {
    return (
        <div className="flex justify-between text-sm py-1.5 gap-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 shrink-0">{label}</span>
            <span className="font-medium text-right text-gray-800">{nilai || "-"}</span>
        </div>
    );
}

const DAFTAR_GEDUNG = [
    "Gedung Pusat Administrasi (GPA)",
    "Gedung Diklat",
    "Pabrik 1A",
    "Pabrik 1B",
    "Gedung MO",
    "Gedung LC",
];

const DATA_KARYAWAN: Record<string, { bet: string; nama: string; dept: string }[]> = {
    "Gedung Pusat Administrasi (GPA)": [
        { bet: "PKC-101", nama: "Junaedi", dept: "TI" },
        { bet: "PKC-102", nama: "Susi", dept: "Keuangan" },
    ],
    "Gedung Diklat": [
        { bet: "PKC-201", nama: "Yoyo", dept: "Pelum" },
        { bet: "PKC-202", nama: "Mumun", dept: "Sekretaris" },
    ],
    "Pabrik 1A":  [{ bet: "PKC-301", nama: "Velia", dept: "Humas" }],
    "Pabrik 1B":  [{ bet: "PKC-401", nama: "Nazla", dept: "QC" }],
    "Gedung MO":  [{ bet: "PKC-501", nama: "Zihan", dept: "MPSDM" }],
    "Gedung LC":  [{ bet: "PKC-601", nama: "Bibah", dept: "Akuntansi" }],
};

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; label: string }> = {
        "Menunggu":       { bg: "bg-yellow-100 text-yellow-800 ring-yellow-300", label: "Menunggu" },
        "MENUNGGU_GATE_UTAMA": { bg: "bg-yellow-100 text-yellow-800 ring-yellow-300", label: "Menunggu Gate" },
        "Check-in":       { bg: "bg-blue-100 text-blue-800 ring-blue-300",   label: "Check-in" },
        "Check-in Area":  { bg: "bg-green-100 text-green-800 ring-green-300", label: "Di Dalam Area" },
        "Check-out":      { bg: "bg-red-100 text-red-800 ring-red-300",       label: "Check-out" },
    };
    const cfg = map[status] ?? { bg: "bg-gray-100 text-gray-700 ring-gray-300", label: status };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${cfg.bg}`}>
            {cfg.label}
        </span>
    );
}

function fmtDt(val?: string) {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function SatpamDashboard() {
    const [roleSatpam, setRoleSatpam] = useState<"gateUtama" | "area">("gateUtama");
    const [lokasiArea, setLokasiArea]   = useState("Gedung Diklat");
    const [searchQuery, setSearchQuery] = useState("");
    const [stepScan, setStepScan]       = useState(1);
    const [modalAction, setModalAction] = useState<"checkin" | "checkout" | "detail" | "scan_checkout" | null>(null);
    const [tamuTerpilih, setTamuTerpilih] = useState<any>(null);
    const [selectedGedung, setSelectedGedung]     = useState("");
    const [selectedKaryawan, setSelectedKaryawan] = useState("");
    const [uidNfc, setUidNfc] = useState("");
    const [aksesBeri, setAksesBeri]   = useState({ gateUtama: true, gateParkir: true });
    const [aksesLepas, setAksesLepas] = useState({ gateUtama: true, gateParkir: true, gateLobby: true });
    const [dataTamu, setDataTamu]     = useState<any[]>([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [isModalVipOpen, setIsModalVipOpen] = useState(false);
    const [isLoadingVip, setIsLoadingVip]     = useState(false);
    const [formVip, setFormVip] = useState({ namaTamu: "", asalInstansi: "", tujuan: "" });

    const fetchTamu = async () => {
        try {
            const res = await fetch("/api/satpam/tamu");
            const json = await res.json();
            if (json.data) setDataTamu(json.data);
        } catch (e) {
            console.error("Error fetching tamu:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchTamu(); }, []);

    const updateStatusTamu = async (
        id: string, statusBaru: string, akses: string,
        uidCard?: string, lokasi?: string, waktuAktual?: string
    ) => {
        setDataTamu((prev) =>
            prev.map((t) => t.id === id ? { ...t, statusKunjungan: statusBaru, aksesAktif: akses } : t)
        );
        try {
            const res = await fetch("/api/satpam/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id, statusKunjungan: statusBaru, aksesAktif: akses,
                    uidNfc: uidCard, lokasiTap: lokasi,
                    waktuAktual: waktuAktual ?? new Date().toISOString(),
                }),
            });
            const result = await res.json();
            if (!result.ok) alert(`Gagal menyimpan: ${result.message}`);
        } catch (e) {
            console.error("Error updating:", e);
        } finally {
            await fetchTamu();
        }
    };

    const tutupModal = () => {
        setModalAction(null);
        setTamuTerpilih(null);
        setStepScan(1);
        setSelectedGedung("");
        setSelectedKaryawan("");
        setUidNfc("");
        setAksesBeri({ gateUtama: true, gateParkir: true });
        setAksesLepas({ gateUtama: true, gateParkir: true, gateLobby: true });
    };

    const handleDaftarVip = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingVip(true);
        try {
            const res = await fetch("/api/satpam/tamu-vip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formVip),
            });
            const responseData = await res.json();
            if (res.ok && responseData.data) {
                setIsModalVipOpen(false);
                setFormVip({ namaTamu: "", asalInstansi: "", tujuan: "" });
                const dataVip = responseData.data;
                setTamuTerpilih(dataVip);
                setModalAction("checkin");
                setStepScan(2);
            } else {
                alert(responseData.message || "Gagal mendaftar VIP");
            }
        } catch (err) {
            console.error("Error VIP:", err);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setIsLoadingVip(false);
        }
    };

    const filteredTamu = dataTamu
        .filter((t) => t.namaTamu?.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter((t) => t.statusKunjungan !== "Menunggu" && t.statusKunjungan !== "MENUNGGU_GATE_UTAMA");

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
            <div className="mx-auto max-w-[1600px] bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            {roleSatpam === "gateUtama"
                                ? "Dashboard Security — Gate Utama"
                                : `Dashboard Security — Area (${lokasiArea})`}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">Sistem Manajemen Pengunjung · PT Pupuk Kujang</p>
                    </div>

                    {/* Mode switcher */}
                    <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                        <span className="text-xs text-slate-500 font-medium">Mode:</span>
                        <Button
                            size="sm" className="h-7 text-xs"
                            variant={roleSatpam === "gateUtama" ? "default" : "outline"}
                            onClick={() => setRoleSatpam("gateUtama")}
                        >
                            Gate Utama
                        </Button>
                        <Button
                            size="sm" className="h-7 text-xs"
                            variant={roleSatpam === "area" ? "default" : "outline"}
                            onClick={() => setRoleSatpam("area")}
                        >
                            Area / Gedung
                        </Button>
                        {roleSatpam === "area" && (
                            <select
                                className="h-7 text-xs rounded-md border border-slate-300 bg-white px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={lokasiArea}
                                onChange={(e) => setLokasiArea(e.target.value)}
                            >
                                {DAFTAR_GEDUNG.map((g) => <option key={g}>{g}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <div className="relative w-full sm:w-72">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari nama tamu…"
                            className="pl-9 h-9 text-sm border-slate-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {roleSatpam === "gateUtama" && (
                            <Button
                                className="h-9 bg-amber-500 hover:bg-amber-600 text-white text-sm"
                                onClick={() => setIsModalVipOpen(true)}
                            >
                                <FaCrown className="mr-2 h-4 w-4" /> Registrasi VIP
                            </Button>
                        )}
                        <Button
                            className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            onClick={() => { setStepScan(1); setModalAction("checkin"); }}
                        >
                            <ScanLine className="mr-2 h-4 w-4" /> Scan Check-in
                        </Button>
                        <Button
                            variant="destructive" className="h-9 text-sm"
                            onClick={() => { setStepScan(1); setModalAction("scan_checkout"); }}
                        >
                            <QrCode className="mr-2 h-4 w-4" /> Scan Check-out
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                {[
                                    "No", "ID Tamu", "ID NFC", "Nama Tamu", "Instansi",
                                    "Email", "Rencana Kunjungan", "Tujuan Karyawan & Dept",
                                    "Waktu Check-in", "Waktu Check-out", "Status", "Aksi", "Detail",
                                ].map((h) => (
                                    <TableHead key={h} className="text-xs font-semibold text-slate-700 whitespace-nowrap px-3 py-3">
                                        {h}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="text-center py-12 text-slate-400 animate-pulse">
                                        Memuat data…
                                    </TableCell>
                                </TableRow>
                            ) : filteredTamu.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="text-center py-10 text-slate-400">
                                        Tidak ada data tamu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTamu.map((tamu, idx) => {
                                    const st = tamu.statusKunjungan || "Menunggu";
                                    return (
                                        <TableRow key={tamu.id} className="hover:bg-slate-50 text-sm">
                                            {/* No */}
                                            <TableCell className="px-3 py-2.5 text-slate-500 text-xs">{idx + 1}</TableCell>

                                            <TableCell className="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">
                                                {tamu.id || "-"}
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                                                {tamu.uidNfc || "-"}
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                                                {tamu.namaTamu}
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                                                {tamu.asalInstansi || "-"}
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5 text-slate-600 text-xs whitespace-nowrap">
                                                {tamu.email || "-"}
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5 text-slate-600 max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis">
                                                {tamu.tujuanKunjungan || "-"}
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                                                {tamu.karyawanTujuan
                                                    ? `${tamu.karyawanTujuan}${tamu.gedungTujuan ? ` · ${tamu.gedungTujuan}` : ""}`
                                                    : tamu.gedungTujuan || "-"}
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                                                {fmtDt(tamu.waktuCheckIn || tamu.tanggalCheckIn)}
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                                                {fmtDt(tamu.waktuCheckOut)}
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5">
                                                <StatusBadge status={st} />
                                            </TableCell>

                                            <TableCell className="px-3 py-2.5">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {roleSatpam === "gateUtama" && (
                                                        <>
                                                            {st === "Menunggu" && (
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                                                                    onClick={() => { setTamuTerpilih(tamu); setStepScan(2); setModalAction("checkin"); }}
                                                                >
                                                                    <LogIn className="mr-1 h-3 w-3" /> Check-in
                                                                </Button>
                                                            )}
                                                            {(st === "Check-in" || st === "Check-in Area") && (
                                                                <Button
                                                                    size="sm" variant="destructive"
                                                                    className="h-7 text-xs whitespace-nowrap"
                                                                    onClick={() => { setTamuTerpilih(tamu); setStepScan(2); setModalAction("checkout"); }}
                                                                >
                                                                    <LogOut className="mr-1 h-3 w-3" /> Check-out
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                    {roleSatpam === "area" && (
                                                        <>
                                                            {st === "Check-in" && (
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 text-xs bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                                                    onClick={() => { setTamuTerpilih(tamu); setStepScan(2); setModalAction("checkin"); }}
                                                                >
                                                                    <LogIn className="mr-1 h-3 w-3" /> Masuk Area
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm" variant="destructive"
                                                                className="h-7 text-xs whitespace-nowrap"
                                                                disabled={st !== "Check-in Area"}
                                                                onClick={() => { setTamuTerpilih(tamu); setModalAction("checkout"); }}
                                                            >
                                                                <LogOut className="mr-1 h-3 w-3" /> Keluar Area
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Detail */}
                                            <TableCell className="px-3 py-2.5 text-center">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-7 w-7 text-slate-500 hover:bg-slate-100 rounded-md"
                                                    onClick={() => { setTamuTerpilih(tamu); setModalAction("detail"); }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={modalAction === "checkin"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b">
                        <DialogTitle className="text-lg font-semibold">
                            {roleSatpam === "gateUtama" ? "Check-in Gate Utama" : `Check-in Area (${lokasiArea})`}
                        </DialogTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {stepScan === 1 ? "Step 1 — Scan QR Tamu"
                                : stepScan === 2 ? "Step 2 — Konfirmasi Data"
                                : "Step 3 — Tap Kartu NFC & Beri Akses"}
                        </p>
                    </div>

                    <div className="p-6">
                        {stepScan === 1 && (
                            <div className="space-y-4 text-center">
                                <div className="aspect-square bg-black rounded-xl overflow-hidden">
                                    <Scanner onScan={(result) => {
                                        if (result?.length) {
                                            const qrValue = result[0].rawValue;
                                            const found = dataTamu.find((t) => t.id.toString() === qrValue);
                                            if (found) { setTamuTerpilih(found); setStepScan(2); }
                                            else alert(`Data tamu tidak ditemukan! (QR: ${qrValue})`);
                                        }
                                    }} />
                                </div>
                                <Button variant="outline" size="sm" className="text-[10px]"
                                    onClick={() => { if (dataTamu.length) setTamuTerpilih(dataTamu[0]); setStepScan(2); }}>
                                    (Dev) Lewati Scan
                                </Button>
                            </div>
                        )}

                        {stepScan === 2 && roleSatpam === "gateUtama" && (
                            <div className="space-y-5">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-1">
                                    <InfoRow label="Nama Lengkap"   nilai={tamuTerpilih?.namaTamu} />
                                    <InfoRow label="NIK"            nilai={tamuTerpilih?.nik || tamuTerpilih?.noKtp} />
                                    <InfoRow label="No. Handphone"  nilai={tamuTerpilih?.noTelp} />
                                    <InfoRow label="Instansi"       nilai={tamuTerpilih?.asalInstansi} />
                                    <InfoRow label="Tujuan Awal"    nilai={tamuTerpilih?.tujuanKunjungan} />
                                </div>
                                <div className="space-y-3 border-t pt-4">
                                    <div className="space-y-1.5">
                                        <Label>Gedung Tujuan Aktual</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={selectedGedung}
                                            onChange={(e) => { setSelectedGedung(e.target.value); setSelectedKaryawan(""); }}
                                        >
                                            <option value="">-- Pilih Gedung --</option>
                                            {DAFTAR_GEDUNG.map((g) => <option key={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    {selectedGedung && (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                            <Label>Karyawan Dituju</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={selectedKaryawan}
                                                onChange={(e) => setSelectedKaryawan(e.target.value)}
                                            >
                                                <option value="">-- Pilih Karyawan --</option>
                                                {DATA_KARYAWAN[selectedGedung]?.map((k) => (
                                                    <option key={k.bet} value={k.bet}>
                                                        {k.nama} ({k.dept}) · {k.bet}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStepScan(1)}>Sebelumnya</Button>
                                    <Button
                                        className="w-2/3 bg-blue-600 hover:bg-blue-700"
                                        disabled={!selectedGedung || !selectedKaryawan}
                                        onClick={() => setStepScan(3)}
                                    >
                                        Lanjut ke NFC
                                    </Button>
                                </div>
                            </div>
                        )}

                        {stepScan === 2 && roleSatpam === "area" && (
                            <div className="space-y-5">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-1">
                                    <InfoRow label="Nama Lengkap" nilai={tamuTerpilih?.namaTamu} />
                                    <InfoRow label="Status Saat Ini" nilai={tamuTerpilih?.statusKunjungan} />
                                </div>
                                <p className="text-sm text-slate-600">Pastikan tamu memiliki keperluan untuk memasuki area dalam gedung.</p>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStepScan(1)}>Sebelumnya</Button>
                                    <Button className="w-2/3 bg-green-600 hover:bg-green-700" onClick={() => setStepScan(3)}>Berikan Akses Lobby</Button>
                                </div>
                            </div>
                        )}

                        {stepScan === 3 && (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label className="flex items-center font-semibold">
                                        <CreditCard className="mr-2 h-4 w-4" /> Tap Kartu NFC
                                    </Label>
                                    <Input
                                        placeholder="Tap kartu di alat pembaca…"
                                        autoFocus
                                        value={uidNfc}
                                        onChange={(e) => setUidNfc(e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-400">*Pastikan kursor berada di kotak ini saat menempelkan kartu.</p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <Label className="font-semibold text-blue-900 mb-3 block">Opsi Akses Diberikan</Label>
                                    {roleSatpam === "gateUtama" ? (
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-2">
                                                <Checkbox id="beri-utama" checked={aksesBeri.gateUtama}
                                                    onCheckedChange={(c) => setAksesBeri({ ...aksesBeri, gateUtama: !!c })} />
                                                <Label htmlFor="beri-utama" className="cursor-pointer text-sm">Masuk Gate Utama</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox id="beri-parkir" checked={aksesBeri.gateParkir}
                                                    onCheckedChange={(c) => setAksesBeri({ ...aksesBeri, gateParkir: !!c })} />
                                                <Label htmlFor="beri-parkir" className="cursor-pointer text-sm">Masuk Gate Parkir {selectedGedung}</Label>
                                            </div>
                                        </div>
                                    ) : (
                                        <ul className="list-disc ml-5 text-sm text-blue-800">
                                            <li>Akses Gate Lobby {lokasiArea}</li>
                                        </ul>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStepScan(2)}>Sebelumnya</Button>
                                    <Button
                                        className="w-2/3 bg-blue-600 hover:bg-blue-700"
                                        onClick={() => {
                                            if (!tamuTerpilih) return;
                                            if (roleSatpam === "gateUtama") {
                                                if (!uidNfc) { alert("Harap tap kartu NFC terlebih dahulu!"); return; }
                                                const aksesArr: string[] = [];
                                                if (aksesBeri.gateUtama) aksesArr.push("GATE_UTAMA");
                                                if (aksesBeri.gateParkir) aksesArr.push(`PARKIR_${selectedGedung}`);
                                                updateStatusTamu(tamuTerpilih.id, "Check-in", aksesArr.join(","), uidNfc, "Gate Utama Masuk", new Date().toISOString());
                                            } else {
                                                updateStatusTamu(tamuTerpilih.id, "Check-in Area",
                                                    tamuTerpilih.aksesAktif + `,LOBBY_${lokasiArea}`,
                                                    uidNfc || undefined, `Lobby ${lokasiArea} Masuk`, new Date().toISOString());
                                            }
                                            tutupModal();
                                        }}
                                    >
                                        Selesai & Simpan
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={modalAction === "scan_checkout"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Scan Check-out — {roleSatpam === "gateUtama" ? "Gate Utama" : "Area"}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-square bg-black rounded-xl overflow-hidden">
                        <Scanner onScan={(result) => {
                            if (result?.length) {
                                const qrValue = result[0].rawValue;
                                const found = dataTamu.find((t) => t.id.toString() === qrValue);
                                if (found) { setTamuTerpilih(found); setStepScan(2); setModalAction("checkout"); }
                                else alert(`Data tamu tidak ditemukan! (QR: ${qrValue})`);
                            }
                        }} />
                    </div>
                    <Button variant="outline" size="sm" className="text-[10px] w-full mt-2"
                        onClick={() => { if (dataTamu.length) setTamuTerpilih(dataTamu[0]); setStepScan(2); setModalAction("checkout"); }}>
                        (Dev) Lewati Kamera
                    </Button>
                </DialogContent>
            </Dialog>

            <Dialog open={modalAction === "checkout"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Proses Check-out: {tamuTerpilih?.namaTamu}</DialogTitle>
                    </DialogHeader>

                    {roleSatpam === "gateUtama" && (
                        <div className="space-y-4">
                            {stepScan === 2 && (
                                <>
                                    <p className="text-sm text-slate-600">Pilih akses yang ingin dilepas dari kartu tamu:</p>
                                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        {[
                                            { id: "chk-utama",  label: "Gate Utama",       key: "gateUtama"  as const },
                                            { id: "chk-parkir", label: "Gate Parkir Gedung", key: "gateParkir" as const },
                                            { id: "chk-lobby",  label: "Gate Lobby (Area)",  key: "gateLobby"  as const },
                                        ].map(({ id, label, key }) => (
                                            <div key={id} className="flex items-center gap-2">
                                                <Checkbox id={id} checked={aksesLepas[key]}
                                                    onCheckedChange={(c) => setAksesLepas({ ...aksesLepas, [key]: !!c })} />
                                                <Label htmlFor={id} className="cursor-pointer">{label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="secondary" className="w-full text-xs"
                                        onClick={() => setAksesLepas({ gateUtama: true, gateParkir: true, gateLobby: true })}>
                                        Pilih Semua (Lepas Keseluruhan)
                                    </Button>
                                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => setStepScan(3)}>
                                        Lanjut Tap NFC
                                    </Button>
                                </>
                            )}
                            {stepScan === 3 && (
                                <div className="space-y-4">
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <Label className="text-red-800 font-semibold mb-2 block">Tap NFC untuk Melepas Akses</Label>
                                        <Input
                                            className="border-red-300 focus-visible:ring-red-500"
                                            placeholder="Tap kartu NFC di sini…"
                                            autoFocus value={uidNfc}
                                            onChange={(e) => setUidNfc(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setStepScan(2)}>Kembali</Button>
                                        <Button variant="destructive" className="flex-1" onClick={() => {
                                            updateStatusTamu(tamuTerpilih.id, "Check-out", "NONAKTIF", uidNfc, "Gate Utama Keluar", new Date().toISOString());
                                            tutupModal();
                                        }}>
                                            Selesaikan Check-out
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {roleSatpam === "area" && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Cabut izin akses Gate Lobby untuk tamu ini. Tamu tetap bisa menggunakan akses lain untuk keluar kawasan.
                            </p>
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <Label className="text-orange-800 font-semibold mb-2 block">Tap NFC untuk Cabut Akses Lobby</Label>
                                <Input
                                    className="border-orange-300 focus-visible:ring-orange-500"
                                    placeholder="Tap kartu NFC di sini…"
                                    autoFocus value={uidNfc}
                                    onChange={(e) => setUidNfc(e.target.value)}
                                />
                            </div>
                            <DialogFooter className="flex gap-2">
                                <Button variant="outline" onClick={tutupModal}>Batal</Button>
                                <Button variant="destructive" onClick={() => {
                                    updateStatusTamu(
                                        tamuTerpilih.id, "Check-in",
                                        tamuTerpilih.aksesAktif.replace(`,LOBBY_${lokasiArea}`, ""),
                                        uidNfc, `Lobby ${lokasiArea} Keluar`, new Date().toISOString()
                                    );
                                    tutupModal();
                                }}>
                                    Cabut Akses & Selesai
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={modalAction === "detail"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detail Tamu: {tamuTerpilih?.namaTamu}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                        {tamuTerpilih?.fotoKtp ? (
                            <img src={tamuTerpilih.fotoKtp} alt="Foto KTP"
                                className="w-full h-auto max-h-48 object-contain rounded-lg border border-slate-300 shadow-sm bg-slate-50" />
                        ) : (
                            <div className="w-full h-28 bg-slate-100 rounded-lg flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-300">
                                Tidak ada foto KTP
                            </div>
                        )}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                            <InfoRow label="Nama Lengkap"     nilai={tamuTerpilih?.namaTamu} />
                            <InfoRow label="NIK"              nilai={tamuTerpilih?.nik || tamuTerpilih?.noKtp} />
                            <InfoRow label="No. Handphone"    nilai={tamuTerpilih?.noTelp} />
                            <InfoRow label="Email"            nilai={tamuTerpilih?.email} />
                            <InfoRow label="Instansi"         nilai={tamuTerpilih?.asalInstansi} />
                            <InfoRow label="Tujuan Kunjungan" nilai={tamuTerpilih?.tujuanKunjungan} />
                            <InfoRow label="Gedung Aktual"    nilai={tamuTerpilih?.gedungTujuan} />
                            <InfoRow label="Karyawan Dituju"  nilai={tamuTerpilih?.karyawanTujuan} />
                            <div className="border-t border-slate-200 my-1" />
                            <InfoRow label="ID NFC"           nilai={tamuTerpilih?.uidNfc} />
                            <InfoRow label="Status"           nilai={tamuTerpilih?.statusKunjungan || "Menunggu Gate Utama"} />
                            <InfoRow label="Akses Aktif"      nilai={tamuTerpilih?.aksesAktif || "Belum Ada"} />
                            <InfoRow label="Waktu Check-in"   nilai={fmtDt(tamuTerpilih?.waktuCheckIn || tamuTerpilih?.tanggalCheckIn)} />
                            <InfoRow label="Waktu Check-out"  nilai={fmtDt(tamuTerpilih?.waktuCheckOut)} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isModalVipOpen} onOpenChange={(open) => { if (!open) { setIsModalVipOpen(false); setFormVip({ namaTamu: "", asalInstansi: "", tujuan: "" }); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            ✨ Jalur Cepat VIP
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleDaftarVip} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label>Nama Lengkap</Label>
                            <Input
                                required
                                placeholder="Contoh: Bapak Menteri X"
                                value={formVip.namaTamu}
                                onChange={(e) => setFormVip({ ...formVip, namaTamu: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Instansi / Asal</Label>
                            <Input
                                required
                                placeholder="Contoh: Kementerian Y"
                                value={formVip.asalInstansi}
                                onChange={(e) => setFormVip({ ...formVip, asalInstansi: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Tujuan Kunjungan</Label>
                            <Input
                                required
                                placeholder="Contoh: Ruang Direktur Utama"
                                value={formVip.tujuan}
                                onChange={(e) => setFormVip({ ...formVip, tujuan: e.target.value })}
                            />
                        </div>
                        <DialogFooter className="pt-2 flex gap-2">
                            <Button
                                type="button" variant="outline"
                                disabled={isLoadingVip}
                                onClick={() => { setIsModalVipOpen(false); setFormVip({ namaTamu: "", asalInstansi: "", tujuan: "" }); }}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                disabled={isLoadingVip}
                            >
                                {isLoadingVip ? "Memproses…" : "Simpan & Scan NFC"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}