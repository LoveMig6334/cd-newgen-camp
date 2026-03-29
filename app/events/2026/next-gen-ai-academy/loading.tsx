export default function EventLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* NavBar skeleton */}
      <div className="bg-white shadow-md h-16 w-full" />

      {/* Hero skeleton */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">กำลังโหลดหน้ากิจกรรม...</p>
        </div>
      </div>
    </div>
  );
}
