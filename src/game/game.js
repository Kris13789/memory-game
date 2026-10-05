import { createDeck as createShuffledDeck, PAIRS_TOTAL } from './cards.js';

export function createGame({
  createDeck = createShuffledDeck,
  onChange = () => {},
  onWin = () => {},
} = {}) {
  let state = null;

  function snapshot() {
    return { ...state, cards: state.cards.map((card) => ({ ...card })) };
  }

  function emitChange() {
    onChange(snapshot());
  }

  function startNewGame() {
    state = {
      cards: createDeck().map((card) => ({ ...card, isOpen: false, isMatched: false })),
      moves: 0,
      matchedPairs: 0,
      firstIndex: null,
      isOver: false,
    };
    emitChange();
  }

  function flipCard(index) {
    const card = state.cards[index];

    if (!card || state.isOver || card.isOpen || card.isMatched) {
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

    if (state.cards[firstIndex].faceId === card.faceId) {
      state.cards[firstIndex].isMatched = true;
      card.isMatched = true;
      state.matchedPairs += 1;
      state.isOver = state.matchedPairs === PAIRS_TOTAL;
    }

    emitChange();

    if (state.isOver) {
      onWin({ moves: state.moves });
    }
  }

  return { startNewGame, flipCard, getState: snapshot };
}
