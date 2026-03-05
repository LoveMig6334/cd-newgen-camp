import { createClient } from "@/lib/supabase/server";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineUsers,
} from "react-icons/hi2";

async function getStats() {
  const supabase = await createClient();

  const [
    { count: eventsCount },
    { count: applicantsCount },
    { data: activeEvent },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("name, year")
      .eq("is_active", true)
      .limit(1)
      .single(),
  ]);

  return {
    eventsCount: eventsCount ?? 0,
    applicantsCount: applicantsCount ?? 0,
    activeEvent: activeEvent ?? null,
  };
}

export default async function AdminDashboard() {
  const { eventsCount, applicantsCount, activeEvent } = await getStats();

  const stats = [
    {
      label: "กิจกรรมทั้งหมด",
      value: eventsCount,
      icon: <HiOutlineCalendarDays className="h-6 w-6" />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "ผู้สมัครทั้งหมด",
      value: applicantsCount,
      icon: <HiOutlineUsers className="h-6 w-6" />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "กิจกรรมที่เปิดรับสมัคร",
      value: activeEvent
        ? `${activeEvent.name} (${activeEvent.year})`
        : "ไม่มี",
      icon: <HiOutlineCheckCircle className="h-6 w-6" />,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-500 mt-1">ภาพรวมของระบบ CD Smart Campus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
