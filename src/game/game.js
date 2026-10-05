import { createDeck as createShuffledDeck } from './cards.js';

export function createGame({ createDeck = createShuffledDeck, onChange = () => {} } = {}) {
  let state = null;

  function snapshot() {
    return { ...state, cards: state.cards.map((card) => ({ ...card })) };
  }

  function emitChange() {
    onChange(snapshot());
  }

  function startNewGame() {
    state = {
      cards: createDeck().map((card) => ({ ...card, isOpen: false })),
      moves: 0,
      firstIndex: null,
    };
    emitChange();
  }

  function flipCard(index) {
    const card = state.cards[index];

    if (!card || card.isOpen) {
      return;
    }

    card.isOpen = true;

    if (state.firstIndex === null) {
      state.firstIndex = index;
    } else {
      state.firstIndex = null;
      state.moves += 1;
    }

    emitChange();
  }

  return { startNewGame, flipCard, getState: snapshot };
}
