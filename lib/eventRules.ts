// Per-event application rules that are not stored in the `events` table.
// Grades are Thai secondary levels (มัธยมศึกษาปีที่ 1–6).

export const ALL_GRADES = [1, 2, 3, 4, 5, 6] as const;

export const gradeLabel = (grade: number) => `มัธยมศึกษาปีที่ ${grade}`;

export interface EventRules {
  /** Grades (ม.1–ม.6) allowed to apply. */
  allowedGrades: number[];
}

const DEFAULT_RULES: EventRules = { allowedGrades: [...ALL_GRADES] };

const EVENT_RULES: Record<string, EventRules> = {
  // CD AI Innovation Bootcamp 2026 — ม.3 – ม.6 only
  "2026/next-gen-ai-academy": { allowedGrades: [3, 4, 5, 6] },
};

export function getEventRules(year: number, slug: string): EventRules {
  return EVENT_RULES[`${year}/${slug}`] ?? DEFAULT_RULES;
}
