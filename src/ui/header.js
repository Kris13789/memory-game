import { el } from '../dom.js';

export function createHeader({ onNewGame, onLeaderboard }) {
  return el(
    'header',
    { className: 'header' },
    el('h1', { className: 'header__title', text: 'Memory Game' }),
    el(
      'div',
      { className: 'header__actions' },
      el('button', { className: 'button', text: 'New game', on: { click: () => onNewGame() } }),
      el('button', {
        className: 'button button--secondary',
        text: 'Leaderboard',
        on: { click: () => onLeaderboard() },
      }),
    ),
  );
}
