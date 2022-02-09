import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { AspectRatio } from './AspectRatio';
import { Giscus } from "@giscus/react";
import { RWebShare } from "react-web-share";

// const ShareIcon = require("../../static/img/devices.svg").default;
import ShareIcon from "../../static/img/share.svg";

function Embed ({ slug, title, author }) {
    let params = "?url="+encodeURIComponent(`/carts/${slug}.wasm`);
    params += "&disk-prefix="+encodeURIComponent(slug);
    params += "&screenshot="+encodeURIComponent(`/carts/${slug}.png`);
    // if (title) {
    //     params += "&title="+encodeURIComponent(title);
    // }
    // if (author) {
    //     params += "&author="+encodeURIComponent(author);
    // }
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

    const dateString = new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(cart.date));

    return (
        <Layout
            title={cart.title}
            image={`https://wasm4.org/carts/${cart.slug}.png`}>
            <main>
            <div className="container game-container">
                <Embed {... cart}/>

                <div className="text--center margin-bottom--lg">
                    <small>P1 controls: Arrows, X, Z / P2 controls: ESDF, Tab, Q</small>
                </div>

                <h1>
                    {cart.title}
                    <a className="cart-download button button--primary button--outline" href={`/carts/${cart.slug}.wasm`}>Download</a>
                    <RWebShare data={{text: cart.title, url: `https://wasm4.org/play/${cart.slug}`, title: `Share ${cart.title}`}}>
                        <a href="#"><ShareIcon className="cart-share" alt="Share" /></a>
                    </RWebShare>
                </h1>
                <div className="avatar">
                  <a
                    className="avatar__photo-link avatar__photo avatar__photo--lg"
                    href={`https://github.com/${cart.github}`} target="_blank"
                  >
                    <img src={`https://github.com/${cart.github}.png?size=128`} />
                  </a>
                  <div className="avatar__intro">
                    <div className="avatar__name"><a href={`https://github.com/${cart.github}`} target="_blank">{cart.author}</a></div>
                    <small className="avatar__subtitle">
                      {dateString}
                    </small>
                  </div>
                </div>

                <div className="margin-top--lg">
                    <div dangerouslySetInnerHTML={{__html: cart.readme}} />
                </div>

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
