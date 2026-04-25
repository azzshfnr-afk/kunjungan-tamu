// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function PUT(
//   req: Request,
//   context: { params: Promise<{ kode: string }> } 
// ) {
//   try {
//     const { kode } = await context.params;
//     const body = await req.json();

//     const idAngka = parseInt(kode.replace("PKC-", ""), 10);

//     const tamu = await prisma.tamu.update({
//       where: { id: idAngka },
//       data: {
//         waktuCheckIn: body.checkin ? new Date(body.checkin) : undefined,
//         waktuCheckOut: body.checkout ? new Date(body.checkout) : undefined,
//       },
//     });

//     return NextResponse.json(tamu);
//   } catch (error) {
//     console.error("PUT ERROR:", error);
//     return NextResponse.json(
//       { message: "Error updating visitor by kode" },
//       { status: 500 }
//     );
//   }
// }