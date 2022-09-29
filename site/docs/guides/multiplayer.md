# Multiplayer

import MultiLanguageCode from '@site/src/components/MultiLanguageCode';

WASM-4 supports realtime multiplayer of up to 4 players, either locally or online.

Detecting [gamepad input](/docs/guides/user-input#gamepad) for Player 2 is the same as usual, but instead of
`GAMEPAD1`, you read from `GAMEPAD2`. For Players 3 and 4, `GAMEPAD3` and `GAMEPAD4`.

## Local Multiplayer

Local multiplayer is where everyone is playing on the same computer. To play local multiplayer, you
can connect multiple physical USB controllers. Xbox or PlayStation controllers are known to work
best.

If all you have is a keyboard, up to 3 players can be controlled from one keyboard using these keys:

| Player # | Directions    | X button                       | Z button                     |
| ---      | ---           | ---                            | ---                          |
| 1        | Arrows        | `.` (period)                   | `,` (comma)                  |
| 2        | `ESDF`        | `A` or `Q`                     | `Tab` or `LShift`            |
| 3        | Numpad `8456` | Numpad `*` or `.`              | Numpad `-` or `Enter`        |

This key layout is designed to fit many hands on one keyboard somewhat comfortably.

## Netplay

Netplay connects gamepad inputs over the Internet using WebRTC. WASM-4 implements [rollback
netcode](https://www.youtube.com/watch?v=0NLe4IpdS1w) to keep games fast and responsive.

Hosting a netplay game is as easy as copy and pasting a link.

1. While playing any cart, press Enter to open the WASM-4 menu.
2. Select "Copy Netplay URL". An invite link (like `https://wasm4.org/netplay/#ABCDEF`) will be
   copied to your clipboard for you to send to a friend.
3. When your friend clicks your link, they'll instantly join your game.

All WASM-4 games that support local multiplayer automatically support netplay. There are no
additional steps developers need to take to make their games netplay-ready.

There are currently some caveats to keep in mind:

- Mouse input is disabled during netplay.
- State saving/loading and cart reset is currently disabled during netplay.
- Netplay is new and there may be bugs, please [report
  issues](https://github.com/aduros/wasm4/issues/new)!

### The `NETPLAY` memory register

WASM-4 exposes the state of netplay to the cart via the [`NETPLAY`](/docs/reference/memory#netplay)
memory register.

Reading this register is not required to implement netplay, but it can be used to implement advanced
features such as non-shared screen multiplayer:

<MultiLanguageCode>

```c
// If netplay is active
if (*NETPLAY & 0b100) {
    int playerIdx = *NETPLAY & 0b011;
    // Render the game from playerIdx's perspective
    // ...
}
```

```rust
unsafe {
    // If netplay is active
    if *NETPLAY & 0b100 != 0 {
        let player_idx = *NETPLAY & 0b011;
        // Render the game from player_idx's perspective
        // ...
    }
}
```

</MultiLanguageCode>

This is a powerful feature enabling games with hidden information, like card games, strategy games,
and first person shooters. However, caution must be taken by developers to not introduce
desynchronization. In other words, the netplay player index should only be used to adjust how a
frame is rendered, and not affect game logic. Each connected player must run the same game logic for
all players in order to prevent desyncs.
