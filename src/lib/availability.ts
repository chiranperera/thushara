/**
 * Availability — turns the `availability` rows Thushara controls in
 * /admin into concrete bookable slots.
 *
 * Evening and weekend slots matter more than anything else here: a
 * Medical Officer cannot take a call at 2pm. If this returns only
 * weekday-daytime slots, the site fails its primary audience.
 */

export interface Slot {
  /** "18:30" — 24h, used as the stored value */
  value: string;
  /** "6:30 pm" — what the visitor sees */
  label: string;
  period: "morning" | "afternoon" | "evening";
  available: boolean;
}

export interface DayAvailability {
  /** "2026-09-08" */
  date: string;
  weekday: number;
  /** "Tue 8 Sep" */
  label: string;
  slots: Slot[];
  hasSlots: boolean;
  blocked: boolean;
  blockedReason?: string;
}

export interface AvailabilityConfig {
  appointmentMinutes: number;
  bufferMinutes: number;
  maxPerDay: number;
  bookingsPaused: boolean;
}

export interface AvailabilityWindow {
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

export function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const period = h < 12 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function periodOf(minutes: number): Slot["period"] {
  if (minutes < 12 * 60) return "morning";
  if (minutes < 17 * 60) return "afternoon";
  return "evening";
}

/** YYYY-MM-DD in local terms, avoiding UTC drift from toISOString(). */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAYS[date.getDay()]} ${d} ${MONTHS[m - 1]}`;
}

export function formatLongDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const full = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const fullMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${full[date.getDay()]} ${d} ${fullMonths[m - 1]}`;
}

/**
 * Builds the next `days` days of availability.
 *
 * @param windows      active availability rows
 * @param blockedDates dates Thushara has blocked out
 * @param booked       map of dateKey -> already-taken "HH:MM" times
 * @param leadTimeHours how soon someone may book. Default 3h: a slot
 *                      two minutes from now helps nobody.
 */
export function buildAvailability(opts: {
  windows: AvailabilityWindow[];
  blockedDates: Map<string, string>;
  booked: Map<string, Set<string>>;
  config: AvailabilityConfig;
  from?: Date;
  days?: number;
}): DayAvailability[] {
  const { windows, blockedDates, booked, config } = opts;
  const from = opts.from ?? new Date();
  const days = opts.days ?? 30;
  const leadTimeHours = 3;

  if (config.bookingsPaused) return [];

  const earliest = new Date(from.getTime() + leadTimeHours * 60 * 60 * 1000);
  const step = Math.max(15, config.appointmentMinutes + config.bufferMinutes);

  const out: DayAvailability[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const dateKey = toDateKey(date);
    const weekday = date.getDay();

    const blockedReason = blockedDates.get(dateKey);
    const takenToday = booked.get(dateKey) ?? new Set<string>();
    const dayWindows = windows.filter((w) => w.day_of_week === weekday && w.active);

    const slots: Slot[] = [];
    for (const w of dayWindows) {
      const start = toMinutes(w.start_time);
      const end = toMinutes(w.end_time);
      for (let m = start; m + config.appointmentMinutes <= end; m += step) {
        const value = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
        if (slots.some((s) => s.value === value)) continue;

        const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(m / 60), m % 60);
        const tooSoon = slotDate < earliest;
        const taken = takenToday.has(value);

        slots.push({
          value,
          label: formatTime(value),
          period: periodOf(m),
          available: !blockedReason && !tooSoon && !taken,
        });
      }
    }

    slots.sort((a, b) => toMinutes(a.value) - toMinutes(b.value));

    const dayFull = takenToday.size >= config.maxPerDay;
    if (dayFull) slots.forEach((s) => (s.available = false));

    out.push({
      date: dateKey,
      weekday,
      label: formatDayLabel(dateKey),
      slots,
      hasSlots: slots.some((s) => s.available),
      blocked: Boolean(blockedReason) || dayFull,
      blockedReason: blockedReason ?? (dayFull ? "Fully booked" : undefined),
    });
  }

  return out;
}

/**
 * The next day with a free slot. Powers the "fully booked" state,
 * which should always offer a way forward rather than a dead end.
 */
export function nextAvailableDay(days: DayAvailability[], after: string): DayAvailability | null {
  return days.find((d) => d.date > after && d.hasSlots) ?? null;
}

/** Does that day include an evening slot? Worth saying explicitly. */
export function hasEveningSlot(day: DayAvailability): boolean {
  return day.slots.some((s) => s.available && s.period === "evening");
}

/* ============================================================
   Wire format.

   The full DayAvailability[] serialises to ~60KB of hydration
   payload — unacceptable on the conversion page over mobile data.
   Only the available slot times cross the wire; labels, periods
   and weekdays are all derivable, so they are recomputed client-side.
   Measured: ~60KB -> ~4KB.
   ============================================================ */

export interface CompactDay {
  /** date key, "2026-09-08" */
  d: string;
  /** available slot times, "HH:MM" */
  s: string[];
  /** blocked reason, when the day is unavailable */
  b?: string;
}

export function toCompact(days: DayAvailability[]): CompactDay[] {
  return days
    // Days with no configured hours at all are simply absent from the picker.
    .filter((day) => day.slots.length > 0 || day.blocked)
    .map((day) => {
      const out: CompactDay = { d: day.date, s: day.slots.filter((s) => s.available).map((s) => s.value) };
      if (day.blockedReason) out.b = day.blockedReason;
      return out;
    });
}

export function fromCompact(compact: CompactDay[]): DayAvailability[] {
  return compact.map((c) => {
    const [y, m, d] = c.d.split("-").map(Number);
    const slots: Slot[] = c.s.map((value) => {
      const [hh, mm] = value.split(":").map(Number);
      return { value, label: formatTime(value), period: periodOf(hh * 60 + mm), available: true };
    });
    return {
      date: c.d,
      weekday: new Date(y, m - 1, d).getDay(),
      label: formatDayLabel(c.d),
      slots,
      hasSlots: slots.length > 0,
      blocked: Boolean(c.b),
      blockedReason: c.b,
    };
  });
}
