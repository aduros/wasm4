export const closeDevtoolsEventType = 'wasm4-close-devtools-request';

export type CloseDevtoolsEvent = CustomEvent;

export function createCloseDevtoolsEvent() {
  return new CustomEvent(closeDevtoolsEventType, {
    bubbles: true,
    composed: true,
  });
}
