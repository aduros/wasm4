#include <libretro.h>
#include <stdint.h>
#include <string.h>
#include <stdlib.h>

#include "../wasm.h"
#include "../runtime.h"

static retro_environment_t environ_cb;
static retro_video_refresh_t video_cb;
static retro_input_poll_t input_poll_cb;
static retro_input_state_t input_state_cb;

static uint8_t* wasmCopy = NULL;

// 1024 bytes plus the 2 byte size header
static uint8_t disk[1026] = { 0 };

static bool firstFrame = false;

unsigned retro_api_version () {
    return RETRO_API_VERSION;
}

void retro_set_environment (retro_environment_t cb) {
    environ_cb = cb;

    // Tell libretro we want to persistent_data=true
    struct retro_system_content_info_override exts[] = {
        { "wasm", false, true },
        { NULL, false, false },
    };
    environ_cb(RETRO_ENVIRONMENT_SET_CONTENT_INFO_OVERRIDE, exts);

    // if (cb(RETRO_ENVIRONMENT_GET_LOG_INTERFACE, &logging))
    //    log_cb = logging.log;
    // else
    //    log_cb = fallback_log;
}

void retro_set_audio_sample (retro_audio_sample_t cb) {
    // audio_cb = cb;
}

void retro_set_audio_sample_batch (retro_audio_sample_batch_t cb) {
    // audio_batch_cb = cb;
}

void retro_set_input_poll (retro_input_poll_t cb) {
    input_poll_cb = cb;
}

void retro_set_input_state (retro_input_state_t cb) {
    input_state_cb = cb;
}

void retro_set_video_refresh (retro_video_refresh_t cb) {
    video_cb = cb;
}

void retro_set_controller_port_device (unsigned port, unsigned device) {
}

size_t retro_serialize_size () {
    return 0;
}

bool retro_serialize (void* data, size_t size) {
    return false;
}

bool retro_unserialize (const void* data, size_t size) {
    return false;
}

void retro_cheat_reset () {
}

void retro_cheat_set (unsigned index, bool enabled, const char *code) {
}

void* retro_get_memory_data (unsigned id) {
    return (id == RETRO_MEMORY_SAVE_RAM) ? disk : NULL;
}

size_t retro_get_memory_size (unsigned id) {
    return (id == RETRO_MEMORY_SAVE_RAM) ? sizeof(disk) : 0;
}

void retro_get_system_info (struct retro_system_info* info) {
    memset(info, 0, sizeof(*info));
    info->library_name = "WASM-4";
    info->library_version = "v1";
    info->valid_extensions = "wasm";
}

unsigned retro_get_region () {
    return RETRO_REGION_NTSC;
}

void retro_init () {
}

void retro_deinit () {
}

bool retro_load_game (const struct retro_game_info* game) {
    bool persistent_data = false;
    struct retro_game_info_ext* ext;
    if (environ_cb(RETRO_ENVIRONMENT_GET_GAME_INFO_EXT, &ext)) {
        persistent_data = ext->persistent_data;
    }

    const uint8_t* data;
    if (persistent_data) {
        // We can use the game data directly if libretro will not free it
        data = game->data;
    } else {
        // Otherwise we need to manage our own copy
        wasmCopy = malloc(game->size);
        memcpy(wasmCopy, game->data, game->size);
        data = wasmCopy;
    }

    uint8_t* memory = w4_wasmInit();
    w4_runtimeInit(memory, disk);
    w4_wasmLoadModule(data, game->size);

    firstFrame = true;

    return true;
}

bool retro_load_game_special (unsigned type, const struct retro_game_info *info, size_t num) {
    return false;
}

void retro_unload_game () {
    if (wasmCopy) {
        free(wasmCopy);
    }
}

void retro_reset () {
}

