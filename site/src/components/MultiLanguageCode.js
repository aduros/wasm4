import React from 'react';
import MultiLanguage, {Page} from "./MultiLanguage";

const classNameToLanguage = {
    "language-typescript": "assemblyscript",
    "language-javascript": "assemblyscript",
    "language-c": "c",
    "language-cpp": "c",
    "language-d": "d",
    "language-lua": "nelua",
    "language-nelua": "nelua",
    "language-nim": "nim",
    "language-rust": "rust",
    "language-go": "go",
    "language-odin": "odin",
    "language-wasm": "wat",
    "language-zig": "zig",
};

export default function MultiLanguageCode (props) {
    const pages = props.children.map((child, idx) => (
        <Page key={idx} value={classNameToLanguage[child.props.children.props.className]}>
            {child}
        </Page>
    ));

    return (
        <MultiLanguage>
            { pages }
        </MultiLanguage>
    );
}
