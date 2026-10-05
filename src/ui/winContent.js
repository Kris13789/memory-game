import { el } from '../dom.js';
import { PAIRS_TOTAL } from '../game/cards.js';

export function buildWinContent({ moves, onNewGame, onClose }) {
  return el(
    'div',
    {},
    el('h2', { className: 'modal__title', text: 'You win!' }),
    el('p', {
      className: 'modal__text',
      text: `You found all ${PAIRS_TOTAL} pairs in ${moves} moves.`,
    }),
    el(
      'div',
      { className: 'modal__actions' },
      el('button', { className: 'button', text: 'New game', on: { click: () => onNewGame() } }),
      el('button', {
        className: 'button button--secondary',
        text: 'Close',
        on: { click: () => onClose() },
      }),
    ),
  );
}
