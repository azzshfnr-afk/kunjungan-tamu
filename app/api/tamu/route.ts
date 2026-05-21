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
    const namaTamu        = (formData.get("namaTamu") as string)       || (formData.get("nama") as string)      || "Tanpa Nama";
    const asalInstansi    = (formData.get("asalInstansi") as string)   || (formData.get("instansi") as string)  || "-";
    const email           = (formData.get("email") as string)          || "-";
    const noTelp          = (formData.get("noTelp") as string)         || (formData.get("telepon") as string)   || "-";
    const nik             = (formData.get("nik") as string)            || "-";
    const karyawanDituju  = (formData.get("karyawanDituju") as string) || (formData.get("petugas") as string)   || "-";
    const departemen      = (formData.get("departemen") as string)     || "-";
    const tujuanKunjungan = (formData.get("tujuanKunjungan") as string)|| (formData.get("tujuan") as string)    || "-";
    const gedungTujuan    = (formData.get("gedungTujuan") as string)   || "-";
    const tglMasuk        = formData.get("tanggalCheckIn") as string;
    const jamMasuk        = formData.get("jamCheckIn") as string;
    const tglKeluar       = formData.get("tanggalCheckOut") as string;
    const jamKeluar       = formData.get("jamCheckOut") as string;

    const waktuCheckIn  = (tglMasuk  && jamMasuk)  ? new Date(`${tglMasuk}T${jamMasuk}`)   : new Date();
    const waktuCheckOut = (tglKeluar && jamKeluar)  ? new Date(`${tglKeluar}T${jamKeluar}`) : new Date();
    const tanggalKunjungan = tglMasuk ? new Date(`${tglMasuk}T00:00:00`) : new Date();

    let anggotaRombonganParsed: { nama: string; email: string; noTelp: string }[] = [];
    try {
      const rombonganRaw = formData.get("anggotaRombongan") as string;
      if (rombonganRaw) {
        anggotaRombonganParsed = JSON.parse(rombonganRaw);
      }
    } catch (e) {
      console.error("Gagal parse anggota rombongan:", e);
    }

    const fileKTP = formData.get("ktp") as File | null;
    let fotoKtpUrl: string | null = null;

    if (fileKTP && fileKTP.name && fileKTP.size > 0) {
      try {
        const bytes     = await fileKTP.arrayBuffer();
        const buffer    = Buffer.from(bytes);
        const fileExt   = fileKTP.name.split('.').pop() || 'jpg';
        const uniqueName = `ktp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(join(uploadDir, uniqueName), buffer);
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
        gedungTujuan,
        waktuCheckIn,
        waktuCheckOut,
        tanggalKunjungan,
        fotoKtp: fotoKtpUrl,
        anggotaRombongan: {
          create: anggotaRombonganParsed.map((a) => ({
            nama:   a.nama   || "-",
            email:  a.email  || "-",
            noTelp: a.noTelp || "-",
          })),
        },
      },
    });

    if (email !== "-" && email.includes("@")) {
      try {
        const d = new Date(tglMasuk || new Date());
        const tanggalFormat = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        const formatIdEmail = `PKC-${String(hasil.id).padStart(4, '0')}`;

        await transporter.sendMail({
          from:    `"Admin Kunjungan" <${process.env.EMAIL_USER}>`,
          to:      email,
          subject: "Pendaftaran Kunjungan Berhasil - Pupuk Kujang",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px; font-weight: bold;">Tiket Kunjungan Disetujui</h2>
                <p style="margin: 8px 0 0 0; font-size: 14px;">PT Pupuk Kujang Cikampek</p>
              </div>
              <div style="padding: 30px; color: #333; background-color: #ffffff;">
                <p>Halo <strong>${namaTamu}</strong>,</p>
                <p>Registrasi kunjungan Anda telah berhasil. Berikut adalah detail rencana kunjungan Anda:</p>

                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                  <tr><td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">ID Kunjungan</td>    <td style="font-weight: bold; border-bottom: 1px solid #eee; color: #4CAF50;">${formatIdEmail}</td></tr>
                  <tr><td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">NIK Terdaftar</td>   <td style="font-weight: bold; border-bottom: 1px solid #eee;">${nik || "-"}</td></tr>
                  <tr><td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Tujuan Kunjungan</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${tujuanKunjungan || "-"}</td></tr>
                  <tr><td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Karyawan Dituju</td> <td style="font-weight: bold; border-bottom: 1px solid #eee;">${karyawanDituju} (${departemen})</td></tr>
                  <tr><td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Gedung Tujuan</td>   <td style="font-weight: bold; border-bottom: 1px solid #eee;">${gedungTujuan || "-"}</td></tr>
                  <tr><td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Rencana Check-in</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${tanggalFormat} - ${jamMasuk} WIB</td></tr>
                </table>

                <div style="margin-top: 30px; padding: 25px; border: 2px dashed #4CAF50; text-align: center; border-radius: 12px; background-color: #f9fff9;">
                  <p style="font-size: 16px; font-weight: bold; color: #2e7d32; margin-bottom: 15px;">QR CODE AKSES</p>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${formatIdEmail}"
                    alt="QR Code"
                    style="display: block; margin: 0 auto; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                  />
                  <p style="font-size: 18px; font-weight: bold; color: #4CAF50; margin-top: 15px; letter-spacing: 1px;">${formatIdEmail}</p>
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                    <p style="font-size: 13px; color: #444; line-height: 1.5; margin: 0;">
                      Tunjukkan QR Code ini kepada petugas Satpam di <strong>Gate Utama</strong> saat tiba di lokasi untuk proses Check-in akses masuk area perusahaan.
                    </p>
                  </div>
                </div>

                <div style="margin-top: 25px; padding: 15px; background-color: #fff9c4; border-radius: 8px; border-left: 4px solid #fbc02d;">
                  <p style="font-size: 13px; color: #574b00; margin: 0;">
                    <strong>Penting:</strong> Harap membawa kartu identitas asli (KTP) yang telah didaftarkan pada saat mengisi formulir registrasi untuk keperluan verifikasi di pos keamanan.
                  </p>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                  Patuhi seluruh protokol K3 dan aturan keamanan yang berlaku di lingkungan PT Pupuk Kujang.<br>
                  © 2026 PT Pupuk Kujang Cikampek - E-Visitor System
                </p>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error("Gagal kirim email:", err);
      }
    }

    return NextResponse.json({ ok: true, data: { id: hasil.id } });
  } catch (error: any) {
    console.error("ERROR API POST:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Gagal menyimpan data." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      const dataKunjungan = await prisma.tamu.findFirst({
        where: {
          OR: [
            { email: email },
            { anggotaRombongan: { some: { email: email } } },
          ],
        },
        include: { anggotaRombongan: true },
        orderBy: { id: 'desc' },
      });

      if (!dataKunjungan) {
        return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Sukses', data: dataKunjungan }, { status: 200 });
    }

    const semuaTamu = await prisma.tamu.findMany({
      include: { anggotaRombongan: true },
      orderBy: { id: 'desc' },
    });

    const result = semuaTamu.map((t) => ({
      id:               t.id,
      name:             t.namaTamu,
      instansi:         t.asalInstansi,
      email:            t.email,
      phone:            t.noTelp,
      departemen:       t.departemen,
      karyawan:         t.karyawanDituju,
      tujuanKunjungan:  t.tujuanKunjungan,
      tipeTamu:         t.tipeTamu ?? "regular",
      status:           t.status,
      statusKunjungan:  t.statusKunjungan,
      tanggalKunjungan: t.tanggalKunjungan,
      visitDate:        t.waktuCheckIn,
      visitTime:        t.waktuCheckIn
        ? new Date(t.waktuCheckIn).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
        : "-",
      checkin:          t.aktualCheckIn  ?? null,
      checkout:         t.aktualCheckOut ?? null,
      anggotaRombongan: t.anggotaRombongan.map((a) => ({
        nama:   a.nama,
        email:  a.email,
        noTelp: a.noTelp,
      })),
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Gagal', error: error.message },
      { status: 500 }
    );
  }
}