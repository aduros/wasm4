const fs = require('fs').promises;
const path = require('path');
const htmlEscape = require('htmlescape');
const z85 = require('./utils/z85');
const Handlebars = require('handlebars');
const pkg = require('../package.json');

async function compileTemplate() {
    const templateSource = await fs.readFile(
        path.resolve(__dirname, '../assets/bundle/html-page.hbs'),
        { encoding: 'utf-8' }
    );

    return Handlebars.compile(templateSource);
}

async function bundle(cartFile, opts) {
    const runtimeDir = path.resolve(__dirname, '../assets/runtime');
    const wasm4CssFilepath = path.resolve(runtimeDir, './wasm4.css');
    const wasm4jsFilepath = path.resolve(runtimeDir, './wasm4.js');

    const outFile = opts.html;
    if (outFile == null) {
        throw new Error('You must specify one or more bundle outputs.');
    }

    if (!require('fs').existsSync(outFile)) {
        await fs.mkdir(path.dirname(outFile), {
            recursive: true,
        });
    }

    let [cart, wasm4Css, wasm4js] = await Promise.all([
        fs.readFile(cartFile),
        fs.readFile(wasm4CssFilepath, 'utf8'),
        fs.readFile(wasm4jsFilepath, 'utf8'),
    ]);

    // @see https://mathiasbynens.be/notes/etago#html5
    // @see https://html.spec.whatwg.org/multipage/parsing.html#script-data-end-tag-open-state
    wasm4js = wasm4js.replace(/<\//g, '\\u003C\\u002F');
    wasm4Css = wasm4Css.replace(/<\//g, '\\003C\\002F');

    // @see https://www.npmjs.com/package/htmlescape
    const wasmCartJson = htmlEscape({
        WASM4_CART: z85.encode(cart),
        WASM4_CART_SIZE: cart.length,
    });

    const buildInfo = [{ value: pkg.version, name: 'wasm4-version' }];

    if (opts.timestamp) {
        buildInfo.push({
            value: new Date().toISOString(),
            name: 'created-at',
        });
    }

    const bundleTemplate = await compileTemplate();

    const outFileContent = bundleTemplate({
        html: {
            title: opts.title,
            desc: opts.desc,
            wasmCartJson,
            wasm4Css,
            wasm4js,
        },
        buildInfo,
        opts,
    });

    await fs.writeFile(outFile, outFileContent);

    console.log(`OK! Bundled ${outFile}.`);
}

exports.run = bundle;
