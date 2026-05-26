import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cronToken = searchParams.get("token");
    if (cronToken !== process.env.CRON_SECRET) {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const waktuSekarang = new Date();
    const tamuOverdue = await prisma.tamu.findMany({
      where: {
        email: { 
          not: null, 
          contains: "@" 
        }, 
        statusKunjungan: {
          in: ["Check-in", "Check-in Area", "Masuk Area", "MENUNGGU_GATE_1"] 
        },
        waktuCheckOut: {
          lt: waktuSekarang 
        }
      }
    });

    if (tamuOverdue.length === 0) {
      return NextResponse.json({ message: "Aman, tidak ada tamu yang melewati batas waktu." });
    }

    for (const tamu of tamuOverdue) {
      const formatJamDeadline = new Date(tamu.waktuCheckOut).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const formatIdEmail = `PKC-${String(tamu.id).padStart(4, '0')}`;
      const mailOptions = {
        from: `"Sistem Keamanan & Aset" <${process.env.EMAIL_USER}>`,
        to: tamu.email!,
        subject: `⚠️ PERINGATAN KERAS: KARTU AKSES NFC BELUM DIKEMBALIKAN (ID: ${formatIdEmail})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: bold;">🚨 PERINGATAN PENGEMBALIAN KARTU NFC</h2>
                  <p style="margin: 5px 0 0 0; font-size: 13px;">PT Pupuk Kujang Cikampek - Keamanan Aset</p>
              </div>
              <div style="padding: 25px; color: #333; background-color: #fffafb;">
                  <p>Yth. Bapak/Ibu <strong>${tamu.namaTamu}</strong>,</p>
                  <p>Sistem E-Visitor mendeteksi bahwa batas waktu kunjungan terdaftar Anda telah <strong>BERAKHIR</strong> pada pukul <strong>${formatJamDeadline} WIB</strong>, namun Anda tercatat <strong>BELUM melakukan proses check-out & pengembalian kartu akses</strong>.</p>
                  
                  <div style="background-color: #fff5f5; border: 1px solid #feb2b2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #9b2c2c;"> REGULASI KETAT PERUSAHAAN:</p>
                      <p style="margin: 0; font-size: 13px; color: #742a2a; line-height: 1.5;">
                          Kartu Akses NFC yang Anda pegang merupakan <strong>Aset Fisik Milik PT Pupuk Kujang</strong>. Kelalaian yang menyebabkan kartu terbawa pulang atau hilang akan dikenakan <strong>Sanksi Tegas, Denda Penggantian, dan Pemblokiran Hak Akses (Blacklist)</strong>.
                      </p>
                  </div>

                  <p style="font-size: 13px; line-height: 1.5;"><strong>Segera lakukan tindakan ini:</strong></p>
                  <ol style="font-size: 13px; line-height: 1.5; padding-left: 20px; color: #4a5568;">
                      <li>Kembali ke <strong>Pos Penjagaan Satpam Gate Utama</strong> PT Pupuk Kujang.</li>
                      <li>Serahkan fisik Kartu Akses NFC Anda kepada petugas satpam yang bertugas.</li>
                  </ol>

                  <div style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
                      <p style="font-size: 11px; color: #a0aec0; margin: 0;">© 2026 PT Pupuk Kujang Cikampek - E-Visitor System</p>
                  </div>
              </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({
      message: "Sukses",
      info: `Berhasil mengirimkan ${tamuOverdue.length} alert email otomatis.`
    });

  } catch (error: any) {
    console.error("CRON REMINDER ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}