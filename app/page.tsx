import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  ClipboardList,
  ExternalLink,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";

const stats = [
  { value: "1975", label: "Tahun berdiri" },
  { value: "2", label: "Pabrik aktif" },
  { value: "570K", label: "Ton urea/tahun" },
];

const steps = [
  { step: 1, text: "Isi data diri dan tujuan kunjungan" },
  { step: 2, text: "Pilih tanggal & jam kunjungan" },
  { step: 3, text: "Dapatkan tiket masuk digital" },
];

const contacts = [
  {
    icon: MapPin,
    text: "Jl. Jend. A. Yani No.39, Cikampek, Karawang, Jawa Barat",
  },
  { icon: Phone, text: "(0264) 316 141 dan 317 007" },
  { icon: Mail, text: "info@pupuk-kujang.co.id" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar halamanAktif="beranda" />

      <main className="flex-1 flex flex-col">
        <section className="relative flex-1 flex items-center min-h-[calc(100vh-64px)]">
          <Image
            src="/kujang.jpg"
            alt="Karyawan PT Pupuk Kujang di area pabrik"
            fill
            priority
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-center">
            <div className="flex flex-col gap-7">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-widest text-green-300 uppercase">
                  Sistem Manajemen Kunjungan
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                  Selamat Datang di{" "}
                  <p className="text-green-400">
                    PT Pupuk Kujang
                  </p>
                </h1>
                <p className="text-white/70 leading-relaxed text-sm md:text-base max-w-lg">
                  Kawasan industri pupuk terpadu sejak 1975. Demi keamanan dan
                  kenyamanan bersama, seluruh tamu wajib melakukan registrasi
                  sebelum memasuki area perusahaan.
                </p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {contacts.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 text-sm text-white/65"
                  >
                    <Icon
                      size={15}
                      className="text-green-400 mt-0.5 shrink-0"
                      aria-hidden
                    />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-6 pt-1">
                {stats.map(({ value, label }, i) => (
                  <div key={label} className="flex items-center gap-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-2xl font-bold text-green-400">
                        {value}
                      </span>
                      <span className="text-xs text-white/50 font-medium">
                        {label}
                      </span>
                    </div>
                    {i < stats.length - 1 && (
                      <Separator
                        orientation="vertical"
                        className="h-8 bg-white/20"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-7 flex flex-col gap-5 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Buku Tamu Digital
                  </h2>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Isi formulir registrasi untuk mendapatkan akses masuk ke
                    area perusahaan.
                  </p>
                </div>
                <Badge className="shrink-0 bg-green-500/20 border border-green-400/40 text-green-300 text-[10px] font-semibold gap-1 px-2.5 py-1">
                  <ShieldCheck size={11} />
                  Resmi
                </Badge>
              </div>

              <Separator className="bg-white/15" />

              <ol className="flex flex-col gap-3">
                {steps.map(({ step, text }) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {step}
                    </span>
                    <span className="text-sm text-white/80">{text}</span>
                  </li>
                ))}
              </ol>

              <div className="flex items-start gap-3 bg-red-500/15 border border-red-400/25 rounded-xl p-3.5">
                <Info size={15} className="text-red-300 mt-0.5 shrink-0" />
                <p className="text-xs text-red-200 leading-relaxed font-medium">
                  Seluruh tamu diwajibkan mengisi formulir ini untuk mendapatkan
                  akses ke area perusahaan.
                </p>
              </div>

              <Link href="/registrasi" className="block w-full">
                <Button className="w-full bg-green-600 hover:bg-green-500/15 text-white h-12 text-sm font-bold rounded-xl shadow-lg hover:shadow-green-500/30 transition-all gap-2">
                  <ClipboardList size={16} />
                  Lanjut ke Formulir Tamu
                  <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white-900 border-t border-white/10 py-5 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-black/35">
            &copy; {new Date().getFullYear()} PT Pupuk Kujang. Sistem Manajemen
            Kunjungan Tamu.
          </p>
          <a
            href="https://www.pupuk-kujang.co.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-black/35 hover:text-green-400 transition-colors"
          >
            <ExternalLink size={12} />
            Website Resmi
          </a>
        </div>
      </footer>
    </div>
  );
}