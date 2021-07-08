import { WIDTH, HEIGHT, BACKGROUND_WIDTH, BACKGROUND_HEIGHT } from "./constants";
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
        this.tmpBuffer = new Uint8Array(BACKGROUND_WIDTH*BACKGROUND_HEIGHT);

        const vertexShader = createShader(gl, GL.VERTEX_SHADER, `
            const vec2 backgroundMax = vec2(${WIDTH}, ${HEIGHT}) / vec2(${BACKGROUND_WIDTH}, ${BACKGROUND_HEIGHT});
            attribute vec2 pos;
            uniform ivec2 scroll;
            varying vec2 backgroundCoord;
            varying vec2 foregroundCoord;

            void main () {
                foregroundCoord = pos*vec2(0.5, -0.5) + 0.5;
                backgroundCoord = foregroundCoord*backgroundMax + vec2(scroll)/vec2(${WIDTH}, ${HEIGHT});
                gl_Position = vec4(pos, 0, 1);
            }
        `);

        const fragmentShader = createShader(gl, GL.FRAGMENT_SHADER, `
            precision mediump float;
            uniform sampler2D palettes;
            uniform sampler2D background;
            uniform sampler2D foreground;
            varying vec2 backgroundCoord;
            varying vec2 foregroundCoord;

            void main () {
                vec2 uv;
                float fg = texture2D(foreground, foregroundCoord).r;
                if (fg == 0.0) {
                    float bg = texture2D(background, backgroundCoord).r;
                    uv = vec2(16.0*bg, 0.0);
                } else {
                    uv = vec2(16.0*fg, 0.5);
                }
                gl_FragColor = texture2D(palettes, uv);
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
        gl.uniform1i(gl.getUniformLocation(program, "background"), 1);
        gl.uniform1i(gl.getUniformLocation(program, "foreground"), 2);

        // Cleanup shaders
        gl.detachShader(program, vertexShader);
        gl.deleteShader(vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(fragmentShader);

        // Create color table texture
        createTexture(gl, GL.TEXTURE0, GL.CLAMP_TO_EDGE);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, 16, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, null);

        // Create background texture
        createTexture(gl, GL.TEXTURE1, GL.REPEAT);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.LUMINANCE, BACKGROUND_WIDTH, BACKGROUND_HEIGHT, 0, GL.LUMINANCE, GL.UNSIGNED_BYTE, null);

        // Create foreground texture
        createTexture(gl, GL.TEXTURE2, GL.CLAMP_TO_EDGE);
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

    composite (palettes, background, foreground, scrollX, scrollY) {
        const gl = this.gl;

        // Upload colors
        gl.activeTexture(GL.TEXTURE0);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, 16, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, palettes);

        // Upload background
        gl.activeTexture(GL.TEXTURE1);
        background.unpack(this.tmpBuffer);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.LUMINANCE, BACKGROUND_WIDTH, BACKGROUND_HEIGHT, 0, GL.LUMINANCE, GL.UNSIGNED_BYTE, this.tmpBuffer);

        // Upload foreground
        gl.activeTexture(GL.TEXTURE2);
        foreground.unpack(this.tmpBuffer);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.LUMINANCE, WIDTH, HEIGHT, 0, GL.LUMINANCE, GL.UNSIGNED_BYTE, this.tmpBuffer);

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
        //             let xx = (x + scrollX) % BACKGROUND_WIDTH;
        //             let yy = (y + scrollY) % BACKGROUND_HEIGHT;
        //             xx = xx - BACKGROUND_WIDTH * Math.floor(xx / BACKGROUND_WIDTH);
        //             yy = yy - BACKGROUND_HEIGHT * Math.floor(yy / BACKGROUND_HEIGHT);
        //             color = background[yy*BACKGROUND_WIDTH + xx];
        //         }
        //         colors[ii] = colorTable[color];
        //     }
        // }
        // this.ctx2d.putImageData(this.imageData, 0, 0);
    }
}
