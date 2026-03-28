#include "store.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <curl/curl.h>

#include "runtime.h"

#define STORE_URL "https://wasm4.org/carts.json"
#define CART_BASE_URL "https://wasm4.org/carts/"
#define MAX_CARTS 512
#define MAX_TITLE 64
#define MAX_AUTHOR 64
#define MAX_SLUG 64
#define ITEMS_PER_PAGE 7
#define FONT_W 8
#define FONT_H 8
#define SCREEN_W 160
#define SCREEN_H 160

typedef struct {
    char slug[MAX_SLUG];
    char title[MAX_TITLE];
    char author[MAX_AUTHOR];
} CartEntry;

typedef enum {
    STORE_CLOSED,
    STORE_LOADING_CATALOG,
    STORE_BROWSING,
    STORE_DOWNLOADING,
    STORE_ERROR
} StoreState;

static StoreState state = STORE_CLOSED;
static CartEntry carts[MAX_CARTS];
static int cartCount = 0;
static int selectedIdx = 0;
static int scrollOffset = 0;
static uint8_t lastGamepad = 0;
static char errorMsg[64] = {0};

// Downloaded cart data
static uint8_t* downloadedCart = NULL;
static int downloadedCartLen = 0;
static bool downloadReady = false;

// Thread for async downloads
static pthread_t downloadThread;
static bool threadActive = false;

// ---- CURL helpers ----

typedef struct {
    char* data;
    size_t size;
} CurlBuffer;

static size_t curlWriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    size_t realsize = size * nmemb;
    CurlBuffer* buf = (CurlBuffer*)userp;
    char* ptr = realloc(buf->data, buf->size + realsize + 1);
    if (!ptr) return 0;
    buf->data = ptr;
    memcpy(&(buf->data[buf->size]), contents, realsize);
    buf->size += realsize;
    buf->data[buf->size] = 0;
    return realsize;
}

static CurlBuffer curlFetch(const char* url) {
    CurlBuffer buf = {0};
    buf.data = malloc(1);
    buf.size = 0;

    CURL* curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curlWriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void*)&buf);
        curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
        curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
        CURLcode res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            free(buf.data);
            buf.data = NULL;
            buf.size = 0;
        }
        curl_easy_cleanup(curl);
    }
    return buf;
}

// ---- Minimal JSON parsing for carts.json ----
// Format: [{"slug":"x","title":"X","authors":[{"name":"Y"}],...}, ...]

static const char* skipWhitespace(const char* p) {
    while (*p == ' ' || *p == '\t' || *p == '\n' || *p == '\r') p++;
    return p;
}

static const char* parseString(const char* p, char* out, int maxLen) {
    if (*p != '"') return NULL;
    p++;
    int i = 0;
    while (*p && *p != '"') {
        if (*p == '\\') {
            p++;
            if (!*p) return NULL;
        }
        if (i < maxLen - 1) out[i++] = *p;
        p++;
    }
    out[i] = 0;
    if (*p == '"') p++;
    return p;
}

static const char* skipValue(const char* p) {
    p = skipWhitespace(p);
    if (*p == '"') {
        p++;
        while (*p && *p != '"') {
            if (*p == '\\') p++;
            p++;
        }
        if (*p == '"') p++;
    } else if (*p == '[' || *p == '{') {
        char open = *p, close = (*p == '[') ? ']' : '}';
        int depth = 1;
        p++;
        while (*p && depth > 0) {
            if (*p == '"') {
                p++;
                while (*p && *p != '"') { if (*p == '\\') p++; p++; }
                if (*p == '"') p++;
                continue;
            }
            if (*p == open) depth++;
            else if (*p == close) depth--;
            p++;
        }
    } else {
        while (*p && *p != ',' && *p != '}' && *p != ']') p++;
    }
    return p;
}

