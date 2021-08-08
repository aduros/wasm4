import { WIDTH, HEIGHT } from "./constants";
import * as constants from "./constants";
import * as GL from "./webgl-constants";

export class WebGLCompositor {
    constructor (gl) {
        this.gl = gl;

        this.colorBuffer = new Uint32Array(WIDTH*HEIGHT >> 2);

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

        function createShader (type, source) {
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

        function createTexture (slot) {
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

        const fragmentShader = createShader(GL.FRAGMENT_SHADER, `
            precision mediump float;
            uniform sampler2D palette;
            uniform sampler2D framebuffer;
            varying vec2 framebufferCoord;

            void main () {
                gl_FragColor = texture2D(palette, vec2(texture2D(framebuffer, framebufferCoord).r, 0.0));
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
        gl.uniform1i(gl.getUniformLocation(program, "palette"), 0);
        gl.uniform1i(gl.getUniformLocation(program, "framebuffer"), 1);

        // Cleanup shaders
        gl.detachShader(program, vertexShader);
        gl.deleteShader(vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(fragmentShader);

        // Create palette texture
        createTexture(GL.TEXTURE0);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, 4, 1, 0, GL.RGB, GL.UNSIGNED_BYTE, null);

        // Create framebuffer texture
        createTexture(GL.TEXTURE1);
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

    composite (palette, framebuffer) {
        const gl = this.gl;
        const bytes = framebuffer.bytes, colorBuffer = this.colorBuffer, table = this.table;

        // Upload palette
        // TODO(2021-08-08): Don't upload if the palette is unchanged
        const rgb = new Uint8Array(colorBuffer.buffer, 3*4);
        for (let ii = 0, n = 0; ii < 4; ++ii) {
            const argb = palette[ii];
            rgb[n++] = argb >> 16;
            rgb[n++] = argb >> 8;
            rgb[n++] = argb;
        }
        gl.activeTexture(GL.TEXTURE0);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, 4, 1, 0, GL.RGB, GL.UNSIGNED_BYTE, rgb);

        // Unpack the framebuffer into one byte per pixel
        for (let ii = 0; ii < WIDTH*HEIGHT >> 2; ++ii) {
            colorBuffer[ii] = table[bytes[ii]];
        }

        // Upload framebuffer
        gl.activeTexture(GL.TEXTURE1);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.LUMINANCE, WIDTH, HEIGHT, 0, GL.LUMINANCE, GL.UNSIGNED_BYTE, new Uint8Array(colorBuffer.buffer));

        // Draw the fullscreen quad
        gl.drawArrays(GL.TRIANGLES, 0, 6);
    }
}
