---
author: Sine System
github: Penncilk
date: 2024-05-31
---

# Wasm4 Gameboy VGM Player

I wrote an engine that allows Wasm4 to emulate the APU of the Gameboy at just a high level enough so that it doesn't tax on the runtime, 

it does this by recording all of the writes to each register in a space in memory, and whenever it's NOT writing to the registers, it either just waits for the next command, or, if a control register is written to, it will send a signal that tells Wasm4 to decrypt the register data and make a funky tune out of it, 

I kind of rushed the actual song as I was very tired after working on this, however if you liked it! the .vgm can be found in the .wasm with a hex editor, and the original song can be found here! https://youtu.be/XeMwf9YFT6s?si=KNNpsogCnXPY6P7h

This is just a proof of concept, so there's not much to it unfortunately, and it is likely riddled with bugs. But if you would like to use this in your own projects, here's the VGM driver code! ^^ 
https://gist.github.com/Penncilk/23d4f76abdd73d2364ba075744c191db

I hope you enjoy!
