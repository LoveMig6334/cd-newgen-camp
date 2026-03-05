import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="border-t border-gray-800  sm:mt-8 pt-6 text-center">
        <p className="text-gray-400 text-sm">
          &copy; วิชาเสรีคอมพิวเตอร์ CD58
          <span className="mx-2 text-gray-600">|</span>
          <Link
            href="/admin/login"
            className="text-gray-300 hover:text-white underline-offset-2 hover:underline transition-colors"
          >
            Admin Login
          </Link>
        </p>
      </div>
    </footer>
  );
}
