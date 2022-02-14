import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--dark', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--outline button--lg"
            to="/play">
            Play Games
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            🚀 Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function GameJamBanner() {
  return (
    <section style={{background: "#1c1e21"}}>
      <div className="container">
        <div className="row">
          <div className="col col--12 text--center padding-vert--md">
            <div>
              <iframe style={{ "maxWidth": "100%" }} width="560" height="315" src="https://www.youtube-nocookie.com/embed/hWGu4SqlRy0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div>
              <p>A quick video introduction to WASM-4.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout>
      <HomepageHeader />
      <main>
        <GameJamBanner />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
