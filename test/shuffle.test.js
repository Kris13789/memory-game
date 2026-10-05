import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shuffle } from '../src/game/shuffle.js';

describe('shuffle', () => {
  it('returns a new array with the same elements', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const result = shuffle(items);

    assert.notEqual(result, items);
    assert.deepEqual([...result].sort(), items);
  });

  it('does not change the source array', () => {
    const items = [1, 2, 3, 4];
    shuffle(items);

    assert.deepEqual(items, [1, 2, 3, 4]);
  });

  it('uses the given random source', () => {
    assert.deepEqual(
      shuffle([1, 2, 3, 4], () => 0),
      [2, 3, 4, 1],
    );
  });

  it('keeps the order when random always picks the last index', () => {
    assert.deepEqual(
      shuffle([1, 2, 3, 4], () => 0.999),
      [1, 2, 3, 4],
    );
  });

  it('handles empty and single-item arrays', () => {
    assert.deepEqual(shuffle([]), []);
    assert.deepEqual(shuffle(['a']), ['a']);
  });

  it('produces different orders over repeated calls', () => {
    const orders = new Set();

    for (let i = 0; i < 50; i += 1) {
      orders.add(shuffle([1, 2, 3, 4, 5]).join(','));
    }

    assert.ok(orders.size > 1);
  });
});
