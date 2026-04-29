import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set ke awal hari ini

    // Ambil data yang tanggal kunjungannya sudah lewat (sebelum hari ini)
    const data = await prisma.tamu.findMany({
      where: {
        tanggalKunjungan: {
          lt: today, // lt = less than (kurang dari hari ini)
        },
      },
      orderBy: {
        tanggalKunjungan: "desc",
      },
    });

    // Mapping agar sesuai dengan variabel yang dipakai di Frontend (LaporanPage)
    const result = data.map((item) => ({
      id: item.id.toString(),
      name: item.namaTamu,
      instansi: item.asalInstansi || "-",
      email: item.email || "-",
      departemen: item.departemen || "-",
      date: item.tanggalKunjungan ? item.tanggalKunjungan.toISOString().split('T')[0] : "-",
      karyawan: item.karyawanDituju || "-",
      checkin: item.aktualCheckIn ? item.aktualCheckIn.toLocaleTimeString('id-ID') : null,
      checkout: item.aktualCheckOut ? item.aktualCheckOut.toLocaleTimeString('id-ID') : null,
      rejected: item.status === "Ditolak", // Sesuaikan dengan string status di DB-mu
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error API Laporan:", error);
    return NextResponse.json([]);
  }
}