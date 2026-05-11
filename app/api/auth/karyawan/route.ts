import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SSO_BASE_URL = process.env.SSO_BASE_URL!; 
const SSO_APPLICATION = process.env.SSO_APPLICATION!;

export async function POST(req: NextRequest) {
  try {
    const bodyJson = await req.json();
    const { username, password } = bodyJson;

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

    console.log("Nembak ke:", `${SSO_BASE_URL}/login/`);

    const ssoRes = await fetch(`${SSO_BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const contentType = ssoRes.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await ssoRes.text();
      console.error("SSO Balikin Bukan JSON:", errorText);
      return NextResponse.json({ message: "Respon SSO tidak valid (Bukan JSON)." }, { status: 502 });
    }

    const ssoData = await ssoRes.json();

    if (!ssoRes.ok || !ssoData.success) {
      return NextResponse.json(
        { message: ssoData?.message || "Login gagal di sistem SSO." },
        { status: ssoRes.status || 401 }
      );
    }

    const { access_token, user } = ssoData;

    const cookieStore = await cookies();
    
    cookieStore.set("sso_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    cookieStore.set("sso_user", JSON.stringify({
      id: user?.id,
      name: user?.name,
      username: user?.username,
      pic: user?.pic,
      email: user?.email,
      organization: user?.organization,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json({ message: "Login berhasil." }, { status: 200 });
  } catch (err: any) {
    console.error("SSO Login Error Detail:", err.message);
    return NextResponse.json(
      { message: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}