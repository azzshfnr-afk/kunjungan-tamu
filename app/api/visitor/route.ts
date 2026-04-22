import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.tamu.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = data.map((item) => ({
      id: String(item.id),
      name: item.namaTamu ?? "",
      instansi: item.asalInstansi ?? "",
      email: item.email ?? "",
      phone: item.noTelp ?? "",
      ktp: item.nik ?? "",
      karyawan: item.karyawanDituju ?? "",
      departemen: item.departemen ?? "",
      tujuan: item.tujuanKunjungan ?? "",
      visitDate: item.tanggalKunjungan ?? item.createdAt,
      visitTime: "-",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET ERROR:", error);

    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}