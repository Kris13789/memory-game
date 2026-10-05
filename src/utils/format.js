const pad = (value) => String(value).padStart(2, '0');

export function formatDate(timestamp) {
  const date = new Date(timestamp);

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}
