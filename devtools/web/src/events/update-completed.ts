import { MemoryView } from '../models/MemoryView';

export const updateCompletedEventType = 'wasm4-update-completed';

export interface UpdateCompletedDetails {
  memory: MemoryView;
  fps: number;
  storedValue: string | null;
}

export interface BufferedMemoryData {
  mouseButtons: number;
  gamepads: number[];
}

export type Wasm4UpdateCompletedEvent = CustomEvent<UpdateCompletedDetails>;

function getStoredValue(): string | null {
  try {
    return window.localStorage.getItem('disk');
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * An event that is meant to be triggered after a `runtime.update` that provides
 * infos regarding the console runtime.
 * @param dataView `runtime.data`
 * @param fps
 * @param bufferedData
 * @param eventInit optional, defaults to `{ bubbles: true }`.
 * @returns
 */
export function createUpdateCompletedEvent(
  dataView: DataView,
  fps: number,
  bufferedData: BufferedMemoryData,
  eventInit: EventInit = { bubbles: true }
): Wasm4UpdateCompletedEvent {
  return new CustomEvent(updateCompletedEventType, {
    ...eventInit,
    detail: {
      memory: new MemoryView(dataView, bufferedData),
      fps,
      storedValue: getStoredValue(),
    },
  });
}
