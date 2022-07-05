---
author: Mr.Rafael
github: MrRafael-dev
date: 2022-07-04
---

# Sound Test

This is an attempt to provide an alternative to the existing [Sound Demo cart](https://wasm4.org/play/sound-demo/).

I tried to make something which could offer a little more control and better usability. That includes draggable components and a simple music composer so you can play around or look for sound effects to use.

Everything is controlled with a mouse:
* Drag the components with left button.
* If you need to adjust to a specific value, click on the `$` symbol to adjust the numbers individually.
* By default, frequencies are limited to 1000, just like the original *Sound Demo*. However, if you want to play with higher frequencies, you can click on the `@` symbol on the right.
* Test a note once by clicking on "Play" button, or with middle button.
* With the right button, you can play a note indefinitely.
* Change the palette by pressing `Z` or `X` buttons.
* On music composer, add notes by clicking on the track with left button, and delete then with right button.
* Change speed using the slider above the track.
* If you don't want to wait to test a note, you can click on the track with middle button, and it will play that note indefinitely.

If you don't know how to set all these values, you can use these functions as a guide to understand how the tone flags are calculated:

```typescript
 export function toneFrequency(freq1: i32 = 0, freq2: i32 = 0): u32 {
	return freq1 | (freq2 << 16);
}

export function toneDuration(attack: i32 = 0, decay: i32 = 0, sustain: i32 = 0, release: i32 = 0): u32 {
	return (attack << 24) | (decay << 16) | sustain | (release << 8);
}

export function toneVolume(peak: i32 = 0, volume: i32 = 0): u32 {
	return (peak << 8) | volume;
}

export function toneFlags(channel: i32 = 0, mode: i32 = 0, pan: i32 = 0): u32 {
	return channel | (mode << 2) | (pan << 4);
}
```
I hope this can be useful. :D
