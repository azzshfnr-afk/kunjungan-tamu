import Image from "next/image";
import Link from "next/link";

export function Navbar({ halamanAktif }: { halamanAktif?: string }) {
    const menuItems = [
        { id: "beranda", label: "Beranda", href: "/" },
        { id: "registrasi", label: "Registrasi", href: "/registrasi" },
        { id: "cek-kunjungan", label: "Cek Kunjungan", href: "/cek-kunjungan" },
    ];
    return (
        <nav className="bg-white border-b border-gray-200 py-3 sticky top-0 z-[100]">
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Logo PT Pupuk Kujang" width={80} height={40} className="object-contain" priority />
                    <div className="hidden md:flex items-center">
                        <span className="font-bold text-base text-gray-800">Registrasi Kunjungan Tamu</span>
                        <span className="text-xs text-gray-500 border-l border-gray-200 pl-2.5 ml-2.5"> PT Pupuk Kujang </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto">
                    {menuItems.map((item) => {
                        const aktif = halamanAktif === item.id;
                        return (
                            <Link key={item.id} href={item.href} className={`px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                                aktif ? "bg-gray-100 text-gray-900 font-bold border border-gray-200" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                            }`}>{item.label}</Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}