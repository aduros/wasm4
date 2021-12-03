export function formatColor(col: number): string {
  return `#${col.toString(16).toLowerCase().padStart(6, '0')}`;
}

export function formatToggle(val: boolean): string {
  return val ? 'on' : 'off';
}

export function formatHex(val: number): string {
  return `0x${val.toString(16)}`;
}
