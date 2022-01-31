import * as w4 from "./wasm4";
import { Date } from "as-date";

let time: f64;

export function start(): void {
    // Get the time the runtime was started.
    time = load<u64>(w4.TIME) as f64;

    // Palette.
    store<u32>(w4.PALETTE, Number.parseInt("000000", 16) as u32);
    store<u32>(w4.PALETTE, Number.parseInt("ffffff", 16) as u32, 4);
    store<u32>(w4.PALETTE, Number.parseInt("ff0000", 16) as u32, 8);
    store<u32>(w4.PALETTE, Number.parseInt("00ff00", 16) as u32, 12);
}

export function update(): void {
    // Increase the seconds.
    time += 1 / 60; // 60 frames per second

    // Clear the screen.
    store<u16>(w4.DRAW_COLORS, 0x2);
    w4.rect(0, 0, w4.SCREEN_SIZE, w4.SCREEN_SIZE);

    // Interpret the time into a valid Date.
    const date = new Date((time as i64) * 1000); // Date() expects milliseconds

    // Draw the clock.
    let center:i32 = w4.SCREEN_SIZE / 2
    let clockRadius = w4.SCREEN_SIZE / 2 * 0.95
    store<u16>(w4.DRAW_COLORS, 0x12);
    w4.oval(center - clockRadius as u32, center - clockRadius as u32, clockRadius * 2 as u32, clockRadius * 2 as u32)

    // Draw the numbers on the clock.
    store<u16>(w4.DRAW_COLORS, 0x1);
    let textRadius = clockRadius * 0.85
    for (let i = 0; i < 12; i++) {
        let clockPosition = i * 5
        let text = i == 0 ? "12" : i.toString()
        let textWidth = text.length * 8
        let textHeight = 4
        w4.text(text, center + textRadius * Math.sin(clockPosition * (2 * Math.PI / 60)) - textWidth / 2 as i32 , center - textRadius * Math.cos(clockPosition * (2 * Math.PI / 60)) - textHeight / 2 as i32)
    }

    // Draw the hands.
    let sradius = clockRadius * 0.8
    let mradius = clockRadius * 0.9
    let hradius = clockRadius * 0.6
    store<u16>(w4.DRAW_COLORS, 0x3);
    w4.line(center, center, center + sradius * Math.sin(date.getSeconds() * (2 * Math.PI / 60)) as i32, center - sradius * Math.cos(date.getSeconds() * (2 * Math.PI / 60)) as i32)
    store<u16>(w4.DRAW_COLORS, 0x1);
    w4.line(center, center, center + mradius * Math.sin(date.getMinutes() * (2 * Math.PI / 60)) as i32, center - mradius * Math.cos(date.getMinutes() * (2 * Math.PI / 60)) as i32)
    store<u16>(w4.DRAW_COLORS, 0x1);
    let h = date.getHours() % 12 + date.getMinutes() / 60.0
    w4.line(center, center, center + hradius * Math.sin(h * (2 * Math.PI / 60)) as i32, center - hradius * Math.cos(h * (2 * Math.PI / 60)) as i32)
}