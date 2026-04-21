import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.tamu.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET ERROR:", error);

    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const visitor = await prisma.tamu.create({
      data: {
        namaTamu: body.name,
        asalInstansi: body.instansi,
        email: body.email,
        noTelp: body.phone,
        nik: body.nik || "0000000000000000",
        karyawanDituju: body.karyawan,
        departemen: body.departemen,
        tujuanKunjungan: body.tujuan,
        waktuCheckIn: new Date(body.visitDate),
        waktuCheckOut: body.visitTime,
      },
    });

    return NextResponse.json(visitor, { status: 201 });
  } catch (error) {
    console.error("POST ERROR:", error);

    return NextResponse.json(
      { message: "Error creating visitor" },
      { status: 500 }
    );
  }
}