static void parseCatalog(const char* json) {
    cartCount = 0;
    const char* p = skipWhitespace(json);
    if (*p != '[') return;
    p++;

    while (cartCount < MAX_CARTS) {
        p = skipWhitespace(p);
        if (*p == ']' || !*p) break;
        if (*p == ',') { p++; continue; }
        if (*p != '{') break;
        p++;

        CartEntry entry = {0};

        // Parse object fields
        while (*p && *p != '}') {
            p = skipWhitespace(p);
            if (*p == ',') { p++; continue; }
            if (*p == '}') break;

            char key[32] = {0};
            const char* pnext = parseString(p, key, sizeof(key));
            if (!pnext) { p = skipValue(p); if (!p) break; continue; }
            p = pnext;
            p = skipWhitespace(p);
            if (*p == ':') p++;
            p = skipWhitespace(p);

            if (strcmp(key, "slug") == 0) {
                pnext = parseString(p, entry.slug, MAX_SLUG);
                if (!pnext) { p = skipValue(p); if (!p) break; continue; }
                p = pnext;
            } else if (strcmp(key, "title") == 0) {
                pnext = parseString(p, entry.title, MAX_TITLE);
                if (!pnext) { p = skipValue(p); if (!p) break; continue; }
                p = pnext;
            } else if (strcmp(key, "authors") == 0) {
                // Parse first author name from array — skip entire value safely
                const char* authorsStart = p;
                p = skipValue(p);
                // Now re-parse just to extract first author name
                {
                    const char* a = authorsStart;
                    if (*a == '[') {
                        a++;
                        while (*a == ' ' || *a == '\n' || *a == '\r' || *a == '\t') a++;
                        if (*a == '{') {
                            a++;
                            while (*a && *a != '}') {
                                while (*a == ' ' || *a == '\n' || *a == '\r' || *a == '\t' || *a == ',') a++;
                                if (*a == '}') break;
                                char akey[32] = {0};
                                const char* anext = parseString(a, akey, sizeof(akey));
                                if (!anext) break;
                                a = anext;
                                while (*a == ' ' || *a == '\n' || *a == '\r' || *a == '\t') a++;
                                if (*a == ':') a++;
                                while (*a == ' ' || *a == '\n' || *a == '\r' || *a == '\t') a++;
                                if (strcmp(akey, "name") == 0) {
                                    parseString(a, entry.author, MAX_AUTHOR);
                                    break; // Got the name, done
                                } else {
                                    a = skipValue(a);
                                }
                            }
                        }
                    }
                }
            } else {
                p = skipValue(p);
            }
            if (!p) break;
        }
        if (!p || !*p) break;
        if (*p == '}') p++;

        if (entry.slug[0] && entry.title[0]) {
            carts[cartCount++] = entry;
        }
    }
}

// ---- Async download threads ----

static void* catalogDownloadThread(void* arg) {
    (void)arg;
    CurlBuffer buf = curlFetch(STORE_URL);
    if (buf.data && buf.size > 0) {
        parseCatalog(buf.data);
        free(buf.data);
        if (cartCount > 0) {
            state = STORE_BROWSING;
        } else {
            snprintf(errorMsg, sizeof(errorMsg), "NO GAMES FOUND");
            state = STORE_ERROR;
        }
    } else {
        snprintf(errorMsg, sizeof(errorMsg), "DOWNLOAD FAILED");
        state = STORE_ERROR;
    }
    threadActive = false;
    return NULL;
}

static void* cartDownloadThread(void* arg) {
    char* slug = (char*)arg;
    char url[256];
    snprintf(url, sizeof(url), "%s%s.wasm", CART_BASE_URL, slug);
    fprintf(stderr, "[store] Downloading: %s\n", url);
    free(slug);

    CurlBuffer buf = curlFetch(url);
    if (buf.data && buf.size > 0) {
        fprintf(stderr, "[store] Downloaded %zu bytes\n", buf.size);
        downloadedCart = (uint8_t*)buf.data;
        downloadedCartLen = (int)buf.size;
        downloadReady = true;
    } else {
        fprintf(stderr, "[store] Download failed\n");
        snprintf(errorMsg, sizeof(errorMsg), "CART DOWNLOAD FAILED");
        state = STORE_ERROR;
    }
    threadActive = false;
    return NULL;
}

// ---- Framebuffer text rendering ----
// We render directly into a 160x160 2bpp framebuffer using the WASM-4 font

