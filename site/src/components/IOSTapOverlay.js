import React from 'react';

export function IOSTapOverlay ({ isIOSDevice, isPlaying, onPlay }) {
    if (!isIOSDevice || isPlaying) return null;
    return (
        <div
            onClick={onPlay}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
    );
}
