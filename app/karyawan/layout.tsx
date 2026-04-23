// app/karyawan/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, CheckCircle2 } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Ringkasan Aktivitas</h2>
        <p className="text-sm text-slate-500">Berikut adalah data kunjungan tamu untuk hari ini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Tamu</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Masih Berkunjung</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Selesai/Check-out</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">16</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabel Tamu bisa diletakkan di bawah sini */}
    </div>
  )
}