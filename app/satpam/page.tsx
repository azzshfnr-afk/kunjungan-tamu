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
    const [selectedGedung, setSelectedGedung] = useState<string>(""); 
    const [aksesTambahan, setAksesTambahan] = useState<string[]>([]);
    const [selectedKaryawan, setSelectedKaryawan] = useState("");
    const [uidNfc, setUidNfc] = useState("");
    const [aksesBeri, setAksesBeri]   = useState({ gateUtama: true, gateParkir: true });
    const [aksesLepas, setAksesLepas] = useState({ gateUtama: true, gateParkir: true, gateLobby: true });
    const [dataTamu, setDataTamu]     = useState<any[]>([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [isModalVipOpen, setIsModalVipOpen] = useState(false);
    const [isLoadingVip, setIsLoadingVip]     = useState(false);
    const [formVip, setFormVip] = useState({ namaTamu: "", asalInstansi: "", tujuan: "" });
    const [openCombobox, setOpenCombobox] = useState(false);
    const [selectedDepartemen, setSelectedDepartemen] = useState<string>("");
    const [selectedKaryawanId, setSelectedKaryawanId] = useState<string | null>(null);

    const [gedungAutoFill, setGedungAutoFill] = useState<string>("");

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
        setAksesBeri({ gateUtama: true, gateParkir: true });
        setAksesLepas({ gateUtama: true, gateParkir: true, gateLobby: true });
    };

    const formatIdTamu = (id: any) => {
        if (!id) return "-";
        const numericId = String(id).replace("PKC-", "");
        return `PKC-${numericId.padStart(4, '0')}`;
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
            const dataRes = await res.json();
            if (res.ok && dataRes.data) {
                setIsModalVipOpen(false);
                setTamuTerpilih(dataRes.data);
                setModalAction("checkin");
                setStepScan(3);
                setFormVip({ namaTamu: "", asalInstansi: "", tujuan: ""});
            } else {
                alert("Gagal simpan VIP: " + (dataRes.message || "Cek terminal"));
            }
        } catch (err) {
            console.error("Error VIP:", err);
            alert("Error jaringan atau server saat menyimpan data VIP!");
        } finally {
            setIsLoadingVip(false);
        }
    };

    const filteredTamu = Array.isArray(dataTamu) 
    ? dataTamu.filter((tamu) => {
        if (!tamu) return false;
        const matchesSearch = tamu.namaTamu?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true;
        const st = tamu.statusKunjungan || "";

        // TAMBAHKAN "Check-out" di sini biar gak ilang dari tabel
        const matchesStatus = ["Menunggu", "Check-in", "Check-in Area", "Masuk Area", "Check-out"].includes(st);

        if (roleSatpam === "area") {
            const isTujuanUtama = tamu.gedungTujuan === lokasiArea;
            const isVip = tamu.gedungTujuan === "VIP";
            const aksesStr = String(tamu.aksesAktif || "").toLowerCase();
            const areaCari = lokasiArea.toLowerCase().trim();
            const isAksesTambahan = aksesStr.includes(areaCari);
            
            return matchesSearch && matchesStatus && (isTujuanUtama || isVip || isAksesTambahan);
        }
        return matchesSearch && matchesStatus;
    })
    : [];

    // --- RETURN UI (Tampilan Dashboard Lu) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
            <div className="mx-auto max-w-[1600px] bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                
                {/* Header Section */}
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

                {/* Search & Actions Bar */}
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <div className="relative w-full sm:w-72">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Cari nama tamu…" className="pl-9 h-9 text-sm border-slate-300" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {roleSatpam === "gateUtama" && (
                            <Button className="h-9 bg-amber-500 hover:bg-amber-600 text-white text-sm" onClick={() => setIsModalVipOpen(true)}>
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

                {/* Table Data */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                {["No", "ID Tamu", "Format ID", "ID NFC", "Nama Tamu", "Instansi", "Email", "Rencana Kunjungan", "Tujuan Karyawan", "Check-in", "Check-out", "Status", "Aksi", "Detail"].map((h) => (
                                    <TableHead key={h} className="text-xs font-semibold text-slate-700 whitespace-nowrap px-3 py-3"> {h} </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={14} className="text-center py-12 text-slate-400 animate-pulse"> Memuat data… </TableCell></TableRow>
                            ) : filteredTamu.length === 0 ? (
                                <TableRow><TableCell colSpan={14} className="text-center py-10 text-slate-400"> Tidak ada data tamu </TableCell></TableRow>
                            ) : (
                                filteredTamu.map((tamu, idx) => {
                                    const st = tamu.statusKunjungan || "Menunggu";
                                    return (
                                        <TableRow key={tamu.id || idx} className="hover:bg-slate-50 text-sm">
                                            <TableCell className="px-3 py-2.5 text-slate-500 text-xs">{idx + 1}</TableCell>
                                            <TableCell className="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">{tamu.id || "-"}</TableCell>
                                            <TableCell className="font-bold text-slate-700">{formatIdTamu(tamu.id)}</TableCell>
                                            <TableCell className="px-3 py-2.5 font-mono text-xs text-slate-600">{tamu.nfcId || "-"}</TableCell>
                                            <TableCell className="font-semibold text-slate-800">
                                                <div className="flex items-center gap-2">
                                                    {tamu.namaTamu || "-"}
                                                    {tamu.gedungTujuan === "VIP" && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-300">VIP</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-2.5 text-slate-600">{tamu.asalInstansi || "-"}</TableCell>
                                            <TableCell className="px-3 py-2.5 text-slate-600 text-xs">{tamu.email || "-"}</TableCell>
                                            <TableCell className="px-3 py-2.5 text-slate-600 truncate max-w-[150px]">{tamu.tujuanKunjungan || "-"}</TableCell>
                                            <TableCell className="px-3 py-2.5 text-slate-600">{tamu.karyawanDituju || "-"}</TableCell>
                                            <TableCell className="px-3 py-2.5 text-xs">{fmtDt(tamu.waktuCheckIn)}</TableCell>
                                            <TableCell className="px-3 py-2.5 text-xs">{fmtDt(tamu.waktuCheckOut)}</TableCell>
                                            <TableCell><StatusBadge status={st} /></TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {/* --- LOGIKA GATE UTAMA --- */}
                                                    {roleSatpam === "gateUtama" && (
                                                        <>
                                                            {st === "Menunggu" && (
                                                                <Button size="sm" className="h-7 text-xs bg-blue-600" onClick={() => { setTamuTerpilih(tamu); setStepScan(2); setModalAction("checkin"); }}>
                                                                    Check-in
                                                                </Button>
                                                            )}
                                                            {/* Tambahin ini: Biar pas statusnya Check-in (atau di dalam area), Gate Utama bisa Checkout-in */}
                                                            {(st === "Check-in" || st === "Check-in Area") && (
                                                                <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { setTamuTerpilih(tamu); setStepScan(1); setModalAction("scan_checkout"); }}>
                                                                    Check-out
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* --- LOGIKA AREA --- */}
                                                    {roleSatpam === "area" && (
                                                        <>
                                                            {st === "Check-in" && (
                                                                <Button size="sm" className="h-7 text-xs bg-green-600" onClick={() => { setTamuTerpilih(tamu); setStepScan(2); setModalAction("checkin"); }}>
                                                                    Masuk Area
                                                                </Button>
                                                            )}
                                                            {/* Tambahin ini: Tombol buat tamu yang lagi di dalem gedung biar bisa Checkout */}
                                                            {st === "Check-in Area" && (
                                                                <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { setTamuTerpilih(tamu); setStepScan(1); setModalAction("scan_checkout"); }}>
                                                                    Keluar Area
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setTamuTerpilih(tamu); setModalAction("detail"); }}><Eye className="h-4 w-4" /></Button>
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
                                <div className="aspect-square bg-black rounded-xl overflow-hidden">
                                    <Scanner onScan={(result) => {
                                        if (result?.length) {
                                            const rawQr = result[0].rawValue.toString().trim();
                                            const numericId = rawQr.replace(/\D/g, "");
                                            const idMurni = parseInt(numericId); 
                                            console.log("DATA TAMU:", { rawQr, idMurni});
                                            const found = dataTamu.find((t) => 
                                                Number(t.id) === idMurni ||
                                                t.id.toString() === rawQr
                                            );
                                            if (found) { 
                                                setTamuTerpilih(found);
                                                setSelectedGedung(found.gedungTujuan || ""); 
                                                setTimeout(() => {
                                                    setSelectedKaryawan(found.karyawanDituju || ""); 
                                                }, 100);
                                                setStepScan(2); 
                                            } else {
                                                alert(`Data tidak ditemukan! ${rawQr} (Parsed: ${idMurni})`);
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

                                    <div className="space-y-2 mt-4 pt-2 border-t border-slate-100">
                                        <Label className="text-xs font-bold text-slate-700 block mb-2">PILIH AKSES KAWASAN LAIN (Opsional)</Label>
                                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            {DAFTAR_GEDUNG.map((gedung) => (
                                                <div key={gedung} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                    id={gedung} 
                                                    checked={aksesTambahan.includes(gedung)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                        setAksesTambahan([...aksesTambahan, gedung]);
                                                        } else {
                                                        setAksesTambahan(aksesTambahan.filter((g) => g !== gedung));
                                                        }
                                                    }}
                                                    />
                                                    <label htmlFor={gedung}>{gedung}</label>
                                                </div>
                                                ))}
                                        </div>
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
                                                if (tamuTerpilih.gedungTujuan === "VIP") {
                                                    aksesArr.push("ALL_AREA_ACCESS_VIP");
                                                } else {
                                                    if (aksesBeri.gateUtama) aksesArr.push("Gate_Utama");
                                                    if (aksesBeri.gateParkir) aksesArr.push(`Parkir_${selectedGedung}`);
                                                }
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
                                                    ? `${tamuTerpilih.aksesAktif}, Lobby_${lokasiArea}` 
                                                    : `Lobby_${lokasiArea}`;

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
                                    const scanndIdMurni = cleanId.replace(/^0+/, "");
                                    const dbIdMurni = t.id.toString().replace("PKC-", "").replace(/^0+/, "");
                                    return dbIdMurni === scanndIdMurni;
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

            <Dialog open={modalAction === "checkout"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Proses Check-out: {tamuTerpilih?.namaTamu}</DialogTitle>
                    </DialogHeader>

                    {roleSatpam === "gateUtama" && (
                        <div className="space-y-4">
                            {stepScan === 2 && (
                                <>
                                    <div className="space-y-1.5 mt-2">
                                        <Label>Karyawan Dituju</Label>
                                        <Select 
                                            value={selectedKaryawan} 
                                            onValueChange={(val) => {
                                                setSelectedKaryawan(val);
                                                    
                                                const orangnya = SEMUA_KARYAWAN.find(k => k.nama === val);
                                                if (orangnya) {
                                                    setSelectedGedung(orangnya.gedung);
                                                }
                                            }}
                                        >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="-- Pilih Karyawan --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SEMUA_KARYAWAN.map((karyawan, idx) => (
                                                        <SelectItem key={idx} value={karyawan.nama}>
                                                            {karyawan.nama} - {karyawan.dept}
                                                        </SelectItem>
                                                    ))}

                                                    {selectedKaryawan && !SEMUA_KARYAWAN.some(k => k.nama === selectedKaryawan) && (
                                                        <SelectItem value={selectedKaryawan}>
                                                            {selectedKaryawan} (Manual/Tidak Tersinkron)
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                        </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Gedung Tujuan Aktual</Label>
                                                <Select 
                                                    value={selectedGedung} 
                                                    onValueChange={setSelectedGedung}
                                                    disabled={!selectedKaryawan} 
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={selectedKaryawan ? "-- Pilih Gedung --" : "-- Pilih Karyawan Dulu --"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DAFTAR_GEDUNG.map((gedung, idx) => (
                                                            <SelectItem key={idx} value={gedung}>
                                                                {gedung}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
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
                                        <Button 
                                            variant="destructive" 
                                            className="flex-1" 
                                            onClick={() => {
                                                updateStatusTamu(
                                                    tamuTerpilih.id, 
                                                    "Check-out", // Pakai Check-out
                                                    uidNfc || "", 
                                                    "Gate Utama Keluar", 
                                                    new Date().toISOString(),
                                                    { aksesAktif: "" } // Hapus semua akses
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
                                            "Check-out", // Ganti jadi Check-out kalau mau langsung selesai
                                            uidNfc || "", 
                                            `Lobby ${lokasiArea} Keluar (Selesai)`, 
                                            new Date().toISOString(),
                                            { aksesAktif: "" } 
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
                            <InfoRow label="ID Tamu" nilai={formatIdTamu(tamuTerpilih?.id)} />
                            <InfoRow label="Nama Lengkap"     nilai={tamuTerpilih?.namaTamu} />
                            <InfoRow label="NIK"              nilai={tamuTerpilih?.nik || tamuTerpilih?.noKtp} />
                            <InfoRow label="No. Handphone"    nilai={tamuTerpilih?.noTelp} />
                            <InfoRow label="Email"            nilai={tamuTerpilih?.email} />
                            <InfoRow label="Instansi"         nilai={tamuTerpilih?.asalInstansi} />
                            <InfoRow label="Rencana Kunjungan" nilai={tamuTerpilih?.tujuanKunjungan} />
                            <InfoRow label="Gedung Aktual"    nilai={tamuTerpilih?.gedungTujuan || tamuTerpilih?.gedungAktual || "-"} />
                            <InfoRow label="Karyawan Dituju"  nilai={tamuTerpilih?.karyawanTujuan || tamuTerpilih?.karyawanDituju} />
                            <div className="border-t border-slate-200 my-1" />
                            <InfoRow label="ID NFC"           nilai={tamuTerpilih?.uidNfc || tamuTerpilih?.nfcId} />
                            <InfoRow label="Status"           nilai={tamuTerpilih?.statusKunjungan || "Menunggu Gate Utama"} />
                            <InfoRow label="Akses Aktif"      nilai={tamuTerpilih?.aksesAktif || "Belum Ada"} />
                            <InfoRow label="Waktu Check-in Aktual"   nilai={fmtDt(tamuTerpilih?.aktualCheckIn)} />
                            <InfoRow label="Waktu Check-out Aktual"  nilai={fmtDt(tamuTerpilih?.aktualCheckOut)} />
                        </div>

                       <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">
                                RENCANA KUNJUNGAN (SESUAI FORM)
                            </p>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                                <span className="text-xs text-slate-500 block mb-1">Waktu Check-in s/d Check-out</span>
                                <span className="text-sm font-semibold text-slate-800 block">
                                    {formatTanggalJam(tamuTerpilih?.waktuCheckIn)} <br className="hidden md:block"/> 
                                    <span className="text-slate-500 font-normal mx-1">s/d</span> <br className="block md:hidden" />
                                    {formatTanggalJam(tamuTerpilih?.waktuCheckOut)}
                                </span>
                            </div>

                            <p className="text-xs font-bold text-green-600 mb-3 tracking-wider mt-4">
                                RIWAYAT TAP AKTUAL (SISTEM)
                            </p>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200 space-y-2">
                                {tamuTerpilih?.riwayatTap ? (
                                    (typeof tamuTerpilih.riwayatTap === 'string' 
                                        ? tamuTerpilih.riwayatTap.split(',') 
                                        : tamuTerpilih.riwayatTap
                                    ).map((log: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center border-b border-green-100 pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <span className="text-[11px] font-bold text-green-800 block">
                                                    {typeof log === 'string' ? log : log.lokasi}
                                                </span>
                                                <span className="text-[11px] text-green-600">
                                                    Status: {typeof log === 'string' ? 'Berhasil' : log.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold text-green-900 block">
                                                    {log.waktu ? formatTanggalJam(log.waktu) : "-"}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-sm font-semibold text-green-900 block italic text-center p-2">
                                        Belum ada riwayat tap NFC.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog 
                open={isModalVipOpen} 
                onOpenChange={(open) => { 
                    if (!open) { 
                        setIsModalVipOpen(false); 
                        setFormVip({ namaTamu: "", asalInstansi: "", tujuan: "" }); 
                    } 
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <Star className="h-5 w-5 fill-amber-600" /> Jalur Cepat VIP
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="vip-nama">Nama Tamu / Rombongan</Label>
                            <Input 
                                id="vip-nama" 
                                placeholder="Contoh: Direksi Bank Mandiri" 
                                value={formVip.namaTamu}
                                onChange={(e) => setFormVip({...formVip, namaTamu: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vip-instansi">Asal Instansi</Label>
                            <Input 
                                id="vip-instansi" 
                                placeholder="Contoh: PT. Bank Mandiri (Persero)" 
                                value={formVip.asalInstansi}
                                onChange={(e) => setFormVip({...formVip, asalInstansi: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vip-tujuan">Tujuan Kunjungan</Label>
                            <Input 
                                id="vip-tujuan" 
                                placeholder="Contoh: Meeting Direksi" 
                                value={formVip.tujuan}
                                onChange={(e) => setFormVip({...formVip, tujuan: e.target.value})}
                            />
                        </div>
                        
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                                <strong>Catatan VIP:</strong> Tamu VIP akan otomatis mendapatkan akses <strong>Full Area</strong> tanpa perlu memilih karyawan secara manual.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 pt-2">
                        <Button 
                            variant="outline" 
                            className="flex-1" 
                            disabled={isLoadingVip}
                            onClick={() => {
                                setIsModalVipOpen(false);
                                setFormVip({ namaTamu: "", asalInstansi: "", tujuan: "" });
                            }}
                        >
                            Batal
                        </Button>
                        <Button 
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={isLoadingVip || !formVip.namaTamu || !formVip.asalInstansi}
                            onClick={handleDaftarVip} // <--- PAKAI FUNGSI YANG UDAH LU BIKIN DI ATAS
                        >
                            {isLoadingVip ? "Memproses..." : "Proses Check-in VIP"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div> // Penutup div utama dashboard
    );
} // Penutup function SatpamDashboard