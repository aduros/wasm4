#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <libretro.h>

#include "../apu.h"
#include "../runtime.h"
#include "../wasm.h"

#define AUDIO_BUFFER_FRAMES_CALLBACK 256
#define AUDIO_BUFFER_FRAMES_PER_VIDEO_FRAME 735

static retro_environment_t environ_cb;
static retro_video_refresh_t video_cb;
static retro_input_poll_t input_poll_cb;
static retro_input_state_t input_state_cb;
static retro_audio_sample_batch_t audio_batch_cb;

static uint8_t* wasmData;
static size_t wasmLength;
static bool wasmCopy = false;

static uint8_t* memory;
static enum retro_pixel_format pixel_format = RETRO_PIXEL_FORMAT_UNKNOWN;
static int use_audio_callback = 0;
static int16_t audio_output[2*AUDIO_BUFFER_FRAMES_PER_VIDEO_FRAME];

static w4_Disk disk = { 0 };

static int hold_in_start_value = 10;

#if !defined(PSP) && !defined(PS2)
static void audio_set_state (bool enable) {
}
#endif

static void fallback_log(enum retro_log_level level,
			 const char *fmt, ...) {
    va_list args;

    (void) level;

    va_start(args, fmt);
    vfprintf(stderr, fmt, args);
    va_end(args);
}

static retro_log_printf_t log_cb = fallback_log;

#if !defined(PSP) && !defined(PS2)
static void audio_callback () {
    w4_apuWriteSamples(audio_output, AUDIO_BUFFER_FRAMES_CALLBACK);
    audio_batch_cb(audio_output, AUDIO_BUFFER_FRAMES_CALLBACK);
}
#endif

unsigned retro_api_version () {
    return RETRO_API_VERSION;
}

static struct retro_variable variables[] =
{
    {
	"wasm4_pixel_type",
#if defined(PS2)
	"Pixel type; bgr555|xrgb8888",
#else
	"Pixel type; xrgb8888|rgb565",
#endif
    },
#if !defined(PSP) && !defined(PS2) // On PSP callback audio leads to hang
    // On PS2 it leads to silent audio
    {
	"wasm4_audio_type",
	"Audio type; callback|normal",
    },
#endif
    {
	"wasm4_touchscreen_hold_frames",
	"Frames to hold touch value; 10|20|30|5"
    },
    { NULL, NULL },
};

void retro_set_environment (retro_environment_t cb) {
    environ_cb = cb;

    // Tell libretro we want to persistent_data=true
    struct retro_system_content_info_override exts[] = {
        { "wasm", false, true },
        { NULL, false, false },
    };
    struct retro_log_callback logging;

    environ_cb(RETRO_ENVIRONMENT_SET_CONTENT_INFO_OVERRIDE, exts);

    // WASM-4 requires content to run
    bool no_game = false;
    environ_cb(RETRO_ENVIRONMENT_SET_SUPPORT_NO_GAME, &no_game);

    if (cb(RETRO_ENVIRONMENT_GET_LOG_INTERFACE, &logging))
        log_cb = logging.log;

    cb(RETRO_ENVIRONMENT_SET_VARIABLES, variables);
}

void retro_set_audio_sample (retro_audio_sample_t cb) {
    // audio_cb = cb;
}

void retro_set_audio_sample_batch (retro_audio_sample_batch_t cb) {
    audio_batch_cb = cb;
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
    return w4_runtimeSerializeSize();
}

bool retro_serialize (void* dest, size_t size) {
    if (size < w4_runtimeSerializeSize()) {
        return false;
    }
    w4_runtimeSerialize(dest);
    return true;
}

bool retro_unserialize (const void* src, size_t size) {
    if (size < w4_runtimeSerializeSize()) {
        return false;
    }
    w4_runtimeUnserialize(src);
    return true;
}

void retro_cheat_reset () {
}

void retro_cheat_set (unsigned index, bool enabled, const char *code) {
}

