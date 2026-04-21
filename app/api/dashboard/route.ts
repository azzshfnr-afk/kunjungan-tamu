import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const data = [
    {
      id: "PKC001",
      name: "Budi",
      instansi: "PT Maju",
      email: "budi@mail.com",
      departemen: "IT",
      date: today,
      karyawan: "Andi",
      checkin: null,
      checkout: null,
      rejected: false,
    },
    {
      id: "PKC002",
      name: "Siti",
      instansi: "PT Jaya",
      email: "siti@mail.com",
      departemen: "HR",
      date: "2026-04-20",
      karyawan: "Rina",
      checkin: null,
      checkout: null,
      rejected: false,
    },
    {
      id: "PKC003",
      name: "Jamal",
      instansi: "PT Jaya Hebat",
      email: "jamal@mail.com",
      departemen: "HR",
      date: today,
      karyawan: "Rina",
      checkin: "08:00 WIB",
      checkout: null,
      rejected: false,
    },
    {
      id: "PKC004",
      name: "Rudi",
      instansi: "PT Hebat",
      email: "rudi@mail.com",
      departemen: "PKC",
      date: today,
      karyawan: "Rina",
      checkin: "08:00 WIB",
      checkout: "12:00 WIB",
      rejected: false,
    },
    {
      id: "PKC005",
      name: "Doni",
      instansi: "PT Lama",
      email: "doni@mail.com",
      departemen: "Finance",
      date: "2026-04-10",
      karyawan: "Andi",
      checkin: "09:00 WIB",
      checkout: "11:00 WIB",
      rejected: false,
    },
    {
      id: "PKC006",
      name: "Tono",
      instansi: "PT Ditolak",
      email: "tono@mail.com",
      departemen: "Legal",
      date: today,
      karyawan: "Bambang",
      checkin: null,
      checkout: null,
      rejected: true,
    },
  ];

  
  const result = data.filter((item) => item.date === today);

  
  result.sort((a, b) => {
    const score = (item: any) => {
      if (item.rejected) return 4;
      if (item.checkin && item.checkout) return 3;
      if (item.checkin) return 2;
      return 1;
    };

    return score(a) - score(b);
  });

  return NextResponse.json(result);
}