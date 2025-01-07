import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BrowserOnly from '@docusaurus/BrowserOnly';
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
                allow="fullscreen; gamepad; autoplay"
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
                <BrowserOnly>{() => Embed()}</BrowserOnly>

                <div className="text--center margin-bottom--lg">
                    <small>Controls: Arrows, X, Z</small>
                </div>

                <h1>Netplay</h1>

                <p>You've been invited to play a WASM-4 multiplayer game.</p>

                <h2>FAQ</h2>

                <b><i>How do I check our connection quality?</i></b>
                <p>You can see your ping to each of the other players on the pause menu by pressing Enter. For fast-paced action games, ping below 200 ms is recommended for best results.</p>

                <b><i>How does this work?</i></b>
                <p>Check out the <Link href="/docs/guides/multiplayer">documentation</Link> for more details about building multiplayer games with WASM-4.</p>
            </div>
            </main>
        </Layout>
    );
}
