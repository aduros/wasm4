export function callAt60Hz(callback: (interFrameTime: number | null) => void) {
    if (_callback) {
        throw new Error("can only have one update function");
    }
    _callback = callback;
    requestAnimationFrame(onVsync);
}

let _callback: ((interFrameTime: number | null) => void) | undefined;

let previousFrameStartTime: number | null = null;
function doUpdate() {
    let frameStartTime = performance.now();
    let interFrameTime = previousFrameStartTime === null ? null : frameStartTime - previousFrameStartTime;
    _callback!(interFrameTime);
    previousFrameStartTime = frameStartTime;
}


// We use a scheme to switch between a vsync-based and timer-based update timing, depending on
// the vsync rate. This keeps the updates smooth and regular on a 60 fps monitor (or multiple thereof),
// but still at the correct update rate for other framerates.

const idealIntervalMs = 1000 / 60;

type TimerMode = {
    vsyncMode: false,
    timerID: number,
}

type VsyncMode = {
    vsyncMode: true,
    vsyncTimeoutID: number,
}

type UpdateTimingMode = TimerMode | VsyncMode;

let updateTimingMode: UpdateTimingMode = {
    vsyncMode: true,
    // It's safe to just set this to 0 because that's never a valid timer ID, and clearing
    // a non-existant ID does nothing.
    vsyncTimeoutID: 0,
}

let previousVsyncTime: number | null = null;
let smoothedVsyncInterval = 60;
let vsyncDividerCounter = 0;
// A requestAnimationFrame callback generally happens once soon after vsync, and the time passed
// to it is essentially the vsync time. Roughly speaking, this is a vsync callback.
// Switching between timing modes is controlled from this function.
function onVsync(vsyncTime: number) {
    requestAnimationFrame(onVsync);

    if (previousVsyncTime !== null) {
        let vsyncInterval = (vsyncTime - previousVsyncTime);
        const a = 0.3;
        smoothedVsyncInterval = (1-a)*smoothedVsyncInterval + a*vsyncInterval;
    }
    previousVsyncTime = vsyncTime;


    let framerateRatio = idealIntervalMs / smoothedVsyncInterval;
    let roundedFramerateRatio = Math.round(framerateRatio);
    let fractionalFramerateRatio = framerateRatio % 1;
    if (roundedFramerateRatio >= 1 && (fractionalFramerateRatio < 0.01 || fractionalFramerateRatio > 0.99)) {
        // The framerate is near to a multiple of 60, so we go to (or stay in) Vsync mode, and do an update.

        // In case requestAnimationFrame callbacks suddenly stop happening as often or stop altogether
        // (e.g. when a desktop user puts the browser window in the background, moves the window to a monitor
        // with a different framerate, etc.), we use a timeout that will rapidly switch to timer mode.

        if (updateTimingMode.vsyncMode) {
            clearTimeout(updateTimingMode.vsyncTimeoutID);
        } else {
            clearTimeout(updateTimingMode.timerID);
        }

        updateTimingMode = {
            vsyncMode: true,
            vsyncTimeoutID: setTimeout(onTimer, 1.2*idealIntervalMs),
        }

        vsyncDividerCounter++;
        if (vsyncDividerCounter >= roundedFramerateRatio) {
            vsyncDividerCounter = 0;
            doUpdate();
        }
    } else {
        // Switch to (or stay in) timer mode.
        // We need to be able to handle going to either a lower vsync rate like 30 per second,
        // or a higher one like 90 per second.
        if (updateTimingMode.vsyncMode) {
            clearTimeout(updateTimingMode.vsyncTimeoutID);

            let timeout;
            let now = performance.now();
            if (previousFrameStartTime !== null) {
                target = previousFrameStartTime + idealIntervalMs;
            } else {
                target = now;
            }
            timeout = target - now;
            updateTimingMode = {
                vsyncMode: false,
                timerID: setTimeout(onTimer, timeout)
            };
        }
    }
}

// For framerates that aren't a multiple of 60, a setTimeout() solution is used.
// This is especially necessary when requestAnimationFrame callbacks happen at less
// than 60 times a second, to ensure that audio is updated at a uniform interval of 60 times per second.
// This could happen e.g. when the device only has a 30 fps screen, or on a desktop when the browser
// window is put in the background. The runtime also falls into timer mode when update calls are taking
// too long.
// setTimeout() is used over setInterval() because setInterval rounds down 16.66ms to 16ms and some browsers
// run setInterval late whereas others try to keep it at the correct frequency on average. Overall, careful use
// of setTimeout() gives better control of timing.
let target = 0;
function onTimer() {
    let now = performance.now();

    if (updateTimingMode.vsyncMode) {
        // The vsync timeout has triggered.
        target = now;
    }

    // If it's been too long since our target time, don't try to catch up on lost time and frames.
    // Just accept that there was lag and continue at normal pace from now.
    // For this reason, the value chosen for this should be only just large enough to absorb timer jitter.
    // I've chosen a conservatively large value of 16.6 milliseconds.
    if (now - target > idealIntervalMs) {
        target = now + idealIntervalMs;
    } else {
        // By setting a target that increases at 60 fps and aiming next frame for it, various timer
        // innaccuracies are corrected for and averaged out, including: the jitter added to performance.now()
        // for security purposes, intrinsic lateness of setTimeout() callbacks, setTimeout() only taking
        // an integer number of milliseconds and removing any fractional part (1000/60 = 16.666ms becomes 16ms
        // on major browsers, which corresponds to 62.5 updates per second, a noticable speedup).
        target += idealIntervalMs;
    }

    updateTimingMode = {
        vsyncMode: false,
        // Calling setTimeout before doUpdate means that the browser clamping the timeout to a minimum of 4ms
        // isn't a problem. If we called it after, we would get slowdown at high load, when update ends less
        // than 4ms before the start of the next frame.
        timerID: setTimeout(onTimer, target-now)
    };

    doUpdate();
}