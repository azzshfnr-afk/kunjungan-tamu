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
    ScanLine, IdCard, CheckCircle2, ShieldCheck, 
    LogOut, SearchIcon, AlertTriangle, Eye, Building, Users 
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

const DAFTAR_GEDUNG = [
    "Gedung Pusat Administrasi (GPA)",
    "Gedung Diklat",
    "Pabrik 1A",
    "Pabrik 1B",
    "Gedung MO",
    "Gedung LC"
];

const DATA_KARYAWAN: Record<string, { bet: string, nama: string }[]> = {
    "Gedung Pusat Administrasi (GPA)": [
        { bet: "PKC-101", nama: "Junaedi (TI)" },
        { bet: "PKC-102", nama: "Susi (Keuangan)" }
    ],
    "Gedung Diklat" : [
        { bet: "PKC-201", nama: "Yoyo (Pelayanan Umum)" },
        { bet: "PKC-202", nama: "Mumun (Sekretaris)" }
    ],
    "Pabrik 1A": [
        { bet: "PKC-301", nama: "Velia (Humas)" }
    ],
    "Pabrik 1B": [
        { bet: "PKC-401", nama: "Nazla (QC)" }
    ],
    "Gedung MO": [
        { bet: "PKC-501", nama: "Zihan (MPSDM)" }
    ],
    "Gedung LC": [
        { bet: "PKC-601", nama: "Bibah (Akuntansi)" }
    ]
};

