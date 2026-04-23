import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const dataTamu = await prisma.tamu.findMany({
            where:  {
                waktuCheckIn: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: {
                waktuCheckIn: "asc",
            },
        });

        return NextResponse.json({ message: "Sukses", data: dataTamu }, { status: 200 });
    } catch (error: any) {
        console.error("GET SATPAM ERROR:", error);
        return NextResponse.json({ message: "Gagal", error: error.message }, { status: 500 });
    }
}