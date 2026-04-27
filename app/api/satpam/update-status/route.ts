import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, statusKunjungan, aksesAktif } = body;

        if (!id) {
            return NextResponse.json({ ok: false, message: "ID Tamu tidak dikirim dari Frontend" }, { status: 400 });
        }

        const tamuSaatIni = await prisma.tamu.findUnique({ where: { id: Number(id) } });
        if (!tamuSaatIni) {
            return NextResponse.json({ ok: false, message: "Tamu tidak ditemukan" }, { status: 404});
        }

        if (uidNfc && statusKunjungan !== "SELESAI") {
            const kartu = await prisma.kartuNfc.findUnique({ where: { uidKartu: uidNfc } });

            if (!kartu) {
                return NextResponse.json({ ok: false, message: "Kartu NFC tidak terdaftar di database!" }, { status: 404 });
            }

            await prisma.kartuNfc.update({
                where: { id: kartu.id },
                data: { status: "DIPAKAI" }
            });

            await prisma.logTracking.create({
                data: {
                    lokasiTap: lokasiTap || "Gate Utama Masuk",
                    jenisTap: "IN",
                    kartuNfcId: kartu.id,
                    tamuId: Number(id)
                }
            });

            const updateTamu = await prisma.tamu.update({
            where: { id: Number(id) }, 
            data: { statusKunjungan, aksesAktif, kartuNfcId: kartu.id }
        });

        return NextResponse.json({ ok: true, data: updateTamu, message: "Check-in & Link Kartu Sukses" });
    }

    if (statusKunjungan === "SELESAI") {
        if (tamuSaatIni.kartuNfcId) {
            await prisma.logTracking.create({
                data: {
                    lokasiTap: lokasiTap || "Gate Utama Keluar",
                    jenisTap: "OUT",
                    kartuNfcId: tamuSaatIni.kartuNfcId,
                    tamuId: Number(id)
                }
            });

            await prisma.kartuNfc.update({
                where: { id: tamuSaatIni.kartuNfcId },
                data: { status: "TERSEDIA" }
            });
        }

        const updateTamu = await prisma.tamu.update({
            where: { id: Number(id) },
            data: { statusKunjungan, aksesAktif, kartuNfcId: null }
        });

        return NextResponse.json({ ok: true, data: updateTamu, message: "Check-out Sukses, Kartu Dilepas" });
    }

    const updateTamuBiasa = await prisma.tamu.update({
        where: { id: Number(id) },
        data: { statusKunjungan, aksesAktif }
    });

    return NextResponse.json({ ok: true, data: updateTamuBiasa });

} catch (error) {
    console.error("Database Update Error:", error);
    return NextResponse.json({ ok: false, message: "Gagal update ke database. Cek terminal VS Code." }, { status: 500 });
    }
}