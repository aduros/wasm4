use super::wasm4::{line, SCREEN_SIZE};
pub fn draw_grid(step: i32) {
    for part in 1..(SCREEN_SIZE as i32 / step) {
        line(part * step, 0, part * step, 160);
        line(0, part * step, 160, part * step);
    }
}
