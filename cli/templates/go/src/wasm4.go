package main

import "unsafe"

// Memory map
var PALETTE = (*[4]uint32)(unsafe.Pointer(uintptr(0x04)));
var DRAW_COLORS = (*uint16)(unsafe.Pointer(uintptr(0x14)));
var GAMEPAD1 = (*uint8)(unsafe.Pointer(uintptr(0x16)));
var GAMEPAD2 = (*uint8)(unsafe.Pointer(uintptr(0x17)));
var GAMEPAD3 = (*uint8)(unsafe.Pointer(uintptr(0x18)));
var GAMEPAD4 = (*uint8)(unsafe.Pointer(uintptr(0x19)));
var MOUSE_X = (*int16)(unsafe.Pointer(uintptr(0x1a)));
var MOUSE_Y = (*int16)(unsafe.Pointer(uintptr(0x1c)));
var MOUSE_BUTTONS = (*uint8)(unsafe.Pointer(uintptr(0x1e)));
var FRAMEBUFFER = (*[6400]uint8)(unsafe.Pointer(uintptr(0xa0)));

//export blit
func blit (ptr *byte, x int, y int, width int, height int, flags int);

//export textUtf8
func text (ptr string, x int, y int);

//export printUtf8
func print (msg string);

func main () {}
