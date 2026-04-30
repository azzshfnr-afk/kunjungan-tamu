import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { uidNfc, lokasiTap, jenisTap } = body;

        if (!uidNfc || !lokasiTap || !jenisTap) {
            return NextResponse.json({ ok: false, message: "Data tap tidak lengkap" }, { status: 400 });
        }
        const kartu = await prisma.kartuNfc.findUnique({
            where: { uidKartu: uidNfc },
            include: { Tamu: true }
        });
        if (!kartu) {
            return NextResponse.json({ ok: false, message: "Kartu tidak terdaftar" }, { status: 404});
        }
        if (kartu.status !== "DIPAKAI" || !kartu.Tamu) {
            return NextResponse.json({ ok: false, message: "Kartu ini sedang tidak aktif / belum di check-in" }, { status: 403 });
        }
        const idTamu = kartu.Tamu.id;
        const log = await prisma.logTracking.create({
            data: {
                lokasiTap: lokasiTap,
                jenisTap: jenisTap,
                kartuNfcId: kartu.id,
                tamuId: idTamu
            }
        });
        return NextResponse.json({
            ok: true,
            message: "Tap berhasil dicatat",
            data: log,
            tamu: { nama: kartu.Tamu.namaTamu, tujuan: kartu.Tamu.gedungTujuan }
        });
    } catch (error) {
        console.error("Tap Tracking Error:", error);
        return NextResponse.json({ ok: false, message: "Terjadi kesalahan server" }, { status: 500 });
    }
}