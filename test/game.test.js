import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createDeck, FACES, PAIRS_TOTAL } from '../src/game/cards.js';
import { createGame, MISMATCH_DELAY_MS } from '../src/game/game.js';

const keepOrder = (cards) => cards;

// With the unshuffled deck, cards 2n and 2n + 1 show the same face.
const pairOf = (n) => [n * 2, n * 2 + 1];

function createFakeScheduler() {
  let nextId = 1;
  let lastCallback = null;
  let lastDelay = null;
  const tasks = new Map();

  return {
    schedule(callback, delay) {
      const id = nextId;
      nextId += 1;
      tasks.set(id, callback);
      lastCallback = callback;
      lastDelay = delay;
      return id;
    },
    cancel(id) {
      tasks.delete(id);
    },
    runPending() {
      const due = [...tasks.values()];
      tasks.clear();
      due.forEach((callback) => callback());
    },
    get pending() {
      return tasks.size;
    },
    get lastCallback() {
      return lastCallback;
    },
    get lastDelay() {
      return lastDelay;
    },
  };
}

function setup(options = {}) {
  const scheduler = createFakeScheduler();
  const events = { changes: 0, wins: [], decks: 0 };
  const game = createGame({
    createDeck: () => {
      events.decks += 1;
      return createDeck(keepOrder);
    },
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
    onChange: () => {
      events.changes += 1;
    },
    onWin: (result) => events.wins.push(result),
    ...options,
  });

  game.startNewGame();

  return { game, scheduler, events };
}

function flipPair(game, n) {
  pairOf(n).forEach((index) => game.flipCard(index));
}

function playAllPairs(game) {
  for (let n = 0; n < PAIRS_TOTAL; n += 1) {
    flipPair(game, n);
  }
}

const openCount = (game) => game.getState().cards.filter((card) => card.isOpen).length;

describe('createDeck', () => {
  it('builds 16 cards with every face exactly twice', () => {
    const deck = createDeck();

    assert.equal(deck.length, PAIRS_TOTAL * 2);

    for (const face of FACES) {
      assert.equal(deck.filter((card) => card.faceId === face.id).length, 2);
    }
  });

  it('gives every card a unique id', () => {
    assert.equal(new Set(createDeck().map((card) => card.id)).size, 16);
  });

  it('shuffles on every call', () => {
    let calls = 0;
    const countingShuffle = (cards) => {
      calls += 1;
      return cards;
    };

    createDeck(countingShuffle);
    createDeck(countingShuffle);

    assert.equal(calls, 2);
  });
});

describe('game start', () => {
  it('starts with all cards closed and zero counters', () => {
    const { game } = setup();
    const state = game.getState();

    assert.equal(state.cards.length, 16);
    assert.ok(state.cards.every((card) => !card.isOpen && !card.isMatched));
    assert.equal(state.moves, 0);
    assert.equal(state.matchedPairs, 0);
    assert.equal(state.isLocked, false);
    assert.equal(state.isOver, false);
  });
});

describe('card selection', () => {
  it('keeps the first card open and waits for the second one', () => {
    const { game } = setup();

    game.flipCard(0);

    assert.equal(game.getState().cards[0].isOpen, true);
    assert.equal(game.getState().firstIndex, 0);
    assert.equal(game.getState().moves, 0);
  });

  it('counts a move when the second card is opened', () => {
    const { game } = setup();

    game.flipCard(0);
    game.flipCard(2);

    assert.equal(game.getState().moves, 1);
  });

  it('ignores a repeated click on the open first card', () => {
    const { game, events } = setup();

    game.flipCard(0);
    const changesAfterFirstClick = events.changes;
    game.flipCard(0);
    game.flipCard(0);

    assert.equal(game.getState().moves, 0);
    assert.equal(openCount(game), 1);
    assert.equal(events.changes, changesAfterFirstClick);

    game.flipCard(1);

    assert.equal(game.getState().moves, 1);
  });

  it('ignores indexes that are not on the board', () => {
    const { game, events } = setup();
    const changesBefore = events.changes;

    game.flipCard(-1);
    game.flipCard(16);

    assert.equal(events.changes, changesBefore);
    assert.equal(openCount(game), 0);
  });
});

describe('matching pair', () => {
  it('keeps both cards open and counts the pair', () => {
    const { game, scheduler } = setup();

    flipPair(game, 0);
    const state = game.getState();

    assert.ok(state.cards[0].isOpen && state.cards[0].isMatched);
    assert.ok(state.cards[1].isOpen && state.cards[1].isMatched);
    assert.equal(state.matchedPairs, 1);
    assert.equal(state.moves, 1);
    assert.equal(state.isLocked, false);
    assert.equal(scheduler.pending, 0);
  });

  it('ignores clicks on a found pair', () => {
    const { game, events } = setup();

    flipPair(game, 0);
    const changesBefore = events.changes;
    game.flipCard(0);
    game.flipCard(1);

    assert.equal(game.getState().moves, 1);
    assert.equal(game.getState().matchedPairs, 1);
    assert.equal(events.changes, changesBefore);
  });

  it('lets the player continue with the next pair', () => {
    const { game } = setup();

    flipPair(game, 0);
    flipPair(game, 1);

    assert.equal(game.getState().matchedPairs, 2);
    assert.equal(game.getState().moves, 2);
  });
});

