#include <GLFW/glfw3.h>

#include "../window.h"
#include "../runtime.h"

void w4_windowInit (const char* title) {
    glfwInit();

    GLFWwindow* window = glfwCreateWindow(160, 160, title, NULL, NULL);
    glfwSetWindowAspectRatio(window, 1, 1);
    glfwMakeContextCurrent(window);

    while (!glfwWindowShouldClose(window)) {
        w4_runtimeUpdate();

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwDestroyWindow(window);
    glfwTerminate();
}

void w4_windowComposite (const uint32_t* palette, const uint8_t* framebuffer) {
    /* printf("Compositing...\n"); */
}
