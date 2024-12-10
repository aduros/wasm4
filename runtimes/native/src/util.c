#include "util.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#if defined(__BYTE_ORDER__) && __BYTE_ORDER__ == __ORDER_BIG_ENDIAN__
#    define W4_BIG_ENDIAN
#endif

void* xmalloc(size_t size) {
    void* ptr = malloc(size);
    if (ptr == NULL) {
        fputs("Allocation failed.\n", stderr);
        abort();
    }
    return ptr;
}

void* xrealloc(void* ptr, size_t size) {
    ptr = realloc(ptr, size);
    if (ptr == NULL) {
        fputs("Allocation failed.\n", stderr);
        abort();
    }
    return ptr;
}

uint16_t bswap16(uint16_t x) {
    return ((( x  >> 8 ) & 0xffu ) | (( x  & 0xffu ) << 8 ));
}

uint32_t bswap32(uint32_t x) {
    return ((( x & 0xff000000u ) >> 24 ) |
            (( x & 0x00ff0000u ) >> 8  ) |
            (( x & 0x0000ff00u ) << 8  ) |
            (( x & 0x000000ffu ) << 24 ));
}

uint16_t w4_read16LE (const void* ptr) {
    uint16_t le;
    memcpy(&le, ptr, sizeof(le));
#ifdef W4_BIG_ENDIAN
    return bswap16(le);
#else
    return le;
#endif
}

uint32_t w4_read32LE (const void* ptr) {
    uint32_t le;
    memcpy(&le, ptr, sizeof(le));
#ifdef W4_BIG_ENDIAN
    return bswap32(le);
#else
    return le;
#endif
}

double w4_readf64LE (const void* ptr) {
    union {
        uint64_t u;
        double d;
    } u;
    memcpy(&u.d, ptr, sizeof(u.d));
#ifdef W4_BIG_ENDIAN
    u.u = bswap32(u.u);
#endif
    return u.d;
}

void w4_write16LE (void* ptr, uint16_t value) {
    uint16_t le;
#ifdef W4_BIG_ENDIAN
    le = bswap16(value);
#else
    le = value;
#endif
    memcpy(ptr, &le, sizeof(le));
}

void w4_write32LE (void* ptr, uint32_t value) {
    uint32_t le;
#ifdef W4_BIG_ENDIAN
    le = bswap32(value);
#else
    le = value;
#endif
    memcpy(ptr, &le, sizeof(le));
}
