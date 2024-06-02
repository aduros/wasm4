# The IWAS file format

Before we can export an IWAS song into our project, first we need to understand it's file format.

The IWAS file format was made under the following goals:
 - **Size:** it must fit into WASM-4's limited 1KB (1024 bytes) of disk space normally used for save games.
 - **Simplicity:** it must be reasonably easy to understand it's structure for anyone to be able to manipulate the data.
 - **Implementor-friendly:** it must be easy to anyone to be able to implement a driver for it.

Influence of these goals can be seen on various aspects of it's format:
 - Songs are limited to a maximum of 192 notes (12 pages), equally divided to all channels.
 - Each channel has it's own track, each one indepedent from each other, and stored sequentially.
 - All structures are fixed-size, so they can always be found on the same offsets.
 - All data is uncompressed.

It's important to point out, however, that **it was not designed with efficiency in mind.** For that, things like
compression, trimming out unused channels, or splitting into tracks will have to be included later.

That said, the file structure for IWAS can be seen below.

## Endianess

**IWAS makes heavy use of AssemblyScript's `DataView`**, which, just like
it's JavaScript counterpart, defaults to big-endian values.

Therefore, with the exception of the lookup tables, **all `u16` and `u32` properties are stored in the big-endian order:**
 - A single `u32` value is dedicated to the "IWAS" magic header.
 - Some editor-specific settings (e.g. note offsets, scroll) and the frequency for channel's instruments (property `frq2`) are stored as `u16`.

Adjusting `frq2` to the correct endianess is important to make it sound right. For this, a simple function can be made for conversion:

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

**Since lookup tables aren't stored in the file, they can be ordered in any way.** There's no requirement for that.

## Lookup tables

IWAS uses 2 lookup tables for it's editor:
 - The **note lookup table**, which includes all the 96 possible tones it can be played.
 - The **speed lookup table**, which is used for it's internal delay counter when playing a song.

### Note Lookup Table

