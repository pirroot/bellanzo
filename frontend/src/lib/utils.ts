export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '').trim()) : price;

  if (!Number.isFinite(numPrice)) {
    return '—';
  }

  const formatted = Math.abs(numPrice).toLocaleString('fa-IR');

  return `${formatted}`;
}
