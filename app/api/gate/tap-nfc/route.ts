import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { uidKartu, lokasiTap, jenisTap } = await req.json(); 
    const kartu = await prisma.kartuNfc.findUnique({
      where: { uidKartu },
      include: {
        Tamu: {
          include: { anggotaRombongan: true, logTracking: true }
        }
      }
    });
    if (!kartu || !kartu.Tamu) {
      return NextResponse.json({ status: "DENIED", message: "Kartu tidak terdaftar/aktif" }, { status: 403 });
    }
    const tamuUtama = kartu.Tamu;
    const totalKuotaRombongan = 1 + tamuUtama.anggotaRombongan.length;
    const hariIni = new Date();
    hariIni.setHours(0,0,0,0);
    const jumlahTapHariIni = await prisma.logTracking.count({
      where: {
        tamuId: tamuUtama.id,
        jenisTap: jenisTap,
        lokasiTap: lokasiTap,
        waktuTap: { gte: hariIni }
      }
    });
    if (jumlahTapHariIni >= totalKuotaRombongan) {
      return NextResponse.json({ 
        status: "DENIED", 
        message: `Akses ditolak! Kuota tap ${jenisTap} untuk rombongan ini sudah habis (${totalKuotaRombongan} orang).` 
      }, { status: 403 });
    }
    const logBaru = await prisma.logTracking.create({
      data: {
        lokasiTap,
        jenisTap,
        kartuNfcId: kartu.id,
        tamuId: tamuUtama.id
      }
    });
    const tapKe = jumlahTapHariIni + 1;
    return NextResponse.json({ 
      status: "GRANTED", 
      message: `Akses diterima. Tamu ke-${tapKe} dari ${totalKuotaRombongan} berhasil tap ${jenisTap}.`
    });
  } catch (error) {
    return NextResponse.json({ status: "ERROR", message: "Server Error" }, { status: 500 });
  }
}