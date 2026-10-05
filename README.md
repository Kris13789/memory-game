# Memory Game

A card-matching game built with plain HTML, CSS and JavaScript. Flip two cards at a time, remember where each picture is, and find all 8 pairs in as few moves as you can.

**Live demo:** https://kris13789.github.io/memory-game/

## How to play

1. The game starts on its own when the page loads. 16 shuffled cards lie face down, and the counters show 0 moves and 0 of 8 pairs.
2. Click a card, then click a second one. Opening two cards is one move.
3. If the pictures match, both cards stay open and the pair counter goes up.
4. If they differ, both stay visible for one second and then turn back. Other cards cannot be opened in the meantime.
5. When all 8 pairs are found, a window with your result opens. You can start a new game or just close it.
6. **New game** in the header restarts at any moment, even while a wrong pair is still showing. **Leaderboard** opens the 10 best results.

## Features

- Cards are shuffled with the Fisher–Yates algorithm on every page load and every new game.
- Clicks on open cards, found pairs, and cards during the one-second pause are ignored, however fast you click.
- One shared modal component serves both the victory window and the leaderboard. It closes with its button, a click on the dark backdrop, or the Escape key. The page behind it cannot be scrolled or clicked while it is open.
- The leaderboard lists the top 10 games by number of moves (the earlier game wins a tie) with place, moves and date as `DD.MM.YYYY`.
- Results are stored in `localStorage`, so they survive a reload or closing the browser. Each win is saved exactly once, and unfinished games are never saved.
- The whole page is built from JavaScript with `document.createElement`. The `<body>` of `index.html` contains only the `<script>` tag.
- Works on phones and desktops, with the keyboard, and without any third-party library.

## Run locally

You need Node.js 20 or newer (or Python 3) and a modern browser.

```sh
git clone https://github.com/Kris13789/memory-game.git
cd memory-game
git switch memory-game
npm start
```

`npm start` serves the folder with `npx serve`. Open the address it prints, usually http://localhost:3000.

Without Node.js you can use any static server instead, for example:

```sh
python3 -m http.server 8000
```

and then open http://localhost:8000. The VS Code "Live Server" extension works too.

> Open the game through a server. Double-clicking `index.html` does not work, because browsers do not load ES modules from `file://` addresses.

### Tests

```sh
npm test
```

This runs the unit tests for the shuffle, the game rules, the leaderboard and the date format with the built-in Node.js test runner. The project has no dependencies to install.

## Project structure

```
index.html              page shell, the body holds only the script tag
css/                    base styles, board and cards, modal and leaderboard
assets/                 self-drawn SVG card faces, card back and favicon
src/main.js             wires the game, the interface, the modal and the storage together
src/dom.js              the only place that calls document.createElement
src/game/               shuffle, card data and the game rules (no DOM code)
src/storage/            leaderboard kept in localStorage
src/ui/                 header, counters, board, shared modal and modal content
src/utils/              date formatting
test/                   unit tests
```

## Notes

- A wrong pair closes after 1000 ms. Starting a new game cancels that timer, and a game number check makes sure an old timer can never touch a newer game.
- The leaderboard is stored under the `memory-game.results` key as a list of `{ moves, finishedAt }` records.
- All card pictures were drawn for this project as SVG files, so there are no third-party images and no licenses to credit.

Built as the "Memory Game" task of the RS School JavaScript / Front-end course.
