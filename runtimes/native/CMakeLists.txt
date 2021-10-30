cmake_minimum_required(VERSION 3.12)
project(WASM4)

# Prevent BUILD_SHARED_LIBS and other options from being cleared by vendor CMakeLists
# https://stackoverflow.com/a/66342383
set(CMAKE_POLICY_DEFAULT_CMP0077 NEW)

set(BUILD_SHARED_LIBS OFF)
# set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
# set(GLFW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
# set(GLFW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)

add_subdirectory(vendor/glfw)
add_subdirectory(vendor/portaudio)

file(GLOB COMMON_SOURCES RELATIVE "${CMAKE_SOURCE_DIR}" "src/*.c")

#
# Desktop (glfw + portaudio) backend
#

file(GLOB_RECURSE DESKTOP_SOURCES RELATIVE "${CMAKE_SOURCE_DIR}"
    "src/backend/main.c"
    "src/backend/wasm_wasm3.c"
    "src/backend/window_glfw.c"
    "vendor/wasm3/source/*.c"
    "vendor/glad/src/*.c"
)
add_executable(wasm4)
target_sources(wasm4 PRIVATE ${COMMON_SOURCES} ${DESKTOP_SOURCES})
target_include_directories(wasm4 PRIVATE "${CMAKE_SOURCE_DIR}/vendor/wasm3/source")
target_include_directories(wasm4 PRIVATE "${CMAKE_SOURCE_DIR}/vendor/glad/include")
target_link_libraries(wasm4 glfw PortAudio)

#
# Libretro backend
#

file(GLOB_RECURSE LIBRETRO_SOURCES RELATIVE "${CMAKE_SOURCE_DIR}"
    "src/backend/main_libretro.c"
    "src/backend/wasm_wasm3.c"
    "vendor/wasm3/source/*.c"
)
add_library(wasm4_libretro SHARED "")
target_sources(wasm4_libretro PRIVATE ${COMMON_SOURCES} ${LIBRETRO_SOURCES})
target_include_directories(wasm4_libretro PRIVATE "${CMAKE_SOURCE_DIR}/vendor/wasm3/source")
target_include_directories(wasm4_libretro PRIVATE "${CMAKE_SOURCE_DIR}/vendor/libretro/include")

# Hide all symbols by default
set_target_properties(wasm4_libretro PROPERTIES
    C_VISIBILITY_PRESET hidden
    VISIBILITY_INLINES_HIDDEN 1)

# Don't prefix with lib*
set_target_properties(wasm4_libretro PROPERTIES PREFIX "")

#
# Common configuration
#

# Use C99
set_property(TARGET wasm4 wasm4_libretro PROPERTY C_STANDARD 99)

# Enable LTO in release builds
if (CMAKE_BUILD_TYPE STREQUAL "Release")
    include(CheckIPOSupported)
    check_ipo_supported()
    set_property(TARGET wasm4 wasm4_libretro PROPERTY INTERPROCEDURAL_OPTIMIZATION TRUE)
endif ()

install(TARGETS wasm4 wasm4_libretro)
