import * as constants from '../constants';

export const updateCompletedEventType = 'wasm4-update-completed';

export interface Point {
  x: number;
  y: number;
}
export interface Wasm4MemoryView {
  pointerPos: Point;
  mouseBtnByte: number;
  systemFlags: number;
  gamepads: number[];
  palette: [number, number, number, number];
  drawColors: number;
}

export interface UpdateCompletedDetails {
  memory: Wasm4MemoryView;
  fps: number;
  storedValue: string | null;
}

export interface BufferedMemoryData {
  mouseButtons: number;
  gamepads: number[];
}

export type Wasm4UpdateCompletedEvent = CustomEvent<UpdateCompletedDetails>;

function extractPalette(data: DataView): Wasm4MemoryView['palette'] {
  const palette: Wasm4MemoryView['palette'] = [0, 0, 0, 0];

  for (let i = 0; i < 4; i++) {
    palette[i] = data.getUint32(constants.ADDR_PALETTE + i * 4, true);
  }

  return palette;
}

function extractGamepads(
  data: DataView,
  bufferedData: BufferedMemoryData
): Wasm4MemoryView['gamepads'] {
  return [
    data.getUint8(constants.ADDR_GAMEPAD1) | bufferedData.gamepads[0],
    data.getUint8(constants.ADDR_GAMEPAD2) | bufferedData.gamepads[1],
    data.getUint8(constants.ADDR_GAMEPAD3) | bufferedData.gamepads[2],
    data.getUint8(constants.ADDR_GAMEPAD4) | bufferedData.gamepads[3],
  ];
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
  bufferedData: BufferedMemoryData,
  eventInit: EventInit = { bubbles: true }
): Wasm4UpdateCompletedEvent {
  const x = data.getInt16(constants.ADDR_MOUSE_X, true);
  const y = data.getInt16(constants.ADDR_MOUSE_Y, true);
  const mouseBtnByte =
    data.getUint8(constants.ADDR_MOUSE_BUTTONS) | bufferedData.mouseButtons;

  const pointerPos = {
    x,
    y,
  };
  const systemFlags = data.getUint8(constants.ADDR_SYSTEM_FLAGS);
  const palette = extractPalette(data);
  const drawColors = data.getUint16(constants.ADDR_DRAW_COLORS, true);

  const gamepads = extractGamepads(data, bufferedData);

  const memory: Wasm4MemoryView = {
    mouseBtnByte,
    palette,
    pointerPos,
    gamepads,
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
