(module
  (func $tracef (import "env" "tracef") (param i32 i32))
  (memory (import "env" "memory") 1 1)
  (func (export "update")
    i32.const 40000
    i32.const 65533
    i32.store

    i32.const 50000
    i32.const 40000
    call $tracef
  )
  (data (i32.const 50000) "%s\00")
  (data (i32.const 65533) "xxx")
)
