"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
    SearchIcon, ScanLine, QrCode, LogIn, LogOut, Eye, Star, CreditCard
} from "lucide-react";
import { FaCrown, } from "react-icons/fa";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; 
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { UsersRound, ChevronDown, ChevronRight } from "lucide-react";

const DAFTAR_GEDUNG: string[] = [
    "Gedung Pusat Administrasi (GPA)",
    "Gedung Diklat",
    "Pabrik 1A",
    "Pabrik 1B",
    "Gedung MO",
    "Gedung LC",
];

interface Karyawan {
    id: string; 
    nama: string;
    dept: string;
    gedung: string;
}

const DATA_KARYAWAN: Record<string, { bet: string; nama: string; dept: string }[]> = {
    "Gedung Pusat Administrasi (GPA)": [
        { bet: "PKC-101", nama: "Junaedi", dept: "TI" },
        { bet: "PKC-102", nama: "Susi", dept: "Keuangan" },
    ],
    "Gedung Diklat": [
        { bet: "PKC-201", nama: "Yoyo", dept: "Agrosolution" },
        { bet: "PKC-202", nama: "Mumun", dept: "Sekretaris" },
    ],
};

const SEMUA_KARYAWAN: Karyawan[] = Object.entries(DATA_KARYAWAN).flatMap(([gedung, list]) => 
    list.map((karyawan) => ({ 
        id: karyawan.bet, 
        nama: karyawan.nama, 
        dept: karyawan.dept, 
        gedung 
    }))
);

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

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; label: string }> = {
        "Menunggu":       { bg: "bg-yellow-100 text-yellow-800 ring-yellow-300", label: "Menunggu" },
        "Menunggu Gate Utama": { bg: "bg-yellow-100 text-yellow-800 ring-yellow-300", label: "Menunggu Gate" },
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
    const [modalAction, setModalAction] = useState<"checkin" | "checkout" | "detail" | "scan_checkout" | "checkout_confirm" | null>(null);
    const [tamuTerpilih, setTamuTerpilih] = useState<any>(null);
    const [selectedGedung, setSelectedGedung] = useState<string>(""); 
    const [aksesTambahan, setAksesTambahan] = useState<string[]>([]);
    const [selectedKaryawan, setSelectedKaryawan] = useState("");
    const [uidNfc, setUidNfc] = useState("");
    const [aksesLepas, setAksesLepas] = useState({ gateUtama: true, gateParkir: true, gateLobby: true });
    const [dataTamu, setDataTamu]     = useState<any[]>([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [stepVip, setStepVip] = useState(1);
    const [namaVip, setNamaVip] = useState("");
    const [instansiVip, setInstansiVip] = useState("");
    const [tujuanVip, setTujuanVip] = useState("");
    const [noTelpVip, setNoTelpVip] = useState("");
    const [jumlahAnggotaVip, setJumlahAnggotaVip] = useState<number>(0);
    const [isModalVipOpen, setIsModalVipOpen] = useState(false);
    const [isLoadingVip, setIsLoadingVip]     = useState(false);
    const [formVip, setFormVip] = useState({ namaTamu: "", asalInstansi: "", tujuan: "" });
    const [openCombobox, setOpenCombobox] = useState(false);
    const [selectedDepartemen, setSelectedDepartemen] = useState<string>("");
    const [selectedKaryawanId, setSelectedKaryawanId] = useState<string | null>(null);
    const [gedungAutoFill, setGedungAutoFill] = useState<string>("");
    const [aksesBeri, setAksesBeri] = useState({
        gateUtama: false,
        gateParkir: false,
        gpa: false,
        diklat: false,
        pabrik1a: false,
        pabrik1b: false,
        mo: false,
        lc: false
    });

    const formatTanggalJam = (dateString: Date | string | null | undefined) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).replace(/\./g, ':'); 
    };

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
        id: any, 
        status: string, 
        uidCard: string | undefined, 
        log: string, 
        waktu: string, 
        dataTambahan?: any
    ) => {
        setDataTamu((prev) => 
            prev.map((t) => t.id === id ? { ...t, statusKunjungan: status, ...dataTambahan } : t)
        );
        try {
            const res = await fetch("/api/satpam/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id, 
                    statusKunjungan: status, 
                    uidNfc: uidCard, 
                    lokasiTap: log, 
                    waktuAktual: waktu, 
                    ...dataTambahan
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Gagal update");
            }
            await fetchTamu(); 
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            tutupModal();
        }
    };

    const tutupModal = () => {
        setModalAction(null);
        setTamuTerpilih(null);
        setStepScan(1);
        setSelectedGedung("");
        setSelectedKaryawan("");
        setUidNfc("");
        setAksesBeri({ gateUtama: true, gateParkir: true, gpa: false, diklat: false, pabrik1a: false, pabrik1b: false, mo: false, lc: false });
        setAksesLepas({ gateUtama: true, gateParkir: true, gateLobby: true });
    };

    const formatIdTamu = (id: any, isVip?: boolean) => {
        if (!id) return "-";
        const nomorFormat = String(id).padStart(4, "0");
        return isVip ? `VIP-${nomorFormat}` : `PKC-${nomorFormat}`;
    };

    const handleDaftarVip = async () => {
        if (!uidNfc) {
            alert("Harap tap kartu NFC VIP terlebih dahulu!");
            return;
        }
        try {
            setIsLoadingVip(true);
            const aksesArr = [];
            if (aksesBeri.gateUtama) aksesArr.push("Gate Utama");
            if (aksesBeri.gateParkir) aksesArr.push("Gate Parkir");
            if (aksesBeri.gpa) aksesArr.push("GPA");
            if (aksesBeri.diklat) aksesArr.push("Gedung Diklat");
            if (aksesBeri.pabrik1a) aksesArr.push("Pabrik 1A");
            if (aksesBeri.pabrik1b) aksesArr.push("Pabrik 1B");
            if (aksesBeri.mo) aksesArr.push("Gedung MO");
            if (aksesBeri.lc) aksesArr.push("Gedung LC");
            const finalAkses = aksesArr.join(", ") || "Gate Utama";
            const res = await fetch("/api/satpam/tamu-vip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    namaTamu: namaVip,
                    asalInstansi: instansiVip,
                    tujuanKunjungan: tujuanVip, 
                    noTelp: noTelpVip,          
                    gedungTujuan: "VIP",
                    statusKunjungan: "Check-in Area",
                    aksesAktif: finalAkses, 
                    nfcId: uidNfc,     
                    jumlahAnggota: jumlahAnggotaVip     
                }),
            });

            const dataRes = await res.json();
            if (res.ok && dataRes.data) {
                setIsModalVipOpen(false);
                setNamaVip("");
                setInstansiVip("");
                setTujuanVip("");
                setNoTelpVip(""); 
                setUidNfc("");
                setStepVip(1);
                setJumlahAnggotaVip(0);
                setAksesBeri({
                    gateUtama: false, gateParkir: false, gpa: false, diklat: false,
                    pabrik1a: false, pabrik1b: false, mo: false, lc: false
                });
                window.location.reload();
            } else {
                alert("Gagal simpan VIP: " + (dataRes.message || "Cek terminal"));
            }
        } catch (err) {
            console.error("Error VIP:", err);
            alert("Error jaringan!");
        } finally {
            setIsLoadingVip(false);
        }
    };

    const filteredTamu = Array.isArray(dataTamu)
    ? dataTamu.filter((tamu) => {
        if (!tamu) return false;
        const matchesSearch = tamu.namaTamu?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true;
        const st = tamu.statusKunjungan || "";
        let isCheckOutHariIni = false;
        if (st === "Check-out" && tamu.waktuCheckOut) {
            const tglCheckOut = new Date(tamu.waktuCheckOut).toDateString();
            const tglHariIni = new Date().toDateString();
            isCheckOutHariIni = tglCheckOut === tglHariIni;
        }
        const matchesStatus = [
            "Menunggu", 
            "Check-in", 
            "Check-in Area", 
            "Masuk Area", 
            "Check-out"
        ].includes(st);
        if (st === "Check-out" && !isCheckOutHariIni) {
            return false;
        }
        if (roleSatpam === "area") {
            const isTujuanUtama = tamu.gedungTujuan === lokasiArea;
            const isVip = tamu.gedungTujuan === "VIP" || tamu.isVip;
            const aksesStr = String(tamu.aksesAktif || "").toLowerCase();
            const areaCari = lokasiArea.toLowerCase().trim();
            let isAksesTambahan = false;
            if (aksesStr) {
                const listAkses = aksesStr.split(",").map(s => s.trim());
                isAksesTambahan = listAkses.some(akses => 
                    areaCari.includes(akses) || akses.includes(areaCari)
                );
            }
            return matchesSearch && matchesStatus && (isTujuanUtama || isVip || isAksesTambahan);
        }
        return matchesSearch && matchesStatus;
    })
    : [];

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
                    <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                        <span className="text-xs text-slate-500 font-medium">Satpam:</span>
                        <Button size="sm" className="h-7 text-xs" variant={roleSatpam === "gateUtama" ? "default" : "outline"} onClick={() => setRoleSatpam("gateUtama")}> Gate Utama </Button>
                        <Button size="sm" className="h-7 text-xs" variant={roleSatpam === "area" ? "default" : "outline"} onClick={() => setRoleSatpam("area")}> Area / Gedung </Button>
                        {roleSatpam === "area" && (
                            <select className="h-7 text-xs rounded-md border border-slate-300 bg-white px-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={lokasiArea} onChange={(e) => setLokasiArea(e.target.value)} > 
                                {DAFTAR_GEDUNG.map((g) => <option key={g}>{g}</option>)} 
                            </select>
                        )}
                    </div>
                </div>
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <div className="relative w-full sm:w-72">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Cari nama tamu…" className="pl-9 h-9 text-sm border-slate-300" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {roleSatpam === "gateUtama" && (
                            <Button 
                                className="h-9 bg-amber-500 hover:bg-amber-600 text-white text-sm" 
                                onClick={() => {
                                    setNamaVip("");
                                    setInstansiVip("");
                                    setTujuanVip("");
                                    setUidNfc("");
                                    setAksesBeri({ 
                                        gateUtama: false,
                                        gateParkir: false, 
                                        gpa: false, 
                                        diklat: false, 
                                        pabrik1a: false, 
                                        pabrik1b: false, 
                                        mo: false, 
                                        lc: false 
                                    });
                                    setStepVip(1);
                                    setIsModalVipOpen(true); 
                                }}
                            >
                                <FaCrown className="mr-2 h-4 w-4" /> Registrasi VIP 
                            </Button>
                        )}
                        <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => { setStepScan(1); setModalAction("checkin"); }}>
                            <ScanLine className="mr-2 h-4 w-4" /> Scan Check-in 
                        </Button>
                        <Button variant="destructive" className="h-9 text-sm" onClick={() => { setStepScan(1); setModalAction("scan_checkout"); }}>
                            <QrCode className="mr-2 h-4 w-4" /> Scan Check-out 
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                {["No", "ID Tamu", "Nama Tamu", "Instansi", "Email", "Rencana Kunjungan", "Tujuan Karyawan", "Check-in", "Check-out", "Status", "Aksi", "Detail"].map((h) => (
                                    <TableHead key={h} className="text-xs font-semibold text-slate-700 whitespace-nowrap px-3 py-3"> {h} </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={13} className="text-center py-12 text-slate-400 animate-pulse"> Memuat data… </TableCell></TableRow>
                            ) : filteredTamu.length === 0 ? (
                                <TableRow><TableCell colSpan={13} className="text-center py-10 text-slate-400"> Tidak ada data tamu </TableCell></TableRow>
                            ) : (
                                filteredTamu.map((tamu, idx) => (
                                    <OverviewRow 
                                        key={tamu.id || idx} 
                                        item={tamu} 
                                        index={idx} 
                                        roleSatpam={roleSatpam}
                                        setTamuTerpilih={setTamuTerpilih}
                                        setStepScan={setStepScan}
                                        setModalAction={setModalAction}
                                        formatIdTamu={formatIdTamu}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={modalAction === "checkin"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-slate-50 px-6 py-4 border-b shrink-0">
                        <DialogTitle className="text-lg font-semibold">
                            {roleSatpam === "gateUtama" ? "Check-in Gate Utama" : `Check-in Area (${lokasiArea})`}
                        </DialogTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {stepScan === 1 ? "Step 1 — Scan QR Tamu"
                                : stepScan === 2 ? "Step 2 — Konfirmasi Data"
                                : "Step 3 — Tap Kartu NFC & Beri Akses"}
                        </p>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        {stepScan === 1 && (
                            <div className="space-y-4 text-center">
                                <div className="aspect-square bg-black rounded-xl overflow-hidden border shadow-inner max-w-[280px] mx-auto">
                                    <Scanner onScan={async (result) => {
                                        if (!result) return;
                                        let rawQr = "";
                                        if (typeof result === "string") {
                                            rawQr = result;
                                        } else if (Array.isArray(result) && result.length > 0) {
                                            const resObj = result[0] as any;
                                            rawQr = resObj?.rawValue || resObj?.text || String(result[0]);
                                        } else if (result && typeof result === "object") {
                                            rawQr = (result as any).rawValue || (result as any).text || "";
                                        }
                                        rawQr = rawQr.trim();
                                        if (!rawQr) return;
                                        const scanMurni = rawQr
                                            .replace("PKC-", "")
                                            .replace("VIP-", "")
                                            .replace(/^0+/, "")
                                            .trim();

                                        try {
                                            const res = await fetch("/api/satpam/tamu");
                                            const json = await res.json();
                                            const dataTamuTerbaru = json.data || dataTamu;
                                            if (json.data) setDataTamu(json.data);
                                            const found = dataTamuTerbaru.find((t: any) => {
                                                if (!t) return false;
                                                const dbIdMurni = String(t.id || "").trim().replace(/^0+/, "");
                                                const dbNfcId = String(t.nfcId || "").trim();
                                                return dbIdMurni === scanMurni || String(t.id) === rawQr || dbNfcId === rawQr;
                                            });
                                            if (found) {
                                                setTamuTerpilih(found);
                                                setSelectedGedung(found.gedungTujuan || "");
                                                setTimeout(() => {
                                                    setSelectedKaryawan(found.karyawanDituju || "");
                                                }, 100);
                                                setStepScan(2);
                                            } else {
                                                alert(`Data tidak ditemukan! ${rawQr} (Parsed: ${scanMurni})`);
                                            }
                                        } catch (err) {
                                            console.error("Gagal auto-refresh data tamu:", err);
                                            const found = dataTamu.find((t: any) => {
                                                if (!t) return false;
                                                const dbIdMurni = String(t.id || "").trim().replace(/^0+/, "");
                                                return dbIdMurni === scanMurni || String(t.id) === rawQr;
                                            });
                                            if (found) {
                                                setTamuTerpilih(found);
                                                setSelectedGedung(found.gedungTujuan || "");
                                                setTimeout(() => {
                                                    setSelectedKaryawan(found.karyawanDituju || "");
                                                }, 100);
                                                setStepScan(2);
                                            } else {
                                                alert(`Data tidak ditemukan! ${rawQr} (Parsed: ${scanMurni})`);
                                            }
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
                            <div className="space-y-5 pb-6">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-1">
                                    <InfoRow label="ID Tamu" nilai={formatIdTamu(tamuTerpilih?.id, tamuTerpilih?.gedungTujuan === "VIP")} />
                                    <InfoRow label="Nama Lengkap" nilai={tamuTerpilih?.namaTamu || "-"} />
                                    <InfoRow label="Instansi/Asal" nilai={tamuTerpilih?.asalInstansi || "-"} />
                                    <InfoRow label="Email" nilai={tamuTerpilih?.email || "-"} />
                                    <InfoRow label="NIK" nilai={tamuTerpilih?.nik || tamuTerpilih?.noKtp || "-"} />
                                    <InfoRow label="No. Handphone" nilai={tamuTerpilih?.noTelp || "-"} />
                                    <InfoRow label="Tujuan" nilai={tamuTerpilih?.tujuanKunjungan || "-"} />
                                    <InfoRow label="Karyawan Dituju" nilai={tamuTerpilih?.karyawanDituju || "-"} />
                                    <InfoRow label="Dept. Tujuan" nilai={tamuTerpilih?.departemen || "-"} />
                                    <div className="border-t border-blue-200 my-2 pt-2"></div>
                                    <InfoRow 
                                        label="Waktu Kunjungan" 
                                        nilai={`${formatTanggalJam(tamuTerpilih?.waktuCheckIn)} s/d ${formatTanggalJam(tamuTerpilih?.waktuCheckOut)}`} 
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5 mt-2">
                                        <Label>Cari Karyawan Dituju</Label>
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between font-normal text-left">
                                                    {selectedKaryawan 
                                                        ? `${selectedKaryawan} - ${selectedDepartemen}` 
                                                        : "Ketik nama karyawan..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Cari nama atau departemen..." />
                                                    <CommandList>
                                                        <CommandEmpty>Karyawan tidak ditemukan.</CommandEmpty>
                                                        <CommandGroup>
                                                            {SEMUA_KARYAWAN.map((karyawan) => (
                                                                <CommandItem 
                                                                    key={karyawan.id} 
                                                                    value={`${karyawan.nama} ${karyawan.dept} ${karyawan.gedung}`} 
                                                                    onSelect={() => {
                                                                        setSelectedKaryawan(karyawan.nama);
                                                                        setSelectedDepartemen(karyawan.dept);
                                                                        setSelectedKaryawanId(karyawan.id);
                                                                        setSelectedGedung(karyawan.gedung); 
                                                                        setOpenCombobox(false);
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", selectedKaryawan === karyawan.nama ? "opacity-100" : "opacity-0")} />
                                                                    <div className="flex flex-col">
                                                                        <span>{karyawan.nama} - <span className="font-semibold">{karyawan.dept}</span></span>
                                                                        <span className="text-[10px] text-muted-foreground">{karyawan.gedung}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {selectedKaryawan && (
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                            <Label className="text-xs font-bold text-slate-500 mb-2 block">DATA KARYAWAN TERPILIH</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label className="text-[10px] text-slate-400">Departemen</Label>
                                                    <Input value={selectedDepartemen} readOnly className="h-8 bg-slate-100 text-xs font-medium focus-visible:ring-0 cursor-default"/>
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-slate-400">ID Karyawan</Label>
                                                    <Input value={selectedKaryawanId || "-"} readOnly className="h-8 bg-slate-100 text-xs font-mono text-blue-600 focus-visible:ring-0 cursor-default"/>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-blue-600 mt-2 italic">
                                                *Data ini akan otomatis tercatat sebagai penanggung jawab kunjungan.
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded bg-slate-50">
                                    {DAFTAR_GEDUNG.map((gedung, idx) => {
                                        const isGedungUtama = selectedGedung === gedung;
                                        return (
                                            <div key={idx} className="flex items-center space-x-2 py-1 border-b last:border-0 border-slate-100">
                                                <Checkbox 
                                                    id={`gd-${idx}`}
                                                    checked={isGedungUtama || aksesTambahan.includes(gedung)}
                                                    disabled={isGedungUtama}
                                                    onCheckedChange={(checked) => {
                                                        if (isGedungUtama) return; 
                                                        if (checked) {
                                                            setAksesTambahan([...aksesTambahan, gedung]);
                                                        } else {
                                                            setAksesTambahan([...aksesTambahan.filter(g => g !== gedung)]);
                                                        }
                                                    }}
                                                />
                                                <label 
                                                    htmlFor={`gd-${idx}`} 
                                                    className={`text-xs font-medium cursor-pointer ${isGedungUtama ? "text-blue-600 font-bold" : "text-slate-700"}`}
                                                >
                                                    {gedung} {isGedungUtama && <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 ml-1">Tujuan Utama</span>}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStepScan(1)}>Sebelumnya</Button>
                                    <Button 
                                        className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white" 
                                        disabled={selectedGedung.length === 0 || (tamuTerpilih?.gedungTujuan !== "VIP" && !selectedKaryawan)} 
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
                                    <InfoRow label="ID Tamu" nilai={formatIdTamu(tamuTerpilih?.id)} />
                                    <InfoRow label="Nama Lengkap" nilai={tamuTerpilih?.namaTamu || "-"} />
                                    <InfoRow label="Instansi/Asal" nilai={tamuTerpilih?.asalInstansi || "-"} />
                                    <InfoRow label="Email" nilai={tamuTerpilih?.email || "-"} />
                                    <InfoRow label="NIK" nilai={tamuTerpilih?.nik || tamuTerpilih?.noKtp || "-"} />
                                    <InfoRow label="No. Handphone" nilai={tamuTerpilih?.noTelp || "-"} />
                                    <InfoRow label="Tujuan" nilai={tamuTerpilih?.tujuanKunjungan || "-"} />
                                    <InfoRow label="Karyawan Dituju" nilai={tamuTerpilih?.karyawanDituju || "-"} />
                                    <InfoRow label="Dept. Tujuan" nilai={tamuTerpilih?.departemen || "-"} />
                                    <div className="border-t border-blue-200 my-2 pt-2"></div>
                                    <InfoRow 
                                        label="Waktu Kunjungan" 
                                        nilai={`${formatTanggalJam(tamuTerpilih?.waktuCheckIn)} s/d ${formatTanggalJam(tamuTerpilih?.waktuCheckOut)}`} 
                                    />
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <p className="text-sm text-slate-700">
                                        Pastikan tamu memiliki keperluan untuk memasuki area dalam gedung ini sesuai dengan data di atas.
                                    </p>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStepScan(1)}>
                                        Sebelumnya
                                    </Button>
                                    <Button 
                                        className="w-2/3 bg-green-600 hover:bg-green-700 text-white" 
                                        onClick={() => setStepScan(3)}
                                    >
                                        Lanjut Berikan Akses Area
                                    </Button>
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
                                                if (aksesBeri.gateUtama) aksesArr.push("Gate Utama");
                                                if (aksesBeri.gateParkir) aksesArr.push(`Parkir ${selectedGedung}`);
                                                const finalAkses = aksesArr.join(",");

                                                updateStatusTamu(
                                                    tamuTerpilih.id,         
                                                    "Check-in",              
                                                    uidNfc || "",     
                                                    "Gate Utama",            
                                                    new Date().toISOString(),
                                                    {                        
                                                        karyawanDituju: selectedKaryawan,
                                                        departemen: selectedDepartemen, 
                                                        gedungTujuan: selectedGedung,
                                                        aksesAktif: finalAkses || ""
                                                    }
                                                );
                                            } else {
                                                const aksesBaru = tamuTerpilih.aksesAktif 
                                                    ? `${tamuTerpilih.aksesAktif}, Lobby ${lokasiArea}` 
                                                    : `Lobby ${lokasiArea}`;

                                                updateStatusTamu(
                                                    tamuTerpilih.id,             
                                                    "Check-in Area",             
                                                    uidNfc || "",         
                                                    `Lobby ${lokasiArea} Masuk`, 
                                                    new Date().toISOString(),
                                                    { aksesAktif: aksesBaru || "" }
                                                );
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
                                const rawQr = result[0].rawValue.toString().trim(); 
                                const cleanId = rawQr.replace("PKC-", "").trim(); 
                                
                                console.log("DATA TAMU:", { rawQr, cleanId }); 

                                const found = dataTamu.find((t) => {
                                const scanndIdMurni = rawQr.replace(/^0+/, "");
                                const dbIdMurni = t.id.toString().replace(/^0+/, "");
                                const matchId = dbIdMurni === scanndIdMurni;
                                const matchNfc = t.nfcId === rawQr || t.kartuNfcId === rawQr;
                                const isTamuCocok = matchId || matchNfc;
                                const masihDiKawasan = t.statusKunjungan === "Check-in" || t.statusKunjungan === "Masuk Area";
                                return isTamuCocok && masihDiKawasan;
                            });
                                if (found) { 
                                    setTamuTerpilih(found); 
                                    setStepScan(2); 
                                    setModalAction("checkout"); 
                                } else {
                                    alert(`Data tidak ditemukan! \nKamera baca: "${rawQr}" \nSistem nyari ID: "${cleanId}"`);
                                }
                            }
                        }}
                    />
                    </div>
                    <Button variant="outline" size="sm" className="text-[10px] w-full mt-2" onClick={() => { 
                            if (tamuTerpilih) {
                                setStepScan(2); 
                                setModalAction("checkout");
                            } else {
                                alert("Pilih tamu terlebih dahulu");
                            }
                        }}
                    >
                        (Dev) Lewati Kamera
                    </Button>
                </DialogContent>
            </Dialog>

            <Dialog open={modalAction === "checkout_confirm"} onOpenChange={(open) => !open && setModalAction(null)}>
                <DialogContent className={`sm:max-w-md overflow-hidden rounded-xl border p-0 ${
                    tamuTerpilih?.gedungTujuan === "VIP" || tamuTerpilih?.isVip ? "border-amber-400 ring-2 ring-amber-300" : "border-slate-200"
                }`}>
                    <div className={`px-6 py-4 border-b ${
                        tamuTerpilih?.gedungTujuan === "VIP" || tamuTerpilih?.isVip
                            ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white" 
                            : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                    }`}>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <LogOut className="h-5 w-5" />
                            Konfirmasi Keluar / Check-out {tamuTerpilih?.gedungTujuan === "VIP" ? "VIP" : "Tamu"}
                        </DialogTitle>
                        <p className="text-xs mt-0.5 opacity-90">
                            ID Card: {tamuTerpilih?.id || "-"} | Status Saat Ini: {tamuTerpilih?.statusKunjungan}
                        </p>
                    </div>
                    <div className="p-6 space-y-4 bg-white max-h-[65vh] overflow-y-auto">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Nama Tamu</span><span className="font-bold text-slate-800">{tamuTerpilih?.namaTamu || "-"}</span></div>
                            <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Instansi</span><span className="font-medium text-slate-700">{tamuTerpilih?.asalInstansi || "-"}</span></div>
                            <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Gedung Tujuan</span><span className="font-semibold text-slate-700">{tamuTerpilih?.gedungTujuan || "-"}</span></div>
                            <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">NFC Card UID</span><span className="font-mono text-slate-600">{tamuTerpilih?.nfcId || tamuTerpilih?.uidNfc || "Belum Terpasang"}</span></div>
                        </div>

                        {tamuTerpilih?.gedungTujuan !== "VIP" && tamuTerpilih?.anggotaRombongan && tamuTerpilih.anggotaRombongan.length > 0 && (
                            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5 text-left">
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                                    <UsersRound className="h-3.5 w-3.5" /> Anggota Rombongan ({tamuTerpilih.anggotaRombongan.length} Orang)
                                </p>
                                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-xs">
                                    {tamuTerpilih.anggotaRombongan.map((anggota: any, idx: number) => (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-md p-1.5 font-medium text-slate-700">
                                            {idx + 1}. {anggota.nama} {anggota.noTelp ? `(${anggota.noTelp})` : ''}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {(tamuTerpilih?.gedungTujuan === "VIP" || tamuTerpilih?.isVip) && (tamuTerpilih?.jumlahRombongan > 0 || tamuTerpilih?.jumlahAnggotaVip > 0) && (
                            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs font-bold text-amber-800">
                                membawa Pengikut VIP: +{tamuTerpilih?.jumlahRombongan || tamuTerpilih?.jumlahAnggotaVip} Orang
                            </div>
                        )}
                        <div className="pt-2 border-t border-slate-200 text-left">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                                ⏱️ Tracking Riwayat Tap Aktual Kartu
                            </h4>
                            <div className="relative pl-4 border-l-2 border-slate-200 space-y-3 text-xs ml-1.5">
                                {(() => {
                                    let listLog = [];
                                    if (Array.isArray(tamuTerpilih?.riwayatTap)) listLog = tamuTerpilih.riwayatTap;
                                    else if (typeof tamuTerpilih?.riwayatTap === "string") {
                                        try { const parsed = JSON.parse(tamuTerpilih.riwayatTap); if (Array.isArray(parsed)) listLog = parsed; } catch(e){}
                                    }
                                    if (listLog.length > 0) {
                                        return listLog.map((log: any, idx: number) => (
                                            <div key={idx} className="relative">
                                                <div className={`absolute -left-[21px] mt-0.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                                                    log.jenisTap === "OUT" || log.status?.toLowerCase().includes("out") ? "bg-rose-500" : "bg-emerald-500"
                                                }`} />
                                                <p className="font-semibold text-slate-800">{log.lokasiGate || log.namaGate || "Gate Area"}</p>
                                                <p className="text-slate-500 text-[11px]">{log.waktuTap ? new Date(log.waktuTap).toLocaleString('id-ID') : "-"} ({log.jenisTap || "Tap"})</p>
                                            </div>
                                        ));
                                    }
                                    return <p className="text-slate-400 italic text-[11px]">Belum ada pergerakan kartu NFC terekam.</p>
                                })()}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-3 bg-slate-50 border-t flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setModalAction(null)}>Batal</Button>
                        <Button 
                            size="sm" 
                            className={tamuTerpilih?.gedungTujuan === "VIP" ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"} 
                            onClick={async () => {
                                try {
                                    setDataTamu((prev: any[]) => prev.map((t) => {
                                        if (t.id === tamuTerpilih.id) {
                                            return {
                                                ...t,
                                                statusKunjungan: "Check-out",
                                                waktuCheckOut: new Date().toISOString() 
                                            };
                                        }
                                        return t;
                                    }));
                                    alert(`Berhasil Memproses Check-out untuk ${tamuTerpilih.namaTamu}`);
                                    setModalAction(null);
                                    setTamuTerpilih(null);
                                } catch (err) {
                                    alert("Gagal memproses check-out");
                                }
                            }}
                        >
                            Fix Check-out
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={modalAction === "checkout"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {stepScan === 1 ? "Scan Tiket Keluar" : `Proses Check-out: ${tamuTerpilih?.namaTamu}`}
                        </DialogTitle>
                    </DialogHeader>

                    {roleSatpam === "gateUtama" && (
                        <div className="space-y-4">
                            {stepScan === 1 && (
                                <div className="space-y-3 text-center">
                                    <Label className="font-bold text-slate-700 block text-sm">Scan QR Code Tiket Tamu Reguler</Label>
                                    <div className="aspect-square max-w-[280px] mx-auto bg-black rounded-xl overflow-hidden border shadow-inner">
                                        <Scanner onScan={(result) => {
                                            if (!result) return;
                                            let rawQr = "";
                                            if (typeof result === "string") { rawQr = result; }
                                            else if (Array.isArray(result) && result.length > 0) {
                                                const resObj = result[0] as any;
                                                rawQr = resObj?.rawValue || resObj?.text || String(result[0]);
                                            }
                                            rawQr = rawQr.trim();
                                            if (!rawQr) return;
                                            const scanMurni = rawQr.replace("PKC-", "").replace("VIP-", "").replace(/^0+/, "").trim();
                                            const ditemukan = dataTamu.find(t => {
                                                if (!t) return false;
                                                const dbIdMurni = String(t.id || "").trim().replace(/^0+/, "");
                                                return dbIdMurni === scanMurni || String(t.id) === rawQr || String(t.nfcId) === rawQr;
                                            });
                                            if (ditemukan) {
                                                setTamuTerpilih(ditemukan);
                                                setStepScan(2); 
                                            } else {
                                                alert(`Data tiket QR (${rawQr}) tidak ditemukan!`);
                                            }
                                        }} />
                                    </div>
                                </div>
                            )}

                            {stepScan === 2 && tamuTerpilih && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                                        <p className="font-bold text-slate-700 uppercase tracking-wider border-b pb-1">📋 Detail Informasi Tamu</p>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                            <div><span className="text-slate-400">Nama Tamu:</span> <p className="font-bold text-slate-800">{tamuTerpilih.namaTamu}</p></div>
                                            <div><span className="text-slate-400">Instansi:</span> <p className="font-medium text-slate-700">{tamuTerpilih.asalInstansi || "-"}</p></div>
                                            <div><span className="text-slate-400">Karyawan Dituju:</span> <p className="font-medium text-slate-700">{tamuTerpilih.karyawanDituju || "-"}</p></div>
                                            <div><span className="text-slate-400">Gedung Tujuan:</span> <p className="font-bold text-blue-600">{tamuTerpilih.gedungTujuan || "-"}</p></div>
                                        </div>

                                        {tamuTerpilih.anggotaRombongan && tamuTerpilih.anggotaRombongan.length > 0 && (
                                            <div className="pt-2 border-t border-slate-200">
                                                <p className="font-bold text-blue-600 mb-1">👥 Anggota Rombongan ({tamuTerpilih.anggotaRombongan.length} Orang):</p>
                                                <div className="max-h-24 overflow-y-auto space-y-1 bg-white p-2 rounded border text-[11px]">
                                                    {tamuTerpilih.anggotaRombongan.map((ang: any, i: number) => (
                                                        <div key={i} className="text-slate-700">
                                                            {i + 1}. {ang.nama} | <span className="text-slate-500">{ang.noTelp || "-"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-slate-200">
                                            <p className="font-bold text-slate-600 mb-1">⏱️ Riwayat Tap Aktual Kartu:</p>
                                            <div className="pl-3 border-l-2 border-slate-300 space-y-1.5 text-[11px]">
                                                {(() => {
                                                    let listLog = [];
                                                    if (Array.isArray(tamuTerpilih?.riwayatTap)) listLog = tamuTerpilih.riwayatTap;
                                                    else if (typeof tamuTerpilih?.riwayatTap === "string") {
                                                        try { listLog = JSON.parse(tamuTerpilih.riwayatTap); } catch(e){}
                                                    }
                                                    if (listLog && listLog.length > 0) {
                                                        return listLog.map((log: any, idx: number) => (
                                                            <div key={idx} className="text-slate-700">
                                                                <span className="font-bold text-slate-800">{log.lokasiGate || "Gate Area"}</span> 
                                                                <span className="text-slate-400 mx-1">•</span>
                                                                <span className="text-slate-500">{log.waktuTap ? new Date(log.waktuTap).toLocaleTimeString('id-ID') : "-"}</span>
                                                                <span className="text-amber-600 font-mono ml-1.5 bg-amber-50 px-1 rounded border border-amber-200">({log.jenisTap || "TAP"})</span>
                                                            </div>
                                                        ));
                                                    }
                                                    return <p className="text-slate-400 italic">Belum ada riwayat tap kartu.</p>;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={tutupModal}>Batal</Button>
                                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setStepScan(3)}>
                                            Lanjut ke Tap NFC
                                        </Button>
                                    </div>
                                </div>
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
                                        <Button 
                                            variant="outline" 
                                            className="flex-1" 
                                            onClick={() => {
                                                if (tamuTerpilih?.gedungTujuan === "VIP" || tamuTerpilih?.isVip) {
                                                    tutupModal();
                                                } else {
                                                    setStepScan(2);
                                                }
                                            }}
                                        >
                                            Kembali
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            className="flex-1" 
                                            onClick={() => {
                                                updateStatusTamu(
                                                    tamuTerpilih.id, 
                                                    "Check-out", 
                                                    uidNfc || "", 
                                                    "Gate Utama Keluar", 
                                                    new Date().toISOString(),
                                                    { aksesAktif: "" } 
                                                );
                                                tutupModal();
                                            }}
                                        >
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
                                <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                        updateStatusTamu(
                                            tamuTerpilih.id, 
                                            "Check-in Area", 
                                            uidNfc || "", 
                                            `Lobby ${lokasiArea} Keluar`, 
                                            new Date().toISOString()
                                        );
                                        tutupModal();
                                    }}
                                >
                                    Cabut Akses & Selesai
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={modalAction === "detail"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className={`sm:max-w-md overflow-hidden rounded-xl border p-0 ${
                    tamuTerpilih?.gedungTujuan === "VIP" || tamuTerpilih?.gedungAktual === "VIP" ? "border-amber-400 ring-2 ring-amber-300" : "border-slate-200"
                }`}>
                    <div className={`px-6 py-4 border-b ${
                        tamuTerpilih?.gedungTujuan === "VIP" || tamuTerpilih?.gedungAktual === "VIP"
                            ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white" 
                            : "bg-slate-50 text-slate-900"
                    }`}>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            {(tamuTerpilih?.gedungTujuan === "VIP" || tamuTerpilih?.gedungAktual === "VIP")}
                            Detail Informasi Tamu VIP
                        </DialogTitle>
                    </div>
                    <div className="p-6 space-y-4 bg-white max-h-[70vh] overflow-y-auto">
                        {tamuTerpilih?.gedungTujuan !== "VIP" && tamuTerpilih?.gedungAktual !== "VIP" && (
                            <div>
                                {tamuTerpilih?.fotoKtp ? (
                                    <img src={tamuTerpilih.fotoKtp} alt="Foto KTP" className="w-full h-auto max-h-40 object-contain rounded-lg border bg-slate-50" />
                                ) : (
                                    <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 border border-dashed">
                                        Tidak ada lampiran foto KTP
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="space-y-2">
                            <InfoRow label="Nama Lengkap" nilai={tamuTerpilih?.namaTamu || "-"} />
                            <InfoRow label="Instansi Asal" nilai={tamuTerpilih?.asalInstansi || "-"} />
                            <InfoRow label="No. Handphone / WA" nilai={tamuTerpilih?.noTelp || tamuTerpilih?.noHp || "-"} />
                            <InfoRow label="Tujuan Kunjungan" nilai={tamuTerpilih?.tujuanKunjungan || tamuTerpilih?.tujuan || "-"} />
                            <InfoRow label="Gedung / Area" nilai={tamuTerpilih?.gedungTujuan || tamuTerpilih?.gedungAktual || "-"} />
                            <div className="border-t border-slate-100 my-2 pt-2"></div>
                            <InfoRow label="ID Tamu" nilai={tamuTerpilih ? formatIdTamu(tamuTerpilih.id, tamuTerpilih.gedungTujuan === "VIP" || tamuTerpilih.isVip) : "-" } />
                            <InfoRow label="Status Saat Ini" nilai={tamuTerpilih?.statusKunjungan || "Menunggu"} />
                            <InfoRow label="Akses Aktif" nilai={tamuTerpilih?.aksesAktif || "Belum Ada"} />
                        </div>

                        {tamuTerpilih?.gedungTujuan !== "VIP" && tamuTerpilih?.anggotaRombongan && tamuTerpilih.anggotaRombongan.length > 0 && (
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2 text-left">
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                                    <UsersRound className="h-3.5 w-3.5" /> Verifikasi Anggota Rombongan ({tamuTerpilih.anggotaRombongan.length} Orang)
                                </p>
                                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                                    {tamuTerpilih.anggotaRombongan.map((anggota: any, idx: number) => (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2 text-xs flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-800">{idx + 1}. {anggota.nama}</p>
                                                <p className="text-slate-500 text-[11px]">📞 {anggota.noTelp && anggota.noTelp !== "-" ? anggota.noTelp : "Tanpa No. HP"}</p>
                                            </div>
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono truncate max-w-[140px]">
                                                {anggota.email && anggota.email !== "-" ? anggota.email : "no-email"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(tamuTerpilih?.gedungTujuan === "VIP" || tamuTerpilih?.isVip) && (tamuTerpilih?.jumlahRombongan > 0 || tamuTerpilih?.jumlahAnggotaVip > 0) && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-center gap-2">
                                <UsersRound className="h-4 w-4 text-amber-700" />
                                <p className="text-xs font-bold text-amber-900">
                                    Membawa Pengikut VIP: <span className="underline">+{tamuTerpilih?.jumlahRombongan || tamuTerpilih?.jumlahAnggotaVip} Orang</span>
                                </p>
                            </div>
                        )}

                        <div className="pt-2 border-t border-slate-200">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                                ⏱️ Riwayat Tap Aktual (Sistem)
                            </h4>
                            <div className="relative pl-4 border-l-2 border-slate-200 space-y-4 text-xs ml-1.5">
                                {(() => {
                                    let listLog = [];
                                    if (Array.isArray(tamuTerpilih?.riwayatTap)) {
                                        listLog = tamuTerpilih.riwayatTap;
                                    } else if (typeof tamuTerpilih?.riwayatTap === "string") {
                                        try {
                                            const parsed = JSON.parse(tamuTerpilih.riwayatTap);
                                            if (Array.isArray(parsed)) listLog = parsed;
                                        } catch (e) {
                                            listLog = [];
                                        }
                                    }
                                    if (listLog.length > 0) {
                                        return listLog.map((log: any, idx: number) => (
                                            <div key={idx} className="relative">
                                                <div className={`absolute -left-[21px] mt-0.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                                                    log.jenisTap === "OUT" || log.status?.toLowerCase().includes("out") 
                                                        ? "bg-rose-500" 
                                                        : "bg-emerald-500"
                                                }`} />
                                                <p className="font-semibold text-slate-800">
                                                    {log.lokasiGate || log.namaGate || log.gate || "Gate Area"}
                                                </p>
                                                <p className="text-slate-500 text-[11px]">
                                                    {log.waktuTap || log.waktu 
                                                        ? new Date(log.waktuTap || log.waktu).toLocaleString('id-ID') 
                                                        : "-"}
                                                    <span className="ml-1 font-medium text-amber-600">
                                                        ({log.jenisTap || log.status || "Tap"})
                                                    </span>
                                                </p>
                                            </div>
                                        ));
                                    }

                                    return (
                                        <p className="text-slate-400 italic text-[11px]">
                                            Belum ada pergerakan kartu NFC terekam di sistem.
                                        </p>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-slate-50 border-t flex justify-end">
                        <Button variant="outline" size="sm" onClick={tutupModal}>Tutup</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isModalVipOpen} onOpenChange={setIsModalVipOpen}>
                <DialogContent className="sm:max-w-md rounded-xl border border-amber-200 bg-white p-6">
                    <DialogTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                        <FaCrown className="h-5 w-5" /> Registrasi Kunjungan Tamu VIP
                    </DialogTitle>
                    {stepVip === 1 && (
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Nama Lengkap Tamu</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900" 
                                    placeholder="Masukkan nama tamu VIP..."
                                    value={namaVip}
                                    onChange={(e) => setNamaVip(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Instansi / Perusahaan</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900" 
                                    placeholder="Masukkan nama instansi asal..."
                                    value={instansiVip}
                                    onChange={(e) => setInstansiVip(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">No. Handphone / WA</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900" 
                                    placeholder="Contoh: 081234567xxx"
                                    value={noTelpVip}
                                    onChange={(e) => setNoTelpVip(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Tujuan Kunjungan</label>
                                <textarea 
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900" 
                                    placeholder="Masukkan detail tujuan kunjungan..."
                                    rows={3}
                                    value={tujuanVip}
                                    onChange={(e) => setTujuanVip(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                                    Jumlah Anggota Yang Ikut (Rombongan)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        min="0"
                                        className="w-32 px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 font-bold text-center" 
                                        placeholder="0"
                                        value={jumlahAnggotaVip}
                                        onChange={(e) => setJumlahAnggotaVip(Math.max(0, parseInt(e.target.value) || 0))}
                                    />
                                    <span className="text-xs text-slate-500 font-medium">
                                        *Isi <span className="font-bold text-slate-700">0</span> jika datang sendirian (tanpa pengikut).
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button 
                                    className="bg-amber-600 hover:bg-amber-700 text-white w-full"
                                    onClick={() => {
                                        if (!namaVip || !instansiVip || !tujuanVip) {
                                            alert("Harap lengkapi nama, instansi, dan tujuan terlebih dahulu!");
                                            return;
                                        }
                                        setStepVip(2);
                                    }}
                                >
                                    Lanjut ke Akses & NFC →
                                </Button>
                            </div>
                        </div>
                    )}

                    {stepVip === 2 && (
                        <div className="space-y-4 pt-2">
                            <div className={`p-4 rounded-xl border text-center space-y-3 ${uidNfc ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200 border-dashed"}`}>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">
                                        {uidNfc ? "Kartu NFC Berhasil Terdeteksi" : "Silakan Tap Kartu NFC VIP ke Reader..."}
                                    </p>
                                </div>

                                <div className="max-w-xs mx-auto pt-1">
                                    <label className="block text-[11px] font-semibold text-slate-500 text-left mb-1 uppercase tracking-wider">
                                        Input UID Manual:
                                    </label>
                                    <input 
                                        type="text"
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono text-center bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 uppercase"
                                        placeholder="Ketik UID kartu di sini..."
                                        value={uidNfc}
                                        onChange={(e) => setUidNfc(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Beri Hak Akses Area/Gedung:</label>
                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aksesBeri.gateUtama} onChange={(e) => setAksesBeri({...aksesBeri, gateUtama: e.target.checked})} /> Gate Utama</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aksesBeri.gateParkir} onChange={(e) => setAksesBeri({...aksesBeri, gateParkir: e.target.checked})} /> Gate Parkir</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aksesBeri.gpa} onChange={(e) => setAksesBeri({...aksesBeri, gpa: e.target.checked})} /> GPA</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aksesBeri.diklat} onChange={(e) => setAksesBeri({...aksesBeri, diklat: e.target.checked})} /> Gedung Diklat</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aksesBeri.pabrik1a} onChange={(e) => setAksesBeri({...aksesBeri, pabrik1a: e.target.checked})} /> Pabrik 1A</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aksesBeri.pabrik1b} onChange={(e) => setAksesBeri({...aksesBeri, pabrik1b: e.target.checked})} /> Pabrik 1B</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aksesBeri.mo} onChange={(e) => setAksesBeri({...aksesBeri, mo: e.target.checked})} /> Gedung MO</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aksesBeri.lc} onChange={(e) => setAksesBeri({...aksesBeri, lc: e.target.checked})} /> Gedung LC</label>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="w-1/3" onClick={() => setStepVip(1)}>
                                    Kembali
                                </Button>
                                <Button
                                    className="w-2/3 bg-amber-600 hover:bg-amber-700 text-white"
                                    onClick={handleDaftarVip}
                                >
                                    Selesai & Simpan
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div> 
    );
}

export function RombonganExpandRow({ anggota, colSpan }: { anggota: any[]; colSpan: number }) {
    return (
        <TableRow className="bg-slate-50/80 border-b border-dashed border-slate-200">
            <TableCell colSpan={colSpan} className="py-0 px-0">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <UsersRound className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Daftar Anggota Rombongan ({anggota.length} Orang)
                        </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {anggota.map((a: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">
                                    {i + 1}
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className="truncate text-sm font-bold text-slate-700">{a.nama || "-"}</p>
                                    <p className="truncate text-xs text-slate-500 font-mono">📧 {a.email && a.email !== "-" ? a.email : "Tidak ada email"}</p>
                                    <p className="text-xs text-slate-500">📞 {a.noTelp && a.noTelp !== "-" ? a.noTelp : (a.noHp && a.noHp !== "-" ? a.noHp : "Tidak ada no telp")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </TableCell>
        </TableRow>
    );
}

export function OverviewRow({ 
    item, 
    index, 
    roleSatpam, 
    setTamuTerpilih, 
    setStepScan, 
    setModalAction,
    formatIdTamu
}: { 
    item: any; 
    index: number; 
    roleSatpam: string;
    setTamuTerpilih: (tamu: any) => void;
    setStepScan: (step: number) => void;
    setModalAction: (action: any) => void;
    formatIdTamu: (id: any, vip: boolean) => string;
}) {
    const [expanded, setExpanded] = useState(false);
    const isVip = item.gedungTujuan === "VIP" || item.isVip;
    const hasRombonganReguler = !isVip && item.anggotaRombongan && item.anggotaRombongan.length > 0;
    const jumlahPengikutVip = item.jumlahRombongan || item.jumlahAnggotaVip || item.jumlahAnggota || 0;
    const st = item.statusKunjungan || "Menunggu";

    return (
        <>
            <TableRow 
                onClick={() => hasRombonganReguler && setExpanded((v) => !v)}
                className={`${
                    isVip 
                        ? "bg-amber-50/50 hover:bg-amber-100/60" 
                        : hasRombonganReguler 
                            ? "bg-blue-50/30 hover:bg-blue-50/60" 
                            : "hover:bg-slate-50"
                } ${hasRombonganReguler ? "cursor-pointer border-l-4 border-l-blue-500" : ""} transition-colors text-sm`}
            >
                <TableCell className="px-3 py-2.5 text-xs font-medium text-slate-500 text-center w-12">
                    {index + 1}
                </TableCell>
                <TableCell className="font-bold text-slate-700">
                    {formatIdTamu(item.id, isVip)}
                </TableCell>
                <TableCell className="font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                        {item.namaTamu || "-"}
                        {isVip && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-300">VIP</span>
                        )}
                        {hasRombonganReguler && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                                <UsersRound className="h-3 w-3" />
                                +{item.anggotaRombongan.length}
                                {expanded ? <ChevronDown className="h-3 w-3 ml-0.5" /> : <ChevronRight className="h-3 w-3 ml-0.5" />}
                            </span>
                        )}
                        {isVip && jumlahPengikutVip > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 text-amber-800 px-2 py-0.5 text-[10px] font-bold border border-amber-200">
                                <UsersRound className="h-3 w-3" />
                                +{jumlahPengikutVip} Rombongan
                            </span>
                        )}
                    </div>
                </TableCell>
                <TableCell className="px-3 py-2.5 text-slate-600">{item.asalInstansi || "-"}</TableCell>
                <TableCell className="px-3 py-2.5 text-slate-600 text-xs">{item.email || "-"}</TableCell>
                <TableCell className="px-3 py-2.5 text-slate-600 truncate max-w-[150px]">{item.tujuanKunjungan || item.tujuanVip || "-"}</TableCell>
                <TableCell className="px-3 py-2.5 text-slate-600">{item.karyawanDituju || "Direksi / Manajemen"}</TableCell>
                <TableCell className="px-3 py-2.5 text-xs">{fmtDt(item.waktuCheckIn)}</TableCell>
                <TableCell className="px-3 py-2.5 text-xs">{fmtDt(item.waktuCheckOut)}</TableCell>
                <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${
                        st === "Menunggu" || st === "Menunggu Gate Utama" ? "bg-yellow-100 text-yellow-800 ring-yellow-300" :
                        st === "Check-in" ? "bg-blue-100 text-blue-800 ring-blue-300" :
                        st === "Check-in Area" ? "bg-green-100 text-green-800 ring-green-300" :
                        st === "Check-out" ? "bg-red-100 text-red-800 ring-red-300" : "bg-gray-100 text-gray-700 ring-gray-300"
                    }`}>
                        {st}
                    </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                        {roleSatpam === "gateUtama" && (
                            <>
                                {st === "Menunggu" && (
                                    <Button size="sm" className="h-7 text-xs bg-blue-600" onClick={() => { setTamuTerpilih(item); setStepScan(2); setModalAction("checkin"); }}>
                                        Check-in
                                    </Button>
                                )}
                                {(st === "Check-in" || st === "Check-in Area") && (
                                    <Button 
                                        size="sm" 
                                        variant="destructive" 
                                        className="h-7 text-xs" 
                                        onClick={() => { 
                                            setTamuTerpilih(item); 
                                            if (item.gedungTujuan === "VIP" || item.isVip) {
                                                setStepScan(3);
                                            } else {
                                                setStepScan(1);
                                            }
                                            setModalAction("checkout");
                                        }}
                                    >
                                        Check-out
                                    </Button>
                                )}
                            </>
                        )}
                        {roleSatpam === "area" && (
                            <>
                                {st === "Check-in" && (
                                    <Button size="sm" className="h-7 text-xs bg-green-600" onClick={() => { setTamuTerpilih(item); setStepScan(2); setModalAction("checkin"); }}>
                                        Masuk Area
                                    </Button>
                                )}
                                {st === "Check-in Area" && (
                                    <Button 
                                        size="sm" 
                                        variant="destructive" 
                                        className="h-7 text-xs" 
                                        onClick={() => { 
                                            setTamuTerpilih(item); 
                                            if (item.gedungTujuan === "VIP" || item.isVip) {
                                                setStepScan(3);
                                            } else {
                                                setStepScan(1);
                                            }
                                            setModalAction("checkout");
                                        }}
                                    >
                                        Keluar Area
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </TableCell>
                
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setTamuTerpilih(item); setModalAction("detail"); }}>
                        <Eye className="h-4 w-4" />
                    </Button>
                </TableCell>
            </TableRow>

            {hasRombonganReguler && expanded && (
                <RombonganExpandRow anggota={item.anggotaRombongan} colSpan={12} />
            )}
        </>
    );
}