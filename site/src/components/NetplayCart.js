import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { AspectRatio } from './AspectRatio';
import { Giscus } from "@giscus/react";
import { RWebShare } from "react-web-share";
import { MdSaveAlt, MdShare } from "react-icons/md";

function Embed () {
    const peerId = location.hash.substring(1);
    return (
        <AspectRatio width={1} height={1} className="game-embed-wrapper">
            <iframe
                src={`/embed/#?netplay=${peerId}`}
                allow="fullscreen gamepad autoplay"
                frameBorder="0"
                className="game-embed">
            </iframe>
        </AspectRatio>
    );
}

export default function NetplayCart () {
    return (
        <Layout title="Netplay">
            <main>
            <div className="container game-container">
                <Embed/>

                <div className="text--center margin-bottom--lg">
                    <small>Controls: Arrows, X, Z</small>
                </div>

                <h1>
                    🚧 Netplay beta
                </h1>

                <p>Netplay connects 2 or more players together over WebRTC. It's still in development, and may have bugs and performance issues.</p>
                <p>Having problems? Please join us on Discord, or open an issue on GitHub!</p>
            </div>
            </main>
        </Layout>
    );
}
