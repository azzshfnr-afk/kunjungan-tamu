import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const rawId = body.id; 
    
    const cleanId = parseInt(String(rawId).replace("PKC-", "").trim());

    if (isNaN(cleanId)) {
      console.error("ID GAGAL DIPROSES:", rawId);
      return NextResponse.json({ ok: false, message: "ID Tamu tidak valid" }, { status: 400 });
    }

    const { 
        statusKunjungan, aksesAktif, uidNfc, lokasiTap, waktuAktual, 
        karyawanDituju, departemen, gedungTujuan
    } = body;

    const waktuSekarang = waktuAktual ? new Date(waktuAktual) : new Date();

    if (statusKunjungan === "Check-in") {
      let kartuIdInDb = null;
      if (uidNfc) {
        const kartu = await prisma.kartuNfc.findUnique({ where: { uidKartu: uidNfc } });
        if (kartu) {
          await prisma.kartuNfc.update({ where: { id: kartu.id }, data: { status: "DIPAKAI" } });
          kartuIdInDb = kartu.id;
        }
      }

      const updateTamu = await prisma.tamu.update({
        where: { id: cleanId },
        data: {
          statusKunjungan: statusKunjungan,
          aksesAktif: aksesAktif,
          nfcId: uidNfc,                 
          aktualCheckIn: waktuSekarang,  
          karyawanDituju: karyawanDituju,
          departemen: departemen,
          gedungTujuan: gedungTujuan, 
          ...(kartuIdInDb ? { kartuNfcId: kartuIdInDb } : {}),
        },
      });

      return NextResponse.json({ ok: true, data: updateTamu });
    }

    const updateTamuBiasa = await prisma.tamu.update({
      where: { id: cleanId },
      data: { statusKunjungan, aksesAktif },
    });
    
    return NextResponse.json({ ok: true, data: updateTamuBiasa });

  } catch (error: any) {
    console.error("Error detail:", error);
    return NextResponse.json({ ok: false, message: error.message || "Gagal menyimpan data" }, { status: 500 });
  }
}