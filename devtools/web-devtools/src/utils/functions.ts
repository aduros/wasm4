import type { MemoryView } from '../models/MemoryView';
import { formatHex } from './format';

export function identity<T>(value: T): T {
  return value;
}

export function bitmask(to: number, from = 0) {
  return ((1 << to) - 1) ^ ((1 << from) - 1);
}

export function renderHexRow(memoryView: MemoryView, offset: number): string {
  const clampedOffset = Math.max(0, Math.min(offset, memoryView.byteLen - 1));
  let row: string[] = [];

  for (let i = clampedOffset, len = clampedOffset + 16; i < len; i++) {
    row[i] = formatHex(memoryView.getUint8(i), 2);
  }

  return row.join(' ');
}

export function range(from: number, to: number, step = 1): number[] {
  if (
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    !Number.isFinite(step) ||
    from > to
  ) {
    throw new TypeError(
      `range: invalid input: from ${from}, to ${to}, step ${step}`
    );
  }

  const len = ((to - from) / step) >> 0;

  let output: number[] = [];

  for (let i = 0; i < len; i++) {
    output[i] = step * i + from;
  }

  return output;
}
