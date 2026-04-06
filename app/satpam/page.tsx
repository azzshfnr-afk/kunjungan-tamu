"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, IdCard, CheckCircle2 } from "lucide-react";

export default function SatpamDashboard() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="w-full max-w-6xl rounded-lg bg-white p-8 shadow-xl border border-gray-200">

                <div className="mb-8 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Security Gate 1</h1>
                        <p className="text-gray-600">Validasi Tamu PT Pupuk Kujang</p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                                <ScanLine className="mr-2 h-5 w-5" />
                                Scan QR Tamu Masuk
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Scan QR Code & Assign NFC</DialogTitle>
                                <DialogDescription>
                                    Arahkan scanner ke QR Code Tamu, lalu masukkan ID Kartu NFC.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="qr-data">Hasil Scan QR (ID Kunjungan)</Label>
                                    <Input id="qr-data" placeholder="Otomatis terisi jika menggunakan scanner.." autoFocus />
                                </div>
                                <div className="space-y-2 pt-4 border-t">
                                    <Label htmlFor="nfc-card" className="flex items-center text-blue-700 font-semibold mb-2">
                                        <IdCard className="mr-2 h-4 w-4" />
                                        ID Kartu NFC
                                    </Label>
                                    <Input id="nfc-card" placeholder="Tap kartu NFC / ketik ID Kartu" />
                                </div>
                            </div>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Validasi & Izinkan Masuk
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="font-semibold text-gray-900">Waktu</TableHead>
                                <TableHead className="font-semibold text-gray-900">Nama Tamu</TableHead>
                                <TableHead className="font-semibold text-gray-900">Instansi</TableHead>
                                <TableHead className="font-semibold text-gray-900">Tujuan (Karyawan)</TableHead>
                                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                <TableHead className="font-semibold text-gray-900">ID NFC</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>09:00 WIB</TableCell>
                                <TableCell className="font-medium">Rachel Vennya</TableCell>
                                <TableCell>PT Teman Baik</TableCell>
                                <TableCell>Azkia (TI)</TableCell>
                                <TableCell>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 border border-green-200">
                                    Di Dalam Area
                                </span>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-gray-500">NFC-042</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-gray-400">-</TableCell>
                                <TableCell className="font-medium">Elzhard</TableCell>
                                <TableCell>Universitas Pendidikan Indonesia</TableCell>
                                <TableCell>Junaedi (Keuangan)</TableCell>
                                <TableCell>
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-200">
                                    Menunggu Kedatangan
                                </span>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-gray-400">-</TableCell>
                            </TableRow>
                            </TableBody>
                    </Table>  
                </div>
            </div>
        </div>  
    );
}