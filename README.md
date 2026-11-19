# simple-moon-phase

Determines the lunar phase and illumination percentage for a given date by computing the synodic cycle position relative to a known new moon epoch.

## Usage

```js
import { MoonPhase, phaseName, illumination } from 'simple-moon-phase';

const date = new Date('2024-01-25T17:54:00Z');
const mp = new MoonPhase(date);

console.log(mp.name);          // 'Full Moon'
console.log(mp.illumination);  // ~0.99
console.log(phaseName(date));  // 'Full Moon'
console.log(illumination(date)); // ~0.99
```

## Why this library exists

Most lunar phase calculators either pull in a large astronomy library or use a
hard-coded table of dates. This library does neither. It uses a single known
new moon epoch and the mean synodic month to compute the phase position. The
trade-off is accuracy: the mean synodic month is an average, so the computed
phase can differ from the true astronomical phase by up to about half a day.
For applications that need to know whether the Moon is waxing or waning, or
roughly how full it is, that is more than enough.

## Edge cases

The library uses the mean synodic month, so the phase position drifts slowly
relative to the true Moon. If you need precise phase times, this is not the
right tool. Dates before the reference epoch are handled by wrapping the
fractional cycle position into [0, 1), so the library works for any valid
JavaScript `Date`.

## API

### `phaseForDate(date)`

Returns the fractional position in the synodic cycle as a number in [0, 1),
where 0 is new moon and 0.5 is full moon. Throws `TypeError` if `date` is not
a valid `Date`.

### `phaseName(date)`

Returns one of the eight phase names as a string. Throws `TypeError` if `date`
is not a valid `Date`.

### `illumination(date)`

Returns the illuminated fraction of the Moon's disk as a number between 0 and
1 inclusive. Throws `TypeError` if `date` is not a valid `Date`.

### `new MoonPhase(date)`

Creates an object with `phase`, `name`, and `illumination` getters. Throws
`TypeError` if `date` is not a valid `Date`.

### `PHASE_NAMES`

An array of the eight phase name strings in order starting from new moon.

### `SYNODIC_MONTH`

The mean length of the synodic month in days, used by the calculations.
