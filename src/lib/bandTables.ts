// Indicative Academic IELTS raw-score -> band conversion tables.
// These are approximate / averaged across official Cambridge past papers —
// actual conversion can shift by +/- one raw mark between test editions.

const LISTENING_TABLE: Array<[number, number, number]> = [
  [39, 40, 9],
  [37, 38, 8.5],
  [35, 36, 8],
  [32, 34, 7.5],
  [30, 31, 7],
  [26, 29, 6.5],
  [23, 25, 6],
  [18, 22, 5.5],
  [16, 17, 5],
  [13, 15, 4.5],
  [11, 12, 4],
  [9, 10, 3.5],
  [6, 8, 3],
  [4, 5, 2.5],
  [3, 3, 2],
  [0, 2, 1],
];

const READING_TABLE: Array<[number, number, number]> = [
  [39, 40, 9],
  [37, 38, 8.5],
  [35, 36, 8],
  [33, 34, 7.5],
  [30, 32, 7],
  [27, 29, 6.5],
  [23, 26, 6],
  [19, 22, 5.5],
  [15, 18, 5],
  [13, 14, 4.5],
  [10, 12, 4],
  [8, 9, 3.5],
  [6, 7, 3],
  [4, 5, 2.5],
  [0, 3, 2],
];

function lookup(table: Array<[number, number, number]>, raw: number): number {
  const clamped = Math.max(0, Math.min(40, Math.round(raw)));
  for (const [min, max, band] of table) {
    if (clamped >= min && clamped <= max) return band;
  }
  return 0;
}

export function listeningBand(raw: number): number {
  return lookup(LISTENING_TABLE, raw);
}

export function readingBand(raw: number): number {
  return lookup(READING_TABLE, raw);
}

export function bandForSkill(skill: string, raw: number, total = 40): number {
  // Normalize to /40 if a different total was supplied
  const normalized = total && total !== 40 ? (raw / total) * 40 : raw;
  if (skill === "listening") return listeningBand(normalized);
  if (skill === "reading") return readingBand(normalized);
  return 0;
}
