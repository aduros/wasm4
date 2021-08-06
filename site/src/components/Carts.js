import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function PlayButton ({ id, title, author }) {
    return (
        <div className="cart">
            <Link to={`/play/${id}`}>{title} by {author}</Link>
        </div>
    );
}

export default function Carts ({ carts }) {
    const cartButtons = carts.map(cart => (<PlayButton key={cart.id} { ...cart } />));
    return (
        <Layout title="Play">
            <main>
                <div className="container">{cartButtons}</div>
            </main>
        </Layout>
    );
}

