import MultiLanguageCode from '@site/src/components/MultiLanguageCode';

# Saving Data

WASM-4 supports saving up to 1024 raw bytes of data to persist between
sessions.

For the web runtime, the disk is saved into the browser's localStorage and tied
to the domain. The localStorage key is chosen [when bundling](distribution) to
be unique and not conflict with other games served from the same domain.

For the native runtime, the disk is saved as a file in the same directory as
the game.

In the case that a game is updated and its disk layout was changed, it's up to
the developer to handle it. A simple method would be to prefix the disk data
with a version number and when it doesn't match, either reset the current disk
or migrate it to the new format.

## Writing Data to Disk

To save, use `diskw()`.
It takes a source data pointer along with a byte length.

For example, to write a 32 bit integer with the value `1337` to disk:

<MultiLanguageCode>

```typescript
// First we need to store the value somewhere in memory to get a pointer
const ptr = memory.data(sizeof<i32>());
store<i32>(ptr, 1337);

w4.diskw(ptr, sizeof<i32>());
```

```c
int gameData = 1337;
diskw(&gameData, sizeof(gameData));
```

```d
int gameData = 1337;
w4.diskw(&gameData, gameData.sizeof);
```

```go
import "unsafe"
// ...

var gameData int32 = 1337
w4.DiskW(unsafe.Pointer(&gameData), unsafe.Sizeof(gameData))
```

```lua
local game_data: integer = 1337
diskw(&game_data, #@decltype(game_data))
```

```nim
var gameData = 1337'i32
discard diskw(addr gameData, uint32 sizeof(gameData))
```

```odin
game_data : i32 = 1337
w4.diskw(&game_data, size_of(game_data))
```

```porth
const data "\\39\\05\\00\\00"c end

4 data diskw
```

```rust
let game_data: i32 = 1337;

unsafe {
    let game_data_bytes = game_data.to_le_bytes();
    diskw(game_data_bytes.as_ptr(), core::mem::size_of::<i32>() as u32);
}
```

```wasm
;; game data (1337 stored in little-endian format)
(data (i32.const 0x2000) "\39\05\00\00")

;; write 4 bytes from address 0x2000
(call $diskw (i32.const 0x2000) (i32.const 4))
```

```zig
var game_data: i32 = 1337;
_ = w4.diskw(@ptrCast([*]u8, &game_data), @sizeOf(@TypeOf(game_data)));
```

</MultiLanguageCode>

## Reading Data from Disk

Reading is similar, using `diskr()`. It takes a destination pointer along with
a byte length.

For example, to read a 32 bit integer from disk:

<MultiLanguageCode>

```typescript
const ptr = memory.data(sizeof<i32>());
w4.diskr(ptr, sizeof<i32>());

const gameData = load<i32>(ptr);
```

```c
int gameData;
diskr(&gameData, sizeof(gameData));
```

```d
int gameData;
w4.diskr(&gameData, gameData.sizeof);
```

```go
import "unsafe"
// ...

var gameData int32
w4.DiskR(unsafe.Pointer(&gameData), unsafe.Sizeof(gameData))
```

```lua
local game_data: integer
diskr(&game_data, #@decltype(game_data))
```

```nim
var gameData: int32
discard diskr(addr gameData, uint32 sizeof(gameData))
```

```odin
game_data : i32
w4.diskr(&game_data, size_of(game_data))
```

```porth
memory game_data 4 end

4 game_data diskr
```

```rust
let game_data = unsafe {
    let mut buffer = [0u8; core::mem::size_of::<i32>()];

    diskr(buffer.as_mut_ptr(), buffer.len() as u32);

    i32::from_le_bytes(buffer)
};
```

```wasm
;; Read 4 bytes into memory at address 0x2000.
(call $diskr (i32.const 0x2000) (i32.const 4))
```

```zig
var game_data: i32 = undefined;
_ = w4.diskr(@ptrCast([*]u8, &game_data), @sizeOf(@TypeOf(game_data)));
```

</MultiLanguageCode>
