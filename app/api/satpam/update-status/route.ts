import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface BodyUpdateStatus {
  id: string | number;
  statusKunjungan: string;
  aksesAktif: string;
  uidNfc?: string;
  lokasiTap?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BodyUpdateStatus;
    const { id, statusKunjungan, aksesAktif, uidNfc, lokasiTap } = body;

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

    
    if (uidNfc && statusKunjungan !== "SELESAI") {
      const kartu = await prisma.kartuNfc.findUnique({
        where: { uidKartu: uidNfc },
      });

      if (!kartu) {
        return NextResponse.json(
          { ok: false, message: "Kartu NFC tidak terdaftar di database!" },
          { status: 404 }
        );
      }

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

      const updateTamu = await prisma.tamu.update({
        where: { id: Number(id) },
        data: {
          statusKunjungan,
          aksesAktif,
          kartuNfcId: kartu.id,
          aktualCheckIn: new Date(), //jam check-in dari satpam
        },
      });

      return NextResponse.json({
        ok: true,
        data: updateTamu,
        message: "Check-in & Link Kartu Sukses",
      });
    }

    // cekin cekot
    if (statusKunjungan === "SELESAI") {
      if (tamuSaatIni.kartuNfcId) {
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
      }

      const updateTamu = await prisma.tamu.update({
        where: { id: Number(id) },
        data: {
          statusKunjungan,
          aksesAktif,
          kartuNfcId: null,
          aktualCheckOut: new Date(), // jam check-out dari satpam
        },
      });

      return NextResponse.json({
        ok: true,
        data: updateTamu,
        message: "Check-out Sukses, Kartu Dilepas",
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