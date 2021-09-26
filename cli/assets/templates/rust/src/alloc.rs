use buddy_alloc::{BuddyAllocParam, FastAllocParam, NonThreadsafeAlloc};

extern "C" {
    pub(crate) static __heap_base: usize;
}

/// Returns a pointer with offset `__heap_base`.
/// based on https://github.com/rustwasm/wee_alloc/issues/88#issuecomment-581404618
macro_rules! heap_ptr {
    ($t:ty) => {{
        &crate::alloc::__heap_base as *const _ as *const () as *const $t
    }};
}

pub(crate) use heap_ptr;

// These values can be tuned
const FAST_HEAP_SIZE: usize = 4 * 1024; // 4 KB
const HEAP_SIZE: usize = 16 * 1024; // 16 KB
const LEAF_SIZE: usize = 16;

static mut FAST_HEAP: [u8; FAST_HEAP_SIZE] = [0u8; FAST_HEAP_SIZE];

#[global_allocator]
static ALLOC: NonThreadsafeAlloc = unsafe {
    let fast_param = FastAllocParam::new(FAST_HEAP.as_ptr(), FAST_HEAP_SIZE);
    let buddy_param = BuddyAllocParam::new(heap_ptr!(u8), HEAP_SIZE, LEAF_SIZE);
    NonThreadsafeAlloc::new(fast_param, buddy_param)
};
