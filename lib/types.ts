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
  nickname: string;
  student_id: string;
  grade: string;
  /** Classroom, e.g. "3/1". */
  classroom: string;
  /** Seat number (เลขที่) within the classroom. */
  class_number: number;
  reason: string | null;
  expectations: string;
  how_did_you_hear: string | null;
  created_at: string;
}

// Form data (before submission — no id/event_id/created_at)
export type ApplicationFormData = Omit<
  Application,
  "id" | "event_id" | "created_at"
>;

// Prompt Battle (see lib/promptBattle.ts)
export interface PromptBattleParticipant {
  id: string;
  first_name: string;
  last_initial: string | null;
  nickname: string | null;
  classroom: string | null;
}

export interface PromptBattleSubmission {
  id: string;
  event_id: string;
  application_id: string;
  prompt: string;
  html: string;
  /** AI tools the student used, e.g. ["Claude", "ChatGPT"]. */
  ai_tools: string[];
  submitted_at: string;
}
