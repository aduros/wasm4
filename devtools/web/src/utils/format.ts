export function formatColor(col: number): string {
  return `#${col.toString(16).toLowerCase().padStart(6, '0')}`;
}

export function formatToggle(val: boolean): string {
  return val ? 'on' : 'off';
}

export function formatHex(val: number, padding = 2): string {
  return val.toString(16).padStart(padding, '0').toUpperCase();
}
