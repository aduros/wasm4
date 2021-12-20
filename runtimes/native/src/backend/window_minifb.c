#include <MiniFB.h>
#include <stdio.h>

#include "../window.h"
#include "../runtime.h"

static uint32_t pixels[160*160];

static int viewportX = 0;
static int viewportY = 0;
static int viewportSize = 3*160;

static void onResize (struct mfb_window* window, int width, int height) {
    viewportSize = (width < height) ? width : height;
    viewportX = width/2 - viewportSize/2;
    viewportY = height/2 - viewportSize/2;

    mfb_set_viewport(window, viewportX, viewportY, viewportSize, viewportSize);
}

void w4_windowBoot (const char* title) {
    struct mfb_window* window = mfb_open_ex(title, viewportSize, viewportSize, WF_RESIZABLE);

    mfb_set_resize_callback(window, onResize);

    do {
        // Keyboard handling
        const uint8_t* keyBuffer = mfb_get_key_buffer(window);

        // Player 1
        uint8_t gamepad = 0;
        if (keyBuffer[KB_KEY_X] || keyBuffer[KB_KEY_V] || keyBuffer[KB_KEY_K] || keyBuffer[KB_KEY_SPACE]) {
            gamepad |= W4_BUTTON_X;
        }
        if (keyBuffer[KB_KEY_Z] || keyBuffer[KB_KEY_C] || keyBuffer[KB_KEY_Y] || keyBuffer[KB_KEY_W] || keyBuffer[KB_KEY_J]) {
            gamepad |= W4_BUTTON_Z;
        }
        if (keyBuffer[KB_KEY_LEFT]) {
            gamepad |= W4_BUTTON_LEFT;
        }
        if (keyBuffer[KB_KEY_RIGHT]) {
            gamepad |= W4_BUTTON_RIGHT;
        }
        if (keyBuffer[KB_KEY_UP]) {
            gamepad |= W4_BUTTON_UP;
        }
        if (keyBuffer[KB_KEY_DOWN]) {
            gamepad |= W4_BUTTON_DOWN;
        }
        w4_runtimeSetGamepad(0, gamepad);

        // Player 2
        gamepad = 0;
        if (keyBuffer[KB_KEY_LEFT_SHIFT] || keyBuffer[KB_KEY_TAB]) {
            gamepad |= W4_BUTTON_X;
        }
        if (keyBuffer[KB_KEY_A] || keyBuffer[KB_KEY_Q]) {
            gamepad |= W4_BUTTON_Z;
        }
        if (keyBuffer[KB_KEY_S]) {
            gamepad |= W4_BUTTON_LEFT;
        }
        if (keyBuffer[KB_KEY_F]) {
            gamepad |= W4_BUTTON_RIGHT;
        }
        if (keyBuffer[KB_KEY_E]) {
            gamepad |= W4_BUTTON_UP;
        }
        if (keyBuffer[KB_KEY_D]) {
            gamepad |= W4_BUTTON_DOWN;
        }
        w4_runtimeSetGamepad(1, gamepad);

        // Mouse handling
        uint8_t mouseButtons = 0;
        const uint8_t* mouseBuffer = mfb_get_mouse_button_buffer(window);
        if (mouseBuffer[MOUSE_LEFT]) {
            mouseButtons |= W4_MOUSE_LEFT;
        }
        if (mouseBuffer[MOUSE_RIGHT]) {
            mouseButtons |= W4_MOUSE_RIGHT;
        }
        if (mouseBuffer[MOUSE_MIDDLE]) {
            mouseButtons |= W4_MOUSE_MIDDLE;
        }
        int mouseX = mfb_get_mouse_x(window);
        int mouseY = mfb_get_mouse_y(window);
        w4_runtimeSetMouse(160*(mouseX-viewportX)/viewportSize, 160*(mouseY-viewportY)/viewportSize, mouseButtons);

        w4_runtimeUpdate();

        if (mfb_update_ex(window, pixels, 160, 160) < 0) {
            break;
        }
    } while (mfb_wait_sync(window));
}

void w4_windowComposite (const uint32_t* palette, const uint8_t* framebuffer) {
    // Convert indexed 2bpp framebuffer to XRGB output
    uint32_t* out = pixels;
    for (int n = 0; n < 160*160/4; ++n) {
        uint8_t quartet = framebuffer[n];
        int color1 = (quartet & 0b00000011) >> 0;
        int color2 = (quartet & 0b00001100) >> 2;
        int color3 = (quartet & 0b00110000) >> 4;
        int color4 = (quartet & 0b11000000) >> 6;

        *out++ = palette[color1];
        *out++ = palette[color2];
        *out++ = palette[color3];
        *out++ = palette[color4];
    }
}