// WASM-4 built-in font data (1bpp, 8x8, ASCII 32-255)
// We reuse the font from constants — but since we're in C, we just call
// the framebuffer text function

static uint8_t storeFb[SCREEN_W * SCREEN_H / 4];
static uint8_t storeDrawColors[2];

static void storeClearFb(void) {
    // Fill with color 0 (palette index 0 = darkest background)
    memset(storeFb, 0x00, sizeof(storeFb));
}

static void storeSetPixel(int x, int y, uint8_t color) {
    if (x < 0 || x >= SCREEN_W || y < 0 || y >= SCREEN_H) return;
    int idx = (y * SCREEN_W + x) >> 2;
    int shift = (x & 3) * 2;
    storeFb[idx] = (storeFb[idx] & ~(3 << shift)) | ((color & 3) << shift);
}

static void storeDrawRect(int x, int y, int w, int h, uint8_t color) {
    for (int dy = 0; dy < h; dy++) {
        for (int dx = 0; dx < w; dx++) {
            storeSetPixel(x + dx, y + dy, color);
        }
    }
}

// Minimal 4x6 font for store UI (uppercase + digits + some symbols)
// Each character is 4 pixels wide, 6 pixels tall, stored as 6 bytes (4 bits used per row)
static const uint8_t miniFont[][6] = {
    // ' ' (space)
    {0x0,0x0,0x0,0x0,0x0,0x0},
    // A
    {0x6,0x9,0x9,0xF,0x9,0x9},
    // B
    {0x7,0x9,0x7,0x9,0x9,0x7},
    // C
    {0x6,0x9,0x1,0x1,0x9,0x6},
    // D
    {0x7,0x9,0x9,0x9,0x9,0x7},
    // E
    {0xF,0x1,0x7,0x1,0x1,0xF},
    // F
    {0xF,0x1,0x7,0x1,0x1,0x1},
    // G
    {0x6,0x9,0x1,0xD,0x9,0x6},
    // H
    {0x9,0x9,0xF,0x9,0x9,0x9},
    // I
    {0xE,0x4,0x4,0x4,0x4,0xE},
    // J
    {0x8,0x8,0x8,0x8,0x9,0x6},
    // K
    {0x9,0x5,0x3,0x3,0x5,0x9},
    // L
    {0x1,0x1,0x1,0x1,0x1,0xF},
    // M
    {0x9,0xF,0xF,0x9,0x9,0x9},
    // N
    {0x9,0xB,0xD,0x9,0x9,0x9},
    // O
    {0x6,0x9,0x9,0x9,0x9,0x6},
    // P
    {0x7,0x9,0x9,0x7,0x1,0x1},
    // Q
    {0x6,0x9,0x9,0x9,0x5,0xA},
    // R
    {0x7,0x9,0x9,0x7,0x5,0x9},
    // S
    {0x6,0x1,0x6,0x8,0x8,0x7},
    // T
    {0xE,0x4,0x4,0x4,0x4,0x4},
    // U
    {0x9,0x9,0x9,0x9,0x9,0x6},
    // V
    {0x9,0x9,0x9,0x9,0x6,0x6},
    // W
    {0x9,0x9,0x9,0xF,0xF,0x9},
    // X
    {0x9,0x9,0x6,0x6,0x9,0x9},
    // Y
    {0x9,0x9,0x6,0x4,0x4,0x4},
    // Z
    {0xF,0x8,0x4,0x2,0x1,0xF},
    // 0
    {0x6,0x9,0xD,0xB,0x9,0x6},
    // 1
    {0x2,0x3,0x2,0x2,0x2,0x7},
    // 2
    {0x6,0x9,0x8,0x4,0x2,0xF},
    // 3
    {0xF,0x8,0x4,0x8,0x9,0x6},
    // 4
    {0x8,0x9,0x9,0xF,0x8,0x8},
    // 5
    {0xF,0x1,0x7,0x8,0x9,0x6},
    // 6
    {0x4,0x2,0x7,0x9,0x9,0x6},
    // 7
    {0xF,0x8,0x4,0x4,0x2,0x2},
    // 8
    {0x6,0x9,0x6,0x9,0x9,0x6},
    // 9
    {0x6,0x9,0x9,0xE,0x4,0x2},
    // . (period)
    {0x0,0x0,0x0,0x0,0x0,0x2},
    // - (hyphen)
    {0x0,0x0,0x6,0x0,0x0,0x0},
    // / (slash)
    {0x8,0x8,0x4,0x2,0x1,0x1},
    // > (arrow)
    {0x1,0x2,0x4,0x2,0x1,0x0},
    // : (colon)
    {0x0,0x2,0x0,0x0,0x2,0x0},
};

