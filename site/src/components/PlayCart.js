import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { Giscus } from "@giscus/react";
// import styles from './index.module.css';
// import HomepageFeatures from '../components/HomepageFeatures';

// function HomepageHeader() {
//   const {siteConfig} = useDocusaurusContext();
//   return (
//     <header className={clsx('hero hero--primary', styles.heroBanner)}>
//       <div className="container">
//         <h1 className="hero__title">{siteConfig.title}</h1>
//         <p className="hero__subtitle">{siteConfig.tagline}</p>
//         <div className={styles.buttons}>
//           <Link
//             className="button button--secondary button--lg"
//             to="/docs/intro">
//             Docusaurus Tutorial - 5min ⏱️
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// }

function Embed ({ id, title, author }) {
    let params = "?url="+encodeURIComponent(`/carts/${id}.wasm`);
    if (title) {
        params += "&title="+encodeURIComponent(title);
    }
    if (author) {
        params += "&author="+encodeURIComponent(author);
    }
    return (
        <iframe
            src={`/embed/${params}`}
            allow="fullscreen"
            frameBorder="0"
            className="game-embed">
        </iframe>
    );
}

export default function PlayCart ({ cart }) {
    const {siteConfig} = useDocusaurusContext();
    // <div style={{position: "relative", width: "calc(min(480px, 100%, 100vh - 200px))"}}>
        // <div style={{"padding-bottom": "100%", position: "relative"}}>
    return (
        <Layout
            title={cart.title}
            description={cart.description}>
            <main>
            <div className="container game-container">
                <Embed {... cart}/>

                <Giscus
                    repo="laymonage/giscus"
                    repoId="MDEwOlJlcG9zaXRvcnkzNTE5NTgwNTM="
                    categoryId="MDE4OkRpc2N1c3Npb25DYXRlZ29yeTMyNzk2NTc1"
                    mapping="specific"
                    term="Welcome to giscus!"
                    theme="transparent_dark"
                    reactionsEnabled="1"
                    emitMetadata="0"
                />
            </div>
            </main>
        </Layout>
    );
}
