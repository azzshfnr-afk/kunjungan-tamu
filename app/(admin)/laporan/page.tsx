"use client";

import * as React from "react";
import { useState } from "react";
import {
  Calendar, FileText, Search, MoreHorizontal,
  Download, FileSpreadsheet, Sheet,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



type StatusType     = "Pending" | "Check-in" | "Selesai" | "Ditolak";
type TipeTamu       = "regular" | "vip";
type DownloadFormat = "excel" | "pdf" | "csv";

type Visitor = {
  id: string;
  name: string;
  instansi: string;
  email: string;
  departemen: string;
  date: string;
  dateTo?: string;
  karyawan: string;
  checkin: string | null;
  checkout: string | null;
  rejected: boolean;
  tipeTamu?: TipeTamu;
  noTelp?: string;
  nik?: string;
  tujuanKunjungan?: string;
  gedungTujuan?: string;
  aksesAktif?: string;
  fotoKtp?: string;
};



function getStatus(item: Visitor): StatusType {
  if (item.rejected)                  return "Ditolak";
  if (!item.checkin)                  return "Pending";
  if (item.checkin && !item.checkout) return "Check-in";
  return "Selesai";
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatDateTime(dt?: string | null) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return dt;
  return d.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}


function StatusBadge({ status }: { status: StatusType }) {
  const styles: Record<StatusType, string> = {
    Pending:    "bg-yellow-100 text-yellow-700 ring-yellow-300",
    "Check-in": "bg-blue-100 text-blue-700 ring-blue-300",
    Selesai:    "bg-green-100 text-green-700 ring-green-300",
    Ditolak:    "bg-red-100 text-red-700 ring-red-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}

function TipeBadge({ tipe }: { tipe?: TipeTamu }) {
  if (tipe === "vip") {
    return (
      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 border border-amber-300">
        ★ VIP
      </span>
    );
  }
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
      Reguler
    </span>
  );
}

function InfoRow({ label, nilai }: { label: string; nilai?: string | null }) {
  return (
    <div className="flex justify-between text-sm py-1.5 gap-4 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-right text-gray-800">{nilai || "-"}</span>
    </div>
  );
}


type DateRangePickerProps = {
  startDate?: Date;
  endDate?: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setEndDate:   React.Dispatch<React.SetStateAction<Date | undefined>>;
  onApply: () => void;
};

function DateRangePicker({ startDate, endDate, setStartDate, setEndDate, onApply }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
      >
        <Calendar size={14} />
        {startDate && endDate
          ? `${format(startDate, "dd MMM yyyy")} – ${format(endDate, "dd MMM yyyy")}`
          : "Pilih Tanggal"}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 space-y-3 rounded-xl border bg-background p-4 shadow-lg">
          <div className="flex gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Dari</p>
              <CalendarUI mode="single" selected={startDate} onSelect={setStartDate} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Sampai</p>
              <CalendarUI mode="single" selected={endDate} onSelect={setEndDate} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}>
              Reset
            </Button>
            <Button size="sm" onClick={() => { onApply(); setOpen(false); }}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


const FORMAT_META: Record<DownloadFormat, { label: string; ext: string; icon: React.ReactNode }> = {
  excel: { label: "Excel", ext: "xls",  icon: <FileSpreadsheet className="h-4 w-4 text-green-600" /> },
  pdf:   { label: "PDF",   ext: "pdf",  icon: <FileText        className="h-4 w-4 text-red-500"   /> },
  csv:   { label: "CSV",   ext: "csv",  icon: <Sheet           className="h-4 w-4 text-blue-500"  /> },
};

function buildRows(data: Visitor[]) {
  return data.map((item) => ({
    ID:           item.id,
    Tipe:         item.tipeTamu === "vip" ? "VIP" : "Reguler",
    Nama:         item.name,
    Instansi:     item.instansi,
    Email:        item.email,
    Departemen:   item.departemen,
    Karyawan:     item.karyawan,
    "Tgl Dari":   formatDate(item.date),
    "Tgl Sampai": item.dateTo ? formatDate(item.dateTo) : formatDate(item.date),
    "Check-in":   formatDateTime(item.checkin),
    "Check-out":  formatDateTime(item.checkout),
    Status:       getStatus(item),
  }));
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(data: Visitor[], filename: string) {
  const rows    = buildRows(data);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${(r as Record<string, string>)[h] ?? ""}"`).join(",")
    ),
  ].join("\n");
  triggerDownload(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }), filename);
}

