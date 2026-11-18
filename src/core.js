// The synodic month is the average time between two identical lunar phases,
// commonly measured new moon to new moon. The value used here is the
// standard astronomical mean length of 29.530588853 days.
export const SYNODIC_MONTH = 29.530588853;

// Reference new moon: 2000-01-06 18:14 UTC, a well-known epoch used by
// many simple lunar phase calculators. Using a fixed epoch keeps the
// calculation deterministic and independent of the system clock.
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

const MS_PER_DAY = 86400000;

// The eight traditional phase names, in order starting from new moon.
export const PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

/**
 * Return the phase name for a given date.
 *
 * The calculation divides the time since the known new moon by the synodic
 * month, takes the fractional part, and maps it to one of eight equal
 * segments. This is a simple approximation: real lunar phases vary by up to
 * about 0.5 days from the mean because the Moon's orbit is elliptical.
 *
 * @param {Date} date - The date to compute the phase for.
 * @returns {string} One of the strings in PHASE_NAMES.
 */
export function phaseName(date) {
  const phase = phaseForDate(date);
  const index = Math.floor(phase * 8 + 0.5) % 8;
  return PHASE_NAMES[index];
}

/**
 * Return the illuminated fraction of the Moon's disk for a given date.
 *
 * Illumination is computed as (1 - cos(2*pi*phase)) / 2, which gives 0 at
 * new moon and 1 at full moon. This is the standard geometric approximation
 * and matches the phase angle derived from the synodic position.
 *
 * @param {Date} date - The date to compute illumination for.
 * @returns {number} A value between 0 and 1 inclusive.
 */
export function illumination(date) {
  const phase = phaseForDate(date);
  return (1 - Math.cos(2 * Math.PI * phase)) / 2;
}

/**
 * Return the fractional position within the synodic cycle for a date.
 *
 * 0.0 means new moon, 0.5 means full moon, and values close to 1.0 mean
 * the next new moon is imminent. Negative dates (before the epoch) are
 * handled by taking the modulo in a way that always yields a value in
 * [0, 1).
 *
 * @param {Date} date - The date to compute the phase position for.
 * @returns {number} A value in [0, 1).
 */
export function phaseForDate(date) {
  const ms = date.getTime();
  if (!Number.isFinite(ms)) {
    throw new TypeError('date must be a valid Date');
  }
  const daysSince = (ms - KNOWN_NEW_MOON_MS) / MS_PER_DAY;
  const cycles = daysSince / SYNODIC_MONTH;
  return cycles - Math.floor(cycles);
}

/**
 * A small convenience class that bundles the phase, illumination, and
 * fractional position for a single date. The constructor takes a Date and
 * validates it immediately so that downstream methods cannot fail.
 */
export class MoonPhase {
  /**
   * @param {Date} date - The date to analyze.
   */
  constructor(date) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
      throw new TypeError('MoonPhase requires a valid Date');
    }
    this.date = new Date(date.getTime());
  }

  /**
   * @returns {number} Fractional position in the synodic cycle, in [0, 1).
   */
  get phase() {
    return phaseForDate(this.date);
  }

  /**
   * @returns {string} One of the PHASE_NAMES strings.
   */
  get name() {
    return phaseName(this.date);
  }

  /**
   * @returns {number} Illuminated fraction between 0 and 1.
   */
  get illumination() {
    return illumination(this.date);
  }
}
