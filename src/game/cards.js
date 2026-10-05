import { shuffle } from './shuffle.js';

export const BACK_SRC = 'assets/cards/back.svg';

export const FACES = [
  { id: 'star', name: 'Star', src: 'assets/cards/star.svg' },
  { id: 'heart', name: 'Heart', src: 'assets/cards/heart.svg' },
  { id: 'moon', name: 'Moon', src: 'assets/cards/moon.svg' },
  { id: 'sun', name: 'Sun', src: 'assets/cards/sun.svg' },
  { id: 'bolt', name: 'Lightning bolt', src: 'assets/cards/bolt.svg' },
  { id: 'drop', name: 'Water drop', src: 'assets/cards/drop.svg' },
  { id: 'leaf', name: 'Leaf', src: 'assets/cards/leaf.svg' },
  { id: 'gem', name: 'Gem', src: 'assets/cards/gem.svg' },
];

export const PAIRS_TOTAL = FACES.length;

export function getFace(faceId) {
  return FACES.find((face) => face.id === faceId);
}

export function createDeck(shuffleCards = shuffle) {
  const cards = FACES.flatMap((face) => [
    { id: `${face.id}-a`, faceId: face.id },
    { id: `${face.id}-b`, faceId: face.id },
  ]);

  return shuffleCards(cards);
}
