use super::wasm4::DRAW_COLORS;
use super::wasm4::PALETTE;

type Palette = [u32; 4];

pub const W4_DEFAULT: Palette = [0xe0f8cf, 0x86c06c, 0x306850, 0x071821];

pub const PONG_OG: Palette = [0x1b1b1b, 0xdcdcdc, 0x1b1b1b, 0xdcdcdc];

pub const ICE_CREAM_GB: Palette = [0xfff6d3, 0xf9a875, 0xeb6b6f, 0x7c3f58];

pub const HOLLOW: Palette = [0x0f0f1b, 0x565a75, 0xc5b7be, 0xf9fbf5];

const PALETTES: [Palette; 4] = [PONG_OG, ICE_CREAM_GB, HOLLOW, W4_DEFAULT];

#[inline]
fn palette_by_idx<T: Into<usize>>(idx: T) -> Palette {
    PALETTES[idx.into() % PALETTES.len()]
}

pub fn change_palette<T: Into<usize>>(idx: T) {
    unsafe {
        *PALETTE = palette_by_idx(idx);
    }
}

pub fn set_draw_color<T: Into<u16>>(idx: T) {
    unsafe { *DRAW_COLORS = idx.into() }
}