void* retro_get_memory_data (unsigned id) {
    switch (id) {
    case RETRO_MEMORY_SAVE_RAM:
        return &disk;
    case RETRO_MEMORY_SYSTEM_RAM:
        return memory;
    default:
        return NULL;
    }
}

size_t retro_get_memory_size (unsigned id) {
    switch (id) {
    case RETRO_MEMORY_SAVE_RAM:
        return sizeof(disk);
    case RETRO_MEMORY_SYSTEM_RAM:
        return 1 << 16;
    default:
        return 0;
    }
}

void retro_get_system_info (struct retro_system_info* info) {
    memset(info, 0, sizeof(*info));
    info->library_name = "WASM-4";
#ifndef GIT_VERSION
#define GIT_VERSION ""
#endif
    info->library_version = "v1" GIT_VERSION;
    info->valid_extensions = "wasm";
    info->need_fullpath = false;
}

unsigned retro_get_region () {
    return RETRO_REGION_NTSC;
}

void retro_init () {
    // printf("WASM4 init\n");
}

void retro_deinit () {
    // printf("WASM4 deinit\n");
}

static void try_pixel_format(enum retro_pixel_format format) {
    if (environ_cb(RETRO_ENVIRONMENT_SET_PIXEL_FORMAT, &format)) {
	log_cb(RETRO_LOG_INFO, "Using pixel format %d\n", format);
	pixel_format = format;
    }
}

static void load_variables(bool startup) {
    struct retro_variable var;

    if (startup) {
#if !defined(PSP) && !defined(PS2)
	var.key = "wasm4_audio_type";
	var.value = NULL;

	use_audio_callback = !environ_cb(RETRO_ENVIRONMENT_GET_VARIABLE, &var) || !var.value || strcmp(var.value, "callback") == 0;
#else
	use_audio_callback = 0;
#endif
    }

    var.key = "wasm4_touchscreen_hold_frames";
    var.value = NULL;

    if (environ_cb(RETRO_ENVIRONMENT_GET_VARIABLE, &var) && var.value) {
	hold_in_start_value = strtoul(var.value, 0, 0);
    } else {
	hold_in_start_value = 10;
    }

    if (hold_in_start_value < 0 || hold_in_start_value > 120)
	hold_in_start_value = 10;
}