Includes all the 96 possible values used in the editor. A more detailed (and complete) list can be seen (here)[https://www.liutaiomottola.com/formulae/freqtab.htm].

Since `0` is used to represent a empty value, the note lookup table is one-indexed.

| Note  | Frequency (Hz) |
|:-----:|:--------------:|
|     1 |             16 |
|     2 |             17 |
|     3 |             18 |
|     4 |             19 |
|     5 |             20 |
|     6 |             21 |
|     7 |             23 |
|     8 |             24 |
|     9 |             25 |
|    10 |             27 |
|    11 |             29 |
|    12 |             30 |
|    13 |             32 |
|    14 |             34 |
|    15 |             36 |
|    16 |             38 |
|    17 |             41 |
|    18 |             43 |
|    19 |             46 |
|    20 |             49 |
|    21 |             51 |
|    22 |             55 |
|    23 |             58 |
|    24 |             61 |
|    25 |             65 |
|    26 |             69 |
|    27 |             73 |
|    28 |             77 |
|    29 |             82 |
|    30 |             87 |
|    31 |             92 |
|    32 |             98 |
|    33 |            103 |
|    34 |            110 |
|    35 |            116 |
|    36 |            123 |
|    37 |            130 |
|    38 |            138 |
|    39 |            146 |
|    40 |            155 |
|    41 |            164 |
|    42 |            174 |
|    43 |            185 |
|    44 |            196 |
|    45 |            207 |
|    46 |            220 |
|    47 |            233 |
|    48 |            246 |
|    49 |            261 |
|    50 |            277 |
|    51 |            293 |
|    52 |            311 |
|    53 |            329 |
|    54 |            349 |
|    55 |            369 |
|    56 |            392 |
|    57 |            415 |
|    58 |            440 |
|    59 |            466 |
|    60 |            493 |
|    61 |            523 |
|    62 |            554 |
|    63 |            587 |
|    64 |            622 |
|    65 |            659 |
|    66 |            698 |
|    67 |            739 |
|    68 |            783 |
|    69 |            830 |
|    70 |            880 |
|    71 |            932 |
|    72 |            987 |
|    73 |           1046 |
|    74 |           1108 |
|    75 |           1174 |
|    76 |           1244 |
|    77 |           1318 |
|    78 |           1396 |
|    79 |           1479 |
|    80 |           1567 |
|    81 |           1661 |
|    82 |           1760 |
|    83 |           1864 |
|    84 |           1975 |
|    85 |           2093 |
|    86 |           2217 |
|    87 |           2349 |
|    88 |           2489 |
|    89 |           2637 |
|    90 |           2793 |
|    91 |           2959 |
|    92 |           3135 |
|    93 |           3322 |
|    94 |           3520 |
|    95 |           3729 |
|    96 |           3951 |

This lookup table is also available below as an JSON array.

```json
[
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
]
```
### Speed lookup table

When playing a music, IWAS uses a hardcoded preset of 11 values to determine it's speed.

The speed lookup table is zero-indexed.

| Speed | Value |
|:-----:|:-----:|
|  0.1% |     0 |
|   10% |     2 |
|   20% |     4 |
|   30% |     6 |
|   40% |     8 |
|   50% |    10 |
|   60% |    20 |
|   70% |    30 |
|   80% |    40 |
|   90% |    60 |
|  100% |    80 |

The delay is controlled by a simple counter, which will count down each
frame. Once it reaches zero, the next note will be played, and the counter
is restarted with one of the values from the table shown above.

An example of how IWAS speed cycles are controlled can be seen in the code below.

```javascript
const lookup = [0, 2, 4, 6, 8, 10, 20, 30, 40, 60, 80];
let speed = 0;
let counter = 0;

function update() {
    counter = counter > 0? (counter - 1): 0;

    if(counter === 0) {
        play();
        counter = lookup[speed];
    }
}
```

This lookup table is also available below as an JSON array.

```json
[0, 2, 4, 6, 8, 10, 20, 30, 40, 60, 80]
```

## Header

Size: 32 bytes total.
- The `length` property is defined by pages instead of notes. To get the actual note number, multiply it by 16.

Below is the structure of the header.

| Location (hex) | Property         | Type        | Category                 | Description                                        |
| -------------- | ---------------- | ----------- |------------------------- | -------------------------------------------------- |
| `0000`         | `magic`          | `u32`       | Header                   | The "IWAS" magic number: `0x_49_57_41_53`          |
| `0004`         | `version`        | `u16`       | Header                   | Version                                            | 
| `0006`         | `length`         | `u8`        | Editor setting           | Music length, in pages (up to 12 pages)            |
| `0007`         | `speed`          | `u8`        | Editor setting           | Music speed                                        |
| `0008`         | `del_mode`       | `bool`      | Editor setting           | Switch between add/remove mode                     |
| `0009`         | `auto_loop`      | `bool`      | Editor setting           | Auto loop music                                    |
| `000A`         | `auto_scroll`    | `bool`      | Editor setting           | Auto scroll when playing music                     |
| `000B`         | `preview_notes`  | `bool`      | Editor setting           | Play a "preview" of a note after adding it         |
| `000C`         | `grid_y`         | `u16`       | Application state        | Vertical grid scroll                               |
| `000E`         | `grid_hpage`     | `u8`        | Application state        | Current horizontal page                            |
| `000F`         | `unused`         | `[u8; 17]`  | Reserved                 | Unused space (reserved for future use)             |

## Channels

Size: 224 bytes total:
- 32 bytes for header.
- 192 bytes for music.

Since all channels have the same size, they can always be found in their respective offsets.

| Location (hex) | Channel 
| -------------- | -------------------- | 
| `0020`         | Channel 0 (pulse)    |
| `0100`         | Channel 1 (pulse)    |
| `01E0`         | Channel 2 (triangle) |
| `02C0`         | Channel 3 (noise)    |

For quick reference, each channel will be listed below.

### Channel 0 (pulse)

| Location (hex) | Property         | Type        | Category                 | Description                                        |
| -------------- | ---------------- | ----------- |------------------------- | -------------------------------------------------- |
| `0020`         | `frq2`           | `u16`       | Main channel             | Frequency #2 (frequency #1 uses note lookup table) |
| `0022`         | `atk`            | `u8`        | Main channel             | ADSR attack                                        |
| `0023`         | `dec`            | `u8`        | Main channel             | ADSR decay                                         |
| `0024`         | `sus`            | `u8`        | Main channel             | ADSR sustain                                       |
| `0025`         | `rel`            | `u8`        | Main channel             | ADSR release                                       |
| `0026`         | `peak`           | `u8`        | Main channel             | Peak                                               |
| `0027`         | `vol`            | `u8`        | Main channel             | Volume                                             |
| `0028`         | `mode`           | `u8`        | Main channel             | Duty cycle mode                                    |
| `0029`         | `shadow_frq2`    | `u16`       | Shadow channel           | Frequency #2 (frequency #1 uses note lookup table) |
| `002B`         | `shadow_atk`     | `u8`        | Shadow channel           | ADSR attack                                        |
| `002C`         | `shadow_dec`     | `u8`        | Shadow channel           | ADSR decay                                         |
| `002D`         | `shadow_sus`     | `u8`        | Shadow channel           | ADSR sustain                                       |
|`,002E`         | `shadow_rel`     | `u8`        | Shadow channel           | ADSR release                                       |
| `002F`         | `shadow_peak`    | `u8`        | Shadow channel           | Peak                                               |
| `0030`         | `shadow_vol`     | `u8`        | Shadow channel           | Volume                                             |
| `0031`         | `shadow_mode`    | `u8`        | Shadow channel           | Duty cycle mode                                    |
| `0032`         | `unused`         | `[u8; 8]`   | Reserved                 | Unused space (reserved for future use)             |
| `0033`         | `offset_x`       | `i8`        | Editor-specific settings | Horizontal offset misplacement                     |
| `003B`         | `offset_y`       | `i8`        | Editor-specific settings | Vertical offset misplacement                       |
| `003C`         | `shadow_enabled` | `bool`      | Editor-specific settings | Shadow channel editing                             |
| `003D`         | `show_lines`     | `bool`      | Editor-specific settings | Connect added notes with lines                     |
| `003E`         | `is_enabled`     | `bool`      | Editor-specific settings | Enable/disable the channel                         |
| `003F`         | `edit_anywhere`  | `bool`      | Editor-specific settings | Add/remove notes from anywhere                     |
| `0040`         | `notes`          | `[i8; 192]` | Music                    | Note data (192 notes)                              |

### Channel 1 (pulse)

| Location (hex) | Property         | Type        | Category                 | Description                                        |
| -------------- | ---------------- | ----------- |------------------------- | -------------------------------------------------- |
| `0100`         | `frq2`           | `u16`       | Main channel             | Frequency #2 (frequency #1 uses note lookup table) |
| `0102`         | `atk`            | `u8`        | Main channel             | ADSR attack                                        |
| `0103`         | `dec`            | `u8`        | Main channel             | ADSR decay                                         |
| `0104`         | `sus`            | `u8`        | Main channel             | ADSR sustain                                       |
| `0105`         | `rel`            | `u8`        | Main channel             | ADSR release                                       |
| `0106`         | `peak`           | `u8`        | Main channel             | Peak                                               |
| `0107`         | `vol`            | `u8`        | Main channel             | Volume                                             |
| `0108`         | `mode`           | `u8`        | Main channel             | Duty cycle mode                                    |
| `0109`         | `shadow_frq2`    | `u16`       | Shadow channel           | Frequency #2 (frequency #1 uses note lookup table) |
| `010B`         | `shadow_atk`     | `u8`        | Shadow channel           | ADSR attack                                        |
| `010C`         | `shadow_dec`     | `u8`        | Shadow channel           | ADSR decay                                         |
| `010D`         | `shadow_sus`     | `u8`        | Shadow channel           | ADSR sustain                                       |
|`,010E`         | `shadow_rel`     | `u8`        | Shadow channel           | ADSR release                                       |
| `010F`         | `shadow_peak`    | `u8`        | Shadow channel           | Peak                                               |
| `0110`         | `shadow_vol`     | `u8`        | Shadow channel           | Volume                                             |
| `0111`         | `shadow_mode`    | `u8`        | Shadow channel           | Duty cycle mode                                    |
| `0112`         | `unused`         | `[u8; 8]`   | Reserved                 | Unused space (reserved for future use)             |
| `0113`         | `offset_x`       | `i8`        | Editor-specific settings | Horizontal offset misplacement                     |
| `011B`         | `offset_y`       | `i8`        | Editor-specific settings | Vertical offset misplacement                       |
| `011C`         | `shadow_enabled` | `bool`      | Editor-specific settings | Shadow channel editing                             |
| `011D`         | `show_lines`     | `bool`      | Editor-specific settings | Connect added notes with lines                     |
| `011E`         | `is_enabled`     | `bool`      | Editor-specific settings | Enable/disable the channel                         |
| `011F`         | `edit_anywhere`  | `bool`      | Editor-specific settings | Add/remove notes from anywhere                     |
| `0120`         | `notes`          | `[i8; 192]` | Music                    | Note data (192 notes)                              |

### Channel 2 (triangle)

| Location (hex) | Property         | Type        | Category                 | Description                                        |
| -------------- | ---------------- | ----------- |------------------------- | -------------------------------------------------- |
| `01E0`         | `frq2`           | `u16`       | Main channel             | Frequency #2 (frequency #1 uses note lookup table) |
| `01E2`         | `atk`            | `u8`        | Main channel             | ADSR attack                                        |
| `01E3`         | `dec`            | `u8`        | Main channel             | ADSR decay                                         |
| `01E4`         | `sus`            | `u8`        | Main channel             | ADSR sustain                                       |
| `01E5`         | `rel`            | `u8`        | Main channel             | ADSR release                                       |
| `01E6`         | `peak`           | `u8`        | Main channel             | Peak                                               |
| `01E7`         | `vol`            | `u8`        | Main channel             | Volume                                             |
| `01E8`         | `mode`           | `u8`        | Main channel             | Duty cycle mode                                    |
| `01E9`         | `shadow_frq2`    | `u16`       | Shadow channel           | Frequency #2 (frequency #1 uses note lookup table) |
| `01EB`         | `shadow_atk`     | `u8`        | Shadow channel           | ADSR attack                                        |
| `01EC`         | `shadow_dec`     | `u8`        | Shadow channel           | ADSR decay                                         |
| `01ED`         | `shadow_sus`     | `u8`        | Shadow channel           | ADSR sustain                                       |
|`,01EE`         | `shadow_rel`     | `u8`        | Shadow channel           | ADSR release                                       |
| `01EF`         | `shadow_peak`    | `u8`        | Shadow channel           | Peak                                               |
| `01F0`         | `shadow_vol`     | `u8`        | Shadow channel           | Volume                                             |
| `01F1`         | `shadow_mode`    | `u8`        | Shadow channel           | Duty cycle mode                                    |
| `01F2`         | `unused`         | `[u8; 8]`   | Reserved                 | Unused space (reserved for future use)             |
| `01F3`         | `offset_x`       | `i8`        | Editor-specific settings | Horizontal offset misplacement                     |
| `01FB`         | `offset_y`       | `i8`        | Editor-specific settings | Vertical offset misplacement                       |
| `01FC`         | `shadow_enabled` | `bool`      | Editor-specific settings | Shadow channel editing                             |
| `01FD`         | `show_lines`     | `bool`      | Editor-specific settings | Connect added notes with lines                     |
| `01FE`         | `is_enabled`     | `bool`      | Editor-specific settings | Enable/disable the channel                         |
| `01FF`         | `edit_anywhere`  | `bool`      | Editor-specific settings | Add/remove notes from anywhere                     |
| `0200`         | `notes`          | `[i8; 192]` | Music                    | Note data (192 notes)                              |

### Channel 3 (noise)

| Location (hex) | Property         | Type        | Category                 | Description                                        |
| -------------- | ---------------- | ----------- |------------------------- | -------------------------------------------------- |
| `02C0`         | `frq2`           | `u16`       | Main channel             | Frequency #2 (frequency #1 uses note lookup table) |
| `02C2`         | `atk`            | `u8`        | Main channel             | ADSR attack                                        |
| `02C3`         | `dec`            | `u8`        | Main channel             | ADSR decay                                         |
| `02C4`         | `sus`            | `u8`        | Main channel             | ADSR sustain                                       |
| `02C5`         | `rel`            | `u8`        | Main channel             | ADSR release                                       |
| `02C6`         | `peak`           | `u8`        | Main channel             | Peak                                               |
| `02C7`         | `vol`            | `u8`        | Main channel             | Volume                                             |
| `02C8`         | `mode`           | `u8`        | Main channel             | Duty cycle mode                                    |
| `02C9`         | `shadow_frq2`    | `u16`       | Shadow channel           | Frequency #2 (frequency #1 uses note lookup table) |
| `02CB`         | `shadow_atk`     | `u8`        | Shadow channel           | ADSR attack                                        |
| `02CC`         | `shadow_dec`     | `u8`        | Shadow channel           | ADSR decay                                         |
| `02CD`         | `shadow_sus`     | `u8`        | Shadow channel           | ADSR sustain                                       |
|`,02CE`         | `shadow_rel`     | `u8`        | Shadow channel           | ADSR release                                       |
| `02CF`         | `shadow_peak`    | `u8`        | Shadow channel           | Peak                                               |
| `02D0`         | `shadow_vol`     | `u8`        | Shadow channel           | Volume                                             |
| `02D1`         | `shadow_mode`    | `u8`        | Shadow channel           | Duty cycle mode                                    |
| `02D2`         | `unused`         | `[u8; 8]`   | Reserved                 | Unused space (reserved for future use)             |
| `02D3`         | `offset_x`       | `i8`        | Editor-specific settings | Horizontal offset misplacement                     |
| `02DB`         | `offset_y`       | `i8`        | Editor-specific settings | Vertical offset misplacement                       |
| `02DC`         | `shadow_enabled` | `bool`      | Editor-specific settings | Shadow channel editing                             |
| `02DD`         | `show_lines`     | `bool`      | Editor-specific settings | Connect added notes with lines                     |
| `02DE`         | `is_enabled`     | `bool`      | Editor-specific settings | Enable/disable the channel                         |
| `02DF`         | `edit_anywhere`  | `bool`      | Editor-specific settings | Add/remove notes from anywhere                     |
| `02E0`         | `notes`          | `[i8; 192]` | Music                    | Note data (192 notes)                              |

## Instruments

**Each channel has 2 instruments.**

For simplicity, IWAS refers to them as if they were separate "channels", with each one having their own counterparts:
- The **main channel:** primary setting. Their notes are displayed as light in the editor.
- The **shadow channel:** secondary setting. Their notes are displayed as dark/outlined in the editor.

These channels can be "mixed" together on the same channel. And because they use the same channel, they can't occupy the same space, 
and therefore one will interrupt the other.

The channel structure includes all but 2 properties for the `tone`:
 - **Frequency #1:** must use the one in the note lookup table, with an index given by the notes.
 - **Pan:** must be assigned to `0`.

## Notes

**All 4 channels will have the same note count (up to 192).**

Each note is a **signed 8-bit** value, and it will range from **-96 to 96**, or **-128** if it's a note break. When a music player iterates through each note, the following conditions are expected to happen:

- If **equals -128**, then it will mute the channel using a **note break**.
- If **greater than zero**, then it will play a tone using the **main channel**.
- If **lower than zero**, then it will play a tone using the **shadow channel**.
- If **equals zero**, it will **do nothing**.

Each index corresponds to a frequency stored in the note lookup table. Negative and positive indexes should all point to the same frequency.
For instance: indexes `-1` and `1` would both point to note index `1` (16Hz).

## Note breaks

A note break is a special mark: when playing a music, it will cut off any previously sound being played on a given channel. Each channel has their own independent note breaks and must not interfere with each other.

It's important to note that, although they are displayed as light in the editor, **note breaks are neutral and have no preference for either channel.** that is, whenever a cursor hits a note from a main channel or a shadow channel, it must mute it regardless.

On IWAS, note breaks are not technically considered a note, and thus won't move up/down on selection mode.

## Parsing the file

Given how it works, we should now be able to write a parser for it. This can be useful in case we want to improve or manipulate the data directly,
or convert it to other formats.

Below is a parser written in vanilla HTML/CSS/JS. It can take the contents of a `.disk` file and convert it to JSON.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>IWAS disk exporter</title>
<style>
:root {
    --color-primary: #04080c;
    --color-secondary: #fafafa;
    --color-link: #0095e9;
}

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-primary);
    color: var(--color-secondary);
    font-family: Verdana, Geneva, Tahoma, sans-serif;
}

