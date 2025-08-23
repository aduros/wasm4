use buddy_alloc::{BuddyAllocParam, FastAllocParam, NonThreadsafeAlloc};

// These values can be tuned
const FAST_HEAP_SIZE: usize = 4 * 1024; // 4 KB
const HEAP_SIZE: usize = 16 * 1024; // 16 KB
const LEAF_SIZE: usize = 16;

static mut FAST_HEAP: *mut [u8; FAST_HEAP_SIZE] = (0x10000 - HEAP_SIZE - FAST_HEAP_SIZE) as *mut [u8; FAST_HEAP_SIZE];
static mut HEAP: *mut [u8; HEAP_SIZE] = (0x10000 - HEAP_SIZE) as *mut [u8; HEAP_SIZE];

#[global_allocator]
static ALLOC: NonThreadsafeAlloc = unsafe {
    let fast_param = FastAllocParam::new(FAST_HEAP as *mut u8, FAST_HEAP_SIZE);
    let buddy_param = BuddyAllocParam::new(HEAP as *mut u8, HEAP_SIZE, LEAF_SIZE);
    NonThreadsafeAlloc::new(fast_param, buddy_param)
};
