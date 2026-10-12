export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Rounds a raw average to the nearest IELTS-style 0.25 -> rounds to nearest 0.5 (.25 rounds up) */
export function roundToIeltsBand(value: number): number {
  if (Number.isNaN(value)) return 0;
  const doubled = value * 4;
  const rounded = Math.round(doubled);
  return Math.round((rounded / 4) * 2) / 2 === rounded / 4 ? rounded / 4 : rounded / 4;
}

/** Proper IELTS overall rounding: average of 4 skills rounded to nearest .5, with .25/.75 rounding UP */
export function ieltsOverallRound(avg: number): number {
  const remainder = avg - Math.floor(avg);
  if (remainder < 0.25) return Math.floor(avg);
  if (remainder < 0.75) return Math.floor(avg) + 0.5;
  return Math.ceil(avg);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysBetween(target: string | Date) {
  const d = typeof target === "string" ? new Date(target) : target;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return Math.ceil((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const SKILLS = ["listening", "reading", "writing", "speaking"] as const;
export type Skill = (typeof SKILLS)[number];

export const SKILL_LABELS: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
  vocab: "Vocabulary",
  general: "General",
};
