# Multiplayer

WASM-4 supports realtime multiplayer of up to 4 players, either locally or online.

Detecting [gamepad input](./user-input#gamepad) for Player 2 is the same as usual, but instead of
`GAMEPAD1`, you read from `GAMEPAD2`. For Players 3 and 4, `GAMEPAD3` and `GAMEPAD4`.

## Local

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

Netplay is in active development. Check back soon!
