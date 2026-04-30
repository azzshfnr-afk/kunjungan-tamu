import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tamuId = searchParams.get("tamuId");
        const uidNfc = searchParams.get("uidNfc");

        if (tamuId) {
            const logs = await prisma.logTracking.findMany({
                where: { tamuId: Number(tamuId) },
                include: { kartuNfc: true },
                orderBy: { waktuTap: 'desc' }
            });
            return NextResponse.json({ ok: true, data: logs });
        }
        if (uidNfc) {
            const kartu = await prisma.kartuNfc.findUnique({ where: { uidKartu: uidNfc } });
            if (!kartu) {
                return NextResponse.json({ ok: false, message: "Kartu tidak ditemukan" }, { status: 404 });
            }

            const logs = await prisma.logTracking.findMany({
                where: { kartuNfcId: kartu.id },
                include: { tamu: true },
                orderBy: { waktuTap: 'desc' }
            });
            return NextResponse.json({ ok: true, data: logs });
        }
        return NextResponse.json({ ok: false, message: "Harap kirimkan tamuId atau uidNfc" }, { status: 400 });
    } catch (error) {
        console.error("Admin Fetch Tracking Error:", error);
        return NextResponse.json({ ok: false, message: "Terjadi kesalahan server" }, { status: 500 });
    }
}