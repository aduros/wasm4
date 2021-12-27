import React, {useState, cloneElement, Children, useRef, useEffect } from 'react';
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
    "rust": "Rust",
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
        setActiveLang(value);
        setTabGroupChoices("language", value);
    };

    // @see https://overreacted.io/making-setinterval-declarative-with-react-hooks/
    const updateLangRef = useRef(updateLang);

    useEffect(()=> {
        updateLangRef.current = updateLang;
    });

    const search = (typeof window !== 'undefined' ? window.location.search : '');
    const rawLanguagePreference = tabGroupChoices.language;

    useEffect(() => {
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
    const { activeLang, updateLang } = useLanguageCode();

    const dropdown = (
        <div className="dropdown dropdown--hoverable dropdown--right">
            <a className="navbar__link">{names[activeLang]} </a>
            <ul className="dropdown__menu text--left">
                {Object.entries(names).map(([value, name]) => 
                    <li key={value}>
                        <a className={`dropdown__link ${value == activeLang ? "dropdown__link--active" : ""}`}
                            onClick={() => updateLang(value)}>
                            {name}
                        </a>
                    </li>
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
                        hidden: item.props.value !== activeLang,
                    })
                )}
            </div>
        </div>
    );
}
