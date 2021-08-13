import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function PlayButton ({ slug, title, author, github }) {
    return (
        <div className="col col--3 margin-top--lg">
          <div className="cart card">
            <Link to={`/play/${slug}`}>
                <div className="card__image">
                  <img
                    src={`/carts/${slug}.png`}
                    alt={title}
                    className="screenshot"
                  />
                </div>
                <div className="card__footer">
                  <div className="avatar">
                    <img
                        className="avatar__photo"
                        src={`https://github.com/${github}.png?size=128`}
                    />
                    <div className="avatar__intro">
                        <div className="avatar__name">{title}</div>
                        <small className="avatar__subtitle">by {author}</small>
                    </div>
                  </div>
                </div>
            </Link>
          </div>
        </div>
    );
}

export default function Carts ({ carts }) {
    const cartButtons = carts.map(cart => (<PlayButton key={cart.slug} { ...cart } />));
    return (
        <Layout title="Play">
            <main>
                <div className="container container--fluid margin-vert--lg">
                    <div className="text--center">
                        <h1>Newest Games</h1>
                        <p>Games and experiments built by users.</p>
                        <p><a className="button button--primary button--outline" target="_blank" href="https://github.com/aduros/wasm4/site/carts.js">+ Add Your Game</a></p>
                    </div>
                    <div className="row">
                        {cartButtons}
                    </div>
                </div>
            </main>
        </Layout>
    );
}

