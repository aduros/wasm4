import { MemoryView } from '../models/MemoryView';

export const updateCompletedEventType = 'wasm4-update-completed';

export interface UpdateCompletedDetails {
  memory: MemoryView;
  fps: number;
  gasUsed: number;
  wasmBufferByteLen: number;
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

export interface UpdateCompletedData {
  dataView: DataView;
  fps: number;
  gasUsed: number;
  bufferedData: BufferedMemoryData;
  wasmBufferByteLen: number;
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
  { dataView, fps, gasUsed, bufferedData, wasmBufferByteLen }: UpdateCompletedData,
  eventInit: EventInit = { bubbles: true }
): Wasm4UpdateCompletedEvent {
  return new CustomEvent(updateCompletedEventType, {
    ...eventInit,
    detail: {
      memory: new MemoryView(dataView, bufferedData),
      fps,
      gasUsed,
      wasmBufferByteLen,
      storedValue: getStoredValue(),
    },
  });
}
