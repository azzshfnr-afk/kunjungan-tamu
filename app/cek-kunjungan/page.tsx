"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { 
    Search, QrCode, MapPin, Calendar, Users, 
    Mail, Phone, ChevronUp, Map, Building2, CreditCard, ShieldAlert 
} from "lucide-react";

export default function CekKunjunganPage() {
    const [emailSearch, setEmailSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [hasilKunjungan, setHasilKunjungan] = useState<any>(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const handleCariKunjungan = async () => {
    if (!emailSearch) return alert("Masukkan email terlebih dahulu!");
    setIsSearching(true);
    setHasilKunjungan(null);
    try {
        const response = await fetch(`/api/tamu?email=${emailSearch}`);
        const result = await response.json();
        if (response.ok && result.data) {
            const dbData = result.data;
            const rombonganValid = (dbData.anggotaRombongan || []).filter(
                (a: any) => a.nama && a.nama !== "-" && a.nama.trim() !== ""
            );
            const daftarTamu = [
                { nama: dbData.namaTamu, noUrut: 1, role: "Tamu Utama" },
                ...rombonganValid.map((a: any, index: number) => ({
                    nama: a.nama,
                    noUrut: index + 2,
                    role: "Rombongan"
                }))
            ];
            setHasilKunjungan({
                ...dbData, 
                idKunjungan: `PKC-${String(dbData.id || "").substring(0, 8).toUpperCase()}`,
                tamu: daftarTamu,
                jumlahTamu: daftarTamu.length,
            });
        } else {
            alert(result.message || "Data kunjungan tidak ditemukan.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Terjadi kesalahan saat mencari data.");
    } finally {
        setIsSearching(false);
    }
};
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar halamanAktif="cek-kunjungan" />
            <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Cek Data Kunjungan</h1>
                    <p className="text-gray-500">Masukkan email untuk melihat daftar dan status kunjungan Anda</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10 max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Input 
                                type="email" 
                                placeholder="contoh@gmail.com" 
                                className="h-12 w-full text-base"
                                value={emailSearch}
                                onChange={(e) => setEmailSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCariKunjungan()}
                            />
                        </div>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white h-12 px-8 shadow-sm"
                            onClick={handleCariKunjungan}
                            disabled={isSearching}
                        >
                            <Search className="w-4 h-4 mr-2" />
                            {isSearching ? "Mencari..." : "Cek Kunjungan"}
                        </Button>
                    </div>
                </div>

                {hasilKunjungan && (
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="font-bold text-lg text-gray-900 mb-3">Daftar Kunjungan (1)</h3>                        
                        <div className="bg-white rounded-xl shadow-sm border border-blue-600 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 tracking-wide">{hasilKunjungan.idKunjungan}</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full"> {hasilKunjungan.status} </span>
                                        <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform duration-300.${!isExpanded ? 'rotate-180' : ''}`}/>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-gray-600 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-gray-400" /> 
                                    {hasilKunjungan.departemen} - {hasilKunjungan.karyawanDituju}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-gray-400" /> 
                                    Gedung Pusat Administrasi (GPA)
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-gray-400" /> 
                                    {hasilKunjungan.jumlahTamu} Orang
                                </div>
                                <div className="flex flex-col gap-1.5 text-blue-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100 w-fit">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">In</div>
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-sm font-semibold">
                                            {new Date(hasilKunjungan.waktuCheckIn).toLocaleDateString('id-ID', { 
                                                day: 'numeric', month: 'long', year: 'numeric' 
                                            })}
                                            {" | "}
                                            {new Date(hasilKunjungan.waktuCheckIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Out</div>
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-sm font-semibold">
                                            {new Date(hasilKunjungan.waktuCheckOut).toLocaleDateString('id-ID', { 
                                                day: 'numeric', month: 'long', year: 'numeric' 
                                            })}
                                            {" | "}
                                            {new Date(hasilKunjungan.waktuCheckOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    </div>
                                </div>
                            </div>
                            </div>

                {isExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-300 ease-in-out">
                            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100">
                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                                    <Mail className="w-5 h-5 text-gray-700 shrink-0" />
                                    <span className="text-sm font-medium text-gray-800 truncate">{hasilKunjungan.email}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                                    <Phone className="w-5 h-5 text-gray-700 shrink-0" />
                                    <span className="text-sm font-medium text-gray-800">{hasilKunjungan.noTelp}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                                    <CreditCard className="w-5 h-5 text-gray-700 shrink-0" />
                                    <span className="text-sm font-medium text-gray-800">{hasilKunjungan.nik}</span>
                                </div>
                            </div>
                            <div className="p-5 border-b border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-4">Data Tamu</h4>
                                <div className="space-y-3">
                                    {hasilKunjungan.tamu.map((t: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-gray-100 text-gray-800 font-bold w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 border border-gray-200">
                                                    <span className="text-[10px] uppercase text-gray-500 leading-none mb-0.5">No</span>
                                                    <span className="text-sm leading-none">{t.noUrut}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{t.nama}</p>
                                                    <p className="text-xs text-gray-500">{t.role}</p>
                                                </div>
                                            </div>
                                            <span className="bg-green-700 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                                                Terdaftar
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50">
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-blue-50/50 text-blue-800 font-semibold text-sm">
                                        <MapPin className="w-4 h-4" /> Pos Penjagaan (Gate 1)
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <p className="text-xs text-gray-600 mb-4 leading-relaxed flex-1">
                                            Silakan menuju Gate 1 Utama PT Pupuk Kujang untuk melakukan penukaran QR Code dengan Kartu Akses NFC.
                                        </p>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                            <Map className="w-4 h-4 mr-2" /> Buka di Maps
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-yellow-200 overflow-hidden shadow-sm flex flex-col">
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-yellow-100 bg-yellow-50 text-yellow-800 font-semibold text-sm">
                                        <ShieldAlert className="w-4 h-4" /> Syarat Kunjungan
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col gap-2">
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Harap membawa <strong>KTP fisik asli</strong> yang didaftarkan pada form registrasi untuk ditukar menjadi <strong>Kartu Akses Masuk</strong>.
                                        </p>
                                        <p className="text-[11px] text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100 mt-auto">
                                            ⚠️ QR Code akan hangus (expired) jika Anda tidak tiba sebelum pukul 15.00 WIB pada hari kunjungan.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-green-500 overflow-hidden shadow-sm flex flex-col">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-green-100 bg-green-50/80 text-green-800 font-semibold text-sm">
                                        <div className="flex items-center gap-2">
                                            <QrCode className="w-4 h-4" /> QR Code Akses
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
                                        <div className="bg-white p-2 border-2 border-gray-100 rounded-xl mb-3 shadow-sm inline-block">
                                            <QRCodeSVG value={hasilKunjungan.idKunjungan} size={140} level={"H"} includeMargin={true} />
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Tunjukkan QR ini kepada petugas di Gate 1 untuk ditukar dengan Kartu Akses NFC. QR Code ini hanya berlaku untuk 1 kali scan dan akan hangus setelah digunakan.
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 mt-1">
                                            ID: {hasilKunjungan.idKunjungan}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
         )}
        </div>
    </div>
 );
}