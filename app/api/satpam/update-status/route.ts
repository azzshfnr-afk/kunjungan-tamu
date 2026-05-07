import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { 
        id, 
        statusKunjungan, 
        aksesAktif, 
        uidNfc, 
        lokasiTap, 
        waktuAktual, 
        karyawanDituju, 
        departemen, 
        gedungTujuan 
    } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "ID Tamu tidak dikirim dari Frontend" },
        { status: 400 }
      );
    }

    const tamuSaatIni = await prisma.tamu.findUnique({
      where: { id: Number(id) },
    });

    if (!tamuSaatIni) {
      return NextResponse.json(
        { ok: false, message: "Tamu tidak ditemukan" },
        { status: 404 }
      );
    }

    const waktuSekarang = waktuAktual ? new Date(waktuAktual) : new Date();

    if (statusKunjungan === "Check-in") {
      let kartuId: number | null = null;
      
      if (uidNfc) {
        const kartu = await prisma.kartuNfc.findUnique({
          where: { uidKartu: uidNfc },
        });

        if (kartu) {
          await prisma.kartuNfc.update({
            where: { id: kartu.id },
            data: { status: "DIPAKAI" },
          });
          await prisma.logTracking.create({
            data: {
              lokasiTap: lokasiTap || "Gate Utama Masuk",
              jenisTap: "IN",
              kartuNfcId: kartu.id,
              tamuId: Number(id),
            },
          });
          kartuId = kartu.id; 
        }
      }

      const updateTamu = await prisma.tamu.update({
        where: { id: Number(id) }, 
        data: {
          statusKunjungan: statusKunjungan,
          aksesAktif: aksesAktif,
          
          nfcId: uidNfc, 
          
          karyawanDituju: karyawanDituju,
          departemen: departemen,
          gedungTujuan: gedungTujuan,
          
          ...(kartuId ? { kartuNfcId: kartuId } : {}),
        },
      });

      return NextResponse.json({
        ok: true,
        data: updateTamu,
        message: kartuId
          ? "Check-in Sukses & Kartu NFC Tertaut"
          : uidNfc
          ? "Check-in Sukses (NFC disimpan tapi tidak terdaftar di sistem)"
          : "Check-in Sukses (tanpa NFC)",
      });
    }

    if (statusKunjungan === "Check-in Area") {
      let kartuId: number | null = null;
      if (uidNfc) {
        const kartu = await prisma.kartuNfc.findUnique({
          where: { uidKartu: uidNfc },
        });
        if (kartu) {
          await prisma.kartuNfc.update({
            where: { id: kartu.id },
            data: { status: "DIPAKAI" },
          });
          await prisma.logTracking.create({
            data: {
              lokasiTap: lokasiTap || "Lobby Masuk",
              jenisTap: "IN",
              kartuNfcId: kartu.id,
              tamuId: Number(id),
            },
          });
          kartuId = kartu.id;
        }
      }

      const updateTamu = await prisma.tamu.update({
        where: { id: Number(id) },
        data: {
          statusKunjungan,
          aksesAktif,
          nfcId: uidNfc ?? tamuSaatIni.nfcId, 
          ...(kartuId ? { kartuNfcId: kartuId } : {}),
        },
      });

      return NextResponse.json({
        ok: true,
        data: updateTamu,
        message: "Check-in Area Sukses",
      });
    }

    if (statusKunjungan === "Check-out" || statusKunjungan === "SELESAI") {
      if (tamuSaatIni.kartuNfcId) {
        try {
          await prisma.logTracking.create({
            data: {
              lokasiTap: lokasiTap || "Gate Utama Keluar",
              jenisTap: "OUT",
              kartuNfcId: tamuSaatIni.kartuNfcId,
              tamuId: Number(id),
            },
          });
          await prisma.kartuNfc.update({
            where: { id: tamuSaatIni.kartuNfcId },
            data: { status: "TERSEDIA" },
          });
        } catch (e) {
          console.error("Gagal update kartu NFC saat checkout:", e);
        }
      }

      const updateTamu = await prisma.tamu.update({
        where: { id: Number(id) },
        data: {
          statusKunjungan,
          aksesAktif,
          kartuNfcId: null, 
          aktualCheckOut: waktuSekarang, 
        },
      });

      return NextResponse.json({
        ok: true,
        data: updateTamu,
        message: "Check-out Sukses",
      });
    }

    const updateTamuBiasa = await prisma.tamu.update({
      where: { id: Number(id) },
      data: { statusKunjungan, aksesAktif },
    });

    return NextResponse.json({ ok: true, data: updateTamuBiasa });

  } catch (error) {
    console.error("Database Update Error:", error);
    return NextResponse.json(
      { ok: false, message: "Gagal update ke database. Cek terminal VS Code." },
      { status: 500 }
    );
  }
}