export function getUrlParam (name: string): string | null {
    const url = new URL(location.href);

    // First try the URL query string
    const value = url.searchParams.get(name);
    if (value != null) {
        return value;
    }

    // Fallback to using the value in the hash
    const hash = new URL(url.hash.substring(1), url.origin);
    return hash.searchParams.get(name);
}

export function requestFullscreen () {
    if (document.fullscreenElement == null) {
        document.body.requestFullscreen({navigationUI: "hide"});
    }
}

export async function copyToClipboard (text: string): Promise<void> {
    try {
        // Attempt to use the async clipboard API, which is not universally supported
        await navigator.clipboard.writeText(text);
    } catch {
        // Fall back to using execCommand on a dummy textarea element
        const textArea = document.createElement('textarea');

        textArea.value = text;

        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        return new Promise((resolve, reject) => {
            if (document.execCommand('copy')) {
                resolve();
            } else {
                reject(new Error("Failed to copy to clipboard"));
            }
            textArea.remove();
        });
    }
}
