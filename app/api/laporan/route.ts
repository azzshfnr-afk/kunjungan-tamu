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
      instansi:        item.asalInstansi    || "-",
      email:           item.email           || "-",
      departemen:      item.departemen      || "-",
      karyawan:        item.karyawanDituju  || "-",
      noTelp:          item.noTelp          || "-",
      nik:             item.nik             || "-",
      tujuanKunjungan: item.tujuanKunjungan || "-",
      gedungTujuan:    item.gedungTujuan    || "-",
      aksesAktif:      item.aksesAktif      || "-",
      fotoKtp:         item.fotoKtp         || null,
      tipeTamu:        item.tipeTamu === "vip" ? "vip" : "regular",
      rejected:        item.statusKunjungan === "DITOLAK",

      date: item.tanggalKunjungan
        ? formatLocalDate(item.tanggalKunjungan)
        : item.waktuCheckIn
        ? formatLocalDate(item.waktuCheckIn)
        : "-",


      waktuCheckOut: item.waktuCheckOut
        ? item.waktuCheckOut.toISOString()
        : null,

      checkin:  item.aktualCheckIn  ? item.aktualCheckIn.toISOString()  : null,
      checkout: item.aktualCheckOut ? item.aktualCheckOut.toISOString() : null,

      nfcKembali:      (item as any).nfcKembali      ?? false,
      waktuNfcKembali: (item as any).waktuNfcKembali
        ? new Date((item as any).waktuNfcKembali).toISOString()
        : null,

      anggotaRombongan: item.anggotaRombongan.map((a) => ({
        nama:   a.nama,
        email:  a.email  || "-",
        noTelp: a.noTelp || "-",
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

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}