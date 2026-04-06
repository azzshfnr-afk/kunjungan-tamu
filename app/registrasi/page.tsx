"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

function PanduanK3({ open, onOpenChange, onAgree }: { open: boolean; onOpenChange: (open: boolean) => void; onAgree: () => void }) {
    const daftarAturan = [
        { icon: "🦺", judul: "Alat Pelindung Diri (APD)", isi: "Tamu wajib menggunakan APD yang disediakan (helm, rompi, dan sepatu safety) saat memasuki area produksi." },
        { icon: "🚭", judul: "Dilarang Merokok", isi: "Dilarang keras merokok di seluruh area pabrik kecuali di tempat yang telah ditentukan." },
        { icon: "📵", judul: "Pembatasan Perangkat Elektronik", isi: "Penggunaan kamera dan perekam tanpa izin dilarang. Ponsel hanya boleh digunakan di area yang diizinkan." },
        { icon: "🚶", judul: "Ikuti Jalur yang Ditentukan", isi: "Tamu wajib mengikuti jalur pejalan kaki yang telah ditandai dan tidak memasuki area terlarang." },
        { icon: "🆘", judul: "Prosedur Darurat", isi: "Jika terjadi keadaan darurat, segera ikuti instruksi petugas dan menuju titik kumpul terdekat." },
        { icon: "🔒", judul: "Kerahasiaan Informasi", isi: "Segala informasi yang diperoleh selama kunjungan bersifat rahasia dan tidak boleh disebarluaskan." },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 bg-gradient-to-br from-green-800 to-green-600 text-white text-center">
                    <div className="text-4xl mb-2 flex justify-center">⚠️</div>
                    <DialogTitle className="text-xl font-bold mb-1 text-center text-white">Panduan K3</DialogTitle>
                    <p className="text-sm opacity-90 text-center">Keselamatan & Kesehatan Kerja</p>
                </DialogHeader>

                <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4 bg-gray-50">
                    {daftarAturan.map((aturan, index) => (
                        <div key={index} className="flex gap-4 p-4 rounded-xl bg-white border border-green-100 shadow-sm">
                            <div className="text-2xl shrink-0">{aturan.icon}</div>
                            <div>
                                <strong className="text-sm text-green-800 block mb-1">{aturan.judul}</strong>
                                <p className="text-xs text-gray-600 leading-relaxed">{aturan.isi}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="p-5 bg-white border-t border-gray-200 flex justify-end gap-3 sm:justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                    <Button className="bg-green-600 text-white hover:bg-green-700 shadow-md" onClick={onAgree}>
                        Setuju & Lanjutkan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-200 py-3 sticky top-0 z-[100]">
            <div className="max-w-[900px] mx-auto px-6 flex items-center gap-3">
                <Image src="/logo.png" alt="Logo PT Pupuk Kujang" width={80} height={40} className="object-contain" priority />
                <span className="font-bold text-base text-gray-800">Registrasi Kunjungan Tamu</span>
                <span className="text-xs text-gray-500 border-l border-gray-200 pl-2.5">PT Pupuk Kujang</span>
            </div>
        </nav>
    );
}

function KomponenStep({ posisiHalaman }: { posisiHalaman: number }) {
    const namaStep = ["Data Tamu", "Detail Kunjungan", "Konfirmasi"];
    
    return (
        <div className="flex px-8 pt-7 pb-6 border-b border-gray-100">
            {namaStep.map((nama, index) => {
                const nomorStep = index + 1;
                const sudahSelesai = posisiHalaman > nomorStep;
                const sedangAktif = posisiHalaman === nomorStep;
                
                return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 relative">
                        {index < namaStep.length - 1 && (
                            <div className={`absolute top-4 left-[50%] w-full h-0.5 z-0 transition-colors duration-300 ${sudahSelesai ? 'bg-green-600' : 'bg-gray-200'}`} />
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold relative z-10 transition-all duration-300
                            ${sudahSelesai ? 'bg-green-800 text-white' : sedangAktif ? 'bg-green-600 text-white shadow-[0_0_0_4px_#dcfce7]' : 'bg-gray-200 text-gray-500'}`}>
                            {sudahSelesai ? "✓" : nomorStep}
                        </div>
                        <span className={`text-xs text-center transition-colors duration-300 ${sedangAktif ? 'font-semibold text-green-600' : 'font-medium text-gray-500'}`}>
                            {nama}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function TabelKonfirmasi({ label, nilai }: { label: string; nilai: any }) {
    return (
        <div className="flex justify-between text-sm py-1.5 gap-2">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-right text-gray-800">{nilai}</span>
        </div>
    );
}

export default function HalamanRegistrasi() {
    const [posisiHalaman, setPosisiHalaman] = useState(1);
    const [PanduanK3Tampil, setPanduanK3Tampil] = useState(false);
    const [sudahSetujuK3, setSudahSetujuK3] = useState(false);
    const [jikaRombongan, setJikaRombongan] = useState(false);
    const [berhasilSubmit, setBerhasilSubmit] = useState(false);
    const [sedangLoading, setSedangLoading] = useState(false);

    const [dataForm, setDataForm] = useState({
        namaTamu: "", asalInstansi: "", email: "", noTelp: "", karyawanDituju: "",
        departemen: "", tujuanKunjungan: "", tanggalKunjungan: "", jamKunjungan: "",
        anggotaRombongan: [{ nama: "", email: ""}],
    });

    const ubahField = (namaField: string, nilai: any) => setDataForm(d => ({ ...d, [namaField]: nilai }));
    const ubahAnggota = (index: number, namaField: string, nilai: string) => {
        setDataForm(d => {
            const arr = [...d.anggotaRombongan];
            arr[index] = { ...arr[index], [namaField]: nilai };
            return { ...d, anggotaRombongan: arr };
        });
    };
    const hapusAnggota = (index: number) => setDataForm(d => ({ ...d, anggotaRombongan: d.anggotaRombongan.filter((_, i) => i !== index) }));
    const tambahAnggota = () => setDataForm(d => ({ ...d, anggotaRombongan: [...d.anggotaRombongan, { nama: "", email: "" }] }));

    const validasiStep1 = () => {
        if (!dataForm.namaTamu) return alert("Nama tamu wajib diisi!"), false;
        if (!dataForm.asalInstansi) return alert("Asal instansi wajib diisi!"), false;
        if (!dataForm.email) return alert("Email wajib diisi!"), false;
        return true;
    };

    const validasiStep2 = () => {
        if (!dataForm.karyawanDituju) return alert("Karyawan dituju wajib diisi!"), false;
        if (!dataForm.departemen) return alert("Departemen wajib dipilih!"), false;
        if (!dataForm.tujuanKunjungan) return alert("Tujuan wajib diisi!"), false;
        if (!dataForm.tanggalKunjungan) return alert("Tanggal wajib diisi!"), false;
        if (!dataForm.jamKunjungan) return alert("Waktu wajib diisi!"), false;
        if (!sudahSetujuK3) {
            alert("Anda harus menyetujui panduan K3 sebelum melanjutkan!");
            setPanduanK3Tampil(true);
            return false;
        }
        return true;
    };

    const mulaiSubmit = async () => {
        setSedangLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        setSedangLoading(false);
        setBerhasilSubmit(true);
    };

    const resetForm = () => {
        setBerhasilSubmit(false); setPosisiHalaman(1); setSudahSetujuK3(false); setJikaRombongan(false);
        setDataForm({ namaTamu: "", asalInstansi: "", email: "", noTelp: "", karyawanDituju: "", departemen: "", tujuanKunjungan: "", tanggalKunjungan: "", jamKunjungan: "", anggotaRombongan: [{ nama: "", email: "" }] });
    };

    if (berhasilSubmit) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className="max-w-[700px] mx-auto px-4 py-8 pb-16">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Registrasi Berhasil</h2>
                        <p className="text-gray-500 mb-6">Cek email <strong className="text-gray-700">{dataForm.email}</strong> untuk QR Code dan detail kunjungan.</p>
                        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-800 mb-6 inline-block">
                            ID Kunjungan: <strong>PKC-{Date.now().toString().slice(-8)}</strong>
                        </div>
                        <br />
                        <Button className="bg-green-600 hover:bg-green-700 text-white h-12 px-6" onClick={resetForm}>
                            Registrasi Baru
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <PanduanK3 
                open={PanduanK3Tampil} 
                onOpenChange={setPanduanK3Tampil} 
                onAgree={() => { setSudahSetujuK3(true); setPanduanK3Tampil(false); }} 
            />
        
            <div className="max-w-[700px] mx-auto px-4 py-8 pb-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <KomponenStep posisiHalaman={posisiHalaman} />

                    {posisiHalaman === 1 && (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Data Tamu</h2>
                            <p className="text-sm text-gray-500 mb-6">Masukkan informasi pribadi Anda sebagai perwakilan</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nama Lengkap *</Label>
                                    <Input placeholder="Masukkan nama lengkap" value={dataForm.namaTamu} onChange={e => ubahField("namaTamu", e.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Asal Instansi / Perusahaan *</Label>
                                    <Input placeholder="Contoh: PT PLN Persero" value={dataForm.asalInstansi} onChange={e => ubahField("asalInstansi", e.target.value)} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input type="email" placeholder="email@contoh.com" value={dataForm.email} onChange={e => ubahField("email", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nomor Telepon *</Label>
                                        <Input type="tel" placeholder="08xxxxxxxxxx" value={dataForm.noTelp} onChange={e => ubahField("noTelp", e.target.value)} />
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center space-x-2">
                                    <Checkbox id="rombongan" checked={jikaRombongan} onCheckedChange={(checked) => setJikaRombongan(checked as boolean)} className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                                    <Label htmlFor="rombongan" className="cursor-pointer font-medium text-gray-700">
                                        Kunjungan Rombongan (lebih dari 1 tamu)
                                    </Label>
                                </div>

                                {jikaRombongan && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-4">
                                        <h3 className="text-sm font-bold text-green-800 mb-1">Data Anggota Rombongan</h3>
                                        <p className="text-xs text-green-700 mb-4">Masukkan nama dan email setiap anggota rombongan</p>
                                    
                                        <div className="space-y-3">
                                            {dataForm.anggotaRombongan.map((anggota, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</div>
                                                    <Input placeholder="Nama lengkap" value={anggota.nama} onChange={e => ubahAnggota(index, "nama", e.target.value)} />
                                                    <Input placeholder="Email" type="email" value={anggota.email} onChange={e => ubahAnggota(index, "email", e.target.value)} />
                                                    {dataForm.anggotaRombongan.length > 1 && (
                                                        <Button variant="destructive" size="icon" className="w-9 h-9 shrink-0" onClick={() => hapusAnggota(index)}>x</Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="outline" className="w-full mt-4 border-dashed border-green-400 text-green-700 hover:bg-green-100 hover:text-green-800" onClick={tambahAnggota}>
                                            + Tambah Anggota
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                                <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => { if (validasiStep1()) setPosisiHalaman(2); }}>
                                    Selanjutnya →
                                </Button>
                            </div>
                        </div>
                    )}

                    {posisiHalaman === 2 && (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Detail Kunjungan</h2>
                            <p className="text-sm text-gray-500 mb-6">Informasi mengenai tujuan kunjungan Anda</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nama Karyawan yang Dituju *</Label>
                                        <Input placeholder="Nama karyawan" value={dataForm.karyawanDituju} onChange={e => ubahField("karyawanDituju", e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Departemen *</Label>
                                        <Select value={dataForm.departemen} onValueChange={(val) => ubahField("departemen", val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Departemen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Direksi">Direksi</SelectItem>
                                                <SelectItem value="Departemen TI">Departemen TI</SelectItem>
                                                <SelectItem value="Departemen Keuangan">Departemen Keuangan</SelectItem>
                                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tujuan Kunjungan *</Label>
                                    <Input placeholder="Ketik tujuan Anda (misal: Rapat, Audit, dll)" value={dataForm.tujuanKunjungan} onChange={e => ubahField("tujuanKunjungan", e.target.value)} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tanggal Kunjungan *</Label>
                                        <Input type="date" value={dataForm.tanggalKunjungan} onChange={e => ubahField("tanggalKunjungan", e.target.value)} min={new Date().toISOString().split("T")[0]} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Jam Kunjungan *</Label>
                                        <Input type="time" value={dataForm.jamKunjungan} onChange={e => ubahField("jamKunjungan", e.target.value)} />
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mt-6">
                                    <div className="flex gap-3 items-start mb-3">
                                        <span className="text-2xl">⚠️</span>
                                        <div className="flex-1">
                                            <strong className="text-sm text-yellow-900 block">Panduan K3 Wajib Dibaca</strong>
                                            <p className="text-xs text-yellow-800 mt-1">Sebelum memasuki area PT Pupuk Kujang, Anda wajib membaca dan menyetujui panduan K3.</p>
                                        </div>
                                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white shrink-0" onClick={() => setPanduanK3Tampil(true)}>
                                            Baca Panduan
                                        </Button>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-yellow-200">
                                        <Checkbox id="k3-agree" checked={sudahSetujuK3} onCheckedChange={() => sudahSetujuK3 ? setSudahSetujuK3(false) : setPanduanK3Tampil(true)} className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                                        <Label htmlFor="k3-agree" className="cursor-pointer text-yellow-900 font-medium">
                                            Saya telah membaca dan menyetujui panduan K3
                                        </Label>
                                        {sudahSetujuK3 && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">✓ Disetujui</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                                <Button variant="outline" onClick={() => setPosisiHalaman(1)}>← Sebelumnya</Button>
                                <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => { if (validasiStep2()) setPosisiHalaman(3); }}>Selanjutnya →</Button>
                            </div>
                        </div>
                    )}      

                    {posisiHalaman === 3 && (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Konfirmasi Data</h2>
                            <p className="text-sm text-gray-500 mb-6">Periksa kembali data Anda sebelum mengirim</p>

                            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 bg-white">
                                <div className="p-5 border-b border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">Data Tamu</h4>
                                    <TabelKonfirmasi label="Nama" nilai={dataForm.namaTamu} />
                                    <TabelKonfirmasi label="Asal Instansi" nilai={dataForm.asalInstansi} />
                                    <TabelKonfirmasi label="Email" nilai={dataForm.email} />
                                    <TabelKonfirmasi label="No. Telepon" nilai={dataForm.noTelp || "-"} />
                                    {jikaRombongan && <TabelKonfirmasi label="Jumlah Rombongan" nilai={`${dataForm.anggotaRombongan.length + 1} orang`} />}
                                </div>

                                <div className="p-5 border-b border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">Detail Kunjungan</h4>
                                    <TabelKonfirmasi label="Karyawan Dituju" nilai={dataForm.karyawanDituju} />
                                    <TabelKonfirmasi label="Departemen" nilai={dataForm.departemen} />
                                    <TabelKonfirmasi label="Tujuan" nilai={dataForm.tujuanKunjungan} />
                                    <TabelKonfirmasi label="Waktu Kunjungan" nilai={`${new Date(dataForm.tanggalKunjungan).toLocaleDateString("id-ID", {
                                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                                    })} - Pukul ${dataForm.jamKunjungan} WIB`} />
                                </div>

                                <div className="px-5 py-3 bg-green-50 text-green-800 text-sm font-semibold flex items-center gap-2">
                                    ✅ Panduan K3 telah disetujui
                                </div>
                            </div>

                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                                <Button variant="outline" onClick={() => setPosisiHalaman(2)}>← Sebelumnya</Button>
                                <Button className="bg-green-600 text-white hover:bg-green-700" onClick={mulaiSubmit} disabled={sedangLoading}>
                                    {sedangLoading ? "Mengirim..." : "Submit Registrasi ✓"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}