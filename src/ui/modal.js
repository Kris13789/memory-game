import { el } from '../dom.js';

const SCROLL_LOCK_CLASS = 'is-scroll-locked';

export function createModal() {
  const content = el('div', { className: 'modal__content' });
  const dialog = el('dialog', { className: 'modal' }, content);
  let pressStartedInside = false;

  function unlockScroll() {
    document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
  }

  function close() {
    if (dialog.open) {
      dialog.close();
      unlockScroll();
    }
  }

  function open(node, label) {
    content.replaceChildren(node);
    dialog.setAttribute('aria-label', label);

    if (!dialog.open) {
      document.documentElement.classList.add(SCROLL_LOCK_CLASS);
      dialog.showModal();
    }
  }

  // A press that starts inside the content and ends on the backdrop must not close the dialog.
  dialog.addEventListener('pointerdown', (event) => {
    pressStartedInside = event.target !== dialog;
  });

  dialog.addEventListener('click', (event) => {
    const isBackdropClick = event.target === dialog && !pressStartedInside;

    pressStartedInside = false;

    if (isBackdropClick) {
      close();
    }
  });

  // Escape closes the dialog natively, so the lock is also released from the close event.
  // The check keeps a dialog that was reopened in the meantime locked.
  dialog.addEventListener('close', () => {
    if (!dialog.open) {
      unlockScroll();
    }
  });

  return { element: dialog, open, close };
}
