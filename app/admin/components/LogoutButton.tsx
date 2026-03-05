"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
      ออกจากระบบ
    </button>
  );
}
