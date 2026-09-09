/**
 * What year is it — in Colombo, not in UTC.
 *
 * Every number on this site that ticks over on 1 January has to tick
 * over at midnight where Thushara and his clients are. A Worker has no
 * timezone of its own: `new Date().getFullYear()` is UTC, and Sri Lanka
 * runs 5 hours 30 minutes ahead of it. So for the last five and a half
 * hours of every 31 December, a UTC-based site would still be showing
 * the old year and the old counts to someone reading it in Colombo on
 * New Year's Day.
 *
 * One evening a year, but it is the one evening someone might notice —
 * and it is a stale-looking site rather than a rounding error.
 */

const ZONE = "Asia/Colombo";

/** The civil year in Colombo right now, whatever the server thinks. */
export function currentYear(now: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, year: "numeric" }).format(now),
  );
}

/**
 * Counts that grow by one every 1 January.
 *
 * These are stored as the year something began rather than as the
 * count itself, because a stored count is a number that silently goes
 * wrong the moment nobody remembers to change it. A start year is a
 * fact that never changes, and the count is derived from it — so the
 * site is correct on 1 January without anyone touching anything.
 *
 * `inclusive` is the difference between the two we need:
 *   · years of experience — he started in 2010, so in 2026 that is
 *     16 years elapsed. Not inclusive.
 *   · MDRT qualifications — he first qualified in 2013 and has every
 *     year since, so 2013 through 2026 is 14 times. Inclusive.
 */
export function yearsSince(startYear: number, opts: { inclusive?: boolean } = {}): number {
  const n = currentYear() - startYear + (opts.inclusive ? 1 : 0);
  return n > 0 ? n : 0;
}
