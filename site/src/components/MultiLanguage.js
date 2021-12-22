import React, {useState, cloneElement, Children} from 'react';
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

export function Page ({children, hidden, className}) {
    return (
        <div {...{hidden, className}}>
            {children}
        </div>
    );
}

export default function MultiLanguage (props) {
    const children = Children.toArray(props.children);
    const {tabGroupChoices, setTabGroupChoices} = useUserPreferencesContext();
    const [selectedValue, setSelectedValue] = useState("assemblyscript");

    function handleChange (value) {
        // TODO(2021-11-26): Hide the dropdown?
        setSelectedValue(value);
        setTabGroupChoices("language", value);
    }

    const relevantTabGroupChoice = tabGroupChoices.language;
    if (relevantTabGroupChoice != null && relevantTabGroupChoice != selectedValue) {
        setSelectedValue(relevantTabGroupChoice);
    }

    const dropdown = (
        <div className="dropdown dropdown--hoverable dropdown--right">
            <a className="navbar__link">{names[selectedValue]} </a>
            <ul className="dropdown__menu text--left">
                {Object.entries(names).map(([value, name]) => 
                    <li>
                        <a className={`dropdown__link ${value == selectedValue ? "dropdown__link--active" : ""}`}
                            onClick={() => handleChange(value)}>
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
                {children.map((item, i) =>
                    cloneElement(item, {
                        key: i,
                        hidden: item.props.value !== selectedValue,
                    })
                )}
            </div>
        </div>
    );
}
