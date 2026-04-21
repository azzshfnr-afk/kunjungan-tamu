import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client/extension';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    console.log("DATA YANG MASUK KE API:");
    for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    const namaTamu = (formData.get("namaTamu") as string) || (formData.get("nama") as string) || "Tanpa Nama";
    const asalInstansi = (formData.get("asalInstansi") as string) || (formData.get("instansi") as string) || "-";
    const email = (formData.get("email") as string) || "-";
    const noTelp = (formData.get("noTelp") as string) || (formData.get("telepon") as string) || "-";
    const nik = (formData.get("nik") as string) || "-";
    const karyawanDituju = (formData.get("karyawanDituju") as string) || (formData.get("petugas") as string) || "-";
    const departemen = (formData.get("departemen") as string) || "-";
    const tujuanKunjungan = (formData.get("tujuanKunjungan") as string) || (formData.get("tujuan") as string) || "-";
    const tglMasuk = formData.get("tanggalCheckIn") as string;
    const jamMasuk = formData.get("jamCheckIn") as string;

    const tglKeluar = formData.get("tanggalCheckOut") as string;
    const jamKeluar = formData.get("jamCheckOut") as string;

    const waktuCheckIn = (tglMasuk && jamMasuk) 
      ? new Date(`${tglMasuk}T${jamMasuk}`) 
      : new Date();

    const waktuCheckOut = (tglKeluar && jamKeluar) 
      ? new Date(`${tglKeluar}T${jamKeluar}`) 
      : new Date();

    const anggotaRombonganString = formData.get("anggotaRombongan") as string;
    let anggotaRombonganParsed = [];
    if (anggotaRombonganString) {
        anggotaRombonganParsed = JSON.parse(anggotaRombonganString);
    }

    const fileKTP = formData.get("ktp") as File | null;
    if (fileKTP) {
        console.log("Ada file KTP masuk:", fileKTP.name);
    }

    const hasil = await prisma.tamu.create({
      data: {
        namaTamu,
        asalInstansi,
        email,
        noTelp,
        nik,
        karyawanDituju,
        departemen,
        tujuanKunjungan,
        waktuCheckIn: waktuCheckIn,
        waktuCheckOut: waktuCheckOut,
        anggotaRombongan: {
          create: anggotaRombonganParsed.map((a: any) => ({
            nama: a.nama || "-",
            email: a.email || "-",
            noTelp: a.noTelp || "-"
          }))
        }
      }
    });

    return Response.json({ ok: true, data: { id: hasil.id } });

  } catch (error) {
    console.error("ERROR API REGISTRASI:", error);
    return Response.json({ ok: false, message: "Gagal menyimpan data." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email wajib diisi' }, { status: 400 });
    }

    const dataKunjungan = await prisma.tamu.findFirst({
      where: {
        OR: [
          { email: email },
          {
            anggotaRombongan: {
              some: { email: email }
            }
          }
        ]
      },
      include: {
        anggotaRombongan: true
      }
    });

    if (!dataKunjungan) {
      return NextResponse.json({ message: 'Data kunjungan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Sukses', data: dataKunjungan }, { status: 200});

  } catch (error: any) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ message: 'Gagal', error: error.message }, { status: 500 });
  }
}