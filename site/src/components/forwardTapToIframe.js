// Replays a tap that landed on the parent-page overlay as a real touch
// press inside the iframe, so the runtime's own fullscreen-on-touch fires.
export function forwardTapToIframe (event, iframeSelector) {
    const iframe = document.querySelector(iframeSelector);
    if (!iframe || !iframe.contentWindow) return;

    const rect = iframe.getBoundingClientRect();
    const pointerInit = {
        bubbles: true,
        cancelable: true,
        pointerType: "touch",
        isPrimary: true,
        clientX: event.clientX - rect.left,
        clientY: event.clientY - rect.top,
    };
    iframe.contentWindow.dispatchEvent(new PointerEvent("pointerdown", pointerInit));
    iframe.contentWindow.dispatchEvent(new PointerEvent("pointerup", pointerInit));
}
