(module
  (func $blit (import "env" "blit") (param i32 i32 i32 i32 i32 i32))
  (memory (import "env" "memory") 1 1)
  (func (export "update")
    i32.const 0
    i32.const 0
    i32.const 0
    i32.const 0x8
    i32.const 0x10000001
    i32.const 1
    call $blit
  )
)
