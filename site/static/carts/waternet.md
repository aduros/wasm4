---
author: Davy Willems
github: joyrider3774
date: 2024-06-10
---

# Waternet

This is the WASM-4 version of my Waternet game which is a multiplatform puzzle game initially written for old consoles and handhelds like Game Boy (Color), Game Gear, Master System, Analogue Pocket and Mega Duck using the gbdk sdk. This a port with many changes to make it work for WASM-4 

## Controls

| Button | Action                                                                   |
|--------|--------------------------------------------------------------------------|
| A      | Confirm in menu and level selector, rotate or slide action while playing |
| B      | Back in menu, level selector and game                                    |

## Game Modes
The aim of the game, in any game mode is always to connect all pipes so that water can flow through them from the water point source. How you can accomplish this depends on the  game mode. The game has a help section in the main menu where you can always check up on the rules of each game mode.

### Rotate Mode

You need to connect all the pipes so water flows through them, by pressing the A button on a pipe, to rotate the single pipe.

### Slide Mode

You need to connect all the pipes so water flows through them, by pressing the A on the arrows of a row or column. The row or column will move all pipes in the direction the arrow is pointing at.

### Roslid Mode

You need to connect all the pipes so water flows through them, by pressing the A on the arrows of a row or column. The row or column will move all pipes in the direction the arrow is pointing at. You can also press the A button on a pipe, to rotate the single pipe. This is a combination Rotate and Slide mode.

## Graphics 
Graphics (tiles), i converted using the [Gimp Image Editor](https://www.gimp.org/) and the [Gimp tilemap gb plugin](https://github.com/bbbbbr/gimp-tilemap-gb) from the gameboy tiles created in [Game Boy Tile Designer](http://www.devrs.com/gb/hmgd/gbtd.html) and the titlescreen graphic is based on a modified title screen image from my waternet game i made for [gp2x](https://www.willemssoft.be/index.php?main=5&sub=6&action=productdetails&id=218) and [windows](https://www.willemssoft.be/index.php?main=46&sub=7&action=productdetails&id=220). I designed the title screen in the [Gimp Image Editor](https://www.gimp.org/) to just have the word waternet and the waterdrop. 

## Sound

Sound are just simple tones that play quickly 

## Music
Music was made using [Online Sequencer](https://onlinesequencer.net/), i created single channel, non mixed music files and later converted this music to an array storing the frequencies of notes to be used on WASM-4. I got [this idea](https://www.gamedeveloper.com/programming/making-a-game-boy-game-in-2017-a-quot-sheep-it-up-quot-post-mortem-part-2-2-) from the [sheep it up](https://gamejolt.com/games/sheepitup/267335) game developed by Dr. Ludos. He stored the frequencies to be used for the music notes in a array. So i used the same system and all i had todo was convert the music from onlinesequencer i made to such array (by hand) as well.

You can find the music files i used for the game below:

* Game Music: [https://onlinesequencer.net/2485064](https://onlinesequencer.net/2485064)
* Title Music: [https://onlinesequencer.net/2484977](https://onlinesequencer.net/2484977)
* Level Done Tune: [https://onlinesequencer.net/2484974](https://onlinesequencer.net/2484974)

## Credits
Waternet game concept is based on the Net and Netslide game from the [Simon Tatham's Portable Puzzle Collection](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/),
it's my own implementation of these 2 game concepts mixed into one game

## Version history

### 1.1
- Added Clickable Text & highlighting on mouse over
- Added mouse controls
- Adjusted black & white palette slightly
- Switched from cpp to c
- Add "back" option in menu's
- Replace A / B button graphics with X / Z
- Fixed No selector displayed in rotate help screen
- Fixed music volume being very low
- Fixed not necessary extra music related array for notes
- Made Image unit8_t instead of struct since you may not initialize an array inside a struct
- updated Makefile and wasm4.h to latest version that "w4 createnew" would generate
- Fixed multiple warnings about int types being mixed or losing signedness etc

### 1.0
- Initial Port

## Source Code
[https://github.com/joyrider3774/waternet_wasm4](https://github.com/joyrider3774/waternet_wasm4)
