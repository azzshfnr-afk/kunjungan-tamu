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

    const tamuLama = await prisma.tamu.findUnique({
      where: { id: cleanId },
      select: { riwayatTap: true, statusKunjungan: true, waktuCheckOut: true } 
    });

    if (!tamuLama) {
      return NextResponse.json({ ok: false, message: "Data tamu tidak ditemukan di sistem" }, { status: 404 });
    }

    if (statusKunjungan === "Check-in") {
      
      if (tamuLama.statusKunjungan === "Check-in" || tamuLama.statusKunjungan === "Check-in Area") {
        return NextResponse.json({ 
          ok: false, 
          message: "❌ TIKET EXPIRED: QR Code ini sudah hangus karena sudah pernah digunakan untuk check-in masuk sebelumnya!" 
        }, { status: 400 });
      }

      if (tamuLama.waktuCheckOut && waktuSekarang > new Date(tamuLama.waktuCheckOut)) {
        return NextResponse.json({
          ok: false,
          message: "❌ TIKET EXPIRED: Batas akhir waktu rencana kunjungan Anda sudah terlewati (Kedaluwarsa). Harap lakukan registrasi ulang!"
        }, { status: 400 });
      }
    }

    const jamTap = waktuSekarang.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta"
    });
    const tapDenganJam = `${lokasiTap || "Area Umum"} (${jamTap})`;
    
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
      const updateTamu = await prisma.tamu.update({
        where: { id: cleanId },
        data: {
          statusKunjungan: statusKunjungan,
          aksesAktif: finalAksesAktif,
          selectedGedungs,
          nfcId: uidNfc,                 
          aktualCheckIn: waktuSekarang,  
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
      statusKunjungan: statusKunjungan, 
      selectedGedungs,
      riwayatTap: riwayatBaru,
      aksesAktif: aksesAktif || "",
    };

    if (statusKunjungan === "Check-out") {
      updateData.aktualCheckOut = waktuSekarang;
      updateData.nfcId = ""; 
      updateData.aksesAktif = ""; 
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