#[cfg(feature = "dev_tools")]
mod dev_tools;
mod geometry;
mod palettes;
mod pong;
mod wasm4;

#[cfg(feature = "dev_tools")]
use dev_tools::draw_grid;
use geometry::*;
use palettes::change_palette;
use palettes::set_draw_color;
use pong::*;
use wasm4::*;

static mut PONG: PongGame = new_pong_game!();

#[no_mangle]
fn start() {
    change_palette(0usize);
    set_draw_color(2u16);
}

#[no_mangle]
fn update() {
    let pong = unsafe { &mut PONG };
    let gamepad = unsafe { *GAMEPAD1 };

    #[cfg(feature = "dev_tools")]
    draw_grid(10);

    pong.update(gamepad);
}
