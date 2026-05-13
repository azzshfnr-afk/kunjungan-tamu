import { cookies } from "next/headers";
import DashboardClient from "./DashboardClient";

function decodeJwtPayload(token: string) {
  try {
    const base64 = token.split(".")[1];
    const json = Buffer.from(base64, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("sso_token")?.value;

  let namaKaryawan: string | null = null;
  if (token) {
    const payload = decodeJwtPayload(token);
    namaKaryawan = payload?.user?.name ?? null;
  }

  return <DashboardClient namaKaryawan={namaKaryawan} />;
}