// Per-event application rules that are not stored in the `events` table.
// Grades are Thai secondary levels (มัธยมศึกษาปีที่ 1–6).

export const ALL_GRADES = [1, 2, 3, 4, 5, 6] as const;

export const gradeLabel = (grade: number) => `มัธยมศึกษาปีที่ ${grade}`;

/** Parse the grade number back out of a `gradeLabel()` string. */
export const gradeFromLabel = (label: string): number | null => {
  const m = /(\d+)\s*$/.exec(label);
  return m ? Number(m[1]) : null;
};

/** Number of classrooms (ห้อง) per grade. ม.5 has 2, every other grade has 3. */
export const ROOMS_PER_GRADE: Record<number, number> = {
  1: 3,
  2: 3,
  3: 3,
  4: 3,
  5: 2,
  6: 3,
};

/** Classroom options for a grade, e.g. 3 → ["3/1", "3/2", "3/3"]. */
export const classroomOptions = (grade: number): string[] =>
  Array.from(
    { length: ROOMS_PER_GRADE[grade] ?? 3 },
    (_, i) => `${grade}/${i + 1}`,
  );

/** Display label for a classroom, e.g. "3/1" → "ม.3/1". */
export const classroomLabel = (classroom: string) => `ม.${classroom}`;

/** Grade number a classroom belongs to, e.g. "3/1" → 3. */
export const gradeFromClassroom = (classroom: string): number | null => {
  const m = /^([1-6])\/[1-9]$/.exec(classroom);
  return m ? Number(m[1]) : null;
};

/** Highest seat number (เลขที่) accepted in a classroom. */
export const MAX_CLASS_NUMBER = 60;

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
