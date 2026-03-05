import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  HiOutlineCalendarDays,
  HiOutlineHome,
  HiOutlineUsers,
} from "react-icons/hi2";
import LogoutButton from "../components/LogoutButton";

const navItems = [
  {
    href: "/admin",
    label: "แดชบอร์ด",
    icon: <HiOutlineHome className="h-5 w-5" />,
  },
  {
    href: "/admin/events",
    label: "กิจกรรม",
    icon: <HiOutlineCalendarDays className="h-5 w-5" />,
  },
  {
    href: "/admin/applicants",
    label: "ผู้สมัคร",
    icon: <HiOutlineUsers className="h-5 w-5" />,
  },
];

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-30 lg:flex">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">CDSC Admin</h1>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-gray-900">CDSC Admin</span>
          <nav className="flex gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-blue-600"
                title={item.label}
              >
                {item.icon}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
