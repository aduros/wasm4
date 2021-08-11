// use std::mem;

// pub const DRAW_COLORS :Register<u16> = Register::new(0x000c);

// pub const FRAMEBUFFER: *mut u8 = Register::new(0xDEAD).ptr;

// pub static mut FRAMEBUFFER: [u8; 4] = [ 1, 2, 3, 4 ];

pub const DRAW_COLORS: *mut u16 = 666 as *mut u16;
pub const GAMEPAD1: *const u8 = 0xBABE as *const u8;

pub const TEST: Register<u8> = Register::new(6969);
pub static mut FRAMEBUFFER: *mut [u8; 4] = 69 as *mut [u8; 4];
// pub const FRAMEBUFFER: *mut [u8; 4] = 69 as *mut [u8; 4];
// pub static mut FRAMEBUFFER: [u8; 4] = unsafe { mem::transmute(69) };

// pub static mut TEST2: u32 = unsafe { mem::transmute(69) };
// pub const FRAMEBUFFER: &'static [u8; 4] = unsafe { &*(69 as *mut [u8; 4]) }uuu;

extern {
    #[link_name = "rect"]
    fn rect_ (x :i32, y :i32, width :u32, height :u32);

    #[link_name = "blit"]
    fn blit_ (sprite :*const u8, x :i32, y :i32, width :u32, height :u32, flags :u32);

    #[link_name = "textUtf8"]
    fn text_utf8 (text: *const u8, length: usize, x: i32, y: i32);

    #[link_name = "printUtf8"]
    fn print_utf8 (text: *const u8, length: usize);
}

pub fn text (text: &str, x: i32, y: i32) {
    unsafe { text_utf8(text.as_ptr(), text.len(), x, y) }
}

pub fn rect (x :i32, y :i32, width :u32, height :u32) {
    unsafe { rect_(x, y, width, height) }
}

pub fn blit (sprite :&[u8], x :i32, y :i32, width :u32, height :u32, flags :u32) {
    unsafe { blit_(sprite.as_ptr(), x, y, width, height, flags) }
}

pub fn print (text: &str) {
    unsafe { print_utf8(text.as_ptr(), text.len()) }
}

#[derive(Copy, Clone)]
pub struct Register<T> {
    ptr: *mut T,
}

impl<T> Register<T> {
    const fn new (address :usize) -> Self {
        Self {
            ptr: address as *mut T,
        }
    }
}

impl<T> Register<T> where T: Copy {
    pub fn set (self, value :T) {
        unsafe { *(self.ptr) = value; }
    }

    #[must_use]
    pub fn get (self) -> T {
        unsafe { *(self.ptr) }
    }
}
