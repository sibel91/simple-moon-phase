import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MoonPhase,
  PHASE_NAMES,
  SYNODIC_MONTH,
  phaseName,
  illumination,
  phaseForDate,
} from '../src/index.js';

// A fixed epoch new moon used by the implementation. The tests use this
// same date so they are deterministic and do not depend on the wall clock.
const EPOCH = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

function approx(actual, expected, eps = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${actual} to be within ${eps} of ${expected}`
  );
}

test('new moon at the reference epoch', () => {
  approx(phaseForDate(EPOCH), 0);
  assert.equal(phaseName(EPOCH), 'New Moon');
  approx(illumination(EPOCH), 0);
});

test('full moon half a synodic month after the epoch', () => {
  const full = new Date(EPOCH.getTime() + (SYNODIC_MONTH / 2) * 86400000);
  approx(phaseForDate(full), 0.5);
  assert.equal(phaseName(full), 'Full Moon');
  approx(illumination(full), 1);
});

test('first quarter a quarter of a synodic month after the epoch', () => {
  const firstQuarter = new Date(
    EPOCH.getTime() + (SYNODIC_MONTH / 4) * 86400000
  );
  approx(phaseForDate(firstQuarter), 0.25);
  assert.equal(phaseName(firstQuarter), 'First Quarter');
  approx(illumination(firstQuarter), 0.5);
});

test('last quarter three quarters of a synodic month after the epoch', () => {
  const lastQuarter = new Date(
    EPOCH.getTime() + (3 * SYNODIC_MONTH / 4) * 86400000
  );
  approx(phaseForDate(lastQuarter), 0.75);
  assert.equal(phaseName(lastQuarter), 'Last Quarter');
  approx(illumination(lastQuarter), 0.5);
});

test('dates before the epoch wrap into [0, 1)', () => {
  const before = new Date(EPOCH.getTime() - (SYNODIC_MONTH / 4) * 86400000);
  const phase = phaseForDate(before);
  assert.ok(phase >= 0 && phase < 1, `phase ${phase} not in [0,1)`);
  approx(phase, 0.75);
  assert.equal(phaseName(before), 'Last Quarter');
});

test('phase names cover all eight segments', () => {
  const seen = new Set();
  for (let i = 0; i < 8; i++) {
    const d = new Date(EPOCH.getTime() + (i * SYNODIC_MONTH / 8) * 86400000);
    seen.add(phaseName(d));
  }
  assert.equal(seen.size, 8);
  assert.deepEqual([...seen].sort(), [...PHASE_NAMES].sort());
});

test('illumination is symmetric around full moon', () => {
  const quarter = (SYNODIC_MONTH / 4) * 86400000;
  const waxing = new Date(EPOCH.getTime() + quarter);
  const waning = new Date(EPOCH.getTime() + 3 * quarter);
  approx(illumination(waxing), illumination(waning), 1e-6);
});

test('MoonPhase class exposes phase, name, and illumination', () => {
  const mp = new MoonPhase(EPOCH);
  approx(mp.phase, 0);
  assert.equal(mp.name, 'New Moon');
  approx(mp.illumination, 0);
});

test('MoonPhase rejects invalid dates', () => {
  assert.throws(() => new MoonPhase(new Date('invalid')), TypeError);
  assert.throws(() => new MoonPhase('not a date'), TypeError);
});

test('phaseForDate rejects invalid dates', () => {
  assert.throws(() => phaseForDate(new Date('invalid')), TypeError);
  assert.throws(() => phaseForDate('not a date'), TypeError);
});

test('illumination is always between 0 and 1', () => {
  for (let i = 0; i < 100; i++) {
    const d = new Date(EPOCH.getTime() + i * 86400000);
    const v = illumination(d);
    assert.ok(v >= 0 && v <= 1, `illumination ${v} out of range`);
  }
});
