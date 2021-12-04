export function identity<T>(value: T): T {
  return value;
}

export function bitmask(to: number, from = 0) {
  return ((1 << to) - 1) ^ ((1 << from) - 1);
}
