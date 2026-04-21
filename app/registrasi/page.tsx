"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileUploader } from "react-drag-drop-files";
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
const fileTypes = ["JPG", "PNG", "JPEG"];
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, User, Building } from "lucide-react";

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
        <div className="flex justify-between text-sm py-1.5 gap-2 border-b border-gray-50 last:border-0">
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
    const [idKunjungan, setIdKunjungan] = useState("");
    const [sedangLoading, setSedangLoading] = useState(false);
    const [fotoTamu, setFotoTamu] = useState<any>(null);

    const handleUploadFoto = (file: any) => {
        setFotoTamu(URL.createObjectURL(file));
    };

    const [dataForm, setDataForm] = useState({
        namaTamu: "", asalInstansi: "", email: "", noTelp: "", nik: "", ktp: null as File | null, 
        karyawanDituju: "", departemen: "", tujuanKunjungan: "", tanggalCheckIn: "", jamCheckIn: "", tanggalCheckOut: "", jamCheckOut: "",
        anggotaRombongan: [{ nama: "", email: "", noTelp: "", gunakanEmailUtama: false}],
    });

    const ubahField = (namaField: string, nilai: any) => {
        if (namaField === "namaTamu" || namaField === "karyawanDituju") {
            nilai = nilai.replace(/[^a-zA-Z\s]/g, "");
        }

        if (namaField === "noTelp" || namaField === "nik") {
            nilai = nilai.replace(/|D/g, "");
        }

        if (namaField === "nik" && nilai.length > 16) {
            nilai = nilai.slice(0, 16);
        }

        setDataForm(d => {
            const dataBaru = { ...d, [namaField]: nilai};

            if (namaField === "email") {
                dataBaru.anggotaRombongan = dataBaru.anggotaRombongan.map(anggota =>
                    anggota.gunakanEmailUtama ? { ...anggota, email: nilai } : anggota
                );
            }
            return dataBaru;
        });
    };

    const ubahAnggota = (index: number, namaField: string, nilai: string | boolean) => {
        if (typeof nilai === "string") {
            if (namaField === "nama") nilai = nilai.replace(/[^a-zA-Z\s]/g, "");
            if (namaField === "noTelp") nilai = nilai.replace(/\D/g, "");
        }

        setDataForm(d => {
            const arr = [...d.anggotaRombongan];
            arr[index] = { ...arr[index], [namaField]: nilai };

            if (namaField === "gunakanEmailUtama" && nilai === true) {
                arr[index].email = d.email;
            }
            else if (namaField === "gunakanEmailUtama" && nilai === false) {
                arr[index].email = "";
            }
            return { ...d, anggotaRombongan: arr };
        });
    };
    const hapusAnggota = (index: number) => setDataForm(d => ({ ...d, anggotaRombongan: d.anggotaRombongan.filter((_, i) => i !== index) }));
    const tambahAnggota = () => setDataForm(d => ({ ...d, anggotaRombongan: [...d.anggotaRombongan, { nama: "", email: "", noTelp: "", gunakanEmailUtama: false }] }));

    const validasiStep1 = () => {
        if (!dataForm.namaTamu.trim()) return alert("Nama tamu wajib diisi!"), false;
        if (!dataForm.asalInstansi.trim()) return alert("Asal instansi wajib diisi!"), false;
        if (!dataForm.email) return alert("Email wajib diisi!"), false;
        if (!dataForm.email.includes("@")) return alert("Format email tidak valid (harus mengandung @)!"), false;
        if (!dataForm.noTelp) return alert("Nomor telepon wajib diisi!"), false;
        if (!fotoTamu) return alert("Gambar KTP wajib diunggah!"), false;
        if (!dataForm.nik) return alert("NIK wajib diisi (16 angka)!"), false;
        if (dataForm.nik.length !== 16) return alert("NIK harus 16 angka! Cek kembali NIK Anda!"), false;
        if (jikaRombongan) {
            for (let i = 0; i < dataForm.anggotaRombongan.length; i++) {
                const ang = dataForm.anggotaRombongan[i];
                if (!ang.nama.trim()) return alert(`Nama anggota rombongan ke-${i + 1} wajib diisi!`), false;
                if (!ang.email) return alert(`Email anggota rombongan ke-${i + 1} wajib diisi!`), false;
                if (!ang.email.includes("@")) return alert(`Format email anggota rombongan ke-${i + 1} tidak valid!`), false;
                if (!ang.noTelp) return alert(`Nomor telepon anggota rombongan ke-${i + 1} wajib diisi!`), false;
            }
        }

        return true;
    };

    const validasiStep2 = () => {
    if (!dataForm.karyawanDituju.trim()) return alert("Karyawan dituju wajib diisi!"), false;
    if (!dataForm.departemen) return alert("Departemen wajib dipilih!"), false;
    if (!dataForm.tujuanKunjungan.trim()) return alert("Tujuan wajib diisi!"), false;
    
    if (!dataForm.tanggalCheckIn) return alert("Tanggal Check-in wajib diisi!"), false;
    if (!dataForm.jamCheckIn) return alert("Waktu Check-in wajib diisi!"), false;
    if (!dataForm.tanggalCheckOut) return alert("Tanggal Check-out wajib diisi!"), false;
    if (!dataForm.jamCheckOut) return alert("Waktu Check-out wajib diisi!"), false;

    const checkInFull = new Date(`${dataForm.tanggalCheckIn}T${dataForm.jamCheckIn}`);
    const checkOutFull = new Date(`${dataForm.tanggalCheckOut}T${dataForm.jamCheckOut}`);

    if (checkOutFull <= checkInFull) {
        alert("Waktu Check-out harus lebih lambat dari waktu Check-in!");
        return false;
    }

    if (!sudahSetujuK3) {
        alert("Anda harus menyetujui panduan K3 sebelum melanjutkan!");
        setPanduanK3Tampil(true);
        return false;
    }
    return true;
};

    const mulaiSubmit = async (e?: any) => {
    if (e) e.preventDefault(); 
    
    setSedangLoading(true);

    const formDataBaru = new FormData();
    formDataBaru.append("namaTamu", dataForm.namaTamu);
    formDataBaru.append("email", dataForm.email);
    formDataBaru.append("asalInstansi", dataForm.asalInstansi);
    formDataBaru.append("noTelp", dataForm.noTelp);
    formDataBaru.append("nik", dataForm.nik);
    formDataBaru.append("karyawanDituju", dataForm.karyawanDituju);
    formDataBaru.append("departemen", dataForm.departemen);
    formDataBaru.append("tujuanKunjungan", dataForm.tujuanKunjungan);
    formDataBaru.append("tanggalCheckIn", dataForm.tanggalCheckIn); 
    formDataBaru.append("jamCheckIn", dataForm.jamCheckIn);
    formDataBaru.append("tanggalCheckOut", dataForm.tanggalCheckOut); 
    formDataBaru.append("jamCheckOut", dataForm.jamCheckOut);

    if (fotoTamu) {
        formDataBaru.append("ktp", fotoTamu);
    }

    if (dataForm.anggotaRombongan) {
        formDataBaru.append("anggotaRombongan", JSON.stringify(dataForm.anggotaRombongan));
    }

    try {
        const response = await fetch('/api/tamu', {
            method: 'POST',
            body: formDataBaru,
        });

        const result = await response.json();

        if (response.ok && result.data) {
            const realId = `PKC-${String(result.data.id).padStart(4, '0')}`;
            
            setIdKunjungan(realId);
            setBerhasilSubmit(true); 
        } else {
            alert(result.message || "Gagal menyimpan data pendaftaran.");
        }

    } catch (error: any) { 
        console.error("Gagal submit:", error);
        alert("Terjadi kesalahan saat menyambung ke server.");
    } finally {
        setSedangLoading(false);
    }
    };

    const resetForm = () => {
        setIdKunjungan(""); setBerhasilSubmit(false); setPosisiHalaman(1); setSudahSetujuK3(false); setJikaRombongan(false); setFotoTamu(null);
        setDataForm({ namaTamu: "", asalInstansi: "", email: "", noTelp: "", nik: "", ktp: null, karyawanDituju: "", departemen: "", tujuanKunjungan: "", tanggalCheckIn: "", jamCheckIn: "",tanggalCheckOut: "", jamCheckOut: "", anggotaRombongan: [{ nama: "", email: "", noTelp: "", gunakanEmailUtama: false }] });
    };

    if (berhasilSubmit) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar halamanAktif="registrasi"/>
                <div className="max-w-[700px] mx-auto px-4 py-8 pb-16">
                    <div className="flex flex-col items-center justify-center w-full mt-4">
                        <div className="relative w-full max-w-md bg-white border-2 border-dashed-gray-300 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-sm overflow-hidden">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="text-6xl mb-2">✅</div>
                                <h2 className="text-2xl font-bold text-gray-800">Registrasi Berhasil</h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    Cek email <strong className="text-gray-900">{dataForm.email}</strong> untuk QR Code dan detail kunjungan.
                                </p>
                            </div>

                            <div className="w-full border-t-2 border-dashed border-gray-200 my-2"></div>

                            <div className="bg-white p-2 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-100">
                                <QRCodeSVG value={idKunjungan} size={180} level={"H"} includeMargin={true}/>
                            </div>

                            <div className="bg-green-50 w-full rounded-xl p-4 border border-green-100 text-center">
                                <p className="text-sm text-green-700 mb-1">ID Kunjungan</p>
                                <p className="text-2xl font-black tracking-wider text-green-800">{idKunjungan}</p>
                            </div>

                            <p className="text-center text-sm text-gray-500 leading-relaxed px-4">
                                Tunjukkan QR Code ini kepada petugas Satpam di Gate 1 saat tiba di lokasi.
                            </p>

                            <div className="absolute top-[52%] -left-4 w-8 h-8 bg-gray-50 rounded-full border-r-2 border-dashed border-gray-300"></div>
                            <div className="absolute top-[52%] -right-4 w-8 h-8 bg-gray-50 rounded-full border-r-2 border-dashed border-gray-300"></div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white h-12 px-8 rounded-xl font-semibold shadow-md transition-all"
                                onClick={resetForm}
                            >
                                Registrasi Baru
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar halamanAktif="registrasi"/>
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
                            <p className="text-sm text-gray-500 mb-6">Masukkan informasi pribadi Anda</p>

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

                                <div className="grid grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-100">
                                    <div className="space-y-2 flex flex-col">
                                        <Label>Upload Gambar KTP</Label>
                                        <FileUploader handleChange={handleUploadFoto} name="file" types={fileTypes} >
                                            <div className="flex w-full items-center justify-center h-10 px-3 border-2 border-dashed border-blue-400 rounded-md cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                                                <span className="text-xs text-gray-600 font-medium truncate">
                                                    Pilih gambar (JPG, PNG, JPEG)
                                                </span>
                                            </div>
                                        </FileUploader>
                                        
                                        {fotoTamu && (
                                            <div className="mt-2 bg-gray-50 p-2 rounded-lg border border-gray-200 text-center">
                                                <Label className="text-[10px] text-gray-400 uppercase mb-1 block">Preview KTP</Label>
                                                <img src={fotoTamu} alt="Preview" className="max-h-20 rounded mx-auto" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 flex flex-col">
                                        <Label>NIK *</Label>
                                        <Input type="text" placeholder="3215xxxxxxxxxxxx" value={dataForm.nik} onChange={e => ubahField("nik", e.target.value)} className="h-10" />
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
                                                <div key={index} className="flex gap-2 items-start">
                                                    <div className="w-6 h-6 mt-2 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</div>

                                                    <div className="flex-1">
                                                        <Input placeholder="Nama lengkap" value={anggota.nama} onChange={e => ubahAnggota(index, "nama", e.target.value)} />
                                                    </div>
                                                    
                                                    <div className="flex-1 space-y-1.5">
                                                        <Input
                                                            className={`w-full ${anggota.gunakanEmailUtama ? 'bg-gray-100 text-gray-500' : ''}`}  placeholder="Email" type="email" value={anggota.email} onChange={e => ubahAnggota(index, "email", e.target.value)} disabled={anggota.gunakanEmailUtama}
                                                        />
                                                        <div className="flex items-center space-x-1.5 px-1">
                                                            <Checkbox
                                                                id={`samakan-email-${index}`} checked={anggota.gunakanEmailUtama} onCheckedChange={(checked) => ubahAnggota(index, "gunakanEmailUtama", checked as boolean)} className="w-3.5 h-3.5 rounded-[3px] data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                                            />
                                                            <Label htmlFor={`samakan-email-${index}`} className="text-[11px] text-gray-600 font-medium cursor-pointer">
                                                                Samakan dengan email utama
                                                            </Label>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1">
                                                        <Input className="w-full" placeholder="Nomor Telepon" type="tel" value={anggota.noTelp} onChange={e => ubahAnggota(index, "noTelp", e.target.value)} />
                                                    </div>

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
                                        <Input placeholder="Departemen" value={dataForm.departemen} onChange={e => ubahField("departemen", e.target.value)} />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="tujuan">Tujuan Kunjungan*</Label>
                                    <Textarea
                                        id="tujuan"
                                        placeholder="Ketik tujuan Anda (misal: Rapat, Audit, dll)"
                                        value={dataForm.tujuanKunjungan}
                                        onChange={e => ubahField("tujuanKunjungan", e.target.value)}
                                        className="min-h-[100px] resize-none"
                                    />
                                    <p className="text-[11px] text-gray-400 italic">
                                        * Jelaskan keperluan kunjungan Anda.
                                    </p>
                                </div>
                               <div className="space-y-4">
                                <Label className="text-base font-semibold">Jadwal Kunjungan *</Label>
                                <Card className="shadow-sm border-gray-200">
                                    <CardContent className="p-4 space-y-6">
                                        
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> Rencana Kedatangan (Check-in)
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input 
                                                    type="date" 
                                                    value={dataForm.tanggalCheckIn} 
                                                    onChange={e => ubahField("tanggalCheckIn", e.target.value)}
                                                    min={new Date().toISOString().split("T")[0]}
                                                />
                                                <Input 
                                                    type="time" 
                                                    value={dataForm.jamCheckIn} 
                                                    onChange={e => ubahField("jamCheckIn", e.target.value)} 
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4"></div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-red-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> Rencana Kepulangan (Check-out)
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input 
                                                    type="date" 
                                                    value={dataForm.tanggalCheckOut} 
                                                    onChange={e => ubahField("tanggalCheckOut", e.target.value)}
                                                    min={dataForm.tanggalCheckIn || new Date().toISOString().split("T")[0]}
                                                />
                                                <Input 
                                                    type="time" 
                                                    value={dataForm.jamCheckOut} 
                                                    onChange={e => ubahField("jamCheckOut", e.target.value)} 
                                                />
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
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

                            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 bg-white shadow-sm">
                                <div className="p-5 border-b border-gray-100">
                                    <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">Data Tamu</h4>
                                    <div className="space-y-1">
                                        <TabelKonfirmasi label="Nama Lengkap" nilai={dataForm.namaTamu} />
                                        <TabelKonfirmasi label="Asal Instansi" nilai={dataForm.asalInstansi} />
                                        <TabelKonfirmasi label="NIK" nilai={dataForm.nik} />
                                        <TabelKonfirmasi label="Email" nilai={dataForm.email} />
                                        <TabelKonfirmasi label="Upload Gambar KTP" nilai={dataForm.ktp ? dataForm.ktp.name : "Belum diunggah"} />
                                        <TabelKonfirmasi label="No. Telepon" nilai={dataForm.noTelp || "-"} />
                                        {jikaRombongan && <TabelKonfirmasi label="Jumlah Rombongan" nilai={`${dataForm.anggotaRombongan.length + 1} orang`} />}
                                        
                                        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-50">
                                            <span className="text-xs text-gray-500">Foto Identitas:</span>
                                            {fotoTamu ? (
                                                <img src={fotoTamu} alt="Foto KTP" className="h-32 w-auto rounded-lg border border-gray-100 object-contain self-start" />
                                            ) : (
                                                <span className="text-xs text-red-500 italic">Foto belum diupload</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-5 bg-gray-50/50">
                                    <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">Detail Kunjungan</h4>
                                    <div className="space-y-1">
                                        <TabelKonfirmasi label="Karyawan Dituju" nilai={dataForm.karyawanDituju} />
                                        <TabelKonfirmasi label="Departemen" nilai={dataForm.departemen} />
                                        <TabelKonfirmasi label="Tujuan" nilai={dataForm.tujuanKunjungan} />
                                        
                                        <TabelKonfirmasi 
                                            label="Check-in" 
                                            nilai={`${dataForm.tanggalCheckIn} | ${dataForm.jamCheckIn} WIB`} 
                                        />
                                        <TabelKonfirmasi 
                                            label="Check-out" 
                                            nilai={`${dataForm.tanggalCheckOut} | ${dataForm.jamCheckOut} WIB`} 
                                        />
                                        
                                        <TabelKonfirmasi label="Status K3" nilai={sudahSetujuK3 ? "Disetujui" : "Belum Disetujui"} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                                <Button variant="outline" onClick={() => setPosisiHalaman(2)} disabled={sedangLoading}>← Sebelumnya</Button>
                                <Button className="bg-green-600 text-white hover:bg-green-700 min-w-[140px]" onClick={mulaiSubmit} disabled={sedangLoading}>
                                    {sedangLoading ? "Mengirim..." : "Kirim Registrasi"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}