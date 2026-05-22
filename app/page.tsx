import Link from "next/link";
import { ArrowRight, MapPin, Users, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { Navbar } from "@/components/Navbar"; 

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar halamanAktif="beranda" />
      <main className="flex-1 flex flex-col items-center p-6 md:p-12">
        
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-8 md:mt-12">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              PT Pupuk Kujang
            </h1>
            <p className="text-slate-600 leading-relaxed text-justify">
              PT Pupuk Kujang didirikan pada tanggal 9 Juni 1975. PT Pupuk Kujang merupakan anak perusahaan dari BUMN Pupuk di Indonesia yaitu PT Pupuk Indonesia Holding Company.
              Pupuk Kujang memiliki dua pabrik yaitu Pabrik Kujang 1A dengan kapasitas produksi 570.000 ton/tahun urea dan 330.000 ton/tahun ammonia dan Pabrik Kujang 1B dengan kapasitas produksi 570.000 ton/tahun urea dan 330.000 ton/tahun ammonia.
              Saat ini PT Pupuk Kujang mempunyai 2 (dua) anak perusahaan yaitu : PT Sintas Kurama Perdana dan PT Kawasan Industri Kujang Cikampek. Selain itu terdapat juga 3 (tiga) perusahaan afiliasi yaitu : PT Multi Nitrotama Kimia, PT Peroksida Indonesia Pratama, dan PT Kujang Sud-Chemie Catalysts.
            </p>
            
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin size={18} className="text-green-600" />
                <span>Jl. Jend. A. Yani No.39, Cikampek, Karawang, Jawa Barat</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={18} className="text-green-600 shrink-0"/>
                <span>(0264) 316 141 dan 317 007</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={18} className="text-green-600 shrink-0" />
                <span>info@pupuk-kujang.co.id</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
            <div className="space-y-2 text-center border-b border-slate-100 pb-6">
              <h2 className="text-2xl font-bold text-slate-800">Sistem Buku Tamu</h2>
              <p className="text-slate-500 text-sm">
                Selamat datang di kawasan PT Pupuk Kujang. Silakan lakukan pendaftaran kunjungan Anda di bawah ini.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 text-center font-medium">
                  Seluruh tamu diwajibkan mengisi formulir registrasi untuk mendapatkan akses masuk ke area perusahaan.
                </p>
              </div>

              <Link href="/registrasi" className="block w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2">
                  Lanjut ke Formulir Tamu
                  <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center mt-auto">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} PT Pupuk Kujang. Sistem Manajemen Kunjungan Tamu.
        </p>
      </footer>
    </div>
  );
}