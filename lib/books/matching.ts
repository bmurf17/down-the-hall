/**
 * Pure title/author matching helpers used by the Hardcover id backfill script.
 * Kept separate so they can be unit tested without touching the database or
 * the network.
 */
export interface PendingBook {
  id: number;
  title: string;
  release_year: number | null;
  user_id: string;
  author: string | null;
}

export interface Candidate {
  id: number;
  title: string;
  alternativeTitles: string[];
  authorNames: string[];
  releaseYear: number | null;
  titleScore: number;
  authorScore: number;
  score: number;
}

export const MIN_TITLE_SCORE = 0.6;
export const MIN_AUTHOR_SCORE = 0.7;
export const MIN_OVERALL_SCORE = 0.8;

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function titleScore(dbTitle: string, candidate: Candidate): number {
  const db = normalize(dbTitle);
  if (!db) return 0;

  const variants = [candidate.title, ...candidate.alternativeTitles]
    .map(normalize)
    .filter(Boolean);

  const dbTokens = new Set(db.split(" "));
  let best = 0;

  for (const variant of variants) {
    if (variant === db) {
      best = Math.max(best, 1);
      continue;
    }

    const variantTokens = new Set(variant.split(" "));
    let intersection = 0;
    for (const token of dbTokens) {
      if (variantTokens.has(token)) intersection++;
    }
    if (intersection === 0) continue;

    const dbCovered = intersection / dbTokens.size;
    const variantCovered = intersection / variantTokens.size;
    const jaccard =
      intersection / (dbTokens.size + variantTokens.size - intersection);

    // One title being a subset of the other (e.g. subtitle differences) is a
    // strong signal; otherwise fall back to token overlap.
    const containment = Math.max(dbCovered, variantCovered);
    const score = containment >= 1 ? 0.95 : 0.6 * containment + 0.4 * jaccard;
    best = Math.max(best, score);
  }

  return best;
}

export function authorScore(dbAuthor: string, candidate: Candidate): number {
  const author = normalize(dbAuthor);
  if (!author) return 0;

  const authorTokens = new Set(author.split(" "));
  let best = 0;

  for (const name of candidate.authorNames) {
    const normalized = normalize(name);
    if (!normalized) continue;

    if (normalized === author) {
      best = Math.max(best, 1);
      continue;
    }

    if (normalized.includes(author) || author.includes(normalized)) {
      best = Math.max(best, 0.85);
      continue;
    }

    const nameTokens = new Set(normalized.split(" "));
    let shared = 0;
    for (const token of authorTokens) {
      if (nameTokens.has(token)) shared++;
    }
    const ratio = shared / authorTokens.size;
    if (ratio >= 0.6) {
      best = Math.max(best, 0.7 * ratio);
    }
  }

  return best;
}

export function isConfident(book: PendingBook, candidate: Candidate): boolean {
  if (candidate.titleScore < MIN_TITLE_SCORE) return false;
  if (book.author?.trim() && candidate.authorScore < MIN_AUTHOR_SCORE) {
    return false;
  }
  return candidate.score >= MIN_OVERALL_SCORE;
}
