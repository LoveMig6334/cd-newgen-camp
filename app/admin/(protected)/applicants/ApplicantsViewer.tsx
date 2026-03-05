"use client";

import type { Application, Event } from "@/lib/types";
import { useState, useTransition } from "react";
import { HiOutlineArrowDownTray } from "react-icons/hi2";

type EventOption = Pick<
  Event,
  "id" | "name" | "year" | "max_applicants" | "is_active"
>;

function exportCSV(applicants: Application[], eventName: string) {
  const headers = [
    "ชื่อ",
    "นามสกุล",
    "อีเมล",
    "โทรศัพท์",
    "โรงเรียน",
    "ระดับชั้น",
    "วันที่สมัคร",
  ];
  const rows = applicants.map((a) => [
    a.first_name,
    a.last_name,
    a.email,
    a.phone,
    a.school,
    a.grade,
    new Date(a.created_at).toLocaleDateString("th-TH"),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `applicants-${eventName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ApplicantsViewer({
  events,
}: {
  events: EventOption[];
}) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  async function handleEventChange(id: string) {
    setSelectedEventId(id);
    setSearch("");
    if (!id) {
      setApplicants([]);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/applicants?event_id=${id}`);
    if (res.ok) setApplicants(await res.json());
    setLoading(false);
  }

  const filtered = applicants.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.first_name.toLowerCase().includes(q) ||
      a.last_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.school.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ผู้สมัคร</h1>
        <p className="text-gray-500 mt-1">ดูรายชื่อผู้สมัครแยกตามกิจกรรม</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <select
            value={selectedEventId}
            onChange={(e) => handleEventChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 min-w-55"
          >
            <option value="">-- เลือกกิจกรรม --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.year} — {event.name}
              </option>
            ))}
          </select>

          {selectedEventId ? (
            <input
              type="text"
              placeholder="ค้นหาชื่อ อีเมล หรือโรงเรียน..."
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                startTransition(() => setSearch(value));
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 flex-1"
            />
          ) : null}
        </div>

        {selectedEventId && applicants.length > 0 ? (
          <button
            onClick={() => exportCSV(filtered, selectedEvent?.name ?? "event")}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" />
            ส่งออก CSV
          </button>
        ) : null}
      </div>

      {/* Stats bar */}
      {selectedEvent ? (
        <div className="mb-3 text-sm text-gray-600">
          ผู้สมัคร{" "}
          <span className="font-semibold text-gray-900">{filtered.length}</span>
          {search ? ` (กรองจาก ${applicants.length})` : null} คน จาก{" "}
          <span className="font-semibold text-gray-900">
            {selectedEvent.max_applicants}
          </span>{" "}
          คน
        </div>
      ) : null}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading || isPending ? (
          <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
        ) : !selectedEventId ? (
          <div className="text-center py-12 text-gray-400">
            กรุณาเลือกกิจกรรม
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    #
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    ชื่อ
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    นามสกุล
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    อีเมล
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    โทรศัพท์
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    โรงเรียน
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    ระดับชั้น
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    วันที่สมัคร
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      {applicants.length === 0
                        ? "ยังไม่มีผู้สมัคร"
                        : "ไม่พบผลลัพธ์"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((applicant, i) => (
                    <tr key={applicant.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 text-gray-900">
                        {applicant.first_name}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {applicant.last_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {applicant.email}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {applicant.phone}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {applicant.school}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {applicant.grade}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(applicant.created_at).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
