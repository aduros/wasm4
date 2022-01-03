import MultiLanguageCode from '@site/src/components/MultiLanguageCode';
import PlayButton from '@site/src/components/PlayButton';

# Audio

WASM-4's sound system has 4 independent channels. Each channel is dedicated to a different type of
audio waveform.

- 2 [pulse](https://en.wikipedia.org/wiki/Pulse_wave) wave (square wave) channels. The classic chiptune sound.
- 1 [triangle](https://en.wikipedia.org/wiki/Triangle_wave) wave channel. A softer sound, great for bass.
- 1 [noise](https://en.wikipedia.org/wiki/White_noise) channel. A harsh sound, for percussion and effects.

:::info
WASM-4's sound system is closely inspired by the architecture of the Nintendo NES and Gameboy.
:::

## Playing a Tone

The `tone()` function is used to play a tone with a given frequency on a given channel.

`tone (frequency, duration, volume, flags)`

- Frequency is the "pitch", measured in hertz.
- Durations are measured in frames, 1/60ths of a second.
- Volume ranges from 0 (silent) to 100 (full volume).
- Flags sets the channel (0-3) and duty cycle. (0-3)

For example, to play a one second (60 frames) tone of 262 Hz ([middle C](https://pages.mtu.edu/~suits/notefreqs.html)) on the first pulse wave channel:

<MultiLanguageCode>

```typescript
w4.tone(262, 60, 100, w4.TONE_PULSE1);
```

```c
tone(262, 60, 100, TONE_PULSE1);
```

```d
w4.tone(262, 60, 100, w4.tonePulse1);
```

```go
w4.Tone(262, 60, 100, w4.TONE_PULSE1)
```

```lua
tone(262, 60, 100, TONE_PULSE1)
```

```nim
tone(262, 60, 100, TONE_PULSE1)
```

```odin
w4.tone(262, 60, 100, .Pulse1)
```

```rust
tone(262, 60, 100, TONE_PULSE1);
```

```wasm
(import "env" "tone" (func $tone (param i32 i32 i32 i32)))

(call $tone (i32.const 262) (i32.const 60) (i32.const 100) (global.get $TONE_PULSE1))
```

```zig
w4.tone(.{ .start = 262 }, .{ .sustain = 60 }, 100, .{ .channel = .pulse1 });
```

</MultiLanguageCode>

## Duty Cycle

The [duty cycle](https://en.wikipedia.org/wiki/Duty_cycle) of the pulse channels can be controlled
with additional flags:

| Flag         | Duty Cycle      |
| ---          | ---             |
| `TONE_MODE1` | 12.5% (default) |
| `TONE_MODE2` | 25%             |
| `TONE_MODE3` | 50%             |
| `TONE_MODE4` | 75%             |

For example, to play at 50% duty cycle (square wave):

<MultiLanguageCode>

```typescript
w4.tone(262, 60, 100, w4.TONE_PULSE1 | w4.TONE_MODE3);
```

```c
tone(262, 60, 100, TONE_PULSE1 | TONE_MODE3);
```

```d
w4.tone(262, 60, 100, w4.tonePulse1 | w4.toneMode3);
```

```go
w4.Tone(262, 60, 100, w4.TONE_PULSE1 | w4.TONE_MODE3)
```

```lua
tone(262, 60, 100, TONE_PULSE1 | TONE_MODE3)
```

```nim
tone(262, 60, 100, TONE_PULSE1 or TONE_MODE3)
```

```odin
w4.tone(262, 60, 100, .Pulse1, .Half)
```

```rust
tone(262, 60, 100, TONE_PULSE1 | TONE_MODE3);
```

```wasm
(call $tone
  (i32.const 262)
  (i32.const 60)
  (i32.const 100)
  (i32.or
    (global.get $TONE_PULSE1)
    (global.get $TONE_MODE3)))
```

```zig
w4.tone(.{ .start = 262 }, .{ .sustain = 60 }, 100, .{ .channel = .pulse1, .mode = .p50 });
```

</MultiLanguageCode>

## Frequency Slide

We can actually pass two different frequencies to `tone()`. The high 16 bits of the `frequency`
parameter is used for a second frequency. If non-zero, it specifies the frequency to slide to over
the duration of the tone.

For example, to slide the tone starting from 262 Hz and up to 523 Hz:

<MultiLanguageCode>

```typescript
w4.tone(262 | (523 << 16), 60, 100, w4.TONE_PULSE1);
```

```c
tone(262 | (523 << 16), 60, 100, TONE_PULSE1);
```

```d
w4.tone(262 | (523 << 16), 60, 100, w4.tonePulse1);
```

```go
w4.Tone(262 | (523 << 16), 60, 100, w4.TONE_PULSE1)
```

```lua
tone(262 | (523 << 16), 60, 100, TONE_PULSE1)
```

```nim
tone(262 or (523 shl 16), 60, 100, TONE_PULSE1)
```

```odin
w4.tone(262 | (523 << 16), 60, 100, .Pulse1)
```

```rust
tone(262 | (523 << 16), 60, 100, TONE_PULSE1);
```

```wasm
(call $tone
  (i32.or
    (i32.const 262)
    (i32.shl (i32.const 523) (i32.const 16)))
  (i32.const 60)
  (i32.const 100)
  (global.get $TONE_PULSE1))
```

```zig
w4.tone(.{ .start = 262, .end = 523 }, .{ .sustain = 60 }, 100, .{ .channel = .pulse1 });
```

</MultiLanguageCode>

## ADSR Envelope

[ADSR](https://en.wikipedia.org/wiki/ADSR_envelope) describes how the volume changes over time, and
has 4 time components:

| Time        | Shift | Description                                                                  |
| ---         | ---   | ---                                                                          |
| **A**ttack  | 24    | The time it takes to initially ramp up from 0 volume to 100% volume.         |
| **D**ecay   | 16    | The time taken to ramp down from 100% volume to the tone `volume` parameter. |
| **S**ustain | 0     | The time to hold the tone steady at `volume`.                                |
| **R**elease | 8     | The time to ramp back down to 0 volume.                                      |

These times are all measured in frames (1/60th of a second), and can be packed
into the `duration` parameter.

For example, to play a tone that sustains for one second and releases over half a second (30 frames):

<MultiLanguageCode>

```typescript
w4.tone(262, 60 | (30 << 8), 100, w4.TONE_PULSE1);
```

```c
tone(262, 60 | (30 << 8), 100, TONE_PULSE1);
```

```d
w4.tone(262, 60 | (30 << 8), 100, w4.tonePulse1);
```

```go
w4.Tone(262, 60 | (30 << 8), 100, w4.TONE_PULSE1)
```

```lua
tone(262, 60 | (30 << 8), 100, TONE_PULSE1)
```

```odin
w4.tone(262, 60 | (30 << 8), 100, .Pulse1)
```

```rust
tone(262, 60 | (30 << 8), 100, TONE_PULSE1);
```

```wasm
(call $tone
  (i32.const 262)
  (i32.or
    (i32.const 60)
    (i32.shl
      (i32.const 30)
      (i32.const 8)))
  (i32.const 100)
  (global.get $TONE_PULSE1))
```

```zig
w4.tone(.{ .start = 262 }, .{ .sustain = 60, .release = 30 }, 100, .{ .channel = .pulse1 });
```

</MultiLanguageCode>

## Sound Tool

The sound demo is a great way to quickly experiment with different sounds and
find values to plug into your game:

<PlayButton slug="sound-demo" title="Sound Demo" author="Bruno Garcia" github="aduros"/>
