;; Raw WebAssembly Text (WAT) example, can be assembled with wat2wasm from binaryen.
;;
;; Useful pages to keep handy:
;; - https://wasm4.org/docs/reference/functions
;; - https://wasm4.org/docs/reference/memory

;; Import a single page (64 KB) of memory
(import "env" "memory" (memory 1 1))

;; Import WASM-4 functions
(import "env" "text" (func $text (param i32 i32 i32)))
(import "env" "blit" (func $blit (param i32 i32 i32 i32 i32 i32)))

;; Export callback functions
(export "update" (func $update))

;; Sprite data
(data $smiley (i32.const 0x19a0) "\c3\81$$\00$\99\c3")

;; Text data
(data (i32.const 0x19a8) "IT'S DANGEROUS\n TO GO ALONE!\00")

;; Player character position
(global $x (mut i32) (i32.const 76))
(global $y (mut i32) (i32.const 76))

(func $handleInput
    (local $gamepad i32)
    (local $dx i32)
    (local $dy i32)

    ;; Load gamepad
    i32.const 0x16
    i32.load8_u
    local.set $gamepad

    ;; Check if left pressed
    local.get $gamepad
    i32.const 0x10
    i32.and
    if
        i32.const -1
        local.set $dx
    end

    ;; Check if right pressed
    local.get $gamepad
    i32.const 0x20
    i32.and
    if
        i32.const 1
        local.set $dx
    end

    ;; Check if up pressed
    local.get $gamepad
    i32.const 0x40
    i32.and
    if
        i32.const -1
        local.set $dy
    end

    ;; Check if down pressed
    local.get $gamepad
    i32.const 0x80
    i32.and
    if
        i32.const 1
        local.set $dy
    end

    ;; Add $dx to $x
    global.get $x
    local.get $dx
    i32.add
    global.set $x

    ;; Add $dy to $y
    global.get $y
    local.get $dy
    i32.add
    global.set $y
)

(func $update
    ;; Handle gamepad input
    call $handleInput

    ;; Set DRAW_COLORS to 2
    i32.const 0x14
    i32.const 2
    i32.store16

    ;; Draw the text message
    i32.const 0x19a8
    i32.const 24
    i32.const 50
    call $text

    ;; Set DRAW_COLORS to 3
    i32.const 0x14
    i32.const 3
    i32.store16

    ;; Draw the smiley
    i32.const 0x19a0
    global.get $x
    global.get $y
    i32.const 8
    i32.const 8
    i32.const 0
    call $blit
)