static int miniFontIndex(char c) {
    if (c == ' ') return 0;
    if (c >= 'A' && c <= 'Z') return 1 + (c - 'A');
    if (c >= 'a' && c <= 'z') return 1 + (c - 'a');
    if (c >= '0' && c <= '9') return 27 + (c - '0');
    if (c == '.') return 37;
    if (c == '-') return 38;
    if (c == '/') return 39;
    if (c == '>') return 40;
    if (c == ':') return 41;
    return 0; // space for unknown
}

static void storeDrawChar(int x, int y, char c, uint8_t color) {
    int idx = miniFontIndex(c);
    for (int row = 0; row < 6; row++) {
        uint8_t bits = miniFont[idx][row];
        for (int col = 0; col < 4; col++) {
            if (bits & (1 << col)) {
                storeSetPixel(x + col, y + row, color);
            }
        }
    }
}

static void storeDrawText(int x, int y, const char* text, uint8_t color) {
    while (*text) {
        storeDrawChar(x, y, *text, color);
        x += 5;
        text++;
    }
}

static int storeTextWidth(const char* text) {
    int len = strlen(text);
    return len > 0 ? len * 5 - 1 : 0;
}

static void storeDrawTextCentered(int y, const char* text, uint8_t color) {
    int w = storeTextWidth(text);
    storeDrawText((SCREEN_W - w) / 2, y, text, color);
}

// ---- Public API ----

void w4_storeInit(void) {
    curl_global_init(CURL_GLOBAL_DEFAULT);
}

void w4_storeOpen(void) {
    if (state != STORE_CLOSED) return;

    // Keep selectedIdx and scrollOffset from previous session
    lastGamepad = 0xff;  // ignore all currently held buttons
    downloadReady = false;
    errorMsg[0] = 0;

    if (cartCount > 0) {
        // Already have catalog cached
        state = STORE_BROWSING;
    } else {
        state = STORE_LOADING_CATALOG;
        catalogDownloadThread(NULL);
    }
}

void w4_storeClose(void) {
    if (state == STORE_LOADING_CATALOG || state == STORE_DOWNLOADING) {
        // Let thread finish in background
        if (threadActive) {
            pthread_detach(downloadThread);
            threadActive = false;
        }
    }
    state = STORE_CLOSED;
}

bool w4_storeIsOpen(void) {
    return state != STORE_CLOSED;
}

void w4_storeInput(uint8_t gamepad) {
    uint8_t pressed = gamepad & (gamepad ^ lastGamepad);
    lastGamepad = gamepad;

    if (state == STORE_ERROR) {
        if (pressed & (W4_BUTTON_Z | W4_BUTTON_X)) {
            w4_storeClose();
        }
        return;
    }

    if (state != STORE_BROWSING) return;

    if (pressed & W4_BUTTON_DOWN) {
        selectedIdx++;
        if (selectedIdx >= cartCount) selectedIdx = 0;
        if (selectedIdx >= scrollOffset + ITEMS_PER_PAGE) {
            scrollOffset = selectedIdx - ITEMS_PER_PAGE + 1;
        }
        if (selectedIdx == 0) scrollOffset = 0;
    }
    if (pressed & W4_BUTTON_UP) {
        selectedIdx--;
        if (selectedIdx < 0) selectedIdx = cartCount - 1;
        if (selectedIdx < scrollOffset) {
            scrollOffset = selectedIdx;
        }
        if (selectedIdx == cartCount - 1) {
            scrollOffset = cartCount - ITEMS_PER_PAGE;
            if (scrollOffset < 0) scrollOffset = 0;
        }
    }
    if (pressed & W4_BUTTON_RIGHT) {
        selectedIdx += ITEMS_PER_PAGE;
        if (selectedIdx >= cartCount) selectedIdx = selectedIdx % cartCount;
        scrollOffset = selectedIdx - ITEMS_PER_PAGE + 1;
        if (scrollOffset < 0) scrollOffset = 0;
    }
    if (pressed & W4_BUTTON_LEFT) {
        selectedIdx -= ITEMS_PER_PAGE;
        if (selectedIdx < 0) selectedIdx = cartCount + selectedIdx;
        scrollOffset = selectedIdx;
        if (scrollOffset < 0) scrollOffset = 0;
    }

    if (pressed & W4_BUTTON_X) {
        if (cartCount > 0) {
            state = STORE_DOWNLOADING;
            threadActive = true;
            char* slug = strdup(carts[selectedIdx].slug);
            pthread_create(&downloadThread, NULL, cartDownloadThread, slug);
        }
    }

    if (pressed & W4_BUTTON_Z) {
        w4_storeClose();
    }
}

