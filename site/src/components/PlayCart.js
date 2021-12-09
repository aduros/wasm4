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

function Embed ({ slug, title, author }) {
    const queryParams = new URLSearchParams({
        url: `/carts/${slug}.wasm`,
        screenshot: `/carts/${slug}.png`,
    });

    if (title) {
        queryParams.append('title', title + '');
    }

    if (author) {
        queryParams.append('author', author + '')
    }
    const params = queryParams.toString();
    const search = params && `?${params}`;

    const iframeRef = React.useRef();


    React.useEffect(() => {
        const handleFocusChange = (evt) => {
            window.requestAnimationFrame(() => {
                if(!iframeRef.current) {
                    console.warn('Embed: invalid ref or unsubscribed evt listener!');
                    return;
                } 
    
                if(document.activeElement !== iframeRef.current) {
                    iframeRef.current.contentWindow.postMessage('wasm4-iframe-blur', '*');
                    console.log('postmessage', evt.type);
                }
            })
        }
        window.addEventListener('blur',  handleFocusChange);

        return () => {
            window.removeEventListener('blur', handleFocusChange);
        }
    }, []);

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
    return (
        <Layout
            title={cart.title}
            image={`https://wasm4.org/carts/${cart.slug}.png`}>
            <main>
            <div className="container game-container">
                <Embed {... cart}/>

                <p>Controls: Arrow Keys, X, Z/Y/C</p>

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
