;;
;; WASM-4: https://wasm4.org/docs

(import "env" "memory" (memory 1))

;; ┌───────────────────────────────────────────────────────────────────────────┐
;; │                                                                           │
;; │ Drawing Functions                                                         │
;; │                                                                           │
;; └───────────────────────────────────────────────────────────────────────────┘
(; Copies pixels to the framebuffer. ;)
(import "env" "blit" (func $blit (param i32 i32 i32 i32 i32 i32)))

(; Copies a subregion within a larger sprite atlas to the framebuffer. ;)
(import "env" "blitSub" (func $blitSub (param i32 i32 i32 i32 i32 i32 i32 i32 i32)))

(; Draws a line between two points. ;)
(import "env" "line" (func $line (param i32 i32 i32 i32)))

(; Draws a horizontal line. ;)
(import "env" "hline" (func $hline (param i32 i32 i32)))

(; Draws a vertical line. ;)
(import "env" "vline" (func $vline (param i32 i32 i32)))

(; Draws an oval (or circle). ;)
(import "env" "oval" (func $oval (param i32 i32 i32 i32)))

(; Draws a rectangle. ;)
(import "env" "rect" (func $rect (param i32 i32 i32 i32)))

(; Draws text using the built-in system font. ;)
(import "env" "text" (func $text (param i32 i32 i32)))

;; ┌───────────────────────────────────────────────────────────────────────────┐
;; │                                                                           │
;; │ Sound Functions                                                           │
;; │                                                                           │
;; └───────────────────────────────────────────────────────────────────────────┘
(; Plays a sound tone. ;)
(import "env" "tone" (func $tone (param i32 i32 i32 i32)))

;; ┌───────────────────────────────────────────────────────────────────────────┐
;; │                                                                           │
;; │ Storage Functions                                                         │
;; │                                                                           │
;; └───────────────────────────────────────────────────────────────────────────┘
(; Reads up to `size` bytes from persistent storage into the pointer `dest`. ;)
(import "env" "diskr" (func $diskr (param i32 i32)))

(; Writes up to `size` bytes from the pointer `src` into persistent storage. ;)
(import "env" "diskw" (func $diskw (param i32 i32)))

(; Prints a message to the debug console. ;)
(import "env" "trace" (func $trace (param i32)))

(; Prints a message to the debug console. ;)
(import "env" "tracef" (func $tracef (param i32 i32)))

(data (i32.const 0x19a0)
  ;; smiley @ 0x19a0
  "\c3\81\24\24\00\24\99\c3"

  ;; 0x19a8
  "Hello from Wat!\00"

  ;; 0x19b8
  "Press X to blink\00"
)

(func (export "start")
)

(func (export "update")
  (local $gamepad i32)

  ;; *DRAW_COLORS = 2
  (i32.store16 (i32.const 0x14) (i32.const 2))

  ;; text("Hello from C!", 10, 10);
  (call $text (i32.const 0x19a8) (i32.const 10) (i32.const 10))

  ;; uint8_t gamepad = *GAMEPAD1;
  (local.set $gamepad (i32.load8_u (i32.const 0x16)))

  ;; if (gamepad & BUTTON_1) {
  ;;     *DRAW_COLORS = 4;
  ;; }
  (if (i32.and (local.get $gamepad) (i32.const 1))
    (then
      (i32.store16 (i32.const 0x14) (i32.const 4))
    ))

  ;; blit(smiley, 76, 76, 8, 8, BLIT_1BPP);
  (call $blit (i32.const 0x19a0) (i32.const 76) (i32.const 76) (i32.const 8) (i32.const 8) (i32.const 0))

  ;; text("Press X to blink", 16, 90);
  (call $text (i32.const 0x19b8) (i32.const 16) (i32.const 90))
)
