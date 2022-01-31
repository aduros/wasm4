import * as constants from '../constants';
export interface BufferedMemoryData {
  mouseButtons: number;
  gamepads: number[];
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface MemoryViewComputedProperties {
  readonly pointerPos: Point;
  readonly mouseBtnByte: number;
  readonly systemFlags: number;
  readonly gamepads: number[];
  readonly palette: [number, number, number, number];
  readonly drawColors: number;
}

function extractPalette(data: DataView): MemoryView['palette'] {
  const palette: MemoryView['palette'] = [0, 0, 0, 0];

  for (let i = 0; i < 4; i++) {
    palette[i] = data.getUint32(constants.ADDR_PALETTE + i * 4, true);
  }

  return palette;
}

function extractGamepads(
  data: DataView,
  bufferedData: BufferedMemoryData
): MemoryView['gamepads'] {
  return [
    data.getUint8(constants.ADDR_GAMEPAD1) | bufferedData.gamepads[0],
    data.getUint8(constants.ADDR_GAMEPAD2) | bufferedData.gamepads[1],
    data.getUint8(constants.ADDR_GAMEPAD3) | bufferedData.gamepads[2],
    data.getUint8(constants.ADDR_GAMEPAD4) | bufferedData.gamepads[3],
  ];
}

export class MemoryView implements MemoryViewComputedProperties {
  readonly pointerPos: Point;
  readonly mouseBtnByte: number;
  readonly systemFlags: number;
  readonly time: number;
  readonly gamepads: number[];
  readonly palette: [number, number, number, number];
  readonly drawColors: number;
  readonly getUint8: DataView['getUint8'];
  readonly byteLen: number;

  constructor(dataView: DataView, bufferedData: BufferedMemoryData) {
    const x = dataView.getInt16(constants.ADDR_MOUSE_X, true);
    const y = dataView.getInt16(constants.ADDR_MOUSE_Y, true);
    this.pointerPos = { x, y };
    this.drawColors = dataView.getUint16(constants.ADDR_DRAW_COLORS, true);
    this.palette = extractPalette(dataView);
    this.gamepads = extractGamepads(dataView, bufferedData);
    this.systemFlags = dataView.getUint8(constants.ADDR_SYSTEM_FLAGS);
    this.time = dataView.getUint32(constants.ADDR_TIME); // TODO: DataView doesn't support uint64?
    this.mouseBtnByte =
      dataView.getUint8(constants.ADDR_MOUSE_BUTTONS) |
      bufferedData.mouseButtons;

    this.getUint8 = (idx: number): number => {
      return dataView.getUint8(idx);
    };

    this.byteLen = dataView.byteLength;
  }
}