bool retro_load_game (const struct retro_game_info* game) {
    // printf("WASM4 load_game\n");

    bool persistent_data = false;
    struct retro_game_info_ext* ext;
    enum retro_pixel_format preferredformat = RETRO_PIXEL_FORMAT_XRGB8888;
    static const enum retro_pixel_format supported_formats[] = {RETRO_PIXEL_FORMAT_XRGB8888, RETRO_PIXEL_FORMAT_RGB565 };
    struct retro_variable var;
    unsigned i;

    var.key = "wasm4_pixel_type";
    var.value = NULL;

    if (!environ_cb(RETRO_ENVIRONMENT_GET_VARIABLE, &var))
	var.value = NULL;
    if (var.value && (strcmp(var.value, "rgb565") == 0 || strcmp(var.value, "bgr555") == 0))
	preferredformat = RETRO_PIXEL_FORMAT_RGB565;
    else
	preferredformat = RETRO_PIXEL_FORMAT_XRGB8888;

    pixel_format = RETRO_PIXEL_FORMAT_UNKNOWN;
    try_pixel_format(preferredformat);
    for (i = 0; pixel_format == RETRO_PIXEL_FORMAT_UNKNOWN && i < sizeof(supported_formats) / sizeof(supported_formats[0]); i++)
	if (supported_formats[i] != preferredformat) // No need to try again
	    try_pixel_format(supported_formats[i]);
    if (pixel_format == RETRO_PIXEL_FORMAT_UNKNOWN) {
	log_cb(RETRO_LOG_ERROR, "No supported image format found\n");
	pixel_format = RETRO_PIXEL_FORMAT_UNKNOWN;
	return false;
    }

    if (environ_cb(RETRO_ENVIRONMENT_GET_GAME_INFO_EXT, &ext)) {
        persistent_data = ext->persistent_data;
    }

    wasmLength = game->size;
    if (persistent_data) {
        // We can use the game data directly if libretro will not free it
        wasmData = (uint8_t*)game->data;
        wasmCopy = false;
    } else {
        // Otherwise we need to manage our own copy
        wasmData = malloc(wasmLength);
        wasmCopy = true;
        memcpy(wasmData, game->data, wasmLength);
    }

    // Set input descriptors
    struct retro_input_descriptor descs[] = {
        { 0, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_LEFT, "Left" },
        { 0, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_UP, "Up" },
        { 0, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_DOWN, "Down" },
        { 0, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_RIGHT, "Right" },
        { 0, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_A, "X" },
        { 0, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_B, "Z" },

        { 1, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_LEFT, "Left" },
        { 1, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_UP, "Up" },
        { 1, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_DOWN, "Down" },
        { 1, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_RIGHT, "Right" },
        { 1, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_A, "X" },
        { 1, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_B, "Z" },

        { 2, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_LEFT, "Left" },
        { 2, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_UP, "Up" },
        { 2, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_DOWN, "Down" },
        { 2, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_RIGHT, "Right" },
        { 2, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_A, "X" },
        { 2, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_B, "Z" },

        { 3, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_LEFT, "Left" },
        { 3, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_UP, "Up" },
        { 3, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_DOWN, "Down" },
        { 3, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_RIGHT, "Right" },
        { 3, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_A, "X" },
        { 3, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_B, "Z" },

        { 0 },
    };
    environ_cb(RETRO_ENVIRONMENT_SET_INPUT_DESCRIPTORS, descs);

    memory = w4_wasmInit();
    w4_runtimeInit(memory, &disk);
    w4_wasmLoadModule(wasmData, wasmLength);

    load_variables(true);

#if !defined(PSP) && !defined(PS2)
    if (use_audio_callback) {
	struct retro_audio_callback audio_cb = { audio_callback, audio_set_state };
	log_cb(RETRO_LOG_INFO, "Using callback audio\n");
	environ_cb(RETRO_ENVIRONMENT_SET_AUDIO_CALLBACK, &audio_cb);
    }
#endif

    if (!use_audio_callback) {
	log_cb(RETRO_LOG_INFO, "Using normal audio\n");
    }

    return true;
}

bool retro_load_game_special (unsigned type, const struct retro_game_info *info, size_t num) {
    return false;
}

void retro_unload_game () {
    w4_wasmDestroy();
    if (wasmCopy) {
        free(wasmData);
    }
}

void retro_reset () {
    w4_runtimeInit(memory, &disk);
    w4_wasmLoadModule(wasmData, wasmLength);
}

