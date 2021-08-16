import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function PlayButton ({ slug, title, author, github }) {
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
