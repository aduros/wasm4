---
author: TheFloatingPixel <TheFloatingPixel>
date: 2022-08-26
---

# Minicraft

Minicraft is a semi-open world sandbox game, where **YOU** build your own world!

Originally made for [WASM-4 Jam #2](https://itch.io/jam/wasm4-v2).

**Features:**
- A 50x50 randomly generated map
- Saving system (!)
- 9 distinct blocks
- 12 different items
- Background music
- An example world

> **NOTE**
> When the mouse is in the game screen, the game switches to `ARROWS+MOUSE` mode. To use `ARROWS`+`ZX` move the mouse outside the game screen.
>
> In mouse mode, most actions that require pressing `X` can be activated using `L🖱️`, the same goes for `Z` and `R🖱️`

## Controls
`L🖱️` means "left mouse button"
`R🖱️` means "right mouse button"
`M🖱️` means "middle mouse button"

**Menu**
`ᐃ`, `ᐁ` - Change selection
`X`, `L🖱️` - Select

**In-game**
`X`, `L🖱️` - Use selected item
`Z`, `R🖱️` - Open inventory
`M🖱️` - Show the name of the clicked tile

**Inventory**
`ᐊ`, `ᐃ`, `ᐁ`, `ᐅ` - Move selection
`X`, `L🖱️` -  Select item and close inventory
`Z`, `R🖱️` - Open crafting menu

ℹ️ **Info:** Items stack to 255

**Crafting menu**
`ᐃ`, `ᐁ` - Change selected recipe
`ᐊ`, `ᐅ` - Previous / next page
`X`, `L🖱️` - Craft
`Z`, `R🖱️` - Close menu

ℹ️ **Note:** In the crafting menu, there are two pages of recipes!

**Map view**
`X`, `Z`, `L🖱️`, `R🖱️` - Close

**Help/Guide book**
`ᐊ`, `ᐅ`, `L🖱️` - Previous/next page
`X`, `R🖱️` - Close

**Cheat code menu**
`X` - Write X
`Z` - Write Z
`ᐊ` - Write L
`ᐃ` - Write U
`ᐁ` - Write D
`ᐅ` - Write R

**To save your progress**
Walk into the campfire, and press `X` (or `L🖱️`).

ℹ️ **Note:** To break blocks, the pickaxe needs to be selected

## Example world
Need inspiration, or just don't feel like building? Ever wanted a peaceful farm life? Use the `Example World` option in the menu to visit a pre-built farm!

If that wasn't enough inspiration for you, here are some pictures of what you can build:

- Fireplace 
	![Fireplace](https://drive.google.com/uc?id=1g15qrWcbH62YrSGD4T0_yohanfICtnVM)
- Beach Umbrella 
	![Beach Umbrella](https://drive.google.com/uc?id=1FYevZ42XlwVI9xiw6KY2nX7SAnPVU9xk)
- Sofa & TV 
	![Sofa & TV](https://drive.google.com/uc?id=1o2IYaBdch3TvWe-Ce2bdedstjEOA6llt)
- Tractor
	![Tractor](https://drive.google.com/uc?id=1mZeNQxfBgvXoV7unXEeAOEKN2CUO4Gq_)
- Pixel art / map art
	![Pixel art](https://drive.google.com/uc?id=1TYbYlqjHAUwbSMSQTEwkSv5WzfLPEmAL)

And these are just some examples of what you can build

## Cheat codes
Missing resources for a build? Want to create a little chaos? Press`Z`and `X` at the same time to open the cheat code menu.

**Cheat codes**
- `LRLRL` - Generates 15 tree patches
	
	The generated blocks will NOT replace already existing blocks (the same goes for `ZXUDR`)

- `ZXUDR` - Generates 15 sand patches
- `UDLR?` - ???
- `DDU??` - ???

By the way, these are not all cheat codes - in total there are 7. (Can you find them?)

## Credits
Programming, Textures, Music & the default palette - **Me (TheFloatingPixel)**
[AGB Palette](https://lospec.com/palette-list/agb) - **ANoob** from Lospec
[AYY4 Palette](https://lospec.com/palette-list/ayy4) - **Polyducks** from Lospec
[Mist GB Palette](https://lospec.com/palette-list/mist-gb) - **Kerrie Lake** from Lospec

## Technical stuff

### Randomness
The wasm4 console doesn't support automatically seeding randomness, so every frame the seed is set to the frame count since the start of the game. Theoretically this is not very random - practically it's random enough.

The function used to generate random numbers is:
```ts
// Totally not copied from stackoverflow
function randRange(min: i32, max: i32): i32 {
    min = Math.ceil(min) as i32;
    max = Math.floor(max) as i32;
    return Math.floor(Math.random() * (max - min + 1)) as i32 + min;
}
```

### Map generation

Map generation:
1. Generating 200 sand patches
	1. Pick random position (0-49), (0-49)
	2. Generate tree patch at position
	3. Repeat 200 times
2. Generating 100 tree patches
	1. Pick random position (0-49), (0-49)
	2. Generate sand patch at position
	3. Repeat 100 times
3. Generating 70 bushes
	1. Pick random position (0-49), (0-49)
	2. Set bush at position
	3. Repeat 70 times

**Generating a patch of something**
The center block of the patch is set to the material,
the neighboring blocks have a 1 in 3 chance of also being set to the material

|  | NEIGHBOR  |  |
|--|--|--|
| **NEIGHBOR**  | **CENTER** | **NEIGHBOR** |
|  | **NEIGHBOR**  |  |

Tile generation chances:
|  | 1 in 3  |  |
|--|--|--|
| **1 in 3**  | **Always** | **1 in 3** |
|  | **1 in 3**  |  |

### Saving
Honestly, saving the game was the most interesting (and time-consuming) part of this project. Here is some info on how it is done:

The map is only 50x50 to fit into 1024 bytes, with 3 bits per tile. But 3 bits only fit 8 different tiles, so how did I fit 9? Well, the campfire is not saved inside of those three bits. Since there only can be one campfire on a map (the one that spawns when creating a new world), the position of the campfire can be saved separately from the map data, thus allowing for 9 tiles.

The save data format is:
| Name | Length | Notes |
|--|--|--|
| Version | 1 byte | always 1 |
| Map data | 938 bytes | 3 bytes for every tile, starting from the top left corner (see the table below)
| Inventory | 8 bytes | 1 byte for every item, except for the pickaxe, map, campfire and book guide
| Player X | 1 byte | 0 - 49 range
| Player Y | 1 byte | 0 - 49 range
| Campfire X | 1 byte | 0 - 49 range
| Campfire Y | 1 byte | 0 - 49 range

You may notice that the inventory in the save is only 8 bytes long, not 16 as you may expect. That is because the pickaxe, map and book guide simply never exit the players inventory, and the campfire must be placed to save the game, thus not being in the players inventory at the moment of saving.

**Map tiles:**
| Tile name | Number | Binary |
|  --       |   --   | --     |
| Grass		| 0      | 000 	  |
| Fence 	| 1      | 001 	  |
| Tree  	| 2      | 010 	  |
| Roof  	| 3      | 011 	  |
| Wall  	| 4      | 100 	  |
| Glass 	| 5      | 101 	  |
| Sand 	    | 6      | 110 	  |
| Bush  	| 7	     | 111 	  |
