import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaTamu, asalInstansi, tujuanKunjungan, noTelp, aksesAktif, nfcId, jumlahAnggota } = body;

    const jamTap = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta"
    });
    
    const totalAnggota = parseInt(jumlahAnggota) || 0;
    const listAnggotaDummy = [];
    for (let i = 0; i < totalAnggota; i++) {
      listAnggotaDummy.push({
        nama: `Pengikut ${namaTamu} (${i + 1})`,
        email: "-",
        noTelp: "-"
      });
    }

    let gedungTujuanUtama = "VIP";
    if (aksesAktif) {
      const listGedung = aksesAktif.split(",").map((g: string) => g.trim());
      const gedungSpesifik = listGedung.find((g: string) => g.toLowerCase() !== "gate utama");
      if (gedungSpesifik) {
        gedungTujuanUtama = gedungSpesifik;
      }
    }

    const tamuVip = await prisma.tamu.create({
      data: {
        namaTamu: namaTamu,
        tujuanKunjungan: tujuanKunjungan || "VIP Access",
        asalInstansi: asalInstansi || "Tamu VIP",
        waktuCheckIn: new Date(),
        aktualCheckIn: new Date(), 
        waktuCheckOut: new Date(),
        statusKunjungan: "Check-in", 
        aksesAktif: aksesAktif || "Gate Utama",
        nfcId: nfcId || "-", 
        riwayatTap: `Gate Utama (${jamTap})`, 
        tipeTamu: "vip",
        nik: "-",
        noTelp: noTelp || "-",
        email: "-",
        karyawanDituju: "-",
        gedungTujuan: gedungTujuanUtama, 
        anggotaRombongan: {
          create: listAnggotaDummy
        }
      },
    });
    
    return NextResponse.json({ ok: true, data: tamuVip });
  } catch (error) {
    console.error("==== ERROR BIKIN VIP DI DATABASE ====", error);
    return NextResponse.json({ ok: false, message: "Gagal Database!" }, { status: 500 });
  }
}