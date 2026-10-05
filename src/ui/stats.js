import { el } from '../dom.js';
import { PAIRS_TOTAL } from '../game/cards.js';

export function createStats() {
  const moves = el('p', { className: 'stats__item' });
  const pairs = el('p', { className: 'stats__item' });
  const element = el(
    'section',
    { className: 'stats', attrs: { role: 'status', 'aria-label': 'Game progress' } },
    moves,
    pairs,
  );

  function render({ moves: movesCount, matchedPairs }) {
    moves.textContent = `Moves: ${movesCount}`;
    pairs.textContent = `Pairs found: ${matchedPairs} of ${PAIRS_TOTAL}`;
  }

  return { element, render };
}
