#include <glad/glad.h>
#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>

#include <stdio.h>

#include "../window.h"
#include "../runtime.h"

static uint32_t table[256];
static GLuint paletteLocation;

static void initLookupTable () {
    // Create a lookup table for each byte mapping to 4 bytes:
    // 0bxxyyzzww --> 0bxx000000_yy000000_zz000000_ww000000
    for (int ii = 0; ii < 256; ++ii) {
        int xx = (ii >> 6) & 3;
        int yy = (ii >> 4) & 3;
        int zz = (ii >> 2) & 3;
        int ww = ii & 3;
        table[ii] = (xx << 30) | (yy << 22) | (zz << 14) | (ww << 6);
    }
}

static GLuint createShader (GLenum type, const char* source) {
    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, &source, NULL);
    glCompileShader(shader);

#ifndef NDEBUG
    GLint status;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &status);
    if (status == GL_FALSE) {
        char log[1024];
        glGetShaderInfoLog(shader, sizeof(log), NULL, log);
        printf("gl shader error: %s\n", log);
    }
#endif

    return shader;
}

static void initOpenGL () {
    GLuint vertexShader = createShader(GL_VERTEX_SHADER,
        "attribute vec2 pos;\n"
        "varying vec2 framebufferCoord;\n"

        "void main () {\n"
            "framebufferCoord = pos*vec2(0.5, -0.5) + 0.5;\n"
            "gl_Position = vec4(pos, 0, 1);\n"
        "}\n");

    GLuint fragmentShader = createShader(GL_FRAGMENT_SHADER,
        "precision mediump float;\n"
        "uniform vec3 palette[4];\n"
        "uniform sampler2D framebuffer;\n"
        "varying vec2 framebufferCoord;\n"

        "void main () {\n"
            "float index = texture2D(framebuffer, framebufferCoord).r;\n"
            "vec3 color = palette[0];\n"
            "color = mix(color, palette[1], step(0.25, index));\n"
            "color = mix(color, palette[2], step(0.50, index));\n"
            "color = mix(color, palette[3], step(0.75, index));\n"
            "gl_FragColor = vec4(color, 1.0);\n"
        "}\n");

    GLuint program = glCreateProgram();
    glAttachShader(program, vertexShader);
    glAttachShader(program, fragmentShader);
    glLinkProgram(program);

#ifndef NDEBUG
    GLint status;
    glGetProgramiv(program, GL_LINK_STATUS, &status);
    if (status == GL_FALSE) {
        char log[1024];
        glGetProgramInfoLog(program, sizeof(log), NULL, log);
        printf("gl program link error: %s\n", log);
    }
#endif

    glUseProgram(program);

    paletteLocation = glGetUniformLocation(program, "palette");
    glUniform1i(glGetUniformLocation(program, "framebuffer"), 0);

    // Cleanup shaders
    glDetachShader(program, vertexShader);
    glDeleteShader(vertexShader);
    glDetachShader(program, fragmentShader);
    glDeleteShader(fragmentShader);

    // Create framebuffer texture
    GLuint texture;
    glGenTextures(1, &texture);
    // glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texture);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_LUMINANCE, 160, 160, 0, GL_LUMINANCE, GL_UNSIGNED_BYTE, NULL);

    // Setup static geometry
    GLuint positionAttrib = glGetAttribLocation(program, "pos");
    GLuint positionBuffer;
    glGenBuffers(1, &positionBuffer);
    float positionData[] = {
        -1, -1, -1, +1, +1, +1, 
        +1, +1, +1, -1, -1, -1,
    };
    glBindBuffer(GL_ARRAY_BUFFER, positionBuffer);
    glBufferData(GL_ARRAY_BUFFER, sizeof(positionData), positionData, GL_STATIC_DRAW);
    glEnableVertexAttribArray(positionAttrib);
    glVertexAttribPointer(positionAttrib, 2, GL_FLOAT, GL_FALSE, 0, 0);
}

static void onFramebufferResized (GLFWwindow* window, int width, int height) {
    int size = (width < height) ? width : height;
    int x = width/2 - size/2;
    int y = height/2 - size/2;
    glViewport(x, y, size, size);
}

void w4_windowBoot (const char* title) {
    glfwInit();

    glfwWindowHint(GLFW_CLIENT_API, GLFW_OPENGL_ES_API);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 2);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);


    GLFWwindow* window = glfwCreateWindow(160, 160, title, NULL, NULL);
    glfwSetFramebufferSizeCallback(window, onFramebufferResized);
    glfwSetWindowAspectRatio(window, 1, 1);
    glfwMakeContextCurrent(window);
    gladLoadGLES2Loader((GLADloadproc)glfwGetProcAddress);

    initOpenGL();
    initLookupTable();

    while (!glfwWindowShouldClose(window)) {
        w4_runtimeUpdate();

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwDestroyWindow(window);
    glfwTerminate();
}

void w4_windowComposite (const uint32_t* palette, const uint8_t* framebuffer) {
    glClear(GL_COLOR_BUFFER_BIT);

    float rgb[3*4];
    for (int ii = 0, n = 0; ii < 4; ++ii) {
        uint32_t argb = *palette;
        rgb[n++] = ((argb >> 16) & 0xff) / 255.0;
        rgb[n++] = ((argb >> 8) & 0xff) / 255.0;
        rgb[n++] = (argb & 0xff) / 255.0;
        ++palette;
    }
    glUniform3fv(paletteLocation, 4, rgb);

    // Unpack the framebuffer into one byte per pixel
    static uint32_t colorBuffer[160*160 >> 2];
    for (int ii = 0; ii < 160*160 >> 2; ++ii) {
        colorBuffer[ii] = table[framebuffer[ii]];
    }

    // Upload framebuffer
    glTexImage2D(GL_TEXTURE_2D, 0, GL_LUMINANCE, 160, 160, 0, GL_LUMINANCE, GL_UNSIGNED_BYTE, colorBuffer);

    // Draw the fullscreen quad
    glDrawArrays(GL_TRIANGLES, 0, 6);

#ifndef NDEBUG
    GLuint error = glGetError();
    if (error) {
        printf("GL error: %d\n", error);
    }
#endif
}