function downloadExcel(data: Visitor[], filename: string) {
  const rows    = buildRows(data);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body><table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((r) =>
            `<tr>${headers.map((h) => `<td>${(r as Record<string, string>)[h] ?? ""}</td>`).join("")}</tr>`
          ).join("")}
        </tbody>
      </table></body>
    </html>`;
  triggerDownload(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" }), filename);
}

function downloadPDF(data: Visitor[]) {
  const rows    = buildRows(data);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const html = `<!DOCTYPE html><html>
    <head>
      <meta charset="UTF-8">
      <style>
        body  { font-family: Arial, sans-serif; margin: 24px; }
        h2    { font-size: 16px; margin-bottom: 8px; }
        p     { font-size: 12px; color: #555; margin-bottom: 16px; }
        table { border-collapse: collapse; width: 100%; }
        th    { background: #16a34a; color: #fff; padding: 7px 8px; font-size: 11px; border: 1px solid #15803d; text-align: left; }
        td    { border: 1px solid #ddd; padding: 6px 8px; font-size: 11px; }
        tr:nth-child(even) { background: #f0fdf4; }
      </style>
    </head>
    <body>
      <h2>Laporan Kunjungan Tamu</h2>
      <p>Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
      <table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((r) =>
            `<tr>${headers.map((h) => `<td>${(r as Record<string, string>)[h] ?? ""}</td>`).join("")}</tr>`
          ).join("")}
        </tbody>
      </table>
    </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.print(); win.close(); }, 500);
}



