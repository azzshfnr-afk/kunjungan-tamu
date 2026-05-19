import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawId = body.id; 
    const cleanId = parseInt(String(rawId).replace("PKC-", "").trim());

    if (isNaN(cleanId)) {
      return NextResponse.json({ ok: false, message: "ID Tamu tidak valid" }, { status: 400 });
    }

    const { 
        id, statusKunjungan, selectedGedungs, uidNfc, lokasiTap, waktuAktual, aksesAktif, aksesTambahan, 
        karyawanDituju, departemen, gedungTujuan, selectedGedung
    } = body;

    const waktuSekarang = waktuAktual ? new Date(waktuAktual) : new Date();

    const jamTap = waktuSekarang.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta"
    });

    const tapDenganJam = `${lokasiTap || "Area Umum"} (${jamTap})`;

    const tamuLama = await prisma.tamu.findUnique({
      where: { id: cleanId },
      select: { riwayatTap: true }
    });

    const riwayatBaru = tamuLama?.riwayatTap
      ? `${tamuLama.riwayatTap}, ${tapDenganJam}`
      : (tapDenganJam);

    let finalAksesAktif = aksesAktif || "";
    if (Array.isArray(selectedGedungs) && selectedGedungs.length > 0) {
      finalAksesAktif = selectedGedungs.join(", ");
    } else if (Array.isArray(selectedGedung) && selectedGedung.length > 0) {
      finalAksesAktif = selectedGedung.join(", ");
    } else if (Array.isArray(aksesTambahan) && aksesTambahan.length > 0) {
      finalAksesAktif = aksesTambahan.join(", ");
    }

    if (gedungTujuan && !finalAksesAktif.includes(gedungTujuan)) {
      finalAksesAktif = finalAksesAktif ? `${gedungTujuan}, ${finalAksesAktif}` : gedungTujuan;
    }

    let finalGedungTujuan = gedungTujuan;
    if (Array.isArray(selectedGedung) && selectedGedung.length > 0) {
        finalGedungTujuan = selectedGedung.join(", ");
    }

    if (statusKunjungan === "Check-in") {
      let kartuIdInDb = null;
      if (uidNfc) {
        const kartu = await prisma.kartuNfc.findUnique({ where: { uidKartu: uidNfc } });
        if (kartu) {
          await prisma.kartuNfc.update({ where: { id: kartu.id }, data: { status: "DIPAKAI" } });
          kartuIdInDb = kartu.id;
        }
      }

      const aksesString = Array.isArray(aksesTambahan) ? aksesTambahan.join(", ") : "";
      const updateTamu = await prisma.tamu.update({
        where: { id: cleanId },
        data: {
          statusKunjungan: statusKunjungan,
          aksesAktif: finalAksesAktif,
          selectedGedungs,
          nfcId: uidNfc,                 
          aktualCheckIn: statusKunjungan === "Check-in" ? waktuSekarang : undefined,  
          karyawanDituju: karyawanDituju,
          departemen: departemen,
          gedungTujuan: gedungTujuan, 
          riwayatTap: riwayatBaru, 
          ...(kartuIdInDb ? { kartuNfcId: kartuIdInDb } : {}),
        }, 
      });

      return NextResponse.json({ ok: true, data: updateTamu });
    }

    const updateData: any = {
      statusKunjungan: statusKunjungan, // Ambil status sesuai kiriman frontend
      selectedGedungs,
      riwayatTap: riwayatBaru,
      aksesAktif: aksesAktif || "",
    };

    // LOGIKA KHUSUS CHECK-OUT
    if (statusKunjungan === "Check-out") {
      updateData.aktualCheckOut = waktuSekarang;
      updateData.nfcId = ""; // Kosongkan NFC
      updateData.aksesAktif = ""; // Cabut semua akses
      
      // Update status kartu NFC jadi TERSEDIA lagi (opsional tapi bagus)
      if (uidNfc) {
        const kartu = await prisma.kartuNfc.findUnique({ where: { uidKartu: uidNfc } });
        if (kartu) {
          await prisma.kartuNfc.update({ 
            where: { id: kartu.id }, 
            data: { status: "TERSEDIA" } 
          });
        }
      }
    }

    const updateTamuFinal = await prisma.tamu.update({
      where: { id: cleanId },
      data: updateData,
    });
    
    return NextResponse.json({ ok: true, data: updateTamuFinal });

  } catch (error: any) {
    console.error("Error detail:", error);
    return NextResponse.json({ ok: false, message: error.message || "Gagal" }, { status: 500 });
  }
}