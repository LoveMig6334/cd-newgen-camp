// Shared types for CDSC Multi-Year Event Platform

export interface Event {
  id: string;
  year: number;
  slug: string;
  name: string;
  description: string | null;
  is_active: boolean;
  max_applicants: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  reason: string;
  expectations: string;
  how_did_you_hear: string | null;
  created_at: string;
}

// Form data (before submission — no id/event_id/created_at)
export type ApplicationFormData = Omit<
  Application,
  "id" | "event_id" | "created_at"
>;
