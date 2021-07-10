import { WIDTH, HEIGHT, FRAMEBUFFER_WIDTH, FRAMEBUFFER_HEIGHT } from "./constants";
import * as constants from "./constants";
import * as GL from "./webgl-constants";

function createTexture (gl, slot, wrap) {
    const texture = gl.createTexture();
    gl.activeTexture(slot);
    gl.bindTexture(GL.TEXTURE_2D, texture);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
}

function createShader (gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (constants.DEBUG) {
        if (gl.getShaderParameter(shader, GL.COMPILE_STATUS) == 0) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
    }
    return shader;
}

export class WebGLCompositor {
    constructor (gl) {
        this.gl = gl;
        this.tmpBuffer = new Uint8Array(FRAMEBUFFER_WIDTH*FRAMEBUFFER_HEIGHT);

        // TODO(2021-07-10): Optimize
        const vertexShader = createShader(gl, GL.VERTEX_SHADER, `#version 300 es
            const vec2 backgroundMax = vec2(${WIDTH}, ${HEIGHT}) / vec2(${FRAMEBUFFER_WIDTH}, ${FRAMEBUFFER_HEIGHT});
            uniform highp ivec2 scroll;

            in vec2 pos;
            out vec2 framebufferCoord;

            void main () {
                // vec2 foregroundCoord = pos*vec2(0.5, -0.5) + 0.5;
                // framebufferCoord = pos*vec2(0.5, -0.5) + 0.5;
                // framebufferCoord = framebufferCoord*backgroundMax + vec2(scroll)/vec2(${FRAMEBUFFER_WIDTH}, ${FRAMEBUFFER_HEIGHT});
                framebufferCoord = vec2(${WIDTH}, ${HEIGHT}) * (pos*vec2(0.5, -0.5) + 0.5);
                framebufferCoord += vec2(scroll);
                framebufferCoord /= vec2(${FRAMEBUFFER_WIDTH}, ${FRAMEBUFFER_HEIGHT});
                // framebufferCoord = framebufferCoord*backgroundMax + vec2(scroll)/vec2(${FRAMEBUFFER_WIDTH}, ${FRAMEBUFFER_HEIGHT});
                gl_Position = vec4(pos, 0, 1);
            }
        `);

        const fragmentShader = createShader(gl, GL.FRAGMENT_SHADER, `#version 300 es
            precision mediump float;
            precision mediump usampler2D;
            uniform sampler2D palettes;
            uniform usampler2D framebuffer;
            in vec2 framebufferCoord;
            out vec4 fragColor;

            void main () {
                uint byte = texture(framebuffer, framebufferCoord).r;
                uint low = byte & 0x0fu;
                vec2 uv = (low != 0u)
                    ? vec2(float(low) / 16.0, 0.5)
                    : vec2(float(byte >> 4u) / 16.0, 0.0);
                fragColor = texture(palettes, uv);
            }
        `);

        // Setup shaders
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (constants.DEBUG) {
            if (gl.getProgramParameter(program, GL.LINK_STATUS) == 0) {
                throw new Error(gl.getProgramInfoLog(program));
            }
        }
        gl.useProgram(program);

        // Setup uniforms
        this.scrollUniform = gl.getUniformLocation(program, "scroll");
        gl.uniform1i(gl.getUniformLocation(program, "palettes"), 0);
        gl.uniform1i(gl.getUniformLocation(program, "framebuffer"), 1);
        // gl.uniform1i(gl.getUniformLocation(program, "foreground"), 2);

        // Cleanup shaders
        gl.detachShader(program, vertexShader);
        gl.deleteShader(vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(fragmentShader);

        // Create combined palettes texture
        createTexture(gl, GL.TEXTURE0, GL.CLAMP_TO_EDGE);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, 16, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, null);

        // Create framebuffer texture
        createTexture(gl, GL.TEXTURE1, GL.REPEAT);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.R8UI, FRAMEBUFFER_WIDTH, FRAMEBUFFER_HEIGHT, 0, GL.RED_INTEGER, GL.UNSIGNED_BYTE, null);

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

    composite (palettes, framebuffer, scrollX, scrollY) {
        const gl = this.gl;

        // Upload palettes
        gl.activeTexture(GL.TEXTURE0);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, 16, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, palettes);

        // Upload framebuffer
        gl.activeTexture(GL.TEXTURE1);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.R8UI, FRAMEBUFFER_WIDTH, FRAMEBUFFER_HEIGHT, 0, GL.RED_INTEGER, GL.UNSIGNED_BYTE, framebuffer.bytes);

        gl.uniform2i(this.scrollUniform, scrollX, scrollY);
        gl.drawArrays(GL.TRIANGLES, 0, 6);
    }
}

export class Canvas2DCompositor {
    constructor (canvas) {
        // this.ctx2d = canvas.getContext("2d");
        // this.imageData = this.ctx2d.createImageData(WIDTH, HEIGHT);
        //
        // const abgr = new Uint32Array(256);
        // const rgb = COLORS;
        // for (let ii = 0; ii < 256; ++ii) {
        //     const r = rgb[3*ii];
        //     const g = rgb[3*ii + 1];
        //     const b = rgb[3*ii + 2];
        //     abgr[ii] = 0xff000000 | (b << 16) | (g << 8) | r;
        // }
        // this.colorTable = abgr;
        //
        // if (constants.DEBUG) {
        //     console.warn("Falling back to slow Canvas2D compositor");
        // }
    }

    composite (colors, background, foreground, scrollX, scrollY) {
        throw new Error("FIXME(2021-07-03)");

        // const colors = new Uint32Array(this.imageData.data.buffer);
        // const colorTable = this.colorTable;
        //
        // for (let ii = 0, y = 0; y < HEIGHT; ++y) {
        //     for (let x = 0; x < WIDTH; ++x, ++ii) {
        //         let color = foreground[ii];
        //         if (color == 0) {
        //             let xx = (x + scrollX) % FRAMEBUFFER_WIDTH;
        //             let yy = (y + scrollY) % FRAMEBUFFER_HEIGHT;
        //             xx = xx - FRAMEBUFFER_WIDTH * Math.floor(xx / FRAMEBUFFER_WIDTH);
        //             yy = yy - FRAMEBUFFER_HEIGHT * Math.floor(yy / FRAMEBUFFER_HEIGHT);
        //             color = background[yy*FRAMEBUFFER_WIDTH + xx];
        //         }
        //         colors[ii] = colorTable[color];
        //     }
        // }
        // this.ctx2d.putImageData(this.imageData, 0, 0);
    }
}
