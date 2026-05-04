import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const {
      statusKunjungan,
      status,
      aksi,
    } = body as {
      statusKunjungan?: "DIIZINKAN" | "DITOLAK";
      status?: "Diterima" | "Ditolak";        
      aksi?: "checkin" | "checkout";           
    };

 
    if (!statusKunjungan && !status && !aksi) {
      return NextResponse.json(
        { message: "Tidak ada data yang dikirim untuk diupdate." },
        { status: 400 }
      );
    }


    const updateData: Record<string, any> = {};

    if (statusKunjungan) {
      updateData.statusKunjungan = statusKunjungan;
    }


    if (status) {
      updateData.status = status;
    }

    if (aksi === "checkin") {
      updateData.aktualCheckIn = new Date();
    } else if (aksi === "checkout") {
      updateData.aktualCheckOut = new Date();
    }

    const updated = await prisma.tamu.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Berhasil diupdate", data: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error PATCH:", error);
    return NextResponse.json(
      { message: "Gagal mengupdate data", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.anggotaRombongan.deleteMany({
      where: { tamuId: id },
    });

    await prisma.tamu.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Data berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error DELETE:", error);
    return NextResponse.json(
      { message: "Gagal menghapus data", error: error.message },
      { status: 500 }
    );
  }
}