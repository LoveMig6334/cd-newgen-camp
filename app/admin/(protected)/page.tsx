import { createClient } from "@/lib/supabase/server";

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
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "ผู้สมัครทั้งหมด",
      value: applicantsCount,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      color: "bg-green-50 text-green-600",
    },
    {
      label: "กิจกรรมที่เปิดรับสมัคร",
      value: activeEvent
        ? `${activeEvent.name} (${activeEvent.year})`
        : "ไม่มี",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
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
