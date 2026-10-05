import { createDeck as createShuffledDeck, PAIRS_TOTAL } from './cards.js';

export const MISMATCH_DELAY_MS = 1000;

export function createGame({
  createDeck = createShuffledDeck,
  schedule = setTimeout,
  cancel = clearTimeout,
  delay = MISMATCH_DELAY_MS,
  onChange = () => {},
  onWin = () => {},
} = {}) {
  let state = null;
  let timerId = null;
  let gameToken = 0;

  function snapshot() {
    return { ...state, cards: state.cards.map((card) => ({ ...card })) };
  }

  function emitChange() {
    onChange(snapshot());
  }

  function startNewGame() {
    if (timerId !== null) {
      cancel(timerId);
      timerId = null;
    }

    gameToken += 1;
    state = {
      cards: createDeck().map((card) => ({ ...card, isOpen: false, isMatched: false })),
      moves: 0,
      matchedPairs: 0,
      firstIndex: null,
      isLocked: false,
      isOver: false,
    };
    emitChange();
  }

  function closeMismatch(token, firstIndex, secondIndex) {
    if (token !== gameToken) {
      return;
    }

    state.cards[firstIndex].isOpen = false;
    state.cards[secondIndex].isOpen = false;
    state.isLocked = false;
    timerId = null;
    emitChange();
  }

  function flipCard(index) {
    const card = state.cards[index];

    if (!card || state.isOver || state.isLocked || card.isOpen || card.isMatched) {
      return;
    }

    card.isOpen = true;

    if (state.firstIndex === null) {
      state.firstIndex = index;
      emitChange();
      return;
    }

    const firstIndex = state.firstIndex;
    state.firstIndex = null;
    state.moves += 1;

    if (state.cards[firstIndex].faceId !== card.faceId) {
      const token = gameToken;
      state.isLocked = true;
      timerId = schedule(() => closeMismatch(token, firstIndex, index), delay);
      emitChange();
      return;
    }

    state.cards[firstIndex].isMatched = true;
    card.isMatched = true;
    state.matchedPairs += 1;
    state.isOver = state.matchedPairs === PAIRS_TOTAL;
    emitChange();

    if (state.isOver) {
      onWin({ moves: state.moves });
    }
  }

  return { startNewGame, flipCard, getState: snapshot };
}
