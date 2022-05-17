---
author: Kris Dabrowski
github: ChuuniMage
date: 2022-05-13
---

# Win 4 Fighter (W4F)

Discord: Krzysztoφορος#9326

W4F is a minimalistic fighting game based on the core gameplay of Virtua Fighter.

Intended exclusively for multiplayer.

To play netplay, press Enter to open the WASM4 menu, and select "COPY NETPLAY URL".

Share this URL with the person you want to play against. They will be able to use P1 controls to play.

A = Guard

B = Punch

Left & Right: Movement

Down: Crouch

You can hold down the attack button to attack the first frame you are able to act.

Down+Punch, Stand+Punch, Forward+Punch are all different striking attacks.

Punch+Guard executes a throw.

You can crouch under high punch, and throw.

Frame data and movelist for nerds:

impact, active, recovery | grd, nh, ch | b.stun, h.stun, ch stun bonus

5P| i12, +1 active, 14 rec | +2, +5, +8 | +18, +21, +3 | High, blockable high, duckable

2P| i12, +0 active, 21 rec | -5, +4, +7 | +17, +26, +3 | Special Low (Blockable both High and Low)

6P| i14, +1 act, 21 rec | -5, +1, +8 | +16, +23, +7 | Mid, blockable high, not duckable

P+G| i10, +0 1ct, 24 rec | hit advantage: +1 | High, beats high block, duckable
