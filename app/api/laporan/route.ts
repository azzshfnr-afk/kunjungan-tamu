import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.tamu.findMany({
      orderBy: {
        // Pakai waktuCheckIn sebagai fallback kalau tanggalKunjungan null
        waktuCheckIn: "desc",
      },
    });

    const result = data.map((item) => ({
      id: item.id.toString(),
      name: item.namaTamu,
      instansi: item.asalInstansi || "-",
      email: item.email || "-",
      departemen: item.departemen || "-",
      karyawan: item.karyawanDituju || "-",
      // Pakai tanggalKunjungan jika ada, fallback ke waktuCheckIn
      date: item.tanggalKunjungan
        ? item.tanggalKunjungan.toISOString().split("T")[0]
        : item.waktuCheckIn
        ? item.waktuCheckIn.toISOString().split("T")[0]
        : "-",
      checkin: item.aktualCheckIn
        ? item.aktualCheckIn.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      checkout: item.aktualCheckOut
        ? item.aktualCheckOut.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      rejected: item.statusKunjungan === "DITOLAK",
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