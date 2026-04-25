import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await prisma.anggotaRombongan.deleteMany({
      where: {
        tamuId: id,
      },
    });

    await prisma.tamu.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: "Data berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    console.error("Error saat menghapus data:", error);
    return NextResponse.json(
      { message: "Gagal menghapus data", error: error.message },
      { status: 500 }
    );
  }
}