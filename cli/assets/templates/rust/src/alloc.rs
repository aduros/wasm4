use buddy_alloc::{BuddyAllocParam, FastAllocParam, NonThreadsafeAlloc};

// These values can be tuned
const FAST_HEAP_SIZE: usize = 4 * 1024; // 4 KB
const HEAP_SIZE: usize = 16 * 1024; // 16 KB
const LEAF_SIZE: usize = 16;

static mut FAST_HEAP: [u8; FAST_HEAP_SIZE] = [0u8; FAST_HEAP_SIZE];
static mut HEAP: [u8; HEAP_SIZE] = [0u8; HEAP_SIZE];

#[global_allocator]
static ALLOC: NonThreadsafeAlloc = {
    let fast_ptr = &raw mut FAST_HEAP as *const u8;
    let buddy_ptr = &raw mut HEAP as *const u8;

    let fast_param = FastAllocParam::new(fast_ptr, FAST_HEAP_SIZE);
    let buddy_param = BuddyAllocParam::new(buddy_ptr, HEAP_SIZE, LEAF_SIZE);

    NonThreadsafeAlloc::new(fast_param, buddy_param)
};
