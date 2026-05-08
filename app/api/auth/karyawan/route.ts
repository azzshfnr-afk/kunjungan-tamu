import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SSO_BASE_URL = process.env.SSO_BASE_URL!;
const SSO_APPLICATION = process.env.SSO_APPLICATION!;

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const body = new URLSearchParams({
      username,
      password,
      application: SSO_APPLICATION,
    });

    const ssoRes = await fetch(`${SSO_BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const ssoData = await ssoRes.json();

    if (!ssoRes.ok || !ssoData.success) {
      return NextResponse.json(
        { message: ssoData?.message || "Login gagal." },
        { status: ssoRes.status }
      );
    }

    const { access_token, user } = ssoData;

    const cookieStore = await cookies();
    cookieStore.set("sso_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 jam
    });

    cookieStore.set("sso_user", JSON.stringify({
      id: user.id,
      name: user.name,
      username: user.username,
      pic: user.pic,
      email: user.email,
      phone_number: user.phone_number,
      organization: user.organization,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json({ message: "Login berhasil." }, { status: 200 });
  } catch (err) {
    console.error("SSO Login Error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}