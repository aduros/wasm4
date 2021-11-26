import React from 'react';
import MultiLanguage, {Page} from "./MultiLanguage";

const values = {
    "language-typescript": "assemblyscript",
    "language-javascript": "assemblyscript",
    "language-c": "c",
    "language-cpp": "c",
    "language-d": "d",
    "language-nim": "nim",
    "language-rust": "rust",
    "language-go": "go",
    "language-odin": "odin",
    "language-zig": "zig",
};

export default function MultiLanguageCode (props) {
    const pages = props.children.map(child => (
        <Page value={values[child.props.children.props.className]}>
            {child}
        </Page>
    ));

    return (
        <MultiLanguage>
            { pages }
        </MultiLanguage>
    );
}
