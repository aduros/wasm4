import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import PlayButton from "./PlayButton";

export default function Carts ({ carts }) {
    const cartButtons = carts.map(cart => (<PlayButton key={cart.slug} { ...cart } />));
    return (
        <Layout title="Play">
            <main>
                <div className="container container--fluid margin-vert--lg">
                    <div className="text--center margin-bottom--lg">
                        <h1>Newest Games</h1>
                        <p>Games and experiments built by users.</p>
                        <p><Link className="button button--primary button--outline" href="/docs/guides/distribution#publish-on-wasm4org">+ Add Your Game</Link></p>
                    </div>
                    <div className="row margin-top--lg">
                        {cartButtons}
                    </div>
                </div>
            </main>
        </Layout>
    );
}

