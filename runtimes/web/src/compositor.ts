import { WIDTH, HEIGHT } from "./constants";
import * as constants from "./constants";
import * as GL from "./webgl-constants";
import type { Framebuffer } from "./framebuffer";

const PALETTE_SIZE = 4;

export class WebGLCompositor {
    table: Uint32Array;
    colorBuffer: Uint32Array;
    paletteBuffer: Float32Array;
    lastPalette: number[];
    paletteLocation: WebGLUniformLocation | null;

    constructor (public gl: WebGLRenderingContext) {
        this.colorBuffer = new Uint32Array(WIDTH * HEIGHT >> 2);
        this.paletteBuffer = new Float32Array(3 * PALETTE_SIZE);
        this.lastPalette = Array(PALETTE_SIZE);
        this.paletteLocation = null;

        // Create a lookup table for each byte mapping to 4 bytes:
        // 0bxxyyzzww --> 0bxx000000_yy000000_zz000000_ww000000
        const table = new Uint32Array(256);
        for (let ii = 0; ii < 256; ++ii) {
            const xx = (ii >> 6) & 3;
            const yy = (ii >> 4) & 3;
            const zz = (ii >> 2) & 3;
            const ww = ii & 3;
            table[ii] = (xx << 30) | (yy << 22) | (zz << 14) | (ww << 6);
        }
        this.table = table;

        const canvas = gl.canvas;
        canvas.addEventListener("webglcontextlost", event => {
            event.preventDefault();
        });
        canvas.addEventListener("webglcontextrestored", () => { this.initGL() });

        this.initGL();

        // // Test WebGL context loss
        // window.addEventListener("mousedown", () => {
        //     console.log("Losing context");
        //     const ext = gl.getExtension('WEBGL_lose_context');
        //     ext.loseContext();
        //     setTimeout(() => {
        //         ext.restoreContext();
        //     }, 0);
        // })
    }

    initGL () {
        const gl = this.gl;

        this.lastPalette = Array(PALETTE_SIZE);

        function createShader (type: number, source: string) {
            const shader = gl.createShader(type)!;

            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (constants.DEBUG) {
                if (gl.getShaderParameter(shader, GL.COMPILE_STATUS) == 0) {
                    throw new Error(gl.getShaderInfoLog(shader) + '');
                }
            }
            return shader;
        }

        function createTexture (slot: number) {
            const texture = gl.createTexture();
            gl.activeTexture(slot);
            gl.bindTexture(GL.TEXTURE_2D, texture);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        }

        const vertexShader = createShader(GL.VERTEX_SHADER, `
            attribute vec2 pos;
            varying vec2 framebufferCoord;

            void main () {
                framebufferCoord = pos*vec2(0.5, -0.5) + 0.5;
                gl_Position = vec4(pos, 0, 1);
            }
        `);

        const lookupBlock = Array.from({length: PALETTE_SIZE - 1},
                (_, i) => {
                    return `p = mix(p, palette[${i + 1}],  step(${((i + 1) / PALETTE_SIZE).toFixed(2)}, index));`
                }).join('\n');

        const fragmentShader = createShader(GL.FRAGMENT_SHADER, `
            precision mediump float;
            uniform vec3 palette[${PALETTE_SIZE}];
            uniform sampler2D framebuffer;
            varying vec2 framebufferCoord;

            vec3 lookup(float index) {
                vec3 p = palette[0];
                ${lookupBlock}
                return p;
            }

            void main () {
                gl_FragColor = vec4(lookup(texture2D(framebuffer, framebufferCoord).r), 1.);
            }
        `);

        // Setup shaders
        const program = gl.createProgram()!;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (constants.DEBUG) {
            if (gl.getProgramParameter(program, GL.LINK_STATUS) == 0) {
                throw new Error(gl.getProgramInfoLog(program) + '');
            }
        }
        gl.useProgram(program);

        // Setup uniforms
        this.paletteLocation = gl.getUniformLocation(program, "palette");
        gl.uniform1i(gl.getUniformLocation(program, "framebuffer"), 0);

        // Cleanup shaders
        gl.detachShader(program, vertexShader);
        gl.deleteShader(vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(fragmentShader);

        // Create framebuffer texture
        createTexture(GL.TEXTURE0);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.LUMINANCE, WIDTH, HEIGHT, 0, GL.LUMINANCE, GL.UNSIGNED_BYTE, null);

        // Setup static geometry
        const positionAttrib = gl.getAttribLocation(program, "pos");
        const positionBuffer = gl.createBuffer();
        const positionData = new Float32Array([
            -1, -1, -1, +1, +1, +1,
            +1, +1, +1, -1, -1, -1,
        ]);
        gl.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(GL.ARRAY_BUFFER, positionData, GL.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttrib);
        gl.vertexAttribPointer(positionAttrib, 2, GL.FLOAT, false, 0, 0);
    }

    composite (palette: Uint32Array, framebuffer: Framebuffer) {
        const gl = this.gl;
        const
            bytes = framebuffer.bytes,
            colorBuffer = this.colorBuffer,
            table = this.table,
            lastPalette = this.lastPalette,
            rgb = this.paletteBuffer;

        // Upload palette when needed
        let syncPalette = false;

        for (let ii = 0, n = 0; ii < PALETTE_SIZE; ++ii) {
            const argb = palette[ii];

            syncPalette = syncPalette || lastPalette[ii] !== argb;

            rgb[n++] = ((argb >> 16) & 0xff) / 0xff;
            rgb[n++] = ((argb >> 8) & 0xff) / 0xff;
            rgb[n++] = (argb & 0xff) / 0xff;

            lastPalette[ii] = argb;
        }

        if (syncPalette) {
            gl.uniform3fv(this.paletteLocation, this.paletteBuffer);
        }

        // Unpack the framebuffer into one byte per pixel
        for (let ii = 0; ii < WIDTH*HEIGHT >> 2; ++ii) {
            colorBuffer[ii] = table[bytes[ii]];
        }

        // Upload framebuffer
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.LUMINANCE, WIDTH, HEIGHT, 0, GL.LUMINANCE, GL.UNSIGNED_BYTE, new Uint8Array(colorBuffer.buffer));

        // Draw the fullscreen quad
        gl.drawArrays(GL.TRIANGLES, 0, 6);
    }
}
