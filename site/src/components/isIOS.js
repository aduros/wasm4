export function isIOS () {
    if (typeof navigator === "undefined") return false;

    // iPadOS 13+ reports a Mac desktop UA, but exposes multi-touch unlike any real Mac.
    return /iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
