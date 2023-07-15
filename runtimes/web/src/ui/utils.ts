export function getUrlParam (name: string): string | null {
    const url = new URL(location.href);

    // First try the URL query string
    const value = url.searchParams.get(name);
    if (value != null) {
        return value;
    }

    // Fallback to using the value in the hash
    const hash = new URL(url.hash.substring(1), "https://x");
    return hash.searchParams.get(name);
}

export function requestFullscreen () {
    if (document.fullscreenElement == null) {
        function expandIframe () {
            // Fullscreen failed, try to maximize our own iframe. We don't yet have a button to go
            // back to minimized, but this at least makes games on wasm4.org playable on iPhone
            const iframe = window.frameElement;
            if (iframe) {
                iframe.style.position = "fixed";
                iframe.style.top = "0";
                iframe.style.left = "0";
                iframe.style.zIndex = "99999";
                iframe.style.width = "100%";
                iframe.style.height = "100%";
            }
        }

        const promise = document.body.requestFullscreen && document.body.requestFullscreen({navigationUI: "hide"});
        if (promise) {
            promise.catch(expandIframe);
        } else {
            expandIframe();
        }
    }
}

export async function copyToClipboard (text: string): Promise<void> {
    try {
        // Attempt to use the async clipboard API, which is not universally supported
        await navigator.clipboard.writeText(text);
    } catch {
        // Safari does not allow writing to the clipboard outside of user interaction events.
        // Fallback is to present user with a dialog box from which they can copy the link.

        let dialog = document.createElement('dialog');
        dialog.title = 'Netplay URL';
        dialog.textContent = text;
        document.body.append(dialog);

        let copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.style.marginLeft = '1em';
        copyButton.onclick = () => navigator.clipboard.writeText(text);
        dialog.appendChild(copyButton);

        let closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginLeft = '1em';
        closeButton.onclick = () => {
          document.body.removeChild(dialog);
        };
        dialog.appendChild(closeButton);
        
        dialog.showModal();
        
    }
}
