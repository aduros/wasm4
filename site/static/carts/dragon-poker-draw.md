---
author: LoneGrayWolf2000 <lonegraywolf@proton.me>
date: 2026-04-26
---

# Dragon Poker Draw

A 6-card poker game for WASM-4 inspired by Robert Asprin's Dragon Poker concept. Win big by making the best poker hands!

## How to Play

**Dragon Poker** uses 6 cards per hand instead of the traditional 5. This opens up new hand combinations and strategic possibilities.

### Game Flow

1. **Betting Phase** - Decide your bet ($1-$5)
2. **Draw Phase** - Receive your initial 6 cards
3. **Exchange Phase** - Swap up to 4 cards to improve your hand
4. **Final Draw** - Receive replacement cards
5. **Results** - See your hand rank and winnings

### Hand Rankings

From highest to lowest payout:

- **Royal Flush** - 2500x - A♠ K♠ Q♠ J♠ 10♠ 9♠ (6-card royal straight flush)
- **Straight Flush** - 250x - Six consecutive cards of the same suit
- **Full Dragon** - 160x - Four of a kind + pair
- **Full Belly** - 120x - Two three-of-a-kinds
- **Flush** - 80x - Six cards of the same suit
- **Corps-à-Corps** - 60x - Three pairs in two suits
- **Four of a Kind** - 40x - Four matching ranks
- **Straight** - 25x - Six consecutive cards (any suit)
- **Full House** - 15x - Three of a kind + pair
- **Three Pair** - 12x - Three distinct pairs
- **Three of a Kind** - 8x - Three matching ranks
- **Two Pair** - 5x - Two distinct pairs
- **Pair of Jacks or Better** - 2x - Jacks, Queens, Kings, or Aces

## Features

### Jokers

You can play with up to 4 jokers! Each joker is a single card that acts as a wildcard:
- Can substitute any rank to complete pairs, three-of-a-kinds, or four-of-a-kinds
- Can fill gaps in straights (up to 1 gap per joker)
- Counts as any suit for flushes

Select your joker count on the **Joker Select Screen** before playing.

### Help System

Press **🔘 (Button 2)** on the title screen to access the 7-page help guide:
- Pages 1-2: How to play
- Page 3: Hand rankings and payouts
- Pages 4-7: Example hands with visual demonstrations

## Controls

- **↑ / ↓** - Navigate menus / Adjust values
- **← / →** - Navigate menus / Adjust values
- **🔘 (Button 1)** - Confirm / Select
- **🔘🔘 (Button 2)** - Help / Back

## Tips

- Jokers are incredibly valuable - use them wisely!
- Straights and flushes are harder to achieve with 6 cards - don't overestimate
- The new hand types (Three Pair, Corps-à-Corps, Full Belly, Full Dragon) offer great payouts
- Building bankroll is key to unlocking more opportunities to play

## Credits

- **Video Game by:** LoneGrayWolf
- **Original Concept by:** Robert Asprin
- **Built with:** WASM-4 Fantasy Console

Enjoy!
