import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("sso_token");
  cookieStore.delete("sso_user");

  return NextResponse.json({ message: "Logout berhasil." });
}