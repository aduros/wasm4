(module
  (func $blit (import "env" "blit") (param i32 i32 i32 i32 i32 i32))
  (memory (import "env" "memory") 1 1)
  (func (export "update")
    i32.const 65529
    i32.const 0
    i32.const 0
    i32.const 8
    i32.const 8
    i32.const 0
    call $blit
  )
)
