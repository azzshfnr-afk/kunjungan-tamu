import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaTamu, asalInstansi, tujuan } = body;

    const tamuVip = await prisma.tamu.create({
      data: {
        namaTamu: namaTamu,
        tujuanKunjungan: tujuan || "VIP Access",
        asalInstansi: asalInstansi || "Tamu VIP",
        waktuCheckIn: new Date(),
        waktuCheckOut: new Date(),
        statusKunjungan: "Menunggu",
        aksesAktif: "SEMUA_KAWASAN_KUJANG",
        tipeTamu: "vip",
        nik: "-",
        noTelp: "-",
        email: "-",
        karyawanDituju: "-",
        gedungTujuan: "VIP"
      },
    });

    return NextResponse.json({ ok: true, data: tamuVip });
  } catch (error) {
    console.error("==== ERROR BIKIN VIP DI DATABASE ====", error);
    
    return NextResponse.json(
      { ok: false, message: "Gagal Database! Cek Terminal VS Code." },
      { status: 500 }
    );
  }
}