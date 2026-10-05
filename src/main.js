import { el } from './dom.js';
import { createGame } from './game/game.js';
import { createBoard } from './ui/board.js';
import { createHeader } from './ui/header.js';
import { createModal } from './ui/modal.js';
import { createStats } from './ui/stats.js';
import { buildWinContent } from './ui/winContent.js';

const modal = createModal();
const stats = createStats();
const board = createBoard({ onCardClick: (index) => game.flipCard(index) });

function renderGame(state) {
  stats.render(state);
  board.render(state);
}

function startNewGame() {
  modal.close();
  game.startNewGame();
}

function showWin({ moves }) {
  modal.open(buildWinContent({ moves, onNewGame: startNewGame, onClose: modal.close }), 'Victory');
}

const game = createGame({ onChange: renderGame, onWin: showWin });
const header = createHeader({
  onNewGame: startNewGame,
  onLeaderboard: () => {},
});

document.body.append(
  el(
    'div',
    { className: 'app' },
    header,
    el('main', { className: 'main' }, stats.element, board.element),
  ),
  modal.element,
);

game.startNewGame();
