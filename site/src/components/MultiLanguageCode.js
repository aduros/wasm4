import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

const LABELS = {
    "language-cpp": "C / C++",
    "language-d": "D",
    "language-typescript": "AssemblyScript",
    "language-nim": "Nim",
    "language-rust": "Rust",
    "language-go": "Go",
    "language-odin": "Odin",
    "language-zig": "Zig",
};

function getLanguage (component) {
    // Pull the class name out of the rendered code block. No idea how reliable this is.
    const lang = component.props.children.props.className;

    // Treat C the same as C++ and JS the same as TS
    if (lang == "language-c") {
        return "language-cpp";
    }
    if (lang == "language-javascript") {
        return "language-typescript";
    }

    return lang;
}

export default function MultiLanguageCode (props) {
    const tabItems = props.children.map(child => (
        <TabItem value={ getLanguage(child) }>{ child }</TabItem>
    ));

    return (
        <Tabs
          groupId="code-language"
          defaultValue="language-typescript"
          values={ props.children.map(child => {
              const lang = getLanguage(child);
              return { label: LABELS[lang], value: lang };
          }) }
        >
            { tabItems }
        </Tabs>
    );
}
