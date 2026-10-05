import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatDate } from '../src/utils/format.js';

describe('formatDate', () => {
  it('formats a date as DD.MM.YYYY', () => {
    assert.equal(formatDate(new Date(2026, 9, 25).getTime()), '25.10.2026');
  });

  it('pads single-digit days and months with zeros', () => {
    assert.equal(formatDate(new Date(2026, 0, 5).getTime()), '05.01.2026');
  });

  it('handles the last day of the year', () => {
    assert.equal(formatDate(new Date(2026, 11, 31).getTime()), '31.12.2026');
  });

  it('does not include the time of day', () => {
    const morning = new Date(2026, 3, 9, 0, 0, 1).getTime();
    const evening = new Date(2026, 3, 9, 23, 59, 59).getTime();

    assert.equal(formatDate(morning), '09.04.2026');
    assert.equal(formatDate(evening), '09.04.2026');
  });
});
