import { createClient } from '@/lib/supabase/server'
import ApplicantsViewer from './ApplicantsViewer'
import type { Event } from '@/lib/types'

export default async function AdminApplicantsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('id, name, year, max_applicants, is_active')
    .order('year', { ascending: false })
    .order('created_at', { ascending: false })

  return <ApplicantsViewer events={(events as Pick<Event, 'id' | 'name' | 'year' | 'max_applicants' | 'is_active'>[]) ?? []} />
}
