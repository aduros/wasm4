import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { AspectRatio } from './AspectRatio';
import { Giscus } from "@giscus/react";

function Embed ({ slug, title, author }) {
    let params = "?url="+encodeURIComponent(`/carts/${slug}.wasm`);
    params += "&disk-prefix="+encodeURIComponent(slug);
    params += "&screenshot="+encodeURIComponent(`/carts/${slug}.png`);
    if (title) {
        params += "&title="+encodeURIComponent(title);
    }
    if (author) {
        params += "&author="+encodeURIComponent(author);
    }
    return (
        <AspectRatio width={1} height={1} className="game-embed-wrapper">
        <iframe
            src={`/embed/${params}`}
            allow="fullscreen"
            frameBorder="0"
            className="game-embed">
        </iframe>
        </AspectRatio>
    );
}

export default function PlayCart ({ cart }) {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            title={cart.title}
            image={`https://wasm4.org/carts/${cart.slug}.png`}>
            <main>
            <div className="container game-container">
                <Embed {... cart}/>

                <p>Player 1 controls: Arrows, X, Z/C</p>
                <p>Player 2 controls: ESDF, Tab/Shift, Q/A</p>

                <a className="button button--primary button--outline" href={`/carts/${cart.slug}.wasm`}>Download this game </a>

                <Giscus
                    repo="aduros/wasm4"
                    repoId="MDEwOlJlcG9zaXRvcnkzOTMxOTY4MjI="
                    category="Games"
                    categoryId="DIC_kwDOF2-1Fs4B-mU1"
                    mapping="specific"
                    term={cart.title}
                    theme="transparent_dark"
                    reactionsEnabled="1"
                    emitMetadata="0"
                />
            </div>
            </main>
        </Layout>
    );
}
