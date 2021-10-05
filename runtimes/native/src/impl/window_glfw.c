#include <GLFW/glfw3.h>

#include "../window.h"
#include "../runtime.h"

static uint32_t table[256];

void initLookupTable () {
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

void initOpenGL () {
    glClearColor(0.0f, 1.0f, 0.0f, 1.0f);
}

void w4_windowBoot (const char* title) {
    glfwInit();

    GLFWwindow* window = glfwCreateWindow(160, 160, title, NULL, NULL);
    glfwSetWindowAspectRatio(window, 1, 1);
    glfwMakeContextCurrent(window);

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
}
