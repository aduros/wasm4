import React, {useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import PlayButton from "./PlayButton";

export default function Carts ({ carts }) {
    const [showGames, setShowGames] = useState(true);
    const [showExperiments, setShowExperiments] = useState(true);

    const cartButtons = carts
        .filter(cart => {
            switch (cart.type) {
                case "game":
                    return showGames;
                case "experiment":
                    return showExperiments;
                default:
                    return true;
            }
        })
        .map(cart => (
            <PlayButton
                key={cart.slug}
                slug={cart.slug}
                title={cart.title}
                author={cart.authors.map(a => a.name).join(', ')}
            />
        ));

    return (
        <Layout title="Play">
            <main>
                <div className="container container--fluid margin-vert--lg">
                    <div className="text--center margin-bottom--lg">
                        <h1>Newest Games</h1>
                        <p>Games and experiments built by users.</p>
                        <p><Link className="button button--primary button--outline" href="/docs/guides/distribution#publish-on-wasm4org">+ Add Your Game</Link></p>
                        <form>
                            <div>
                                <label>
                                    <input type="checkbox" checked={showGames} onChange={event => setShowGames(event.target.checked || !showExperiments)} />
                                    Games
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input type="checkbox" checked={showExperiments} onChange={event => setShowExperiments(event.target.checked || !showGames)} />
                                    Experiments
                                </label>
                            </div>
                        </form>
                    </div>
                    <div className="row margin-top--lg">
                        {cartButtons}
                    </div>
                </div>
            </main>
        </Layout>
    );
}

