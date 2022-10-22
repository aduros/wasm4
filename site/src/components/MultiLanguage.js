import React, {useState, cloneElement, Children, useRef, useEffect, useLayoutEffect } from 'react';
import Link from '@docusaurus/Link';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';
import useUserPreferencesContext from '@theme/hooks/useUserPreferencesContext';

import "./MultiLanguage.css";

const names = {
    "assemblyscript": "AssemblyScript",
    "c": "C / C++",
    "d": "D",
    "go": "Go",
    "nelua": "Nelua",
    "nim": "Nim",
    "odin": "Odin",
    "porth": "Porth",
    "roland": "Roland",
    "rust": "Rust",
    "wat": "WebAssembly Text",
    "zig": "Zig",
};

/**
 * @type {(val: unknown) => val is keyof typeof names}
 */
function isValidLanguageValue(value) {
    return typeof value === 'string' && Object.prototype.hasOwnProperty.call(names, value);
}

/**
 * @type {(val: string | null | undefined) => string}
 */
function normalizeLanguageValue(val) {
    return (val ?? '').trim().toLowerCase()
}

export function Page ({children, hidden, className}) {
    return (
        <div {...{hidden, className}}>
            {children}
        </div>
    );
}

/**
 * @type {() => { activeLang: string, updateLang: (nextLang: string) => void}}
 */
function useLanguageCode() {
    const {tabGroupChoices, setTabGroupChoices} = useUserPreferencesContext();
    const [activeLang, setActiveLang] = useState("assemblyscript");

    /**
     * @type {(val: string) => void}
     */
    const updateLang = (value) => {
        const isValid = isValidLanguageValue(value);

        if(isValid) {
            setActiveLang(value);
            setTabGroupChoices("language", value);
        } else if(!isValid) {
            console.warn(`MultilanguageCode: invalid code-lang received: "${value}"`);
        }
    };

    // @see https://overreacted.io/making-setinterval-declarative-with-react-hooks/
    const updateLangRef = useRef(updateLang);

    useEffect(()=> {
        updateLangRef.current = updateLang;
    });

    const search = (typeof window !== 'undefined' ? window.location.search : '');
    const rawLanguagePreference = tabGroupChoices.language;

    useLayoutEffect(() => {
        const langFromPreferences = normalizeLanguageValue(rawLanguagePreference);

        if(isValidLanguageValue(langFromPreferences)) {
            setActiveLang(langFromPreferences);
        }

    }, [rawLanguagePreference]);

    useEffect(() => {
        const currentQueryParams = new URLSearchParams(search);
        const langFromQueryParams = normalizeLanguageValue(currentQueryParams.get('code-lang'));

        if(isValidLanguageValue(langFromQueryParams)) {
            updateLangRef.current(langFromQueryParams);
        }
    }, [search])

   return { activeLang, updateLang };
}


export default function MultiLanguage (props) {
    const children = Children.toArray(props.children);
    const languages = children.map(child => child.props.value);
    const { activeLang } = useLanguageCode();
    const history = useHistory();
    const activeSupportedLang =
        languages.includes(activeLang)
        ? activeLang
        : languages.includes('assemblyscript')
        ? 'assemblyscript'
        : languages[0];

    const dropdown = (
        <div className="dropdown dropdown--hoverable dropdown--right">
            <a className="navbar__link">{names[activeSupportedLang]} </a>
            <ul className="dropdown__menu text--left">
                {Object.entries(names).filter(names => languages.includes(names[0])).map(([value, name]) => {
                    // We use `#no-scroll` to prevent scroll to top on page change.
                    // @see https://github.com/facebook/docusaurus/blob/73ee356949e6baf70732c69cf6be8d8919f3f75a/packages/docusaurus/src/client/PendingNavigation.tsx#L79
                    const to = `${history.location.pathname}?code-lang=${value}${history.location.hash || '#no-scroll'}`

                    return (<li key={value}>
                        <Link
                          to={to}
                          replace
                          className={clsx('dropdown__link', value === activeSupportedLang && "dropdown__link--active")}
                        >
                        {name}
                        </Link>
                    </li>);
                }

                )}
            </ul>
        </div>
    );

    return (
        <div>
            <div className="multilang">
                {dropdown}
            </div>
            <div>
                {children.map((item) =>
                    cloneElement(item, {
                        key: item.props.value,
                        hidden: item.props.value !== activeSupportedLang,
                    })
                )}
            </div>
        </div>
    );
}
