import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SSO_BASE_URL    = process.env.SSO_BASE_URL!;
const SSO_APPLICATION = process.env.SSO_APPLICATION!;

const ADMIN_GROUPS = ["group:type:SUPERADMIN"];

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams({
      username,
      password,
      application: SSO_APPLICATION,
    });

    const ssoRes = await fetch(`${SSO_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const contentType = ssoRes.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { message: "Respon SSO tidak valid." },
        { status: 502 }
      );
    }

    const ssoData = await ssoRes.json();

    if (!ssoRes.ok || !ssoData.success) {
      return NextResponse.json(
        { message: ssoData?.message || "Login gagal. Periksa username dan password." },
        { status: 401 }
      );
    }

    const { access_token, user } = ssoData;

    const userGroups: string[] = user?.groups ?? [];
    const isAdmin = ADMIN_GROUPS.some((g) => userGroups.includes(g));

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Akses ditolak. Akun Anda tidak memiliki hak akses admin." },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("admin_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 8,
    });

    cookieStore.set("admin_user", JSON.stringify({
      id:           user?.id,
      name:         user?.name,
      username:     user?.username,
      pic:          user?.pic,
      email:        user?.email,
      organization: user?.organization,
      groups:       userGroups,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json({ message: "Login berhasil." }, { status: 200 });
  } catch (err: any) {
    console.error("Admin SSO Login Error:", err.message);
    return NextResponse.json(
      { message: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}