import { el } from '../dom.js';
import { BACK_SRC, FACES, PAIRS_TOTAL, getFace } from '../game/cards.js';

const CARDS_TOTAL = PAIRS_TOTAL * 2;

// Kept at module level so the browser does not drop the requests before the images are cached.
const preloadedImages = [];

function preloadImages() {
  const sources = [BACK_SRC, ...FACES.map((face) => face.src)];

  preloadedImages.push(...sources.map((src) => el('img', { attrs: { src } })));
}

function createCard(index, onCardClick) {
  const image = el('img', {
    className: 'card__image',
    attrs: { src: BACK_SRC, alt: '', draggable: 'false' },
  });
  const button = el(
    'button',
    {
      className: 'card',
      attrs: { 'aria-label': `Card ${index + 1}, face down` },
      on: { click: () => onCardClick(index) },
    },
    image,
  );

  return { button, image };
}

function renderCard({ button, image }, card, index) {
  const isFaceUp = card.isOpen || card.isMatched;
  const face = isFaceUp ? getFace(card.faceId) : null;

  image.src = face ? face.src : BACK_SRC;
  button.classList.toggle('card--open', isFaceUp);
  button.classList.toggle('card--matched', card.isMatched);
  button.setAttribute(
    'aria-label',
    face ? `Card ${index + 1}: ${face.name}` : `Card ${index + 1}, face down`,
  );
}

export function createBoard({ onCardClick }) {
  preloadImages();

  const cardViews = Array.from({ length: CARDS_TOTAL }, (_, index) =>
    createCard(index, onCardClick),
  );
  const element = el(
    'div',
    { className: 'board', attrs: { role: 'group', 'aria-label': 'Memory cards' } },
    ...cardViews.map((view) => view.button),
  );

  function render({ cards, isLocked }) {
    cards.forEach((card, index) => renderCard(cardViews[index], card, index));
    element.classList.toggle('board--locked', isLocked);
  }

  return { element, render };
}