export default function SatpamDashboard() {
    const [roleSatpam, setRoleSatpam] = useState<"gate1" | "area">("gate1");
    const [searchQuery, setSearchQuery] = useState(""); 

    const [stepScan, setStepScan] = useState(1);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    const [tamuTerpilih, setTamuTerpilih] = useState<any>(null);
    const [modalAction, setModalAction] = useState<"checkout" | "detail" | null>(null);

    const [selectedGedung, setSelectedGedung] = useState("");
    const [selectedKaryawan, setSelectedKaryawan] = useState("");

    const [dataTamu, setDataTamu] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTamu = async () => {
            try {
                const response = await fetch('/api/satpam/tamu');
                const result = await response.json();
                if (result.data) {
                    setDataTamu(result.data);
                }
            } catch (error) {
                console.error("Error fetching tamu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTamu();
    }, []);

    const handleCloseScanModal = (open: boolean) => {
        setIsScanModalOpen(open);
        if (!open) {
            setStepScan(1);
            setTamuTerpilih(null);
            setSelectedGedung("");
            setSelectedKaryawan(""); 
        }
    };

    const tutupModal = () => {
        setModalAction(null);
        setTamuTerpilih(null);
    };

    const handleBukaValidasi = (tamu: any) => {
        setTamuTerpilih(tamu);
        setSelectedGedung("");
        setSelectedKaryawan("");
        setStepScan(2);
        setIsScanModalOpen(true);
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="w-full max-w-7xl rounded-lg bg-white p-8 shadow-xl border border-gray-200">

                <div className="mb-4 flex items-center justify-end space-x-2 bg-gray-50 p-2 rounded-md border border-gray-200 w-fit ml-auto">
                    <Button variant={roleSatpam === "gate1" ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setRoleSatpam("gate1")}>Satpam Gate 1</Button>
                    <Button variant={roleSatpam === "area" ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setRoleSatpam("area")}>Satpam Area / Gedung</Button>
                </div>

                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard {roleSatpam === "gate1" ? "Security Gate 1" : "Security Area"}
                        </h1>
                        <p className="text-gray-600">Sistem Manajemen Pengunjung PT Pupuk Kujang</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:w-72">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Cari nama atau ID..." 
                                className="pl-9 border-gray-300 focus-visible:ring-blue-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Dialog open={isScanModalOpen} onOpenChange={handleCloseScanModal}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md" onClick={() => handleCloseScanModal(true)}>
                                    <ScanLine className="mr-2 h-5 w-5" />
                                    Scan QR Check-in
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                                <div className="bg-gray-50 p-6 border-b">
                                    <div className="flex justify-between items-center mb-4">
                                        {[1, 2, 3].map((s) => (
                                            <div key={s} className="flex items-center">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${stepScan >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                    {s}
                                                </div>
                                                {s < 3 && <div className={`w-10 h-0.5 mx-2 ${stepScan > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                                            </div>
                                        ))}
                                    </div>
                                    <DialogTitle className="text-xl">
                                        {stepScan === 1 && "Step 1: Scan QR Code"}
                                        {stepScan === 2 && "Step 2: Verifikasi Data Tamu"}
                                        {stepScan === 3 && "Step 3: Berikan Akses & NFC"}
                                    </DialogTitle>
                                </div>

                                <div className="p-6">
                                    {stepScan === 1 && (
                                        <div className="space-y-4 text-center">
                                            <div className="relative aspect-square bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-gray-800">
                                                <Scanner
                                                    onScan={(result) => {
                                                        if (result && result.length > 0) {
                                                            console.log("QR Terdeteksi:", result[0].rawValue);
                                                            if (dataTamu.length > 0) setTamuTerpilih(dataTamu[0]);
                                                            setStepScan(2);
                                                        }
                                                    }}
                                                    onError={(error) => console.error("Kamera Error:", error)}
                                                />
                                            </div>
                                            <Button variant="outline" size="sm" className="mt-2 text-[10px]" onClick={() => {
                                                if (dataTamu.length > 0) setTamuTerpilih(dataTamu[0]);
                                                setStepScan(2);
                                            }}>
                                                (Dev Mode) Lewati Scan 
                                            </Button>
                                        </div>
                                    )}

                                    {stepScan === 2 && (
                                        <div className="space-y-5">
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2">ID Kunjungan: PKC-{String(tamuTerpilih?.id || 0).padStart(4, '0')}</p>
                                                <div className="space-y-1">
                                                    <TabelKonfirmasi label="Nama Lengkap" nilai={tamuTerpilih?.namaTamu} />
                                                    <TabelKonfirmasi label="Instansi" nilai={tamuTerpilih?.asalInstansi} />
                                                    <TabelKonfirmasi label="Tujuan (Di Form)" nilai={tamuTerpilih?.tujuanKunjungan} />
                                                </div>
                                            </div>

                                            <div className="space-y-4 border-t pt-4">
                                                <div className="space-y-1.5">
                                                    <Label className="flex items-center gap-2 text-gray-700">
                                                        <Building className="w-4 h-4 text-blue-600" /> Gedung Tujuan Aktual
                                                    </Label>
                                                    <select 
                                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                                        value={selectedGedung}
                                                        onChange={(e) => {
                                                            setSelectedGedung(e.target.value);
                                                            setSelectedKaryawan(""); 
                                                        }}
                                                    >
                                                        <option value="">-- Pilih Gedung --</option>
                                                        {DAFTAR_GEDUNG.map(gedung => (
                                                            <option key={gedung} value={gedung}>{gedung}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {selectedGedung && (
                                                    <div className="space-yy-1.5 animate-in fade-in slide-in-from-top-2">
                                                        <Label className="flex items-center gap-2 text-gray-700">
                                                            <Users className="w-4 h-4 text-blue-600" /> Karyawan Dituju (Sesuai Bet)
                                                        </Label>
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2-blue-600"
                                                            value={selectedKaryawan}
                                                            onChange={(e) => setSelectedKaryawan(e.target.value)}
                                                        >
                                                            <option value="">-- Pilih Karyawan --</option>
                                                            {DATA_KARYAWAN[selectedGedung]?.map(karyawan => (
                                                                <option key={karyawan.bet} value={karyawan.bet}>
                                                                    [{karyawan.bet}] - {karyawan.nama}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button variant="outline" className="flex-1" onClick={() => setStepScan(1)}>Ulangi Scan</Button>
                                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={!selectedGedung || !selectedKaryawan} onClick={() => setStepScan(3)}>Lanjut ke Akses </Button>
                                            </div>
                                        </div>
                                    )}

                                    {stepScan === 3 && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="nfc-card" className="flex items-center text-blue-700 font-semibold">
                                                    <IdCard className="mr-2 h-4 w-4" /> Hubungkan Kartu NFC
                                                </Label>
                                                <Input id="nfc-card" placeholder="Tap kartu NFC sekarang..." autoFocus />
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-gray-700 font-semibold">Berikan Izin Akses Sesuai Tujuan</Label>
                                                <div className="space-y-2">
                                                    <div className="flex items-start space-x-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                                        <Checkbox id="akses-gate1" defaultChecked disabled className="mt-1 opacity-70" />
                                                        <div>
                                                            <Label htmlFor="akses-gate1" className="font-semibold text-blue-900">Akses Gate 1 Utama</Label>
                                                            <p className="text-xs text-blue-700 leading-snug">Wajib untuk masuk kawasan perusahaan.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex ites-start space-x-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                                        <Checkbox id="akses-area" defaultChecked className="mt-1" />
                                                        <div>
                                                            <Label htmlFor="akses-area" className="font-semibold text-blue-900 cursor-pointer">
                                                                Akses Area {selectedGedung || "Gedung Tujuan"}
                                                            </Label>
                                                            <p className="text-xs text-blue-700 leading-snug">Izin membuka portal parkir menuju {selectedGedung}. Akses ruang dalam ditentukan Satpam Area nanti.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button variant="outline" className="flex-1" onClick={() => setStepScan(2)}>Kembali</Button>
                                                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCloseScanModal(false)}>
                                                    Validasi & Selesai
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="font-semibold text-gray-900 w-[200px]">Waktu Kunjungan</TableHead>
                                <TableHead className="font-semibold text-gray-900">Nama Tamu</TableHead>
                                <TableHead className="font-semibold text-gray-900">Instansi</TableHead>
                                <TableHead className="font-semibold text-gray-900">Departemen</TableHead>
                                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                <TableHead className="font-semibold text-gray-900">ID NFC</TableHead>
                                <TableHead className="text-right font-semibold text-gray-900">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-gray-500 animate-pulse">
                                        Memuat data jadwal hari ini...
                                    </TableCell>
                                </TableRow>
                            ) : dataTamu.filter(tamu => tamu.namaTamu.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                                        Tidak ada jadwal tamu untuk hari ini
                                    </TableCell>
                                </TableRow>
                            ) : (
                                dataTamu
                                .filter(tamu => tamu.namaTamu.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((tamu) => {
                                    const statusStyle = tamu.status === "Menunggu Kedatangan"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : tamu.status === "Di Dalam Area"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200";

                                    const dateObj = new Date(tamu.waktuCheckIn);
                                    const formatTanggal = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                                    const formatJam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB";
                                    return (
                                        <TableRow key={tamu.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{formatTanggal}</span>
                                                    <span className="text-xs text-gray-500">{formatJam}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-gray-900">{tamu.namaTamu}</TableCell>
                                            <TableCell>{tamu.asalInstansi || "-"}</TableCell>
                                            <TableCell>{tamu.departemen || "-"}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusStyle}`}>
                                                    {tamu.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-gray-500">{tamu.nfc || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {tamu.status === "Menunggu Kedatangan" && (
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-blue-600 hover:bg-blue-700 text-white h-8" 
                                                            onClick={() => handleBukaValidasi(tamu)}
                                                        >
                                                            <ShieldCheck className="mr-1 h-4 w-4" /> Validasi
                                                        </Button>
                                                    )}
                                                    
                                                    {tamu.status === "Di Dalam Area" && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive" 
                                                            className="h-8" 
                                                            onClick={() => { 
                                                                setTamuTerpilih(tamu); 
                                                                setModalAction("checkout"); 
                                                            }}
                                                        >
                                                            <LogOut className="mr-1 h-4 w-4" /> Check-out
                                                        </Button>
                                                    )}

                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-gray-500" 
                                                        onClick={() => { 
                                                            setTamuTerpilih(tamu); 
                                                            setModalAction("detail"); 
                                                        }}
                                                    >
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

            <Dialog open={modalAction === "checkout"} onOpenChange={tutupModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Check-out Tamu: {tamuTerpilih?.nama}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <Label>Verifikasi Kepulangan (Tap NFC)</Label>
                        <Input placeholder="Tap kartu NFC di sini..." autoFocus />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={tutupModal}>Batal</Button>
                        <Button variant="destructive">Proses Check-out</Button>
                        </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={modalAction === "detail"} onOpenChange={tutupModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detail Tamu: {tamuTerpilih?.namaTamu}</DialogTitle>
                        <DialogDescription>Informasi lengkap pengunjung</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                        <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-200">
                            <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Foto Identitas (KTP)</p>
                            {tamuTerpilih?.fotoKtp ? (
                                <img
                                    src={tamuTerpilih.fotoKtp} alt={`KTP ${tamuTerpilih?.namaTamu}`} className="w-full h-auto max-h-48 object-contain rounded-lg border border-gray-300 shadow-sm bg-white" />
                            ) : (
                                <div className="w-full h-32 flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p>Gambar KTP tidak tersedia</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 border-t pt-4">
                            <TabelKonfirmasi label="Nama Lengkap" nilai={tamuTerpilih?.namaTamu} />
                            <TabelKonfirmasi label="Asal Instansi" nilai={tamuTerpilih?.asalInstansi} />
                            <TabelKonfirmasi label="NIK" nilai={tamuTerpilih?.nik} />
                            <TabelKonfirmasi label="Email" nilai={tamuTerpilih?.email} />
                            <TabelKonfirmasi label="Gambar KTP" nilai={tamuTerpilih?.ktp} />
                            <TabelKonfirmasi label="No. Telepon" nilai={tamuTerpilih?.noTelp || "-"} />
                        </div>
                    
                        <div className="p-5 border-b border-gray-100">
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">Detail Kunjungan</h4>
                            <TabelKonfirmasi label="Karyawan Dituju" nilai={tamuTerpilih?.karyawanDituju} />
                            <TabelKonfirmasi label="Departemen" nilai={tamuTerpilih?.departemen} />
                            <TabelKonfirmasi label="Tujuan Spesifik" nilai={tamuTerpilih?.tujuanKunjungan} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={tutupModal}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>  
    );
}