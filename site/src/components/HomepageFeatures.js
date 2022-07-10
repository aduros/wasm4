import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';
import Link from '@docusaurus/Link';

const FeatureList = [
  {
    title: 'Minimalist and Easy',
    Svg: require('../../static/img/human-handsup.svg').default,
    description: (
      <>
        Everything you need to build complete games without being overwhelming. Get creative within
        160x160 pixels and 4 colors.
      </>
    ),
  },
  {
    title: 'Language Agnostic',
    Svg: require('../../static/img/notes-multiple.svg').default,
    description: (
      <>
        Use any programming language, as long as it can compile to WebAssembly. AssemblyScript, C/C++, Rust, Go, and more.
      </>
    ),
  },
  {
    title: 'Run Anywhere',
    Svg: require('../../static/img/devices.svg').default,
    description: (
      <>
        Besides great desktop/mobile web support, run your game natively (no webviews!) even on <Link href="https://twitter.com/alvaroviebrantz/status/1518343016011943939">low-powered microcontrollers</Link> and <Link href="https://twitter.com/wasm4_org/status/1483140582943956992">obsolete hardware</Link>.
      </>
    ),
  },
  {
    title: 'Multiplayer',
    Svg: require('../../static/img/modem.svg').default,
    description: (
      <>
      Fast online multiplayer support with <Link href="/blog/release-2-4-0">rollback netcode</Link> based on GGPO.
      </>
    ),
  },
  {
    title: 'Community',
    Svg: require('../../static/img/heart.svg').default,
    description: (
      <>
      WASM-4 is supported by a diverse and friendly <Link href="/community">community</Link> of creators who love building small.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
