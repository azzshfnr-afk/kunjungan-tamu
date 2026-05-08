import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const rawId = String(body.id);
    const cleanId = Number(rawId.replace("PKC-", ""));

    const { 
        statusKunjungan, aksesAktif, uidNfc, lokasiTap, waktuAktual, 
        karyawanId, karyawanDituju, departemen, gedungTujuan
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
          
          karyawanId: karyawanId ? Number(karyawanId) : null, 
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

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ ok: false, message: "Error" }, { status: 500 });
  }
}