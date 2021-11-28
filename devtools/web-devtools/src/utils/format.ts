export function formatColor(col: number): string {
  return `#${col.toString(16).toLowerCase().padStart(6, '0')}`;
}
