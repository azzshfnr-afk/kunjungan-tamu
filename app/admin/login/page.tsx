"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal. Periksa username dan password.");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0d0d0d]">
      <div className="relative w-[52%] hidden md:flex flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://admin-web.pupuk-kujang.co.id/proxy-file?source=corporate-info/profil_singkat/file-n3abh1738569823.jpg')",
            filter: "brightness(0.45)",
          }}
        />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-2 text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
            <span className="text-base font-semibold tracking-wide">Guests Kujang</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-start px-8 pb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Admin Panel
          </span>
          <p className="text-white text-base font-medium mb-3">
            Administrator interface for Managing Kujang Guests
          </p>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-400 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 rounded-full" />
            </div>
            <span className="text-gray-400 text-sm">
              Built by{" "}
              <span className="text-white underline underline-offset-2 cursor-pointer">
                Anak Sholeh & Sholehah
              </span>
              . Praktikan TI PKC.
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#0d0d0d] px-8">
        <div className="w-full max-w-sm">

          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <h1 className="text-white text-3xl font-bold mb-1">Admin Login</h1>
          <p className="text-gray-400 text-sm mb-6">
            Masuk menggunakan akun SSO Pupuk Kujang
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Username SSO"
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-white placeholder-gray-500
                rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gray-500
                focus:ring-1 focus:ring-gray-500 transition"
            />

            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••••"
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-white placeholder-gray-500
                rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gray-500
                focus:ring-1 focus:ring-gray-500 transition"
            />

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-red-950/40 border border-red-800/50 px-3 py-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-2.5
                rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Memverifikasi...
                </span>
              ) : "Masuk sebagai Admin"}
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-5 leading-relaxed">
            Hanya akun dengan hak akses <span className="text-gray-400">SUPERADMIN</span> yang dapat masuk.
          </p>
        </div>
      </div>
    </div>
  );
}