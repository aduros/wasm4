import { useEffect, useState } from 'react';
import { isIOS } from './isIOS';
import { forwardTapToIframe } from './forwardTapToIframe';

export function useIOSTapToPlay (iframeSelector) {
    const [isIOSDevice, setIsIOSDevice] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        setIsIOSDevice(isIOS());
    }, []);

    const onPlay = (event) => {
        forwardTapToIframe(event, iframeSelector);
        setIsPlaying(true);
    };

    return { isIOSDevice, isPlaying, onPlay };
}
