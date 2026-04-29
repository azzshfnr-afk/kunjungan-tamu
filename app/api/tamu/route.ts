import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    const waktuCheckIn = (tglMasuk && jamMasuk) ? new Date(`${tglMasuk}T${jamMasuk}`) : new Date();
    const waktuCheckOut = (tglKeluar && jamKeluar) ? new Date(`${tglKeluar}T${jamKeluar}`) : new Date();

    let anggotaRombonganParsed = [];
    try {
      const rombonganRaw = formData.get("anggotaRombongan") as string;
      if (rombonganRaw) {
        anggotaRombonganParsed = JSON.parse(rombonganRaw);
      }
    } catch (e) {
      console.error("Gagal parse anggota rombongan:", e);
    }

    const fileKTP = formData.get("ktp") as File | null;
    let fotoKtpUrl = null;

    if (fileKTP && fileKTP.name && fileKTP.size > 0) {
      try {
        const bytes = await fileKTP.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileExt = fileKTP.name.split('.').pop() || 'jpg';
        const uniqueName = `ktp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        const filePath = join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);
        fotoKtpUrl = `/uploads/${uniqueName}`;
      } catch (err) {
        console.error("Gagal simpan file KTP:", err);
      }
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
        waktuCheckIn,
        waktuCheckOut,
        fotoKtp: fotoKtpUrl,
        anggotaRombongan: {
          create: anggotaRombonganParsed.map((a: any) => ({
            nama: a.nama || "-",
            email: a.email || "-",
            noTelp: a.noTelp || "-"
          }))
        }
      }
    });

    if (email !== "-" && email.includes("@")) {
      try {
        const mailOptions = {
          from: `"Admin Kunjungan" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Pendaftaran Kunjungan Berhasil - Pupuk Kujang",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold;">Tiket Kunjungan Disetujui</h2>
                    <p style="margin: 8px 0 0 0; font-size: 14px;">PT Pupuk Kujang Cikampek</p>
                </div>
                <div style="padding: 30px; color: #333; background-color: #ffffff;">
                    <p>Halo <strong>${namaTamu}</strong>,</p>
                    <p>Registrasi kunjungan Anda telah berhasil. Berikut detailnya:</p>
                    <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">ID Kunjungan</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${hasil.id}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Tujuan</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${departemen} (${karyawanDituju})</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Tanggal</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${tglMasuk}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Waktu</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${jamMasuk} WIB</td></tr>
                    </table>
                    <div style="margin-top: 30px; padding: 20px; border: 2px dashed #4CAF50; text-align: center; border-radius: 10px;">
                        <p style="font-size: 14px; color: #555;">Scan QR Code ini di Security Gate 1:</p>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${hasil.id}" alt="QR Code" style="display: block; margin: 15px auto;" />
                    </div>
                </div>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);
      } catch (err) {
        console.error("Gagal kirim email:", err);
      }
    }

    return NextResponse.json({ ok: true, data: { id: hasil.id } });

  } catch (error: any) {
    console.error("ERROR API POST:", error);
    return NextResponse.json({ ok: false, message: error.message || "Gagal menyimpan data." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Jika ada email, cari data spesifik (Fitur Cek Tiket)
    if (email) {
      const dataKunjungan = await prisma.tamu.findFirst({
        where: {
          OR: [
            { email: email },
            { anggotaRombongan: { some: { email: email } } }
          ]
        },
        include: { anggotaRombongan: true },
        orderBy: { id: 'desc' }
      });

      if (!dataKunjungan) {
        return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Sukses', data: dataKunjungan }, { status: 200 });
    }

    // Jika tidak ada email, ambil SEMUA data (Fitur Dashboard & Visitor Card)
    const semuaTamu = await prisma.tamu.findMany({
      include: { anggotaRombongan: true },
      orderBy: { id: 'desc' }
    });

    // Mapping agar nama field di database sinkron dengan yang dipanggil di UI (Frontend)
    const result = semuaTamu.map((t) => ({
      id: t.id,
      name: t.namaTamu,
      instansi: t.asalInstansi,
      email: t.email,
      phone: t.noTelp,
      departemen: t.departemen,
      karyawan: t.karyawanDituju,
      tujuanKunjungan: t.tujuanKunjungan, // tambah ini
      status: t.status,                   // tambah ini
      tipeTamu: t.tipeTamu,               // tambah ini
      statusKunjungan: t.statusKunjungan,       // ← tambah ini
      tanggalKunjungan: t.tanggalKunjungan,     // ← tambah ini
      visitDate: t.waktuCheckIn,
      visitTime: t.waktuCheckIn ? new Date(t.waktuCheckIn).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'}) : "-",
      checkin: t.waktuCheckIn,
      checkout: t.waktuCheckOut,
    }));

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ message: 'Gagal', error: error.message }, { status: 500 });
  }
}