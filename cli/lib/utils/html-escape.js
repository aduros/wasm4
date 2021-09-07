/**
 * @param {string} jsToInline
 * @returns {string}
 * @see https://mathiasbynens.be/notes/etago#html5
 * @see https://html.spec.whatwg.org/multipage/parsing.html#script-data-end-tag-open-state
 * @see https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
 */
function escapeJsContentToInline(jsToInline) {
    return jsToInline.replace(/<\//g, '<\\u002F').replace(/<!/g, '<\\u0021');
}

/**
 * @param {string} cssToInline
 * @returns {string}
 * @see https://mathiasbynens.be/notes/etago#html5
 * @see https://html.spec.whatwg.org/multipage/parsing.html#script-data-end-tag-open-state
 * @see https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
 */
function escapeCssContentToInline(cssToInline) {
    return cssToInline.replace(/<\//g, '<\\002F').replace(/<!/g, '<\\0021');
}

module.exports = { escapeJsContentToInline, escapeCssContentToInline };
