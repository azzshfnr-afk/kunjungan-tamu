import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { namaTamu, asalInstansi, tujuan } = body;
        if (!namaTamu) {
            return NextResponse.json(
                { ok: false, message: "Nama tamu wajib diisi" },
                { status: 400 }
            );
        }
        const tamuVip = await prisma.tamu.create({
            data: {
                namaTamu: namaTamu,
                asalInstansi: asalInstansi || "Tamu VIP",
                tujuanKunjungan: tujuan,
                karyawanDituju: tujuan,
                waktuCheckIn: new Date(),
                waktuCheckOut: new Date(),
                statusKunjungan: "Menunggu",
                aksesAktif: "SEMUA_KAWASAN_KUJANG",
                tipeTamu: "vip",
            },
        });

        return NextResponse.json({
            ok: true,
            message: "Data VIP berhasil dibuat",
            data: tamuVip,
        });
    } catch (error) {
        console.error("Error Create VIP:", error);
        return NextResponse.json(
            { ok: false, message: "Gagal membuat data VIP ke database" },
            { status: 500 }
        );
    }
}