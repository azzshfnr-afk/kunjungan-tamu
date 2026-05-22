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
    const [hasilKunjungan, setHasilKunjungan] = useState<any[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0); 
    const handleCariKunjungan = async () => {
        if (!emailSearch) return alert("Masukkan email terlebih dahulu!");
        setIsSearching(true);
        setHasilKunjungan([]); 
        setExpandedIndex(0); 
        try {
            const response = await fetch(`/api/tamu?email=${emailSearch}`);
            const result = await response.json();
            if (response.ok && Array.isArray(result.data)) {
                const kumpulanKunjunganFormatted = result.data.map((dbData: any) => {
                    if (!dbData) return null;
                    const rombonganValid = (dbData.anggotaRombongan || []).filter(
                        (a: any) => a && a.nama && a.nama !== "-" && a.nama.trim() !== ""
                    );
                    const daftarTamu = [
                        { nama: dbData.namaTamu || "Tanpa Nama", noUrut: 1, role: "Tamu Utama" },
                        ...rombonganValid.map((a: any, index: number) => ({
                            nama: a.nama,
                            noUrut: index + 2,
                            role: "Rombongan"
                        }))
                    ];
                    return {
                        ...dbData,
                        idKunjungan: `PKC-${String(dbData.id || "").padStart(4, '0')}`, 
                        tamu: daftarTamu,
                        jumlahTamu: daftarTamu.length,
                    };
                }).filter(Boolean); 
                setHasilKunjungan(kumpulanKunjunganFormatted);
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
    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };
    const formatTanggalAman = (dateString: any) => {
        if (!dateString) return "-";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "-";
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            return "-";
        }
    };
    const formatJamAman = (dateString: any) => {
        if (!dateString) return "-";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "-";
            return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB";
        } catch (e) {
            return "-";
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

                {hasilKunjungan.length > 0 && (
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                            Daftar Riwayat Kunjungan ({hasilKunjungan.length})
                        </h3>
                        {hasilKunjungan.map((kunjungan, idx) => {
                            const isOpen = expandedIndex === idx;
                            return (
                                <div key={kunjungan.id || idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div 
                                        className="p-5 border-b border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors" 
                                        onClick={() => toggleExpand(idx)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h2 className="text-lg font-bold text-blue-600 tracking-wide">{kunjungan.idKunjungan}</h2>
                                                <p className="text-sm font-bold text-gray-800 mt-0.5">{kunjungan.namaTamu}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${
                                                    kunjungan.statusKunjungan === "Check-out" ? "bg-red-500" :
                                                    kunjungan.statusKunjungan?.includes("Check-in") ? "bg-green-600" : "bg-blue-600"
                                                }`}> 
                                                    {kunjungan.statusKunjungan || kunjungan.status || "Menunggu"} 
                                                </span>
                                                <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`}/>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-gray-600 font-medium text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="w-4 h-4 text-gray-400" /> 
                                                {kunjungan.departemen || kunjungan.divisiTujuan || "Dept"} - {kunjungan.karyawanDituju || "-"}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-gray-400" /> 
                                                {kunjungan.gedungTujuan || "-"}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-gray-400" /> 
                                                {kunjungan.jumlahTamu || 1} Orang
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-blue-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 w-full mt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-blue-600 text-white text-[9px] px-1 py-0.2 rounded font-bold uppercase">In</div>
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-semibold">
                                                        {formatTanggalAman(kunjungan.waktuCheckIn)} {kunjungan.waktuCheckIn && "|"} {formatJamAman(kunjungan.waktuCheckIn)}
                                                    </span>
                                                </div>
                                                <div className="hidden sm:block text-blue-300">|</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-red-500 text-white text-[9px] px-1 py-0.2 rounded font-bold uppercase">Out</div>
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-semibold">
                                                        {formatTanggalAman(kunjungan.waktuCheckOut)} {kunjungan.waktuCheckOut && "|"} {formatJamAman(kunjungan.waktuCheckOut)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="animate-in slide-in-from-top-2 duration-300 ease-in-out bg-white">
                                            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100">
                                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                                                    <Mail className="w-5 h-5 text-gray-700 shrink-0" />
                                                    <span className="text-sm font-medium text-gray-800 truncate">{kunjungan.email || "-"}</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                                                    <Phone className="w-5 h-5 text-gray-700 shrink-0" />
                                                    <span className="text-sm font-medium text-gray-800">{kunjungan.noTelp || "-"}</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                                                    <CreditCard className="w-5 h-5 text-gray-700 shrink-0" />
                                                    <span className="text-sm font-medium text-gray-800">{kunjungan.nik || "-"}</span>
                                                </div>
                                            </div>
                                            <div className="px-5 pt-4">
                                                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 italic border">
                                                    <span className="font-bold not-italic text-slate-500 block mb-0.5">Perihal Kunjungan:</span>
                                                    "{kunjungan.tujuanKunjungan || kunjungan.tujuanVip || "Tidak ada catatan perihal"}"
                                                </div>
                                            </div>
                                            <div className="p-5 border-b border-gray-100">
                                                <h4 className="font-bold text-gray-900 mb-3 text-sm">Data Anggota Tamu</h4>
                                                <div className="space-y-2">
                                                    {kunjungan.tamu?.map((t: any, i: number) => (
                                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-gray-100 text-gray-800 font-bold w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 border text-xs">
                                                                    <span className="text-[9px] uppercase text-gray-400 font-medium">No</span>
                                                                    <span className="leading-none mt-0.5">{t.noUrut}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-xs">{t.nama}</p>
                                                                    <p className="text-[10px] text-gray-500">{t.role}</p>
                                                                </div>
                                                            </div>
                                                            <span className="bg-green-700 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                                                                Terdaftar
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50">
                                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-blue-50/50 text-blue-800 font-semibold text-sm">
                                                        <MapPin className="w-4 h-4" /> Pos Penjagaan (Gate Utama)
                                                    </div>
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <p className="text-xs text-gray-600 mb-4 leading-relaxed flex-1">
                                                            Silakan menuju Gate Utama PT Pupuk Kujang untuk melakukan penukaran QR Code dengan Kartu Akses NFC.
                                                        </p>
                                                        <Button 
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
                                                            onClick={() => {
                                                                const lokasiStatis = "Gate Utama PT Pupuk Kujang";
                                                                const queryUrl = encodeURIComponent(lokasiStatis);
                                                                window.open(`https://maps.app.goo.gl/pbYErui1ZP4aZvvM9`, '_blank');
                                                            }}
                                                        >
                                                            <MapPin className="w-4 h-4 mr-2" /> Buka di Maps
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
                                                            ⚠️ QR Code ini hanya berlaku pada hari kunjungan yang telah dikonfirmasi.
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
                                                        <div className="bg-white p-2 border-2 border-gray-100 rounded-xl mb-2 shadow-sm inline-block">
                                                            <QRCodeSVG value={kunjungan.idKunjungan} size={110} level={"H"} includeMargin={true} />
                                                        </div>
                                                        <p className="text-[11px] text-gray-600 leading-tight">
                                                            Tunjukkan QR ini kepada petugas di Gate Utama untuk ditukar kartu NFC.
                                                        </p>
                                                        <p className="text-xs font-bold text-gray-900 mt-1">
                                                            ID: {kunjungan.idKunjungan}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {hasilKunjungan.length === 0 && !isSearching && (
                    <p className="text-center text-sm text-gray-400 italic mt-10">
                        Masukkan email di atas untuk memuat daftar seluruh riwayat kunjungan Anda.
                    </p>
                )}
            </div>
        </div>
    );
}