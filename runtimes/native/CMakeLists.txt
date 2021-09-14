cmake_minimum_required(VERSION 3.9)
project(WASM4)

set(BUILD_SHARED_LIBS OFF)
# set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
# set(GLFW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
# set(GLFW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)

add_subdirectory(vendor/glfw)
add_subdirectory(vendor/portaudio)

file(GLOB_RECURSE SOURCES RELATIVE ${CMAKE_SOURCE_DIR}
    "src/*.c"
    "src/impl/*.c"
    "vendor/wasm3/source/*.c")
add_executable(wasm4 ${SOURCES})

include(CheckIPOSupported)
check_ipo_supported()
set_property(TARGET wasm4 PROPERTY INTERPROCEDURAL_OPTIMIZATION TRUE)

# set(CMAKE_EXE_LINKER_FLAGS "-static")
target_include_directories(wasm4 PRIVATE "${CMAKE_SOURCE_DIR}/vendor/wasm3/source")
target_link_libraries(wasm4 glfw PortAudio)