export default function LaporanPage() {
  const currentYear = new Date().getFullYear();
  const years = ["Semua", ...Array.from({ length: 5 }, (_, i) => String(currentYear - i))];

  const [data, setData]       = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [selectedYear, setSelectedYear] = useState("Semua");

  const [tempStartDate, setTempStartDate]       = useState<Date | undefined>();
  const [tempEndDate, setTempEndDate]           = useState<Date | undefined>();
  const [appliedStartDate, setAppliedStartDate] = useState<Date | undefined>();
  const [appliedEndDate, setAppliedEndDate]     = useState<Date | undefined>();

  const [page, setPage]               = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailTamu, setDetailTamu]   = useState<Visitor | null>(null);

  const [downloadFormat, setDownloadFormat]       = useState<DownloadFormat | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading]         = useState(false);

  React.useEffect(() => {
    fetch("/api/laporan")
      .then((r) => r.json())
      .then((result) => setData(Array.isArray(result) ? result : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredData = data.filter((item) => {
    const itemDate = new Date(item.date);
    const keyword  = search.toLowerCase();
    const inRange  =
      appliedStartDate && appliedEndDate
        ? itemDate >= appliedStartDate && itemDate <= appliedEndDate
        : true;

    return (
      inRange &&
      (selectedYear === "Semua" || String(itemDate.getFullYear()) === selectedYear) &&
      [item.name, item.email, item.id, item.instansi].some((v) =>
        v.toLowerCase().includes(keyword)
      )
    );
  });

  const sortedData    = [...filteredData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages    = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function handleSelectFormat(fmt: DownloadFormat) {
    setDownloadFormat(fmt);
    setConfirmDialogOpen(true);
  }

  async function handleConfirmDownload() {
    if (!downloadFormat) return;
    setIsDownloading(true);

    const { ext, label } = FORMAT_META[downloadFormat];
    const filename = `laporan_kunjungan_${format(new Date(), "yyyyMMdd_HHmm")}.${ext}`;

    await new Promise((r) => setTimeout(r, 600));

    try {
      if (downloadFormat === "csv")   downloadCSV(sortedData, filename);
      if (downloadFormat === "excel") downloadExcel(sortedData, filename);
      if (downloadFormat === "pdf")   downloadPDF(sortedData);

      toast.success("Download berhasil!", {
        description: `${sortedData.length} data diunduh sebagai ${label}`,
      });
    } catch {
      toast.error("Download gagal", {
        description: "Terjadi kesalahan saat mengunduh. Coba lagi.",
      });
    } finally {
      setIsDownloading(false);
      setConfirmDialogOpen(false);
      setDownloadFormat(null);
    }
  }

  if (loading) return <p className="p-4 text-sm text-muted-foreground animate-pulse">Memuat data…</p>;

  const hasActiveFilter = !!(appliedStartDate || appliedEndDate || selectedYear !== "Semua" || search);

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText size={16} />
        <span>›</span>
        <span className="font-medium text-foreground">Laporan</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-green-100 p-4 text-green-600">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Laporan Periode</h1>
          <p className="text-sm text-muted-foreground">Filter dan lihat laporan kunjungan tamu</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-4 rounded-xl border bg-background p-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setPage(1); }}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <DateRangePicker
            startDate={tempStartDate}
            endDate={tempEndDate}
            setStartDate={setTempStartDate}
            setEndDate={setTempEndDate}
            onApply={() => { setAppliedStartDate(tempStartDate); setAppliedEndDate(tempEndDate); setPage(1); }}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Laporan
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {sortedData.length} data (filter aktif)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["excel", "pdf", "csv"] as DownloadFormat[]).map((fmt) => (
                <DropdownMenuItem key={fmt} onClick={() => handleSelectFormat(fmt)} className="gap-2 cursor-pointer">
                  {FORMAT_META[fmt].icon}
                  <span>Download {FORMAT_META[fmt].label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={(o) => { if (!isDownloading) setConfirmDialogOpen(o); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {downloadFormat && FORMAT_META[downloadFormat].icon}
              Konfirmasi Download {downloadFormat ? FORMAT_META[downloadFormat].label : ""}
            </DialogTitle>
            <DialogDescription>
              Anda akan mengunduh{" "}
              <span className="font-semibold text-foreground">{sortedData.length} data</span>{" "}
              sesuai filter aktif sebagai file{" "}
              <span className="font-semibold text-foreground">
                {downloadFormat ? FORMAT_META[downloadFormat].label : ""}
              </span>.
            </DialogDescription>
          </DialogHeader>

          {hasActiveFilter && (
            <div className="rounded-lg bg-muted p-3 text-xs space-y-1 text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Filter aktif:</p>
              {selectedYear !== "Semua" && <p>• Tahun: {selectedYear}</p>}
              {appliedStartDate && appliedEndDate && (
                <p>• Tanggal: {format(appliedStartDate, "dd MMM yyyy")} – {format(appliedEndDate, "dd MMM yyyy")}</p>
              )}
              {search && <p>• Pencarian: "{search}"</p>}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={isDownloading}>
              Batal
            </Button>
            <Button onClick={handleConfirmDownload} disabled={isDownloading} className="gap-2">
              {isDownloading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Mengunduh…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Ya, Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     
      <div className="rounded-xl border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                {["No","ID","Tipe","Nama","Instansi","Email","Departemen","Karyawan",
                  "Tgl Kunjungan (Dari – Sampai)","Check-in","Check-out","Status","Detail",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-sm text-muted-foreground">
                    Tidak ada data yang sesuai
                  </td>
                </tr>
              ) : paginatedData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b transition-colors ${
                    item.tipeTamu === "vip" ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{(page - 1) * rowsPerPage + index + 1}</td>
                  <td className="px-3 py-2.5 font-mono text-xs font-bold text-gray-600">PKC-{item.id}</td>
                  <td className="px-3 py-2.5"><TipeBadge tipe={item.tipeTamu} /></td>
                  <td className="px-3 py-2.5 font-semibold text-gray-900 whitespace-nowrap">{item.name}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.instansi}</td>
                  <td className="px-3 py-2.5 text-gray-600 text-xs">{item.email}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.departemen}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.karyawan}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-gray-800 font-medium">{formatDate(item.date)}</span>
                    {item.dateTo ? (
                      <>
                        <span className="mx-1 text-gray-400">–</span>
                        <span className="text-gray-800 font-medium">{formatDate(item.dateTo)}</span>
                      </>
                    ) : (
                      <span className="ml-1 text-gray-400 text-xs">(1 hari)</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-blue-600 font-medium whitespace-nowrap">
                    {item.checkin ? formatDateTime(item.checkin) : "-"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-red-500 font-medium whitespace-nowrap">
                    {item.checkout ? formatDateTime(item.checkout) : "-"}
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge status={getStatus(item)} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setDetailTamu(item)}
                      className="inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="flex items-center justify-between border-t px-4 py-3 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Tampilkan</span>
            <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>baris</span>
            <span className="ml-2 text-gray-400">({sortedData.length} total data)</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages || 1}</p>
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      </div>

      
      <Dialog open={!!detailTamu} onOpenChange={(open) => !open && setDetailTamu(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detail Tamu: {detailTamu?.name}
              {detailTamu?.tipeTamu === "vip" && <TipeBadge tipe="vip" />}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {detailTamu?.fotoKtp ? (
              <img
                src={detailTamu.fotoKtp}
                alt="Foto KTP"
                className="w-full h-auto max-h-44 object-contain rounded-lg border border-gray-200 bg-gray-50"
              />
            ) : (
              <div className="w-full h-24 flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                Tidak ada foto KTP
              </div>
            )}

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Identitas Tamu</p>
              <InfoRow label="ID Tamu"       nilai={detailTamu?.id? `PKC-${detailTamu.id}` : undefined} />
              <InfoRow label="Nama Lengkap"  nilai={detailTamu?.name} />
              <InfoRow label="Tipe Tamu"     nilai={detailTamu?.tipeTamu === "vip" ? "VIP" : "Reguler"} />
              <InfoRow label="NIK"           nilai={detailTamu?.nik} />
              <InfoRow label="No. Handphone" nilai={detailTamu?.noTelp} />
              <InfoRow label="Email"         nilai={detailTamu?.email} />
              <InfoRow label="Instansi"      nilai={detailTamu?.instansi} />
            </div>

            <div className="bg-green-50 rounded-xl border border-green-100 p-4 space-y-1">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Detail Kunjungan</p>
              <InfoRow label="Departemen"       nilai={detailTamu?.departemen} />
              <InfoRow label="Karyawan Dituju"  nilai={detailTamu?.karyawan} />
              <InfoRow label="Tujuan Kunjungan" nilai={detailTamu?.tujuanKunjungan} />
              <InfoRow label="Gedung Tujuan"    nilai={detailTamu?.gedungTujuan} />
              <InfoRow
                label="Tgl Kunjungan"
                nilai={
                  detailTamu?.date
                    ? detailTamu.dateTo
                      ? `${formatDate(detailTamu.date)} – ${formatDate(detailTamu.dateTo)}`
                      : formatDate(detailTamu.date)
                    : undefined
                }
              />
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status & Akses</p>
              <InfoRow label="Akses Aktif"     nilai={detailTamu?.aksesAktif || "Belum Ada"} />
              <InfoRow label="Waktu Check-in"  nilai={formatDateTime(detailTamu?.checkin)} />
              <InfoRow label="Waktu Check-out" nilai={formatDateTime(detailTamu?.checkout)} />
              <div className="flex justify-between items-center py-1.5">
                <span className="text-sm text-gray-500">Status</span>
                {detailTamu && <StatusBadge status={getStatus(detailTamu)} />}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}