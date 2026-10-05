import { el } from '../dom.js';
import { formatDate } from '../utils/format.js';

const COLUMNS = ['Place', 'Moves', 'Date'];

function buildTable(results) {
  return el(
    'table',
    { className: 'leaderboard' },
    el(
      'thead',
      {},
      el('tr', {}, ...COLUMNS.map((title) => el('th', { text: title, attrs: { scope: 'col' } }))),
    ),
    el(
      'tbody',
      {},
      ...results.map((result, index) =>
        el(
          'tr',
          {},
          el('td', { text: String(index + 1) }),
          el('td', { text: String(result.moves) }),
          el('td', { text: formatDate(result.finishedAt) }),
        ),
      ),
    ),
  );
}

export function buildLeaderboardContent({ results, onClose }) {
  return el(
    'div',
    {},
    el('h2', { className: 'modal__title', text: 'Leaderboard' }),
    results.length > 0
      ? buildTable(results)
      : el('p', { className: 'modal__text', text: 'No results yet' }),
    el(
      'div',
      { className: 'modal__actions' },
      el('button', { className: 'button', text: 'Close', on: { click: () => onClose() } }),
    ),
  );
}
