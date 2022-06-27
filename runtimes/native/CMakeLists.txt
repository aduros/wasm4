cmake_minimum_required(VERSION 3.7)
project(WASM4)

# Prevent BUILD_SHARED_LIBS and other options from being cleared by vendor CMakeLists
# https://stackoverflow.com/a/66342383
set(CMAKE_POLICY_DEFAULT_CMP0077 NEW)

# Enable LTO in release builds
if (${CMAKE_MAJOR_VERSION}.${CMAKE_MINOR_VERSION} VERSION_GREATER 3.11)
cmake_minimum_required(VERSION 3.12)
set(CMAKE_POLICY_DEFAULT_CMP0069 NEW)
if (CMAKE_BUILD_TYPE STREQUAL "Release")
    include(CheckIPOSupported)
    check_ipo_supported(RESULT result OUTPUT output)
    if (result)
        set(CMAKE_INTERPROCEDURAL_OPTIMIZATION TRUE)
    else()
        message(WARNING "IPO is not supported: ${output}")
    endif ()
endif ()
endif ()

# General options
set(BUILD_SHARED_LIBS OFF)
set(BUILD_TESTS OFF)
set(BUILD_TOOLS OFF)

# MiniFB options
set(MINIFB_BUILD_EXAMPLES OFF)
set(USE_OPENGL_API OFF)
# set(USE_METAL_API OFF)

# Cubeb options
set(USE_SANITIZERS OFF)

if (LIBRETRO)
  execute_process(COMMAND git rev-parse --short HEAD
    OUTPUT_VARIABLE GIT_VERSION
    OUTPUT_STRIP_TRAILING_WHITESPACE
    ERROR_QUIET)
  if ("${GIT_VERSION}" STREQUAL "")
    set(GIT_VERSION "unknown")
  endif ()
  add_definitions(-DGIT_VERSION=" ${GIT_VERSION}")
endif ()

if (NOT LIBRETRO)
# add_subdirectory(vendor/glfw)
add_subdirectory(vendor/minifb)
add_subdirectory(vendor/cubeb)
endif ()

file(GLOB COMMON_SOURCES RELATIVE "${CMAKE_SOURCE_DIR}" "src/*.c")
file(GLOB M3_SOURCES RELATIVE "${CMAKE_SOURCE_DIR}" "vendor/wasm3/source/*.c")

# Include a strnlen polyfill for some platforms where it's missing (OSX PPC, maybe others)
include(CheckSymbolExists)
check_symbol_exists(strnlen "string.h" HAVE_STRNLEN)
if (NOT HAVE_STRNLEN)
    list(APPEND M3_SOURCES "src/backend/strnlen.c")
endif ()

if (NOT LIBRETRO)

#
# Desktop (minifb + cubeb) backend
#

set(MINIFB_SOURCES
    src/backend/main.c
    src/backend/wasm_wasm3.c
    src/backend/window_minifb.c
)
add_executable(wasm4 ${COMMON_SOURCES} ${MINIFB_SOURCES} ${M3_SOURCES})

target_include_directories(wasm4 PRIVATE "${CMAKE_SOURCE_DIR}/vendor/wasm3/source")
target_link_libraries(wasm4 minifb cubeb)
set_target_properties(wasm4 PROPERTIES C_STANDARD 99)
install(TARGETS wasm4)
endif ()

if (WASMER_DIR)
    set(WASMER_SOURCES
        src/backend/main.c
        src/backend/wasm_wasmer.c
        src/backend/window_minifb.c
    )
    add_executable(wasm4_wasmer ${COMMON_SOURCES} ${WASMER_SOURCES})

    target_include_directories(wasm4_wasmer PRIVATE "${WASMER_DIR}/include")
    target_link_directories(wasm4_wasmer PRIVATE "${WASMER_DIR}/lib")
    target_link_libraries(wasm4_wasmer minifb cubeb wasmer)
    set_target_properties(wasm4 PROPERTIES C_STANDARD 99)
    install(TARGETS wasm4_wasmer)
endif ()

# #
# # Desktop (glfw + cubeb) backend
# #
# 
# set(GLFW_SOURCES
#     src/backend/main.c
#     src/backend/wasm_wasm3.c
#     src/backend/window_glfw.c
#     vendor/glad/src/glad.c
# )
# add_executable(wasm4_glfw)
# target_sources(wasm4_glfw PRIVATE ${COMMON_SOURCES} ${GLFW_SOURCES} ${M3_SOURCES})
# target_include_directories(wasm4_glfw PRIVATE "${CMAKE_SOURCE_DIR}/vendor/wasm3/source")
# target_include_directories(wasm4_glfw PRIVATE "${CMAKE_SOURCE_DIR}/vendor/glad/include")
# target_link_libraries(wasm4_glfw glfw cubeb)
# set_target_properties(wasm4_glfw PROPERTIES C_STANDARD 99)
# install(TARGETS wasm4_glfw)

#
# Libretro backend
#
set(LIBRETRO_SOURCES
    src/backend/main_libretro.c
    src/backend/wasm_wasm3.c
)
if(LIBRETRO_STATIC)
  add_library(wasm4_libretro STATIC ${COMMON_SOURCES} ${LIBRETRO_SOURCES} ${M3_SOURCES})
else()
  add_library(wasm4_libretro SHARED ${COMMON_SOURCES} ${LIBRETRO_SOURCES} ${M3_SOURCES})
endif()
target_include_directories(wasm4_libretro PRIVATE "${CMAKE_SOURCE_DIR}/vendor/wasm3/source")
target_include_directories(wasm4_libretro PRIVATE "${CMAKE_SOURCE_DIR}/vendor/libretro/include")
set_target_properties(wasm4_libretro PROPERTIES C_STANDARD 99)
install(TARGETS wasm4_libretro
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
  COMPONENT library)

# Hide all symbols by default
set_target_properties(wasm4_libretro PROPERTIES
    C_VISIBILITY_PRESET hidden
    VISIBILITY_INLINES_HIDDEN 1)

# Follow naming conventions for libretro cores
set_target_properties(wasm4_libretro PROPERTIES PREFIX "")
if (ANDROID)
    set_target_properties(wasm4_libretro PROPERTIES SUFFIX "_android.so")
elseif(EMSCRIPTEN)
    set_target_properties(wasm4_libretro PROPERTIES SUFFIX "${LIBRETRO_SUFFIX}.bc")
elseif(LIBRETRO_STATIC)
    set_target_properties(wasm4_libretro PROPERTIES SUFFIX "${LIBRETRO_SUFFIX}.a")
endif ()
