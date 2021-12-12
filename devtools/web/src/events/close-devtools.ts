export const closeDevtoolsEventType = 'wasm4-close-devtools-request';

export type CloseDevtoolsEvent = CustomEvent;

/**
 * Generates an event to request to close the devtools.
 * @returns
 */
export function createCloseDevtoolsEvent() {
  return new CustomEvent(closeDevtoolsEventType, {
    bubbles: true,
    composed: true,
  });
}
