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

    if (email !== "-") {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

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
                    <p style="margin-top: 0;">Halo <strong>${namaTamu}</strong>,</p>
                    <p>Registrasi kunjungan Anda telah berhasil. Berikut adalah detail kunjungan Anda:</p>
                    
                    <table style="width: 100%; margin-top: 20px; margin-bottom: 30px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666; width: 35%; border-bottom: 1px solid #f0f0f0;">ID Kunjungan</td>
                            <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">${hasil.id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #f0f0f0;">Tujuan</td>
                            <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Departemen ${departemen} (${karyawanDituju})</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #f0f0f0;">Tanggal</td>
                            <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">${tglMasuk}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #f0f0f0;">Waktu</td>
                            <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #f0f0f0;">${jamMasuk} WIB</td>
                        </tr>
                    </table>

                    <div style="border: 2px dashed #ccc; border-radius: 8px; padding: 25px 20px; text-align: center; background-color: #fcfcfc;">
                        <p style="margin-top: 0; margin-bottom: 20px; font-size: 14px; color: #555;">
                            Tunjukkan QR Code ini kepada petugas Security di Gate 1:
                        </p>
                        
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${hasil.id}" alt="QR Code" style="width: 200px; height: 200px; margin: 0 auto; display: block;" />
                    </div>

                    <p style="text-align: center; font-size: 12px; color: #888; margin-top: 25px; line-height: 1.6;">
                        Harap membawa KTP asli yang didaftarkan. QR Code ini hanya berlaku pada hari dan jam yang telah ditentukan.
                    </p>
                </div>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sukses dikirim ke:", email);
      } catch (emailError) {
        console.error("Gagal mengirim email:", emailError);
      }
    }

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
      },
      orderBy: {
        id: 'desc'
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