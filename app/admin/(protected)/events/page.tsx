import { createClient } from '@/lib/supabase/server'
import EventsManager from './EventsManager'
import type { Event } from '@/lib/types'

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*, applications(count)')
    .order('year', { ascending: false })
    .order('created_at', { ascending: false })

  return <EventsManager initialEvents={(events as (Event & { applications: { count: number }[] })[]) ?? []} />
}
