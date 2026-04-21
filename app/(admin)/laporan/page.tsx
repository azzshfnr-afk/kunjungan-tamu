"use client";

import * as React from "react";
import { useState } from "react";
import { Calendar, FileText, Search } from "lucide-react";
import { format } from "date-fns";

import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusType =
  | "Pending"
  | "Check-in"
  | "Selesai"
  | "Ditolak";

type Visitor = {
  id: string;
  name: string;
  instansi: string;
  email: string;
  departemen: string;
  date: string;
  karyawan: string;
  checkin: string | null;
  checkout: string | null;
  rejected: boolean;
};

type DateRangePickerProps = {
  startDate?: Date;
  endDate?: Date;
  setStartDate: React.Dispatch<
    React.SetStateAction<Date | undefined>
  >;
  setEndDate: React.Dispatch<
    React.SetStateAction<Date | undefined>
  >;
  onApply: () => void;
};

type StatusBadgeProps = {
  status: StatusType;
};

export default function LaporanPage() {
  const currentYear = new Date().getFullYear();

  const [data, setData] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] =
    useState("Semua");

  const [tempStartDate, setTempStartDate] =
    useState<Date | undefined>();

  const [tempEndDate, setTempEndDate] =
    useState<Date | undefined>();

  const [appliedStartDate, setAppliedStartDate] =
    useState<Date | undefined>();

  const [appliedEndDate, setAppliedEndDate] =
    useState<Date | undefined>();

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const years = [
    "Semua",
    ...Array.from(
      { length: 5 },
      (_, i) => String(currentYear - i)
    ),
  ];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/laporan");
        const result: Visitor[] =
          await res.json();

        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function getStatus(
    item: Visitor
  ): StatusType {
    if (item.rejected) return "Ditolak";
    if (!item.checkin) return "Pending";
    if (item.checkin && !item.checkout)
      return "Check-in";
    return "Selesai";
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const filteredData = data.filter(
    (item) => {
      const itemDate = new Date(item.date);
      const itemYear = String(
        itemDate.getFullYear()
      );

      const keyword =
        search.toLowerCase();

      const isDateMatch =
        !appliedStartDate &&
        !appliedEndDate
          ? true
          : appliedStartDate &&
            appliedEndDate
          ? itemDate >=
              appliedStartDate &&
            itemDate <=
              appliedEndDate
          : true;

      return (
        isDateMatch &&
        (selectedYear ===
          "Semua" ||
          itemYear ===
            selectedYear) &&
        (item.name
          .toLowerCase()
          .includes(keyword) ||
          item.email
            .toLowerCase()
            .includes(keyword) ||
          item.id
            .toLowerCase()
            .includes(keyword))
      );
    }
  );

  const sortedData = [
    ...filteredData,
  ].sort(
    (a, b) =>
      new Date(
        b.date
      ).getTime() -
      new Date(
        a.date
      ).getTime()
  );

  const totalPages = Math.ceil(
    sortedData.length /
      rowsPerPage
  );

  const paginatedData =
    sortedData.slice(
      (page - 1) *
        rowsPerPage,
      page *
        rowsPerPage
    );

  if (loading) {
    return (
      <p className="p-4">
        Loading...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText size={16} />
        <span>›</span>
        <span className="font-medium text-foreground">
          Laporan
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-green-100 p-4 text-green-600">
          <FileText size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Laporan Periode
          </h1>

          <p className="text-sm text-muted-foreground">
            Filter dan lihat
            laporan
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap justify-between gap-4 rounded-xl border bg-background p-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search ID, nama..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedYear}
            onValueChange={(
              value
            ) => {
              setSelectedYear(
                value
              );
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>

            <SelectContent>
              {years.map(
                (year) => (
                  <SelectItem
                    key={
                      year
                    }
                    value={
                      year
                    }
                  >
                    {year}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <DateRangePicker
            startDate={
              tempStartDate
            }
            endDate={
              tempEndDate
            }
            setStartDate={
              setTempStartDate
            }
            setEndDate={
              setTempEndDate
            }
            onApply={() => {
              setAppliedStartDate(
                tempStartDate
              );

              setAppliedEndDate(
                tempEndDate
              );

              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background shadow-sm">
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">
                  No
                </th>
                <th className="p-2">
                  ID
                </th>
                <th className="p-2">
                  Nama
                </th>
                <th className="p-2">
                  Instansi
                </th>
                <th className="p-2">
                  Email
                </th>
                <th className="p-2">
                  Departemen
                </th>
                <th className="p-2">
                  Karyawan
                </th>
                <th className="p-2">
                  Tanggal
                </th>
                <th className="p-2">
                  Check-in
                </th>
                <th className="p-2">
                  Check-out
                </th>
                <th className="p-2">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map(
                (
                  item,
                  index
                ) => {
                  const status =
                    getStatus(
                      item
                    );

                  return (
                    <tr
                      key={
                        item.id
                      }
                      className="border-b"
                    >
                      <td className="p-2">
                        {(page -
                          1) *
                          rowsPerPage +
                          index +
                          1}
                      </td>

                      <td className="p-2">
                        {
                          item.id
                        }
                      </td>

                      <td className="p-2">
                        {
                          item.name
                        }
                      </td>

                      <td className="p-2">
                        {
                          item.instansi
                        }
                      </td>

                      <td className="p-2">
                        {
                          item.email
                        }
                      </td>

                      <td className="p-2">
                        {
                          item.departemen
                        }
                      </td>

                      <td className="p-2">
                        {
                          item.karyawan
                        }
                      </td>

                      <td className="p-2">
                        {formatDate(
                          item.date
                        )}
                      </td>

                      <td className="p-2">
                        {item.checkin ||
                          "-"}
                      </td>

                      <td className="p-2">
                        {item.checkout ||
                          "-"}
                      </td>

                      <td className="p-2">
                        <StatusBadge
                          status={
                            status
                          }
                        />
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t p-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of{" "}
            {totalPages || 1}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={
                page === 1
              }
              onClick={() =>
                setPage(
                  page - 1
                )
              }
            >
              Prev
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={
                page ===
                  totalPages ||
                totalPages ===
                  0
              }
              onClick={() =>
                setPage(
                  page + 1
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DateRangePicker({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApply,
}: DateRangePickerProps) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="relative">
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
      >
        <Calendar size={14} />

        {startDate &&
        endDate
          ? `${format(
              startDate,
              "yyyy-MM-dd"
            )} - ${format(
              endDate,
              "yyyy-MM-dd"
            )}`
          : "Pilih Tanggal"}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 space-y-3 rounded-xl border bg-background p-4 shadow">
          <div className="flex gap-4">
            <CalendarUI
              mode="single"
              selected={
                startDate
              }
              onSelect={
                setStartDate
              }
            />

            <CalendarUI
              mode="single"
              selected={
                endDate
              }
              onSelect={
                setEndDate
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStartDate(
                  undefined
                );
                setEndDate(
                  undefined
                );
              }}
            >
              Reset
            </Button>

            <Button
              size="sm"
              onClick={() => {
                onApply();
                setOpen(
                  false
                );
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles: Record<
    StatusType,
    string
  > = {
    Pending:
      "bg-yellow-100 text-yellow-600",
    "Check-in":
      "bg-green-100 text-green-600",
    Selesai:
      "bg-blue-100 text-blue-600",
    Ditolak:
      "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs ${styles[status]}`}
    >
      {status}
    </span>
  );
}