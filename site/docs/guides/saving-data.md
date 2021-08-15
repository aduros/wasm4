import MultiLanguageCode from '@site/src/components/MultiLanguageCode';

# Saving Data

## Writing Data to Disk

WASM-4 supports saving up to 1024 raw bytes of data using `diskw()`. It takes a
source data pointer along with a byte length.

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

```rust
// Rust example coming soon 🦀
```

```go
import "unsafe"
// ...

var gameData int32 = 1337;
diskw(unsafe.Pointer(&gameData), unsafe.Sizeof(gameData));
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

```rust
// Rust example coming soon 🦀
```

```go
import "unsafe"
// ...

var gameData int32;
diskr(unsafe.Pointer(&gameData), unsafe.Sizeof(gameData));
```

</MultiLanguageCode>
