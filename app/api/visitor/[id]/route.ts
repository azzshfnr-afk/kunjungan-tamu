// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function PUT(
//   req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await context.params;
//     const idAngka = parseInt(id, 10); 
//     const body = await req.json();

//     const updated = await prisma.tamu.update({
//       where: { id: idAngka },
//       data: {
//         waktuCheckIn: body.checkin
//           ? new Date(body.checkin)
//           : undefined,
//         waktuCheckOut: body.checkout
//           ? new Date(body.checkout)
//           : undefined,
//       },
//     });

//     return NextResponse.json(updated);
//   } catch (error) {
//     console.error("PUT ERROR:", error);

//     return NextResponse.json(
//       { message: "Error updating visitor" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await context.params; 
//     const idAngka = parseInt(id, 10);
//     await prisma.tamu.delete({
//       where: { id: idAngka },
//     });

//     return NextResponse.json({ message: "Deleted" });
//   } catch (error) {
//     console.error("DELETE ERROR:", error);

//     return NextResponse.json(
//       { message: "Error deleting visitor" },
//       { status: 500 }
//     );
//   }
// }