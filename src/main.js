import { el } from './dom.js';
import { createGame } from './game/game.js';
import { createBoard } from './ui/board.js';
import { createHeader } from './ui/header.js';
import { createStats } from './ui/stats.js';

const stats = createStats();
const board = createBoard({ onCardClick: (index) => game.flipCard(index) });

function renderGame(state) {
  stats.render(state);
  board.render(state);
}

const game = createGame({ onChange: renderGame });
const header = createHeader({
  onNewGame: () => game.startNewGame(),
  onLeaderboard: () => {},
});

document.body.append(
  el(
    'div',
    { className: 'app' },
    header,
    el('main', { className: 'main' }, stats.element, board.element),
  ),
);

game.startNewGame();
