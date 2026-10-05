import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createLeaderboard, LEADERBOARD_SIZE, sortResults } from '../src/storage/leaderboard.js';

const KEY = 'memory-game.results';

function createFakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const writes = [];

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      writes.push(key);
      data.set(key, String(value));
    },
    data,
    writes,
  };
}

describe('sortResults', () => {
  it('puts fewer moves first', () => {
    const sorted = sortResults([
      { moves: 14, finishedAt: 1 },
      { moves: 9, finishedAt: 2 },
      { moves: 11, finishedAt: 3 },
    ]);

    assert.deepEqual(
      sorted.map((result) => result.moves),
      [9, 11, 14],
    );
  });

  it('puts the earlier game first when moves are equal', () => {
    const sorted = sortResults([
      { moves: 10, finishedAt: 300 },
      { moves: 10, finishedAt: 100 },
      { moves: 10, finishedAt: 200 },
    ]);

    assert.deepEqual(
      sorted.map((result) => result.finishedAt),
      [100, 200, 300],
    );
  });

  it('does not change the source array', () => {
    const results = [
      { moves: 12, finishedAt: 1 },
      { moves: 9, finishedAt: 2 },
    ];

    sortResults(results);

    assert.equal(results[0].moves, 12);
  });
});

describe('leaderboard', () => {
  it('is empty when nothing has been saved', () => {
    const leaderboard = createLeaderboard(createFakeStorage());

    assert.deepEqual(leaderboard.load(), []);
    assert.deepEqual(leaderboard.getTop(), []);
  });

  it('saves a result with its moves and finish time', () => {
    const leaderboard = createLeaderboard(createFakeStorage());

    leaderboard.save(12, 5000);

    assert.deepEqual(leaderboard.load(), [{ moves: 12, finishedAt: 5000 }]);
  });

  it('uses the current time when no finish time is given', () => {
    const leaderboard = createLeaderboard(createFakeStorage());
    const before = Date.now();

    leaderboard.save(12);

    const [result] = leaderboard.load();
    assert.ok(result.finishedAt >= before && result.finishedAt <= Date.now());
  });

  it('keeps results after a reload', () => {
    const storage = createFakeStorage();

    createLeaderboard(storage).save(12, 5000);
    const afterReload = createLeaderboard(storage);

    assert.deepEqual(afterReload.getTop(), [{ moves: 12, finishedAt: 5000 }]);
  });

  it('adds one entry per saved game and keeps older ones', () => {
    const leaderboard = createLeaderboard(createFakeStorage());

    leaderboard.save(12, 1);
    leaderboard.save(12, 2);
    leaderboard.save(15, 3);

    assert.equal(leaderboard.load().length, 3);
  });

  it('does not write to storage when results are read', () => {
    const storage = createFakeStorage();
    const leaderboard = createLeaderboard(storage);

    leaderboard.save(12, 1);
    const writesAfterSave = storage.writes.length;
    leaderboard.getTop();
    leaderboard.load();
    leaderboard.getTop();

    assert.equal(storage.writes.length, writesAfterSave);
  });

  it('returns the best results first and ties by the earlier game', () => {
    const leaderboard = createLeaderboard(createFakeStorage());

    leaderboard.save(14, 1);
    leaderboard.save(10, 3);
    leaderboard.save(10, 2);

    assert.deepEqual(leaderboard.getTop(), [
      { moves: 10, finishedAt: 2 },
      { moves: 10, finishedAt: 3 },
      { moves: 14, finishedAt: 1 },
    ]);
  });

  it('shows only the 10 best results but keeps every game', () => {
    const leaderboard = createLeaderboard(createFakeStorage());

    for (let i = 0; i < 12; i += 1) {
      leaderboard.save(30 - i, i);
    }

    const top = leaderboard.getTop();

    assert.equal(LEADERBOARD_SIZE, 10);
    assert.equal(top.length, 10);
    assert.deepEqual(
      top.map((result) => result.moves),
      [19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
    );
    assert.equal(leaderboard.load().length, 12);
  });

  it('shows all results when there are fewer than 10', () => {
    const leaderboard = createLeaderboard(createFakeStorage());

    leaderboard.save(12, 1);
    leaderboard.save(11, 2);

    assert.equal(leaderboard.getTop().length, 2);
  });

  it('treats corrupt stored data as empty and repairs it on save', () => {
    const storage = createFakeStorage({ [KEY]: '{not json' });
    const leaderboard = createLeaderboard(storage);

    assert.deepEqual(leaderboard.load(), []);

    leaderboard.save(12, 1);

    assert.deepEqual(JSON.parse(storage.data.get(KEY)), [{ moves: 12, finishedAt: 1 }]);
  });

  it('ignores stored entries that are not valid results', () => {
    const stored = JSON.stringify([
      { moves: 'many', finishedAt: 1 },
      { moves: 12 },
      null,
      { moves: 11, finishedAt: 2 },
    ]);
    const leaderboard = createLeaderboard(createFakeStorage({ [KEY]: stored }));

    assert.deepEqual(leaderboard.load(), [{ moves: 11, finishedAt: 2 }]);
  });

  it('keeps results for the session when storage is unavailable', () => {
    const leaderboard = createLeaderboard(null);

    leaderboard.save(12, 1);

    assert.deepEqual(leaderboard.getTop(), [{ moves: 12, finishedAt: 1 }]);
  });

  it('does not throw and keeps the result when writing fails', () => {
    const storage = createFakeStorage();
    storage.setItem = () => {
      throw new Error('quota exceeded');
    };
    const leaderboard = createLeaderboard(storage);

    leaderboard.save(12, 1);

    assert.deepEqual(leaderboard.getTop(), [{ moves: 12, finishedAt: 1 }]);
  });
});
