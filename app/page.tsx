import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: activeEvent } = await supabase
    .from('events')
    .select('year, slug')
    .eq('is_active', true)
    .single()

  if (activeEvent) {
    redirect(`/events/${activeEvent.year}/${activeEvent.slug}`)
  }

  // No active event — show placeholder
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">CD Smart Campus</h1>
        <p className="text-gray-500 text-lg mb-8">ขณะนี้ยังไม่มีกิจกรรมที่เปิดรับสมัคร</p>
        <p className="text-sm text-gray-400">กรุณาติดตามประกาศจากทางโรงเรียน</p>
      </div>
    </div>
  )
}
