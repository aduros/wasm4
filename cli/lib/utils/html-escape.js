/**
 * Escapes input `jsToInline` in order to be safely interpolated as
 * without additional escaping.
 *
 * ```html
 * <script>{{{jsToInline}}}</script>
 * ```
 * without additional escaping.
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
 * Escapes input `cssToInline` in order to be safely interpolated as
 *
 * ```html
 * <style>{{{cssToInline}}}</style>
 * ```
 * without additional escaping.
 * @param {string} cssToInline
 * @returns {string}
 * @see https://mathiasbynens.be/notes/etago#html5
 * @see https://html.spec.whatwg.org/multipage/parsing.html#script-data-end-tag-open-state
 * @see https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
 */
function escapeCssContentToInline(cssToInline) {
    return cssToInline.replace(/<\//g, '<\\002F').replace(/<!/g, '<\\0021');
}

/**
 * Serialize input and escapes its string representation in order to be safely interpolated as
 * ```html
 * <script type="application/json">{{{jsValueToSerialize}}}</script>
 * ````
 * without additional escaping.
 * @param {any} jsValueToSerialize
 * @returns {string}
 * @see https://mathiasbynens.be/notes/etago#html5
 * @see https://html.spec.whatwg.org/multipage/parsing.html#script-data-end-tag-open-state
 * @see https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
 */
function stringifyForJSONScript(jsValueToSerialize) {
    return escapeJsContentToInline(JSON.stringify(jsValueToSerialize));
}

module.exports = {
    escapeJsContentToInline,
    escapeCssContentToInline,
    stringifyForJSONScript,
};
