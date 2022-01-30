import * as w4 from "./wasm4";
import { Date } from "as-date";

let time: f64;

export function start(): void {
    // Get the time the runtime was started.
    time = load<u64>(w4.TIME) as f64;
}

export function update(): void {
    // Increase the seconds.
    time += 1 / 60; // 60 frames per second

    // Clear the screen.
    store<u16>(w4.DRAW_COLORS, 0x43);
    w4.rect(0, 0, w4.SCREEN_SIZE, w4.SCREEN_SIZE);

    // Interpret the time into a valid Date.
    const date = new Date((time as i64) * 1000); // Date() expects milliseconds

    // Display the current time.
    const lineHeight = 12;
    store<u16>(w4.DRAW_COLORS, 0x1);
    w4.text("Time: " + (time as u64).toString(), 10, lineHeight);

    w4.text("Hour: " + date.getHours().toString(), 10, lineHeight * 5);
    w4.text("Minute: " + date.getMinutes().toString(), 10, lineHeight * 6);
    w4.text("Seconds: " + date.getSeconds().toString(), 10, lineHeight * 7);
}