a {
    color: var(--color-link);
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.section {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 320px;
    height: 320px;
}

.disk-import {
    border: 2px solid;
    border-color: var(--color-secondary);
    border-style: dashed;
    user-select: none;
    margin: 2em;
}

.disk-import-form {
    text-align: center;
}

.disk-export {
    margin: 1em;
}

.export-result {
    width: 100%;
    height: 100%;
    color: var(--color-secondary);
    background-color: transparent;
}
</style>
</head>
<body>
<div class="container" id="disk-container">
    <div class="section disk-import">
        <div class="disk-import-form">
            <label>
                Select disk file(s) to import
                <input id="disk-file" type="file" />
            </label>
            <a id="disk-file-clear" href="javascript:void(0)">clear</a>
        </div>
    </div>
    <div class="section disk-export">
        <textarea
            id="disk-json"
            class="export-result"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            readonly="readonly"
        ></textarea>
    </div>
</div>
<script>
/** The "IWAS" magic number. */
const IWAS_MAGIC = 0x49574153;

/** IWAS version number. */
const IWAS_VERSION = 0x0001;

/**
 * Note lookup table.
 * Not needed for conversion, but added here for reference.
 */
const IWAS_NOTE_LOOKUP = [
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
];

/**
 * Speed lookup table
 * Not needed for conversion, but added here for reference.
 */
const IWAS_SPEED_LOOKUP = [0, 2, 4, 6, 8, 10, 20, 30, 40, 60, 80];

/**
 * Convert IWAS disk to an object.
 * 
 * @param {ArrayBuffer} data Data.
 * @returns 
 */
function iwas2object(data) {
    /** Data view. */
    const view = new DataView(data);

    /** The "IWAS" magic number. */
    const magic = view.getUint32(0);

    /** IWAS version number. */
    const version = view.getUint16(4);

    // Reject invalid headers:
    if(magic !== IWAS_MAGIC && version !== IWAS_VERSION) {
        throw new Error("Invalid IWAS header and/or unsupported version.");
    }

    /** IWAS header. */
    const header = {
        magic,
        version,
        length: view.getUint8(6),
        speed: view.getUint8(7),
        del_mode: Boolean(view.getUint8(8)),
        auto_loop: Boolean(view.getUint8(9)),
        auto_scroll: Boolean(view.getUint8(10)),
        preview_notes: Boolean(view.getUint8(11)),
        grid_y: view.getUint16(12),
        grid_hpage: view.getUint16(14)
    };

    /** Channel data array. */
    const channels = [];

    // Iterate through all four channels...
    for(let i = 0; i < 4; i += 1) {
        const unused = 8;
        const offset = 32 + (i * 224);

        /** Channel data. */
        const channel = {
            frq2: view.getUint16(offset),
            atk: view.getUint8(offset + 1),
            dec: view.getUint8(offset + 2),
            sus: view.getUint8(offset + 3),
            rel: view.getUint8(offset + 4),
            peak: view.getUint8(offset + 5),
            vol: view.getUint8(offset + 6),
            mode: view.getUint8(offset + 7),
            shadow_frq2: view.getUint16(offset),
            shadow_atk: view.getUint8(offset + 1),
            shadow_dec: view.getUint8(offset + 2),
            shadow_sus: view.getUint8(offset + 3),
            shadow_rel: view.getUint8(offset + 4),
            shadow_peak: view.getUint8(offset + 5),
            shadow_vol: view.getUint8(offset + 6),
            shadow_mode: view.getUint8(offset + 7),
            offset_x: view.getUint8(offset + unused),
            offset_y: view.getUint8(offset + unused + 1),
            shadow_enabled: Boolean(view.getUint8(offset + unused + 2)),
            show_lines: Boolean(view.getUint8(offset + unused + 3)),
            is_enabled: Boolean(view.getUint8(offset + unused + 4)),
            edit_anywhere: Boolean(view.getUint8(offset + unused + 5)),
            notes: []
        };

        /** Channel note data. */
        const notes = (new Int8Array(view.buffer)).slice(offset + 32, offset + 32 + 192);

        channel.notes.push(...notes);
        channels.push(channel);
    }

    return {
        header,
        channels
    };
}

/** Disk import section. */
const disk = {
    container: document.querySelector("#disk-container"),
    input: document.querySelector("#disk-file"),
    clear: document.querySelector("#disk-file-clear"),
    output: document.querySelector("#disk-json")
};

disk.clear.addEventListener("click", () => {
    disk.input.value = null;
    disk.output.value = "";
});

// Listen for files...
disk.input.addEventListener("change", async (event) => {    
    /** @type {FileList} User selected files. */
    const fileList = event.target.files;

    // Return if there are no files:
    if(fileList.length < 1) {
        return;
    }

    /** Result list. */
    const result = [];
    
    // Convert files into array buffers...
    try {
        for(let i = 0; i < fileList.length; i += 1) {
            const file = fileList[i];
            const buffer = await file.arrayBuffer();
            const data = iwas2object(buffer);

            result.push(data);
        }

        disk.output.value = JSON.stringify(result, null, 4);
    }

    // Display errors on text box...
    catch(error) {
        disk.output.value = error;
        throw error;
    }
});
</script>
</body>
</html>
```
