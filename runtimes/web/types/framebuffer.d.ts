export declare class Framebuffer {
    drawColors: Uint16Array;
    bytes: Uint8Array;
    constructor(memory: ArrayBuffer);
    clear(): void;
    drawPoint(color: number, x: number, y: number): void;
    drawPointUnclipped(color: number, x: number, y: number): void;
    drawHLineFast(color: number, startX: number, y: number, endX: number): void;
    drawHLineUnclipped(color: number, startX: number, y: number, endX: number): void;
    drawHLine(x: number, y: number, len: number): void;
    drawVLine(x: number, y: number, len: number): void;
    drawRect(x: number, y: number, width: number, height: number): void;
    drawOval(x: number, y: number, width: number, height: number): void;
    drawLine(x1: number, y1: number, x2: number, y2: number): void;
    drawText(charArray: number[] | Uint8Array | Uint8ClampedArray | Uint16Array, x: number, y: number): void;
    blit(sprite: any, dstX: number, dstY: number, width: number, height: number, srcX: number, srcY: number, srcStride: number, bpp2?: number | boolean, flipX?: number | boolean, flipY?: number | boolean, rotate?: number | boolean): void;
}
