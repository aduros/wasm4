import type { Framebuffer } from "./framebuffer";
export declare class WebGLCompositor {
    gl: WebGLRenderingContext;
    table: Uint32Array;
    colorBuffer: Uint32Array;
    paletteBuffer: Float32Array;
    lastPalette: number[];
    paletteLocation: WebGLUniformLocation | null;
    constructor(gl: WebGLRenderingContext);
    composite(palette: Uint32Array, framebuffer: Framebuffer): void;
}
