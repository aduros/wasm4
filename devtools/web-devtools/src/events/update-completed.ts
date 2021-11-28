import * as constants from '../constants';

export const updateCompletedEventType = 'wasm4-update-completed';

export interface Point {
  x: number;
  y: number;
}

export interface MouseButtons {
  left: boolean;
  right: boolean;
  middle: boolean;
}

export interface Wasm4MemoryView {
  pointerPos: Point;
  mouseButtons: MouseButtons;
  systemFlags: number;
  palette: [number, number, number, number];
  drawColors: number;
}

export interface UpdateCompletedDetails {
  memory: Wasm4MemoryView;
  fps: number;
  storedValue: string | null;
}

export type Wasm4UpdateCompletedEvent = CustomEvent<UpdateCompletedDetails>;

function extractPalette(data: DataView): Wasm4MemoryView['palette'] {
  const palette: Wasm4MemoryView['palette'] = [0, 0, 0, 0];

  for (let i = 0; i < 4; i++) {
    palette[i] = data.getUint32(constants.ADDR_PALETTE + i * 4, true);
  }

  return palette;
}

function getStoredValue(): string | null {
  try {
    return window.localStorage.getItem('disk');
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function createUpdateCompletedEvent(
  data: DataView,
  fps: number,
  eventInit: EventInit = { bubbles: true }
): Wasm4UpdateCompletedEvent {
  const x = data.getInt16(constants.ADDR_MOUSE_X, true);
  const y = data.getInt16(constants.ADDR_MOUSE_Y, true);
  const mouseBtnValue = data.getUint8(constants.ADDR_MOUSE_BUTTONS);

  const mouseButtons = {
    left: !!(mouseBtnValue & constants.MOUSE_LEFT),
    middle: !!(mouseBtnValue & constants.MOUSE_MIDDLE),
    right: !!(mouseBtnValue & constants.MOUSE_RIGHT),
  };
  const pointerPos = {
    x,
    y,
  };
  const systemFlags = data.getUint8(constants.ADDR_SYSTEM_FLAGS);
  const palette = extractPalette(data);
  const drawColors = data.getUint16(constants.ADDR_DRAW_COLORS, true);

  const memory: Wasm4MemoryView = {
    mouseButtons,
    palette,
    pointerPos,
    systemFlags,
    drawColors,
  };

  return new CustomEvent(updateCompletedEventType, {
    ...eventInit,
    detail: {
      memory,
      fps,
      storedValue: getStoredValue(),
    },
  });
}
