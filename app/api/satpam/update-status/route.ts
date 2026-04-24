import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, statusKunjungan, aksesAktif } = body;

        if (!id) {
            return NextResponse.json(
                { ok: false, message: "ID Tamu tidak dikirim dari Frontend" }, 
                { status: 400 }
            );
        }

        const updateTamu = await prisma.tamu.update({
            where: { 
                id: Number(id) 
            }, 
            data: {
                statusKunjungan: statusKunjungan,
                aksesAktif: aksesAktif
            }
        });

        return NextResponse.json({ ok: true, data: updateTamu });

    } catch (error) {
        console.error("Database Update Error:", error);
        return NextResponse.json(
            { ok: false, message: "Gagal update ke database. Cek terminal VS Code." }, 
            { status: 500 }
        );
    }
}