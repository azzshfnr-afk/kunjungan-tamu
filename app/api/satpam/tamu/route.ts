import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const dataTamu = await prisma.tamu.findMany({
            where: {
                waktuCheckIn: {
                    lte: endOfToday.toISOString(),
                },
                waktuCheckOut: {
                    gte: startOfToday.toISOString(),
                },
            },
            orderBy: {
                waktuCheckIn: 'asc',
            },
            include: {
                kartuNfc: true
            }
        });

        return NextResponse.json({ message: "Sukses", data: dataTamu }, { status: 200 });
    } catch (error: any) {
        console.error("GET SATPAM ERROR:", error);
        return NextResponse.json({ message: "Gagal", error: error.message }, { status: 500 });
    }
}