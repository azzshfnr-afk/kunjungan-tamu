import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.tamu.findMany({
      orderBy: { waktuCheckIn: "desc" },
      include: { anggotaRombongan: true },
    });

    const result = data.map((item) => ({
      id:              item.id.toString(),
      name:            item.namaTamu,
      instansi:        item.asalInstansi       || "-",
      email:           item.email              || "-",
      departemen:      item.departemen         || "-",
      karyawan:        item.karyawanDituju     || "-",
      noTelp:          item.noTelp             || "-",
      nik:             item.nik                || "-",
      tujuanKunjungan: item.tujuanKunjungan    || "-",
      gedungTujuan:    item.gedungTujuan       || "-",
      aksesAktif:      item.aksesAktif        || "-",
      fotoKtp:         item.fotoKtp           || null,
      tipeTamu:        item.tipeTamu === "vip" ? "vip" : "regular",

      date: item.tanggalKunjungan
        ? item.tanggalKunjungan.toISOString().split("T")[0]
        : item.waktuCheckIn
        ? item.waktuCheckIn.toISOString().split("T")[0]
        : "-",

      checkin: item.aktualCheckIn
        ? item.aktualCheckIn.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : null,

      checkout: item.aktualCheckOut
        ? item.aktualCheckOut.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : null,

      rejected: item.statusKunjungan === "DITOLAK",

      anggotaRombongan: item.anggotaRombongan.map((a) => ({
        nama:   a.nama,
        email:  a.email,
        noTelp: a.noTelp,
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error API Laporan:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data laporan" },
      { status: 500 }
    );
  }
}