export function requestFullscreen () {
    if (document.fullscreenElement == null) {
        document.body.requestFullscreen({navigationUI: "hide"});
    }
}

