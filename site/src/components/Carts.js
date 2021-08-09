import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function PlayButton ({ id, title, author, github }) {
    return (
        <div className="col col--3 margin-top--lg">
          <div className="cart card">
            <Link to={`/play/${id}`}>
                <div className="card__image">
                  <img
                    src="https://placekitten.com/160"
                    alt="{{title}}"
                    className="screenshot"
                  />
                </div>
                <div class="card__footer">
                  <div class="avatar">
                    <img
                        class="avatar__photo"
                        src={`https://github.com/${github}.png?size=128`}
                    />
                    <div class="avatar__intro">
                        <div class="avatar__name">{title}</div>
                        <small class="avatar__subtitle">by {author}</small>
                    </div>
                  </div>
                </div>
            </Link>
          </div>
        </div>
    );
}

export default function Carts ({ carts }) {
    const cartButtons = carts.map(cart => (<PlayButton key={cart.id} { ...cart } />));
    return (
        <Layout title="Play">
            <main>
                <div className="container">
                    <div className="row">
                        {cartButtons}
                    </div>
                </div>
            </main>
        </Layout>
    );
}

