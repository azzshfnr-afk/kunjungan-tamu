"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from 'next/dynamic';
import { 
    ScanLine, CreditCard, ShieldCheck, LogOut, SearchIcon, 
    Eye, Building, Users, MapPin, DoorOpen, DoorClosed, QrCode, LogIn
} from "lucide-react";

const Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-black flex items-center justify-center text-white text-xs">Menyiapkan Kamera...</div>
});
function TabelKonfirmasi({ label, nilai }: { label: string; nilai: any }) {
    return (
        <div className="flex justify-between text-sm py-1.5 gap-2 border-b border-gray-100/50 last:border-0">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-right text-gray-800">{nilai || "-"}</span>
        </div>
    );
}
const DAFTAR_GEDUNG = ["Gedung Pusat Administrasi (GPA)", "Gedung Diklat", "Pabrik 1A", "Pabrik 1B", "Gedung MO", "Gedung LC"];
const DATA_KARYAWAN: Record<string, { bet: string, nama: string }[]> = {
    "Gedung Pusat Administrasi (GPA)": [{ bet: "PKC-101", nama: "Junaedi (TI)" }, { bet: "PKC-102", nama: "Susi (Keuangan)" }],
    "Gedung Diklat" : [{ bet: "PKC-201", nama: "Yoyo (Pelum)" }, { bet: "PKC-202", nama: "Mumun (Sekretaris)" }],
    "Pabrik 1A": [{ bet: "PKC-301", nama: "Velia (Humas)" }],
    "Pabrik 1B": [{ bet: "PKC-401", nama: "Nazla (QC)" }],
    "Gedung MO": [{ bet: "PKC-501", nama: "Zihan (MPSDM)" }],
    "Gedung LC": [{ bet: "PKC-601", nama: "Bibah (Akuntansi)" }]
};
export default function SatpamDashboard() {
    const [roleSatpam, setRoleSatpam] = useState<"gateUtama" | "area">("gateUtama");
    const [lokasiArea, setLokasiArea] = useState("Gedung Diklat"); 
    const [searchQuery, setSearchQuery] = useState(""); 
    const [stepScan, setStepScan] = useState(1);
    const [modalAction, setModalAction] = useState<"checkin" | "checkout" | "detail" | "scan_checkout" | null>(null);
    const [tamuTerpilih, setTamuTerpilih] = useState<any>(null);
    const [selectedGedung, setSelectedGedung] = useState("");
    const [selectedKaryawan, setSelectedKaryawan] = useState("");
    const [uidNfc, setUidNfc] = useState("");
    const [aksesBeri, setAksesBeri] = useState({ gateUtama: true, gateParkir: true });
    const [aksesLepas, setAksesLepas] = useState({ gateUtama: true, gateParkir: true, gateLobby: true });
    const [dataTamu, setDataTamu] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchTamu = async () => {
            try {
                const response = await fetch('/api/satpam/tamu');
                const result = await response.json();
                if (result.data) setDataTamu(result.data);
            } catch (error) {
                console.error("Error fetching tamu:", error);
            } finally {
                setIsLoading(false);
            }};
        fetchTamu();
    }, []);
    const updateStatusTamu = async (id: string, statusBaru: string, akses: string, uidCard?: string, lokasi?: string) => {
        setDataTamu(prev => prev.map(t => t.id === id ? { ...t, statusKunjungan: statusBaru, aksesAktif: akses } : t));
        try {
            await fetch('/api/satpam/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: id, 
                    statusKunjungan: statusBaru, 
                    aksesAktif: akses,
                    uidNfc: uidCard,    
                    lokasiTap: lokasi   
                }),
            });
        } catch (error) {
            console.error("Error updating database:", error);
        }};
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
    const handleLepasSemuaAkses = () => {
        setAksesLepas({ gateUtama: true, gateParkir: true, gateLobby: true });
    };
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="w-full max-w-7xl rounded-lg bg-white p-8 shadow-xl border border-gray-200">
                    <div className="mb-4 flex flex-wrap items-center justify-end gap-2 bg-gray-50 p-2 rounded-md border border-gray-200 w-fit ml-auto">
                    <span className="text-xs text-gray-500 font-medium">Mode Satpam:</span>
                    <Button variant={roleSatpam === "gateUtama" ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setRoleSatpam("gateUtama")}>Gate Utama</Button>
                    <Button variant={roleSatpam === "area" ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setRoleSatpam("area")}>Area/Gedung</Button>
                    {roleSatpam === "area" && (
                        <select className="h-7 text-xs rounded border-gray-300 bg-white px-2" value={lokasiArea} onChange={(e) => setLokasiArea(e.target.value)}>
                            {DAFTAR_GEDUNG.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    )}
                </div>
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900"> Dashboard {roleSatpam === "gateUtama" ? "Security Gate Utama" : `Security Area (${lokasiArea})`} </h1>
                        <p className="text-gray-600">Sistem Manajemen Pengunjung PT Pupuk Kujang</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Cari nama tamu..." className="pl-9 h-9 text-sm border-gray-300" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-9" onClick={() => { setStepScan(1); setModalAction("checkin"); }}>
                            <ScanLine className="mr-2 h-4 w-4" /> Scan Check-in
                        </Button>
                        <Button variant="destructive" className="w-full sm:w-auto h-9" onClick={() => { setStepScan(1); setModalAction("scan_checkout"); }}>
                            <QrCode className="mr-2 h-4 w-4" /> Scan Check-out
                        </Button>
                    </div>
                </div>
                <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="font-semibold text-gray-900 w-[150px]">Tanggal</TableHead>
                                <TableHead className="font-semibold text-gray-900">Nama Tamu</TableHead>
                                <TableHead className="font-semibold text-gray-900">Tujuan</TableHead>
                                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                <TableHead className="text-center font-semibold text-gray-900">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500 animate-pulse">Memuat data...</TableCell></TableRow>
                            ) : dataTamu.filter(t => t.namaTamu.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-6 text-gray-500">Tidak ada jadwal tamu</TableCell></TableRow>
                            ) : (
                                dataTamu
                                .filter(t => t.namaTamu.toLowerCase().includes(searchQuery.toLowerCase()))
                                .filter(t => t.statusKunjungan !== "Menunggu" && t.statusKunjungan !== "MENUNGGU_GATE_UTAMA")
                                .map((tamu) => {
                                    const st = tamu.statusKunjungan || "MENUNGGU"; 
                                    let bg = "bg-gray-100 text-gray-800"; let txt = st;
                                    if (st === "Menunggu") { bg = "bg-yellow-100 text-yellow-800"; txt = "Menunggu Kedatangan"; }
                                    else if (st === "Check-in") { bg = "bg-blue-100 text-blue-800"; txt = "Check-in"; }
                                    else if (st === "Check-in Area") { bg = "bg-green-100 text-green-800"; txt = "Di Dalam Area/Gedung"; }
                                    else if (st === "Check-out") { bg = "bg-red-100 text-red-800"; txt = "Check-out (Selesai)"; }
                                    const tgl = new Date(tamu.waktuCheckIn || tamu.tanggalCheckIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                    return (
                                        <TableRow key={tamu.id}>
                                            <TableCell className="font-medium text-gray-900">{tgl}</TableCell>
                                            <TableCell className="font-bold text-gray-900">{tamu.namaTamu}</TableCell>
                                            <TableCell>{tamu.gedungTujuan || tamu.tujuanKunjungan || "-"}</TableCell>
                                            <TableCell><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${bg}`}>{txt}</span></TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center items-center gap-1.5 flex-wrap">
                                                    {roleSatpam === "gateUtama" && (
                                                        <>
                                                            {st === "Menunggu" && (
                                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs" onClick={() => { setTamuTerpilih(tamu); setStepScan(2); setModalAction("checkin"); }}>
                                                                    <LogIn className="mr-1 h-3 w-3" /> Check-in
                                                                </Button>
                                                            )}
                                                            {(st !== "Check-in" && st !== "Check-in Area") && (
                                                                <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => { setTamuTerpilih(tamu); setStepScan(2); setModalAction("checkout"); }}>
                                                                    <LogOut className="mr-1 h-3 w-3" /> Check-out
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                    {roleSatpam === "area" && (
                                                        <>
                                                            {st === "Check-in" && (
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => { setTamuTerpilih(tamu); setStepScan(2); setModalAction("checkin"); }}>
                                                                    <LogIn className="mr-1 h-3 w-3" /> Masuk Area
                                                                </Button>
                                                            )}
                                                                <Button size="sm" variant="destructive" className="h-8 text-xs" disabled={st !== "Check-in Area"} onClick={() => { setTamuTerpilih(tamu); setModalAction("checkout"); }}>
                                                                    <LogOut className="mr-1 h-3 w-3" /> Keluar Area
                                                                </Button>
                                                        </>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 bg-gray-100 hover:bg-gray-200" onClick={() => { setTamuTerpilih(tamu); setModalAction("detail"); }}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
                    <div className="bg-gray-50 p-6 border-b">
                        <DialogTitle className="text-xl">
                            {roleSatpam === "gateUtama" ? "Check-in Gate Utama" : `Check-in Area (${lokasiArea})`}
                        </DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            {stepScan === 1 ? "Step 1: Scan QR Tamu" : stepScan === 2 ? "Step 2: Konfirmasi Data" : "Step 3: Tap Kartu NFC & Beri Akses"}
                        </p>
                    </div>
                    <div className="p-6">
                        {stepScan === 1 && (
                            <div className="space-y-4 text-center">
                                <div className="relative aspect-square bg-black rounded-xl overflow-hidden">
                                <Scanner onScan={(result) => { if (result && result.length > 0) {
                                    const qrValue = result[0].rawValue;
                                    const tamuFound = dataTamu.find(t => t.id.toString() === qrValue);
                                    if (tamuFound) {
                                        setTamuTerpilih(tamuFound);
                                        setStepScan(2);
                                    } else {
                                        console.log("Isi QR:", qrValue);
                                        alert(`Data tamu tidak ditemukan! (QR: ${qrValue})`);
                                    }}
                                }} />
                                </div>
                                <Button variant="outline" size="sm" className="mt-2 text-[10px]" onClick={() => { if(dataTamu.length>0) setTamuTerpilih(dataTamu[0]); setStepScan(2); }}>(Dev) Lewati Scan</Button>
                            </div>
                        )}
                        {stepScan === 2 && roleSatpam === "gateUtama" && (
                            <div className="space-y-5">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-1">
                                    <TabelKonfirmasi label="Nama Lengkap" nilai={tamuTerpilih?.namaTamu} />
                                    <TabelKonfirmasi label="No. Identitas (NIK)" nilai={tamuTerpilih?.nik || tamuTerpilih?.noKtp} />
                                    <TabelKonfirmasi label="No. Handphone" nilai={tamuTerpilih?.noTelp} />
                                    <TabelKonfirmasi label="Instansi/Asal" nilai={tamuTerpilih?.asalInstansi} />
                                    <TabelKonfirmasi label="Tujuan Awal" nilai={tamuTerpilih?.tujuanKunjungan} />
                                </div>
                                <div className="space-y-4 border-t pt-4">
                                    <div className="space-y-1.5">
                                        <Label>Gedung Tujuan Aktual</Label>
                                        <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm" value={selectedGedung} onChange={(e) => { setSelectedGedung(e.target.value); setSelectedKaryawan(""); }}>
                                            <option value="">-- Pilih Gedung --</option>
                                            {DAFTAR_GEDUNG.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    {selectedGedung && (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                            <Label>Karyawan Dituju</Label>
                                            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm" value={selectedKaryawan} onChange={(e) => setSelectedKaryawan(e.target.value)}>
                                                <option value="">-- Pilih Karyawan --</option>
                                                {DATA_KARYAWAN[selectedGedung]?.map(k => <option key={k.bet} value={k.bet}>{k.nama} ({k.bet})</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStepScan(1)}>Sebelumnya</Button>
                                    <Button className="w-2/3 bg-blue-600 hover:bg-blue-700" disabled={!selectedGedung || !selectedKaryawan} onClick={() => setStepScan(3)}>Lanjut ke NFC</Button>
                                </div>
                            </div>
                        )}
                        {stepScan === 2 && roleSatpam === "area" && (
                            <div className="space-y-5">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <TabelKonfirmasi label="Nama Lengkap" nilai={tamuTerpilih?.namaTamu} />
                                    <TabelKonfirmasi label="Status Saat Ini" nilai={tamuTerpilih?.statusKunjungan} />
                                </div>
                                <p className="text-sm text-gray-600">Pastikan tamu memang memiliki keperluan untuk memasuki area dalam gedung.</p>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStepScan(1)}>Sebelumnya</Button>
                                    <Button className="w-2/3 bg-green-600 hover:bg-green-700" onClick={() => setStepScan(3)}>Berikan Akses Lobby</Button>
                                </div>
                            </div>
                        )}
                        {stepScan === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center font-semibold"><CreditCard className="mr-2 h-4 w-4" /> Tap Kartu NFC</Label>
                                    <Input 
                                        placeholder="Tap kartu di alat pembaca..." 
                                        autoFocus 
                                        value={uidNfc}
                                        onChange={(e) => setUidNfc(e.target.value)} />
                                    <p className="text-[10px] text-gray-500">*Pastikan kursor berada di kotak ini saat menempelkan kartu ke alat pembaca.</p>
                                </div>                              
                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                    <Label className="font-semibold text-blue-900 mb-3 block">Opsi Akses Diberikan:</Label>
                                    {roleSatpam === "gateUtama" ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="beri-utama" checked={aksesBeri.gateUtama} onCheckedChange={(c) => setAksesBeri({...aksesBeri, gateUtama: !!c})} />
                                                <Label htmlFor="beri-utama" className="cursor-pointer text-sm font-medium">Masuk Gate Utama</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="beri-parkir" checked={aksesBeri.gateParkir} onCheckedChange={(c) => setAksesBeri({...aksesBeri, gateParkir: !!c})} />
                                                <Label htmlFor="beri-parkir" className="cursor-pointer text-sm font-medium">Masuk Gate Parkir {selectedGedung}</Label>
                                            </div>
                                        </div>
                                    ) : (
                                        <ul className="list-disc ml-5 text-sm text-blue-800">
                                            <li>Akses Gate Lobby {lokasiArea}</li>
                                        </ul>
                                    )}
                                </div>                               
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStepScan(2)}>Sebelumnya</Button>
                                    <Button className="w-2/3 bg-blue-600 hover:bg-blue-700" onClick={() => { 
                                        if(tamuTerpilih) {
                                            if(roleSatpam === "gateUtama") {
                                                if (!uidNfc) {
                                                    alert("Harap tap kartu NFC terlebih dahulu!");
                                                    return;
                                                }
                                                let aksesArr = [];
                                                if(aksesBeri.gateUtama) aksesArr.push("GATE_UTAMA");
                                                if(aksesBeri.gateParkir) aksesArr.push(`PARKIR_${selectedGedung}`);
                                                updateStatusTamu(tamuTerpilih.id, "Check-in", aksesArr.join(","), uidNfc, "Gate Utama Masuk");
                                            }
                                            if(roleSatpam === "area") {
                                                updateStatusTamu(tamuTerpilih.id, "Check-in Area", tamuTerpilih.aksesAktif + `,LOBBY_${lokasiArea}`, uidNfc || undefined, `Lobby ${lokasiArea} Masuk`);
                                            }}
                                        tutupModal(); 
                                    }}>Selesai & Simpan</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={modalAction === "scan_checkout"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Scan Check-out {roleSatpam === "gateUtama" ? "Gate Utama" : "Area"}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-square bg-black rounded-xl overflow-hidden">
                        <Scanner onScan={(result) => { if (result && result.length > 0) { 
                            const qrValue = result[0].rawValue;
                            const tamuFound = dataTamu.find(t => t.id.toString() === qrValue);
                            if (tamuFound) {
                                setTamuTerpilih(tamuFound);
                                setStepScan(2);
                                setModalAction("checkout");
                            } else {
                                console.log("Isi QR:", qrValue);
                                alert(`Data tamu tidak ditemukan! (QR: ${qrValue})`);
                            }}
                    }} />
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 text-[10px] w-full" onClick={() => { if(dataTamu.length>0) setTamuTerpilih(dataTamu[0]); setStepScan(2); setModalAction("checkout"); }}>(Dev) Lewati Kamera</Button>
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
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">Pilih akses yang ingin dilepas dari kartu tamu ini:</p>
                                    <div className="space-y-3 bg-gray-50 p-4 rounded border">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="chk-utama" checked={aksesLepas.gateUtama} onCheckedChange={(c) => setAksesLepas({...aksesLepas, gateUtama: !!c})} />
                                            <Label htmlFor="chk-utama" className="cursor-pointer">Gate Utama</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="chk-parkir" checked={aksesLepas.gateParkir} onCheckedChange={(c) => setAksesLepas({...aksesLepas, gateParkir: !!c})} />
                                            <Label htmlFor="chk-parkir" className="cursor-pointer">Gate Parkir Gedung</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="chk-lobby" checked={aksesLepas.gateLobby} onCheckedChange={(c) => setAksesLepas({...aksesLepas, gateLobby: !!c})} />
                                            <Label htmlFor="chk-lobby" className="cursor-pointer">Gate Lobby (Area)</Label>
                                        </div>
                                    </div>
                                    <Button variant="secondary" className="w-full text-xs" onClick={handleLepasSemuaAkses}>Pilih Semua (Lepas Keseluruhan)</Button>
                                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => setStepScan(3)}>Lanjut Tap NFC</Button>
                                </div>
                            )}
                            {stepScan === 3 && (
                                <div className="space-y-4 py-2">
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <Label className="text-red-800 font-semibold mb-2 block">Tap NFC untuk Melepas Akses</Label>
                                        <Input 
                                            className="border-red-300 focus-visible:ring-red-500" 
                                            placeholder="Tap kartu NFC di sini..." 
                                            autoFocus 
                                            value={uidNfc}
                                            onChange={(e) => setUidNfc(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => setStepScan(2)}>Kembali</Button>
                                        <Button variant="destructive" className="flex-1" onClick={() => {
                                            updateStatusTamu(tamuTerpilih.id, "Check-out", "NONAKTIF", uidNfc, "Gate Utama Keluar");
                                            tutupModal();
                                        }}>Selesaikan Check-out</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {roleSatpam === "area" && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-gray-600">Cabut izin akses Gate Lobby untuk tamu ini. Tamu tetap bisa menggunakan akses lain untuk keluar kawasan.</p>
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <Label className="text-orange-800 font-semibold mb-2 block">Tap NFC untuk Cabut Akses Lobby</Label>
                                <Input 
                                    className="border-orange-300 focus-visible:ring-orange-500" 
                                    placeholder="Tap kartu NFC di sini..." 
                                    autoFocus 
                                    value={uidNfc}
                                    onChange={(e) => setUidNfc(e.target.value)}
                                />
                            </div>
                            <DialogFooter className="mt-4">
                                <Button variant="outline" onClick={tutupModal}>Batal</Button>
                                <Button variant="destructive" onClick={() => {
                                    updateStatusTamu(tamuTerpilih.id, "Check-in", tamuTerpilih.aksesAktif.replace(`,LOBBY_${lokasiArea}`,''), uidNfc, `Lobby ${lokasiArea} Keluar`);
                                    tutupModal();
                                }}>Cabut Akses & Selesai</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={modalAction === "detail"} onOpenChange={(open) => !open && tutupModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Detail Tamu: {tamuTerpilih?.namaTamu}</DialogTitle></DialogHeader>
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                        {tamuTerpilih?.fotoKtp ? (
                            <img src={tamuTerpilih.fotoKtp} alt="Foto KTP" className="w-full h-auto max-h-48 object-contain rounded-lg border border-gray-300 shadow-sm bg-gray-50" />
                        ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-300">Tidak ada foto KTP</div>
                        )}
                        <div className="space-y-1 pt-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <TabelKonfirmasi label="Nama Lengkap" nilai={tamuTerpilih?.namaTamu} />
                            <TabelKonfirmasi label="No. Identitas (NIK)" nilai={tamuTerpilih?.nik || tamuTerpilih?.noKtp} />
                            <TabelKonfirmasi label="No. Handphone" nilai={tamuTerpilih?.noTelp} />
                            <TabelKonfirmasi label="Instansi/Asal" nilai={tamuTerpilih?.asalInstansi} />
                            <TabelKonfirmasi label="Tujuan Kunjungan" nilai={tamuTerpilih?.tujuanKunjungan} />
                            <TabelKonfirmasi label="Gedung Aktual" nilai={tamuTerpilih?.gedungTujuan} />
                            <div className="border-t border-gray-200 mt-2 pt-2"></div>
                            <TabelKonfirmasi label="Status" nilai={tamuTerpilih?.statusKunjungan || "MENUNGGU GATE UTAMA"} />
                            <TabelKonfirmasi label="Akses Aktif" nilai={tamuTerpilih?.aksesAktif || "Belum Ada"} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>  
    );
}