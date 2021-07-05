export const WIDTH = 160;
export const HEIGHT = 144;

export const BACKGROUND_WIDTH = 160 + 8;
export const BACKGROUND_HEIGHT = 144 + 8;

export function drawSprite1BPP (layer, layerWidth, sprite, x, y, palette, flipX, flipY) {
    for (let v = 0; v < 8; ++v) {
        for (let h = 0; h < 8; ++h) {
            const paletteIdx = (sprite[v] >> (7 - h)) & 0x1;
            const dstX = x + (flipX ? 7 - h : h);
            const dstY = y + (flipY ? 7 - v : v);
            const color = palette[paletteIdx];
            if (color != 0) {
                layer[layerWidth*dstY + dstX] = color;
            }
        }
    }
}

export function drawSprite2BPP (layer, layerWidth, sprite, x, y, palette, flipX, flipY) {
    for (let v = 0; v < 8; ++v) {
        for (let h = 0; h < 8; ++h) {
            const ch1 = ((sprite[v] >> h) & 0x1);
            const ch2 = (((sprite[v + 8] >> h) & 0x1) << 1);
            const paletteIdx = ch1 + ch2;
            const dstX = x + (flipX ? 7 - h : h);
            const dstY = y + (flipY ? 7 - v : v);
            const color = palette[paletteIdx];
            if (color != 0) {
                layer[layerWidth*dstY + dstX] = color;
            }
        }
    }
}

export function drawRect (layer, layerWidth, colorIdx, x, y, width, height) {
    // TODO(2021-07-03): Optimize using Uint8Array.fill()
    for (var v = y, maxV = y+height; v < maxV; ++v) {
        for (var h = x, maxH = x+width; h < maxH; ++h) {
            layer[layerWidth*v + h] = colorIdx;
        }
    }
}
