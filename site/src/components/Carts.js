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
                    <div className="text--center">
                        <h1>Newest Games</h1>
                        <p>Games and experiments built by users.</p>
                        <p><a className="button button--primary button--outline" target="_blank" href="https://github.com/aduros/wasm4/blob/main/site/carts.js">+ Add Your Game</a></p>
                    </div>
                    <div className="row">
                        {cartButtons}
                    </div>
                </div>
            </main>
        </Layout>
    );
}