void retro_get_system_av_info (struct retro_system_av_info* info) {
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
    bool updated = false;
    if (environ_cb(RETRO_ENVIRONMENT_GET_VARIABLE_UPDATE, &updated) && updated) {
	load_variables(false);
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
    int16_t mouseX;
    int16_t mouseY;
    uint8_t mouseButtons = 0;
    int touchcount = 0;
    static int hold_position_countdown;
    static int hold_touch_countdown;
    static int old_touchcount = 0, held_touchcount = 0;
    static int hold_position_touchcount = 0;
    static int holdX = 0;
    static int holdY = 0;
    static bool is_mouse =
#if defined(ANDROID) || defined(__SWITCH__) || defined(VITA)
	false
#else
	true
#endif
	;

    while (input_state_cb(0, RETRO_DEVICE_POINTER, touchcount, RETRO_DEVICE_ID_POINTER_PRESSED))
	touchcount++;

    if (hold_position_countdown > 0 && touchcount < hold_position_touchcount) {
	hold_position_countdown--;
	mouseX = holdX;
	mouseY = holdY;
    } else if (touchcount > 0)  {
	int sX = 0, sY = 0, i = 0;
	for (i = 0; i < touchcount; i++) {
	    sX += input_state_cb(0, RETRO_DEVICE_POINTER, i, RETRO_DEVICE_ID_POINTER_X);
	    sY += input_state_cb(0, RETRO_DEVICE_POINTER, i, RETRO_DEVICE_ID_POINTER_Y);
	}
	mouseX = sX / touchcount;
	mouseY = sY / touchcount;
    } else if (is_mouse)  {
	mouseX = input_state_cb(0, RETRO_DEVICE_POINTER, 0, RETRO_DEVICE_ID_POINTER_X);
	mouseY = input_state_cb(0, RETRO_DEVICE_POINTER, 0, RETRO_DEVICE_ID_POINTER_Y);
    } else {
	mouseX = 0x7fff;
	mouseY = 0x7fff;
    }

    if (hold_position_countdown <= 0)
	hold_position_touchcount = 0;

    if (touchcount > hold_position_touchcount) {
	hold_position_countdown = hold_in_start_value;
	hold_position_touchcount = touchcount;
	holdX = mouseX;
	holdY = mouseY;
    }

    if (touchcount == held_touchcount && hold_touch_countdown > 0) {
	hold_touch_countdown--;
    } else if (touchcount == held_touchcount) {
	old_touchcount = touchcount;
    } else {
	held_touchcount = touchcount;
	hold_touch_countdown = hold_in_start_value;
    }

    bool lbutton = input_state_cb(0, RETRO_DEVICE_MOUSE, 0, RETRO_DEVICE_ID_MOUSE_LEFT);
    bool rbutton = input_state_cb(0, RETRO_DEVICE_MOUSE, 0, RETRO_DEVICE_ID_MOUSE_RIGHT);
    bool mbutton = input_state_cb(0, RETRO_DEVICE_MOUSE, 0, RETRO_DEVICE_ID_MOUSE_MIDDLE);

    if (lbutton || old_touchcount == 1) {
	mouseButtons |= W4_MOUSE_LEFT;
    }
    if (rbutton || old_touchcount == 2) {
	mouseButtons |= W4_MOUSE_RIGHT;
    }
    if (mbutton || old_touchcount >= 3) {
	mouseButtons |= W4_MOUSE_MIDDLE;
    }

    w4_runtimeSetMouse(80+80*mouseX/0x7fff, 80+80*mouseY/0x7fff, mouseButtons);

    w4_runtimeUpdate();

    if (!use_audio_callback) {
	w4_apuWriteSamples(audio_output, AUDIO_BUFFER_FRAMES_PER_VIDEO_FRAME);
	audio_batch_cb(audio_output, AUDIO_BUFFER_FRAMES_PER_VIDEO_FRAME);
    }
}

#define do_composite(type, palette) {			\
	type* out = (type *)dest;			\
	for (int n = 0; n < 160*160/4; ++n) {		\
	    uint8_t quartet = framebuffer[n];		\
	    int color1 = (quartet & 0x03) >> 0;		\
	    int color2 = (quartet & 0x0c) >> 2;		\
	    int color3 = (quartet & 0x30) >> 4;		\
	    int color4 = (quartet & 0xc0) >> 6;		\
							\
	    *out++ = palette[color1];			\
	    *out++ = palette[color2];			\
	    *out++ = palette[color3];			\
	    *out++ = palette[color4];			\
	}						\
	video_cb(dest, 160, 160, 160*sizeof(type));	\
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
    if (pixel_format == RETRO_PIXEL_FORMAT_RGB565) {
	uint16_t transform_palette[4];
	int i;
	for (i = 0; i < 4; i++) {
	    uint32_t c = palette[i];
#if defined(PS2)
	    transform_palette[i] = ((((c) & 0xf8) << 7) | ((c>>6) & 0x3e0) | (((c >> 19) & 0x1f)));
#else
	    transform_palette[i] = ((c >> 3) & 0x001f) | ((c >> 5) & 0x07e0) | ((c >> 8) & 0xf800);
#endif
	}
	do_composite(uint16_t, transform_palette);
    } else {
	do_composite(uint32_t, palette);
    }
}
