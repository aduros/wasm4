# Implementing a driver

**For this guide, we will use the 1KB binary file directly.**

To get a byte array, you can either use an exporter, a command line tool, or (a web tool)[https://notisrac.github.io/FileToCArray/].

## Getting started

Once we have our file converted into a byte array, we should have it added on our code:

## Lookup tables and variables

```typescript
/** Music data. */
const data: usize = memory.data<u8>([
    // 1024 bytes...
]);
```

IWAS uses lookup tables for notes and speed values, so we can start including those, too:

```typescript
/** Note lookup table. */
const IWAS_NOTE_LOOKUP: usize = memory.data<u16>([
    16,   17,   18,   19,   20,   21,   23,   24,
    25,   27,   29,   30,   32,   34,   36,   38,
    41,   43,   46,   49,   51,   55,   58,   61,
    65,   69,   73,   77,   82,   87,   92,   98,
   103,  110,  116,  123,  130,  138,  146,  155,
   164,  174,  185,  196,  207,  220,  233,  246,
   261,  277,  293,  311,  329,  349,  369,  392,
   415,  440,  466,  493,  523,  554,  587,  622,
   659,  698,  739,  783,  830,  880,  932,  987,
  1046, 1108, 1174, 1244, 1318, 1396, 1479, 1567,
  1661, 1760, 1864, 1975, 2093, 2217, 2349, 2489,
  2637, 2793, 2959, 3135, 3322, 3520, 3729, 3951
]);

/** Speed lookup table. */
const IWAS_SPEED_LOOKUP: usize = memory.data<u8>([
    0, 2, 4, 6, 8, 10, 20, 30, 40, 60, 80
]);
```

We will also require at least 2 variables to control the music:
 - **A speed counter** to handle the speed.
 - **A cursor** which will point to the next note that should be played.

```typescript
/** Speed counter. */
let counter: u8 = 0;

/** Note cursor. */
let cursor: u8 = 0;
```

And we also know that IWAS stores `u16` and `u32` values as big-endian. 
We won't be using the header for anything in this guide, so converting `u32`
to the right order can be ignored.

The `frq2` property used by the instruments, however, is important, so we're adding
one small function to correct it to the right order later on:

```typescript
/**
 * Load `u16` value (big-endian).
 * 
 * @param offset Address offset
 */
function loadUint16BE(offset: usize): u16 {
    /** High byte. */
    const hi: u16 = u16(load<u8>(offset));

    /** Low byte. */
    const lo: u16 = u16(load<u8>(offset + 1));

    return (hi * 0x100) + lo;
}
```

## Declaring the function

Let's make a `play` function, which will be responsible for playing our music.

We can also figure what we need at the moment:
 - Make the countdown timer.
 - Check if it's `0`.
 - When it's ready to play a note, it will apply for all channels.

And this is what we have:

```typescript
/**
 * Play music.
 */
function play(): void {    
    // Countdown delay...
    counter = counter > 0? counter - 1: 0;
    
    // Return if it's not ready to play yet...
    if(counter > 0) {
        return;
    }

    // When it reaches zero, it will iterate through each channel to play 
    // every note...
    for(let ichannel: u8 = 0; ichannel < 4; ichannel += 1) {
        // ...
    }
}
```

## Offsets and notes

Next, we'll need to figure out a few things:
 - The offset for each channel.
 - The note value.

The header is 32 bytes, and each channel has 224 bytes, which means we can get their offsets on a loop simply using `32 + (224 * ichannel)`. The same thing applies with the note offset, except it will also add to the 32 bytes of the channel header.

We can also cap the cursor at 192, the maximum amount of notes a channel can have, in order to avoid any out-of-bounds shenanigans.

```typescript
/** Channel data offset. */
const offset: usize = data + 32 + (224 * ichannel);

/** Note value. */
const note: i8 = load<i8>(offset + 32 + (cursor % 192));
```

For the sake of consistency, we could also check if the `is_enabled` property is set:

```typescript
/** Check if channel is enabled. */
const isEnabled: bool = load<bool>(offset + 30);

// Ignore if is not enabled...
if(!isEnabled) {
    return;
}
```

## Reading notes

With an offset value and the note value, we can start to implement how each note should be interpreted.

The **note break** is a very specific value, so we can check for that first. It will interrupt any sounds
being played on a given channel. To do that, we can simply reset the channel with an empty `tone`.

Apart from that, any valid note must be within `-96` and `96`, and it can't be `0`.

```typescript
// Notes with a value of -128 represent a note break.
//
// Note breaks will mute a specific channel if it's still
// playing a tone.
if(note === -128) {
    w4.tone(0, 0, 0, ichannel);
    continue;
}
// Notes ranging from -96 and 96 are valid tones.
//
// Positive notes will use the main channel, while
// negative notes will use the shadow channel. 
//
// Anything else, or 0, can be ignored.
else if(note !== 0 && note >= -96 && note <= 96) {
    // ...
}
```

## Getting the instrument

Each channel has 2 instruments available for use. For simplicity, IWAS calls each one a "main channel" and a "shadow channel".

To check if a note should use the main or the shadow channel, we can look if the value is either positive or negative:
 - **Positive values** will use the **main channel.**
 - **Negative values** will use the **shadow channel.**

Both instruments will have the same byte length, which is 9 bytes, and if we look at the data structure, we can see
they're pretty close from one to another.

We can calculate the offset of the instrument we need to fetch simply comparing if the value is positive, and if it is,
then we just need to add 9 to the result. That way we can point to the main channel or the shadow channel.

```typescript
/** Instrument offset (main channel if positive, shadow channel if negative). */
const instrument: usize = offset + (note > 0? 0: 9);
```

The `tone` function uses 2 frequencies, but instruments only have `frq2`. The `frq1` is taken from the **note lookup table**,
and we can calculate an offset for it, too:

```typescript
/** Note index for the note lookup table. If negative, it's value will be mirrored (e.g. `-1` becomes `1`). */
const inote: u8 = u8(Math.abs(note)) - 1;

// Get frequency from note lookup table...
const frq1: u16 = load<u16>(IWAS_NOTE_LOOKUP + (inote * 2));
```

Now we just need to fetch the instrument data and call `tone`, mixing all the properties together with bitwise operations. We can also see
our little-endian to big-endian function being used by `frq2`:

```typescript
// Get instrument data.
//
// A positive note index should point to the main channel, and
// a negative note index should point to the shadow channel.
//
// `frq2` is a big-endian value, so it must be converted.
//
// Values are converted to `u32` in order to better fit into the
// bitwise operations needed for the `tone` function to work.
const frq2: u32 = u32(loadUint16BE(instrument));
const atk: u32= u32(load<u8>(instrument + 2));
const dec: u32 = u32(load<u8>(instrument + 3));
const sus: u32 = u32(load<u8>(instrument + 4));
const rel: u32 = u32(load<u8>(instrument + 5));
const peak: u32 = u32(load<u8>(instrument + 6));
const vol: u32 = u32(load<u8>(instrument + 7));
const mode: u32 = u32(load<u8>(instrument + 8));
const pan: u32 = 0;

// Play tone:
w4.tone(
    frq1 | (frq2 << 16),
    (atk << 24) | (dec << 16) | sus | (rel << 8),
    (peak << 8) | vol,
    ichannel | (mode << 2) | (pan << 4)
);
```

Also, notice how we're casting all values to `u32`, despite being a single byte.

The `tone` function expects all arguments to be `u32`, with all ADSR envelope settings
being grouped together using bitwise operations. However, if we apply those on the values
as `u8`, they will occasionally wrap from 0 to 255 and thus potentially not giving the
intended value.

This effect can be specially seen on `frq2`, but it might affect other values, too, so we
convert all the values, just to be safe.

## Music speed and length

Due to screen size limitations, IWAS splits a song into 12 pages, each one containing 16 notes.
Getting the note count should be as simple as multiplying the page number by 16.

To reset the counter, we use the values provided by the speed lookup table.

```typescript
/** Music length. To get the actual note count, the page number can be multiplied by 16. */
const length: u8 = load<u8>(data + 6) * 16;

/** Speed index for the speed lookup table. */
const ispeed: u8 = load<u8>(data + 7);

/** Speed value. */
const speed: u8 = load<u8>(IWAS_SPEED_LOOKUP + ispeed);

// Advance counter and cursor...
counter = speed;
cursor = cursor < length? cursor + 1: 0;
```