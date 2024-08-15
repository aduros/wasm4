(module
  (func $tracef (import "env" "tracef") (param i32 i32))
  (memory (import "env" "memory") 1 1)
  (func (export "update")
    i32.const 50000
    i32.const 65529
    call $tracef
  )
  (data (i32.const 50000) "%f\00")
)
