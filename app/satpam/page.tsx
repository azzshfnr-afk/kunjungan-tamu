"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from 'next/dynamic';
import { 
    ScanLine, IdCard, CheckCircle2, ShieldCheck, 
    LogOut, SearchIcon, AlertTriangle, Eye 
} from "lucide-react";

const Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-black flex items-center justify-center text-white text-xs">Menyiapkan Kamera...</div>
});

function TabelKonfirmasi({ label, nilai }: { label: string; nilai: any }) {
    return (
        <div className="flex justify-between text-sm py-1.5 gap-2 border-b border-gray-100/50 last:border-0">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-right text-gray-800">{nilai}</span>
        </div>
    );
}

export default function SatpamDashboard() {
    const [roleSatpam, setRoleSatpam] = useState<"gate1" | "area">("gate1");
    const [searchQuery, setSearchQuery] = useState(""); 

    const [stepScan, setStepScan] = useState(1);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    const [tamuTerpilih, setTamuTerpilih] = useState<any>(null);
    const [modalAction, setModalAction] = useState<"checkout" | "detail" | null>(null);

    const handleCloseScanModal = (open: boolean) => {
        setIsScanModalOpen(open);
        if (!open) {
            setStepScan(1);
            setTamuTerpilih(null); 
        }
    };

    const tutupModal = () => {
        setModalAction(null);
        setTamuTerpilih(null);
    };

    const dataTamu = [
        { id: 1, waktu: "09:00 WIB", nama: "Rachel Vennya", instansi: "PT Teman Baik", tujuan: "Azkia (TI)", gedung: "Gedung Pusat Administrasi (GPA)", status: "Di Dalam Area", nfc: "NFC-042", statusColor: "bg-green-100 text-green-800 border-green-200" },
        { id: 2, waktu: "-", nama: "Elzhard", instansi: "Universitas Pendidikan Indonesia", tujuan: "Junaedi (Keuangan)", gedung: "Gedung Diklat", status: "Menunggu Kedatangan", nfc: "-", statusColor: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    ];

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
                                id="search-tamu" 
                                placeholder="Cari nama atau ID..." 
                                className="pl-9 border-gray-300 focus-visible:ring-blue-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Dialog open={isScanModalOpen} onOpenChange={handleCloseScanModal}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md" onClick={() => {
                                    setTamuTerpilih(null);
                                    setStepScan(1);
                                }}>
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
                                    <DialogDescription className="sr-only">
                                        Proses check-in pengunjung menggunakan QR Code.
                                    </DialogDescription>
                                </div>

                                <div className="p-6">
                                    {stepScan === 1 && (
                                        <div className="space-y-4 text-center">
                                            <div className="relative aspect-square bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-gray-800">
                                                <Scanner
                                                    onScan={(result) => {
                                                        if (result && result.length > 0) {
                                                            console.log("QR Terdeteksi:", result[0].rawValue);
                                                            setStepScan(2);
                                                        }
                                                    }}
                                                    onError={(error) => console.error("Kamera Error:", error)}
                                                    components={{ finder: false }}
                                                    styles={{
                                                        container: { width: '100%', height: '100%' },
                                                        video: { objectFit: 'cover' }
                                                    }}
                                                />

                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="w-56 h-56 border-2 border-red-500/50 rounded-3xl relative">
                                                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-lg"></div>
                                                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-lg"></div>
                                                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-lg"></div>
                                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-lg"></div>
                                                        
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce" 
                                                             style={{ animationDuration: '3s' }}>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-3 backdrop-blur-md">
                                                    <p className="text-white text-[11px] font-medium tracking-wide">
                                                        QR CODE SCANNER ACTIVE
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-500 px-4">
                                                Arahkan kamera perangkat ke QR Code yang ada pada tiket atau HP tamu.
                                            </p>
                                            
                                            <Button variant="outline" size="sm" className="mt-2 text-[10px]" onClick={() => setStepScan(2)}>
                                                (Dev Mode) Lewati Scan →
                                            </Button>
                                        </div>
                                    )}

                                    {stepScan === 2 && (
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2">ID Kunjungan: PKC-{String(tamuTerpilih?.id || 20260414).padStart(4, '0')}</p>
                                                <div className="space-y-1">
                                                    <TabelKonfirmasi label="Nama Lengkap" nilai={tamuTerpilih?.nama || "Azkia Shafa"} />
                                                    <TabelKonfirmasi label="Instansi" nilai={tamuTerpilih?.instansi || "UPI Bandung"} />
                                                    <TabelKonfirmasi label="Tujuan Gedung" nilai={tamuTerpilih?.gedung || "Gedung Pusat Administrasi"} />
                                                    <TabelKonfirmasi label="Karyawan Dituju" nilai={tamuTerpilih?.tujuan || "Bapak Junaedi"} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" className="flex-1" onClick={() => setStepScan(1)}>Ulangi Scan</Button>
                                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setStepScan(3)}>Data Sesuai →</Button>
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
                                                <Label className="text-gray-700 font-semibold">Pilih Izin Akses:</Label>
                                                <div className="space-y-2">
                                                    {roleSatpam === "gate1" ? (
                                                        <>
                                                            <div className="flex items-start space-x-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                                                <Checkbox id="akses-gate1" defaultChecked className="mt-1" />
                                                                <div>
                                                                    <Label htmlFor="akses-gate1" className="font-semibold text-blue-900 cursor-pointer">Akses Gate 1 Utama</Label>
                                                                    <p className="text-xs text-blue-700 leading-snug">Izin melewati gerbang depan kawasan perusahaan.</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start space-x-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                                                <Checkbox id="akses-area" defaultChecked className="mt-1" />
                                                                <div>
                                                                    <Label htmlFor="akses-area" className="font-semibold text-blue-900 cursor-pointer">Akses Area {tamuTerpilih?.gedung || "Gedung"}</Label>
                                                                    <p className="text-xs text-blue-700 leading-snug">Izin membuka portal/gerbang area parkir gedung tujuan.</p>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-start space-x-3 bg-green-50/50 p-3 rounded-lg border border-green-200">
                                                            <Checkbox id="akses-lobby" defaultChecked className="mt-1" />
                                                            <div>
                                                                <Label htmlFor="akses-lobby" className="font-semibold text-green-900 cursor-pointer">Akses Lobby {tamuTerpilih?.gedung || "Gedung"}</Label>
                                                                <p className="text-xs text-green-700 leading-snug">Izin masuk ke dalam fasilitas lobby atau resepsionis gedung.</p>
                                                            </div>
                                                        </div>
                                                    )}
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
                                <TableHead className="font-semibold text-gray-900">Waktu</TableHead>
                                <TableHead className="font-semibold text-gray-900">Nama Tamu</TableHead>
                                <TableHead className="font-semibold text-gray-900">Instansi</TableHead>
                                <TableHead className="font-semibold text-gray-900">Gedung Tujuan</TableHead>
                                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                <TableHead className="font-semibold text-gray-900">ID NFC</TableHead>
                                <TableHead className="text-right font-semibold text-gray-900">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dataTamu
                                .filter(tamu => tamu.nama.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((tamu) => (
                                <TableRow key={tamu.id}>
                                    <TableCell>{tamu.waktu}</TableCell>
                                    <TableCell className="font-medium">{tamu.nama}</TableCell>
                                    <TableCell>{tamu.instansi}</TableCell>
                                    <TableCell>{tamu.gedung}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${tamu.statusColor}`}>
                                            {tamu.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-gray-500">{tamu.nfc}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {tamu.status === "Menunggu Kedatangan" && (
                                                <Button 
                                                    size="sm" 
                                                    className="bg-blue-600 hover:bg-blue-700 text-white h-8" 
                                                    onClick={() => { 
                                                        setTamuTerpilih(tamu); 
                                                        setStepScan(2); 
                                                        setIsScanModalOpen(true); 
                                                    }}
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
                            ))}
                            {dataTamu.filter(tamu => tamu.nama.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                                        Tidak ada data tamu yang cocok dengan pencarian "{searchQuery}"
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>  
                </div>
            </div>

            <Dialog open={modalAction === "checkout"} onOpenChange={tutupModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Check-out Tamu: {tamuTerpilih?.nama}</DialogTitle>
                        <DialogDescription>
                            Proses pencabutan akses tamu dari kawasan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="mb-4">
                            <Label htmlFor="verif-nfc" className="text-xs font-semibold text-gray-700 mb-1 block">Verifikasi Kepulangan (Tap NFC)</Label>
                            <Input id="verif-nfc" placeholder="Tap kartu NFC di sini..." autoFocus />
                        </div>
                        
                        {roleSatpam === "area" ? (
                            <div className="flex items-start space-x-3 bg-red-50/50 p-3 rounded-lg border border-red-100">
                                <Checkbox id="lepas-lobby" defaultChecked className="mt-1" />
                                <div>
                                    <Label htmlFor="lepas-lobby" className="font-semibold text-red-900">Cabut Akses Lobby {tamuTerpilih?.gedung}</Label>
                                    <p className="text-xs text-red-700 leading-snug">Tamu keluar dari gedung. (Akses kawasan/Gate 1 masih aktif).</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3 bg-red-50 p-3 rounded-lg border border-red-200">
                                    <Checkbox id="lepas-semua" defaultChecked className="mt-1" />
                                    <div>
                                        <Label htmlFor="lepas-semua" className="font-bold text-red-900">Cabut SEMUA Akses secara Paksa</Label>
                                        <p className="text-xs text-red-700 leading-snug mt-1">
                                            Opsi ini akan otomatis mencabut akses Lobby, Parkir, dan Gate Utama, 
                                            sekalipun tamu lupa check-out di pos {tamuTerpilih?.gedung}.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-300 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-yellow-900">Tarik NFC & Kembalikan KTP</p>
                                        <p className="text-xs text-yellow-800 mt-1">Pastikan kartu NFC ditarik kembali oleh petugas dan KTP asli dikembalikan kepada tamu.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={tutupModal}>Batal</Button>
                        <Button variant="destructive">Proses Check-out</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={modalAction === "detail"} onOpenChange={tutupModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detail Tamu: {tamuTerpilih?.nama}</DialogTitle>
                        <DialogDescription>Lihat Detail Data Tamu {tamuTerpilih?.nfc}</DialogDescription>
                    </DialogHeader>
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 bg-white">
                        <div className="p-5 border-b border-gray-100">
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">Data Tamu</h4>
                            <TabelKonfirmasi label="Nama" nilai={tamuTerpilih?.nama} />
                            <TabelKonfirmasi label="Asal Instansi" nilai={tamuTerpilih?.instansi} />
                            <TabelKonfirmasi label="NIK" nilai={tamuTerpilih?.nik} />
                            <TabelKonfirmasi label="Email" nilai={tamuTerpilih?.email} />
                            <TabelKonfirmasi label="Gambar KTP" nilai={tamuTerpilih?.ktp} />
                            <TabelKonfirmasi label="No. Telepon" nilai={tamuTerpilih?.noTelp || "-"} />
                        </div>
                        <div className="p-5 border-b border-gray-100">
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">Detail Kunjungan</h4>
                            <TabelKonfirmasi label="Karyawan Dituju" nilai={tamuTerpilih?.tujuan} />
                            <TabelKonfirmasi label="Lokasi Gedung" nilai={tamuTerpilih?.gedung} />
                            <TabelKonfirmasi label="Departemen" nilai={tamuTerpilih?.departemen} />
                            <TabelKonfirmasi label="Tujuan" nilai={tamuTerpilih?.tujuan} />
                            <TabelKonfirmasi label="Waktu" nilai={tamuTerpilih?.tanggal | tamuTerpilih?.jam} />
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