void retro_get_system_av_info (struct retro_system_av_info* info) {
    enum retro_pixel_format format = RETRO_PIXEL_FORMAT_XRGB8888;
    environ_cb(RETRO_ENVIRONMENT_SET_PIXEL_FORMAT, &format);

    info->timing = (struct retro_system_timing) {
        .fps = 60.0,
        .sample_rate = 44100,
    };

    info->geometry = (struct retro_game_geometry) {
        .base_width   = 160,
        .base_height  = 160,
        .max_width    = 160,
        .max_height   = 160,
        .aspect_ratio = 1,
    };
}

void retro_run () {
    // start() needs to be deferred to retro_run(), after retro_get_memory*() is set up
    if (firstFrame) {
        firstFrame = false;
        w4_wasmCallStart();
    }

    input_poll_cb();

    // Gamepad handling
    for (int idx = 0; idx < 4; ++idx) {
        uint8_t gamepad = 0;
        if (input_state_cb(idx, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_A)
                || input_state_cb(idx, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_X)) {
            gamepad |= W4_BUTTON_X;
        }
        if (input_state_cb(idx, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_B)
                || input_state_cb(idx, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_Y)) {
            gamepad |= W4_BUTTON_Z;
        }
        if (input_state_cb(idx, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_LEFT)) {
            gamepad |= W4_BUTTON_LEFT;
        }
        if (input_state_cb(idx, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_RIGHT)) {
            gamepad |= W4_BUTTON_RIGHT;
        }
        if (input_state_cb(idx, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_UP)) {
            gamepad |= W4_BUTTON_UP;
        }
        if (input_state_cb(idx, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_DOWN)) {
            gamepad |= W4_BUTTON_DOWN;
        }
        w4_runtimeSetGamepad(idx, gamepad);
    }

    // Mouse handling
    int16_t mouseX = input_state_cb(0, RETRO_DEVICE_POINTER, 0, RETRO_DEVICE_ID_POINTER_X);
    int16_t mouseY = input_state_cb(0, RETRO_DEVICE_POINTER, 0, RETRO_DEVICE_ID_POINTER_Y);
    uint8_t mouseButtons = 0;
    if (input_state_cb(0, RETRO_DEVICE_MOUSE, 0, RETRO_DEVICE_ID_MOUSE_LEFT)
            || input_state_cb(0, RETRO_DEVICE_POINTER, 0, RETRO_DEVICE_ID_POINTER_PRESSED)) {
        mouseButtons |= W4_MOUSE_LEFT;
    }
    if (input_state_cb(0, RETRO_DEVICE_MOUSE, 0, RETRO_DEVICE_ID_MOUSE_RIGHT)) {
        mouseButtons |= W4_MOUSE_RIGHT;
    }
    if (input_state_cb(0, RETRO_DEVICE_MOUSE, 0, RETRO_DEVICE_ID_MOUSE_MIDDLE)) {
        mouseButtons |= W4_MOUSE_MIDDLE;
    }
    w4_runtimeSetMouse(80+80*mouseX/0x7fff, 80+80*mouseY/0x7fff, mouseButtons);

    w4_runtimeUpdate();
}

void w4_windowComposite (const uint32_t* palette, const uint8_t* framebuffer) {
    // // Get the write destination
    // uint32_t* dest;
    // struct retro_framebuffer info = {0};
    // info.width = 160;
    // info.height = 160;
    // info.access_flags = RETRO_MEMORY_ACCESS_WRITE;
    // if (environ_cb(RETRO_ENVIRONMENT_GET_CURRENT_SOFTWARE_FRAMEBUFFER, &info)
    //         && info.format == RETRO_PIXEL_FORMAT_XRGB8888) {
    //     // Write directly to libretro's framebuffer
    //     dest = info.data;
    //     // TODO(2021-10-30): Handle info.pitch?
    // } else {
    //     // Manage our own intermediate framebuffer
    //     static uint32_t* local = NULL;
    //     if (!local) {
    //         local = malloc(160*160*4);
    //     }
    //     dest = local;
    // }

    static uint32_t dest[160*160];

    // Convert indexed 2bpp framebuffer to XRGB output
    uint32_t* out = dest;
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

    video_cb(dest, 160, 160, 160*4);
}
