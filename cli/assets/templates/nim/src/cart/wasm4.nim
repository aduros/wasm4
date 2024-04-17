const
  SCREEN_SIZE* = 160

const
  PALETTE* = (cast[ptr array[4, uint32]](0x04))
  DRAW_COLORS* = (cast[ptr uint16](0x14))
  GAMEPAD1* = (cast[ptr uint8](0x16))
  GAMEPAD2* = (cast[ptr uint8](0x17))
  GAMEPAD3* = (cast[ptr uint8](0x18))
  GAMEPAD4* = (cast[ptr uint8](0x19))
  MOUSE_X* = (cast[ptr int16](0x1a))
  MOUSE_Y* = (cast[ptr int16](0x1c))
  MOUSE_BUTTONS* = (cast[ptr uint8](0x1e))
  SYSTEM_FLAGS* = (cast[ptr uint8](0x1f))
  NETPLAY* = (cast[ptr uint8](0x20))
  FRAMEBUFFER* = (cast[ptr array[6400, uint8]](0xa0))

const
  BUTTON_1* = 1
  BUTTON_2* = 2
  BUTTON_ENTER* = 4
  BUTTON_UNUSED* = 8
  BUTTON_LEFT* = 16
  BUTTON_RIGHT* = 32
  BUTTON_UP* = 64
  BUTTON_DOWN* = 128

const
  MOUSE_LEFT* = 0
  MOUSE_RIGHT* = 1
  MOUSE_MIDDLE* = 2

const
  BLIT_2BPP* = 1
  BLIT_1BPP* = 0
  BLIT_FLIP_X* = 2
  BLIT_FLIP_Y* = 4
  BLIT_ROTATE* = 8

const
  TONE_PULSE1* = 0
  TONE_PULSE2* = 1
  TONE_TRIANGLE* = 2
  TONE_NOISE* = 3
  TONE_MODE1* = 0
  TONE_MODE2* = 4
  TONE_MODE3* = 8
  TONE_MODE4* = 12
  TONE_PAN_LEFT* = 16
  TONE_PAN_RIGHT* = 32
  TONE_NOTE_MODE* = 64

{.push importc, codegenDecl: "__attribute__((import_name(\"$2\"))) $1 $2$3".}
proc blit*(data: ptr uint8; x: int32; y: int32; width: uint32; height: uint32;
          flags: uint32)
## Copies pixels to the framebuffer.

proc blitSub*(data: ptr uint8; x: int32; y: int32; width: uint32;
             height: uint32; srcX: uint32; srcY: uint32; stride: uint32;
             flags: uint32)
## Copies a subregion within a larger sprite atlas to the framebuffer.


proc line*(x1: int32; y1: int32; x2: int32; y2: int32)
## Draws a line between two points.

proc hline*(x: int32; y: int32; len: uint32)
## Draws a horizontal line.

proc vline*(x: int32; y: int32; len: uint32)
## Draws a vertical line.

proc oval*(x: int32; y: int32; width: uint32; height: uint32)
## Draws an oval (or circle).

proc rect*(x: int32; y: int32; width: uint32; height: uint32)
## Draws a rectangle.

proc text*(text: cstring; x: int32; y: int32)
## Draws text using the built-in system font.

proc tone*(frequency: uint32; duration: uint32; volume: uint32; flags: uint32)
## Plays a sound tone.

proc diskr*(dest: pointer; size: uint32): uint32


proc diskw*(src: pointer; size: uint32): uint32
## Writes up to `size` bytes from the pointer `src` into persistent storage.


proc trace*(str: cstring)
## Prints a message to the debug console.
proc tracef*(str: cstring) {.varargs.}
## Prints a message to the debug console.

{.pop.}

import std/macros

macro exportWasm*(def: untyped): untyped = 
  result = def
  result[^3] = nnkPragma.newTree( 
    ident("exportc"),
    nnkExprColonExpr.newTree(
      ident("codegenDecl"),
      newStrLitNode("__attribute__((export_name(\"$2\"))) $1 $2$3")
    )
  )
