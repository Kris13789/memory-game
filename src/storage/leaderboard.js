const STORAGE_KEY = 'memory-game.results';

export const LEADERBOARD_SIZE = 10;

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function isValidResult(result) {
  return (
    typeof result === 'object' &&
    result !== null &&
    Number.isInteger(result.moves) &&
    result.moves > 0 &&
    Number.isFinite(result.finishedAt)
  );
}

export function sortResults(results) {
  return [...results].sort((a, b) => a.moves - b.moves || a.finishedAt - b.finishedAt);
}

export function createLeaderboard(storage = getDefaultStorage()) {
  // Results that could not be written to storage stay available until the page is closed.
  const unsaved = [];

  function readStored() {
    if (!storage) {
      return [];
    }

    try {
      const parsed = JSON.parse(storage.getItem(STORAGE_KEY));

      return Array.isArray(parsed) ? parsed.filter(isValidResult) : [];
    } catch {
      return [];
    }
  }

  function load() {
    return [...readStored(), ...unsaved];
  }

  function save(moves, finishedAt = Date.now()) {
    const result = { moves, finishedAt };

    if (!storage) {
      unsaved.push(result);
      return;
    }

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify([...readStored(), result]));
    } catch {
      unsaved.push(result);
    }
  }

  function getTop(limit = LEADERBOARD_SIZE) {
    return sortResults(load()).slice(0, limit);
  }

  return { load, save, getTop };
}
