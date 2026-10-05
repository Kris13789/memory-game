export function el(tag, options = {}, ...children) {
  const { className, text, attrs = {}, on = {} } = options;
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  if (tag === 'button' && !('type' in attrs)) {
    element.type = 'button';
  }

  for (const [name, value] of Object.entries(attrs)) {
    element.setAttribute(name, value);
  }

  for (const [eventName, handler] of Object.entries(on)) {
    element.addEventListener(eventName, handler);
  }

  element.append(...children);

  return element;
}
