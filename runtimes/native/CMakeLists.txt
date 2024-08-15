cmake_minimum_required(VERSION 3.7)
project(WASM4)

set(WASM_BACKEND "wasm3" CACHE STRING "webassembly runtime")
if (CMAKE_SYSTEM_NAME MATCHES "Darwin")
set(WINDOW_BACKEND "glfw" CACHE STRING "window backend")
else ()
set(WINDOW_BACKEND "minifb" CACHE STRING "window backend")
endif ()

set (WASM3 OFF)
set (TOYWASM OFF)
if (WASM_BACKEND STREQUAL "wasm3")
set (WASM3 ON)
elseif (WASM_BACKEND STREQUAL "toywasm")
set (TOYWASM ON)
else ()
message (FATAL_ERROR "Unrecognized WASM_BACKEND value: ${WASM_BACKEND}")
endif ()

set (MINIFB OFF)
set (GLFW OFF)
if (WINDOW_BACKEND STREQUAL "minifb")
set (MINIFB ON)
elseif (WINDOW_BACKEND STREQUAL "glfw")
set (GLFW ON)
else ()
message (FATAL_ERROR "Unrecognized WINDOW_BACKEND value: ${WINDOW_BACKEND}")
endif ()

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

# wasm3
if (WASM3)
file(GLOB M3_SOURCES RELATIVE "${CMAKE_SOURCE_DIR}" "vendor/wasm3/source/*.c")
set(WASM3_SOURCES
    src/backend/wasm_wasm3.c
    ${M3_SOURCES}
)
endif ()

# toywasm
if (TOYWASM)
set(toywasm_tmp_install ${CMAKE_CURRENT_BINARY_DIR}/install)

include(ExternalProject)
ExternalProject_Add(toywasm
    SOURCE_DIR "${CMAKE_SOURCE_DIR}/vendor/toywasm"
    CMAKE_ARGS
        -DCMAKE_INSTALL_PREFIX=${toywasm_tmp_install}
        -DBUILD_TESTING=OFF
        -DTOYWASM_BUILD_CLI=OFF
        -DTOYWASM_BUILD_UNITTEST=OFF
        -DTOYWASM_ENABLE_WASI=OFF
        -DTOYWASM_ENABLE_WASM_SIMD=OFF
        -DTOYWASM_USE_SHORT_ENUMS=OFF
        -DTOYWASM_USE_SMALL_CELLS=OFF
    BUILD_COMMAND
        cmake --build .
    INSTALL_COMMAND
        cmake --build . --target install
)

set(TOYWASM_SOURCES
    src/backend/wasm_toywasm.c
)
endif () # TOYWASM


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
if (GLFW)
add_subdirectory(vendor/glfw)
endif ()
if (MINIFB)
add_subdirectory(vendor/minifb)
endif ()
add_subdirectory(vendor/cubeb)
endif ()

file(GLOB COMMON_SOURCES RELATIVE "${CMAKE_SOURCE_DIR}" "src/*.c")

# Include a strnlen polyfill for some platforms where it's missing (OSX PPC, maybe others)
include(CheckSymbolExists)
check_symbol_exists(strnlen "string.h" HAVE_STRNLEN)
if (NOT HAVE_STRNLEN)
    list(APPEND M3_SOURCES "src/backend/strnlen.c")
endif ()

if (NOT LIBRETRO)

#
# Desktop ([minifb|glfw] + cubeb) backend
#

set(MAIN_SOURCES
    src/backend/main.c
)

set(MINIFB_SOURCES
    src/backend/window_minifb.c
)

set(GLFW_SOURCES
    src/backend/window_glfw.c
    vendor/glad/src/glad.c
)

add_executable(wasm4 ${COMMON_SOURCES} ${MAIN_SOURCES}
    $<$<BOOL:${MINIFB}>:${MINIFB_SOURCES}>
    $<$<BOOL:${GLFW}>:${GLFW_SOURCES}>
    $<$<BOOL:${WASM3}>:${WASM3_SOURCES}>
    $<$<BOOL:${TOYWASM}>:${TOYWASM_SOURCES}>)
if (TOYWASM)
add_dependencies(wasm4 toywasm)
endif ()

target_include_directories(wasm4 PRIVATE
    $<$<BOOL:${GLFW}>:${CMAKE_SOURCE_DIR}/vendor/glad/include>
    $<$<BOOL:${WASM3}>:${CMAKE_SOURCE_DIR}/vendor/wasm3/source>
    $<$<BOOL:${TOYWASM}>:${toywasm_tmp_install}/include>)
target_link_directories(wasm4 PRIVATE
    $<$<BOOL:${TOYWASM}>:${toywasm_tmp_install}/lib>)

target_link_libraries(wasm4 cubeb
    $<$<BOOL:${MINIFB}>:minifb>
    $<$<BOOL:${GLFW}>:glfw>
    $<$<BOOL:${TOYWASM}>:toywasm-core>)
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

#
# Libretro backend
#
set(LIBRETRO_SOURCES
    src/backend/main_libretro.c
)
if(LIBRETRO_STATIC)
  add_library(wasm4_libretro STATIC ${COMMON_SOURCES} ${LIBRETRO_SOURCES}
      $<$<BOOL:${WASM3}>:${WASM3_SOURCES}>
      $<$<BOOL:${TOYWASM}>:${TOYWASM_SOURCES}>)
else()
  add_library(wasm4_libretro SHARED ${COMMON_SOURCES} ${LIBRETRO_SOURCES}
      $<$<BOOL:${WASM3}>:${WASM3_SOURCES}>
      $<$<BOOL:${TOYWASM}>:${TOYWASM_SOURCES}>)
endif()
if (TOYWASM)
add_dependencies(wasm4_libretro toywasm)
endif ()
target_include_directories(wasm4_libretro PRIVATE
    $<$<BOOL:${WASM3}>:${CMAKE_SOURCE_DIR}/vendor/wasm3/source>
    $<$<BOOL:${TOYWASM}>:${toywasm_tmp_install}/include>)
target_link_directories(wasm4_libretro PRIVATE
    $<$<BOOL:${TOYWASM}>:${toywasm_tmp_install}/lib>)
target_include_directories(wasm4_libretro PRIVATE "${CMAKE_SOURCE_DIR}/vendor/libretro/include")
target_link_libraries(wasm4_libretro $<$<BOOL:${TOYWASM}>:toywasm-core>)
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
