export function safeJSONParse<T>(
  val: string,
  onError?: (val: unknown) => void
): T | null {
  try {
    return JSON.parse(val);
  } catch (err) {
    onError?.(err);
    return null;
  }
}