void w4_storeRender(uint32_t* palette, uint8_t* framebuffer) {
    // Store palette: dark background, light text
    palette[0] = 0x1a1c2c; // darkest (bg)
    palette[1] = 0x5d275d; // dark accent
    palette[2] = 0x73eff7; // highlight
    palette[3] = 0xf4f4f4; // lightest (text)

    storeClearFb();

    if (state == STORE_LOADING_CATALOG) {
        storeDrawTextCentered(76, "LOADING...", 3);
    }
    else if (state == STORE_DOWNLOADING) {
        storeDrawTextCentered(70, "DOWNLOADING", 3);
        storeDrawTextCentered(82, carts[selectedIdx].title, 2);
    }
    else if (state == STORE_ERROR) {
        storeDrawTextCentered(70, errorMsg, 2);
        storeDrawTextCentered(86, "PRESS ANY KEY", 3);
    }
    else if (state == STORE_BROWSING) {
        // Header
        storeDrawTextCentered(4, "WASM-4 STORE", 2);

        // Divider line
        storeDrawRect(4, 14, SCREEN_W - 8, 1, 1);

        // Game list
        int y = 18;
        int end = scrollOffset + ITEMS_PER_PAGE;
        if (end > cartCount) end = cartCount;

        for (int i = scrollOffset; i < end; i++) {
            uint8_t titleColor = (i == selectedIdx) ? 2 : 3;

            if (i == selectedIdx) {
                // Highlight bar
                storeDrawRect(2, y - 1, SCREEN_W - 4, 18, 1);
                // Arrow
                storeDrawChar(4, y + 1, '>', 2);
            }

            // Title (truncate to fit)
            char buf[28];
            snprintf(buf, sizeof(buf), "%s", carts[i].title);
            storeDrawText(12, y + 1, buf, titleColor);

            // Author below title
            char authorBuf[28];
            snprintf(authorBuf, sizeof(authorBuf), "%s", carts[i].author);
            storeDrawText(12, y + 9, authorBuf, (i == selectedIdx) ? 3 : 1);

            y += 19;
        }

        // Footer with scroll info
        storeDrawRect(0, SCREEN_H - 11, SCREEN_W, 11, 1);
        char footer[32];
        snprintf(footer, sizeof(footer), "%d/%d", selectedIdx + 1, cartCount);
        storeDrawText(4, SCREEN_H - 9, footer, 3);
        storeDrawText(80, SCREEN_H - 9, "X:OK Z:BACK", 2);
    }

    memcpy(framebuffer, storeFb, sizeof(storeFb));
}

void w4_storeJoinThread(void) {
    if (threadActive) {
        pthread_join(downloadThread, NULL);
        threadActive = false;
    }
}

uint8_t* w4_storeGetSelectedCart(int* outLength) {
    if (downloadReady && downloadedCart) {
        uint8_t* cart = downloadedCart;
        *outLength = downloadedCartLen;
        downloadedCart = NULL;
        downloadedCartLen = 0;
        downloadReady = false;
        state = STORE_CLOSED;
        return cart;
    }
    return NULL;
}