describe('mismatched pair', () => {
  it('keeps both cards open, locks the board and counts the move', () => {
    const { game, scheduler } = setup();

    game.flipCard(0);
    game.flipCard(2);
    const state = game.getState();

    assert.ok(state.cards[0].isOpen && state.cards[2].isOpen);
    assert.equal(state.isLocked, true);
    assert.equal(state.moves, 1);
    assert.equal(state.matchedPairs, 0);
    assert.equal(scheduler.pending, 1);
  });

  it('schedules the close inside the required 700-1500 ms range', () => {
    const { game, scheduler } = setup();

    game.flipCard(0);
    game.flipCard(2);

    assert.equal(scheduler.lastDelay, MISMATCH_DELAY_MS);
    assert.ok(MISMATCH_DELAY_MS >= 700 && MISMATCH_DELAY_MS <= 1500);
  });

  it('does not open other cards until the pair is closed', () => {
    const { game, events } = setup();

    game.flipCard(0);
    game.flipCard(2);
    const changesBefore = events.changes;
    game.flipCard(4);
    game.flipCard(0);

    assert.equal(game.getState().cards[4].isOpen, false);
    assert.equal(game.getState().moves, 1);
    assert.equal(openCount(game), 2);
    assert.equal(events.changes, changesBefore);
  });

  it('closes both cards and unlocks the board after the delay', () => {
    const { game, scheduler } = setup();

    game.flipCard(0);
    game.flipCard(2);
    scheduler.runPending();

    assert.equal(openCount(game), 0);
    assert.equal(game.getState().isLocked, false);
    assert.equal(game.getState().moves, 1);

    game.flipCard(4);

    assert.equal(game.getState().cards[4].isOpen, true);
  });
});

describe('win', () => {
  it('reports the win once with the number of moves', () => {
    const { game, events } = setup();

    playAllPairs(game);

    assert.deepEqual(events.wins, [{ moves: 8 }]);
    assert.equal(game.getState().isOver, true);
    assert.equal(game.getState().matchedPairs, 8);
  });

  it('counts mismatched attempts in the total moves', () => {
    const { game, scheduler, events } = setup();

    game.flipCard(0);
    game.flipCard(2);
    scheduler.runPending();
    playAllPairs(game);

    assert.deepEqual(events.wins, [{ moves: 9 }]);
  });

  it('ignores card clicks after the game is over', () => {
    const { game, events } = setup();

    playAllPairs(game);
    const changesBefore = events.changes;
    game.flipCard(0);
    game.flipCard(5);

    assert.equal(game.getState().moves, 8);
    assert.equal(events.changes, changesBefore);
    assert.equal(events.wins.length, 1);
  });
});

describe('new game', () => {
  it('resets the board and counters after a win', () => {
    const { game } = setup();

    playAllPairs(game);
    game.startNewGame();
    const state = game.getState();

    assert.ok(state.cards.every((card) => !card.isOpen && !card.isMatched));
    assert.equal(state.moves, 0);
    assert.equal(state.matchedPairs, 0);
    assert.equal(state.isOver, false);

    game.flipCard(0);

    assert.equal(game.getState().cards[0].isOpen, true);
  });

  it('cancels the close timer of an open mismatched pair and restarts at once', () => {
    const { game, scheduler } = setup();

    game.flipCard(0);
    game.flipCard(2);
    game.startNewGame();

    assert.equal(scheduler.pending, 0);
    assert.equal(openCount(game), 0);
    assert.equal(game.getState().isLocked, false);
    assert.equal(game.getState().moves, 0);

    game.flipCard(4);

    assert.equal(game.getState().cards[4].isOpen, true);
  });

  it('ignores a stale close callback from the previous game', () => {
    const { game, scheduler } = setup();

    game.flipCard(0);
    game.flipCard(2);
    const staleCallback = scheduler.lastCallback;
    game.startNewGame();
    game.flipCard(0);
    staleCallback();

    assert.equal(game.getState().cards[0].isOpen, true);
    assert.equal(game.getState().firstIndex, 0);
  });

  it('builds a new deck for every game', () => {
    const { game, events } = setup();

    game.startNewGame();
    game.startNewGame();

    assert.equal(events.decks, 3);
  });
});

describe('change notifications', () => {
  it('passes a copy of the state, not the internal object', () => {
    let received = null;
    const { game } = setup({
      onChange: (state) => {
        received = state;
      },
    });

    received.cards[0].isOpen = true;

    assert.equal(game.getState().cards[0].isOpen, false);
  });
});
