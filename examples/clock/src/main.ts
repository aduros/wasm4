import * as w4 from "./wasm4";
import { Date } from "as-date";

let time: f64;
let timezone: i32;
let previousGamepad: u8;

export function start(): void {
    // Get the time the runtime was started.
    time = load<u64>(w4.TIME) as f64;

    // Load the timezone.
    const ptr = memory.data(sizeof<i32>());
    w4.diskr(ptr, sizeof<i32>());
    timezone = load<i32>(ptr);

    // Palette.
    store<u32>(w4.PALETTE, Number.parseInt("000000", 16) as u32);
    store<u32>(w4.PALETTE, Number.parseInt("ffffff", 16) as u32, 4);
    store<u32>(w4.PALETTE, Number.parseInt("ff0000", 16) as u32, 8);
    store<u32>(w4.PALETTE, Number.parseInt("00ff00", 16) as u32, 12);
}

function setTimezone(newTimezone:i32): void {
    const ptr = memory.data(sizeof<i32>());
    store<i32>(ptr, newTimezone);
    w4.diskw(ptr, sizeof<i32>());
    timezone = newTimezone;
}

export function update(): void {
    // Increase the seconds.
    time += 1 / 60; // 60 frames per second

    // Clear the screen.
    store<u16>(w4.DRAW_COLORS, 0x2);
    w4.rect(0, 0, w4.SCREEN_SIZE, w4.SCREEN_SIZE);

    // Interpret the time into a valid Date.
    const date = new Date((time as i64) * 1000); // Date() expects milliseconds
    date.setTimezoneOffset(timezone * 60);

    // Draw the clock.
    let center:i32 = w4.SCREEN_SIZE / 2;
    let clockRadius = w4.SCREEN_SIZE / 2 * 0.95;
    store<u16>(w4.DRAW_COLORS, 0x12);
    w4.oval(center - clockRadius as u32, center - clockRadius as u32, clockRadius * 2 as u32, clockRadius * 2 as u32);

    // Draw the numbers on the clock.
    store<u16>(w4.DRAW_COLORS, 0x1);
    let textRadius = clockRadius * 0.85
    for (let i = 0; i < 12; i++) {
        let clockPosition = i * 5;
        let text = i == 0 ? "12" : i.toString()
        let textWidth = text.length * 8;
        let textHeight = 8;
        w4.text(text, center + textRadius * Math.sin(clockPosition * (2 * Math.PI / 60)) - textWidth / 2 as i32 , center - textRadius * Math.cos(clockPosition * (2 * Math.PI / 60)) - textHeight / 2 as i32);
    }

    // Draw the hands.
    let sradius = clockRadius * 0.8;
    let mradius = clockRadius * 0.9;
    let hradius = clockRadius * 0.6;
    store<u16>(w4.DRAW_COLORS, 0x3);
    w4.line(center, center, center + sradius * Math.sin(date.getSeconds() * (2 * Math.PI / 60)) as i32, center - sradius * Math.cos(date.getSeconds() * (2 * Math.PI / 60)) as i32)
    store<u16>(w4.DRAW_COLORS, 0x1);
    w4.line(center, center, center + mradius * Math.sin(date.getMinutes() * (2 * Math.PI / 60)) as i32, center - mradius * Math.cos(date.getMinutes() * (2 * Math.PI / 60)) as i32);
    store<u16>(w4.DRAW_COLORS, 0x1);
    let h = date.getHours() % 12 + date.getMinutes() / 60.0;
    w4.line(center, center, center + hradius * Math.sin(h * (2 * Math.PI / 60)) as i32, center - hradius * Math.cos(h * (2 * Math.PI / 60)) as i32);

    // Allow changing the timezone.
    const gamepad = load<u8>(w4.GAMEPAD1);
    const pressedThisFrame = gamepad & (gamepad ^ previousGamepad);
    previousGamepad = gamepad;
    if (pressedThisFrame & w4.BUTTON_LEFT) {
        setTimezone(timezone - 1);
    }
    if (pressedThisFrame & w4.BUTTON_RIGHT) {
        setTimezone(timezone + 1);
    }
}
