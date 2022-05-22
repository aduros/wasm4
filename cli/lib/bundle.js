const fs = require('fs').promises;
const path = require('path');
const z85 = require('./utils/z85');
const {
    escapeJsContentToInline,
    escapeCssContentToInline,
    stringifyForJSONScript,
} = require('./utils/html-escape');
const { iconToBase64DataUrl } = require('./utils/icon');
const Mustache = require('mustache');
const pkg = require('../package.json');

async function bundleHtml (cartFile, htmlFile, opts) {
    const runtimeDir = path.resolve(__dirname, '../assets/runtime/slim');
    const wasm4CssFilepath = path.resolve(runtimeDir, './wasm4.css');
    const wasm4JsFilepath = path.resolve(runtimeDir, './wasm4.js');

    if (!require('fs').existsSync(htmlFile)) {
        await fs.mkdir(path.dirname(htmlFile), {
            recursive: true,
        });
    }

    let iconPromise = opts.iconUrl;

    if (opts.iconFile) {
        iconPromise = iconToBase64DataUrl(opts.iconFile);
    }

    let [cart, wasm4Css, wasm4js, iconUrl] = await Promise.all([
        fs.readFile(cartFile),
        fs.readFile(wasm4CssFilepath, 'utf8'),
        fs.readFile(wasm4JsFilepath, 'utf8'),
        iconPromise,
    ]);

    wasm4js = escapeJsContentToInline(wasm4js);
    wasm4Css = escapeCssContentToInline(wasm4Css);

    const wasmCartJson = stringifyForJSONScript({
        WASM4_CART: z85.encode(cart),
        WASM4_CART_SIZE: cart.length,
    });

    const metadata = [{ content: `WASM-4 ${pkg.version}`, name: 'generator' }];

    if (opts.timestamp) {
        metadata.push({
            content: new Date().toISOString(),
            name: 'created',
        });
    }

    const template = await fs.readFile(
        (opts.htmlTemplate != null) ? opts.htmlTemplate : path.resolve(__dirname, '../assets/bundle/template.html'),
        { encoding: 'utf-8' }
    );

    const htmlFileContent = Mustache.render(template, {
        html: {
            title: opts.title,
            description: opts.description,
            diskPrefix: (opts.htmlDiskPrefix != null) ? opts.htmlDiskPrefix : opts.title,
            wasmCartJson,
            wasm4Css,
            wasm4js,
            iconUrl,
            metadata,
        },
        opts,
    });

    await fs.writeFile(htmlFile, htmlFileContent);

    console.log(`✔ Bundled ${htmlFile}`);
}

async function bundleExecutable (cartFile, sourceFile, outputFile, opts) {
    const [source, cart] = await Promise.all([
        fs.readFile(sourceFile),
        fs.readFile(cartFile),
    ]);

    // FileFooter metadata for the native runtime to read
    const footer = Buffer.alloc(136);
    footer.writeInt32LE(1414676803, 0); // magic
    footer.write(opts.title, 4, 127); // title
    footer.writeInt32LE(cart.length, 132); // cartLength

    const output = Buffer.concat([source, cart, footer]);
    await fs.writeFile(outputFile, output);

    // Make sure it's executable
    await fs.chmod(outputFile, "775");

    console.log(`✔ Bundled ${outputFile}`);
}

async function bundle(cartFile, opts) {
    if (!opts.html && !opts.windows && !opts.mac && !opts.linux) {
        throw new Error('You must specify one or more bundle outputs.');
    }

    const limit = 1 << 16;
    const stat = await fs.stat(cartFile);
    if (stat.size > limit) {
        throw new Error(`Cart size of ${stat.size} bytes is above the limit of ${limit} bytes.`);
    }

    if (opts.html) {
        await bundleHtml(cartFile, opts.html, opts);
    }
    if (opts.windows) {
        await bundleExecutable(cartFile,
            path.resolve(__dirname, "../assets/natives/wasm4-windows.exe"), opts.windows, opts);
    }
    if (opts.mac) {
        await bundleExecutable(cartFile,
            path.resolve(__dirname, "../assets/natives/wasm4-mac"), opts.mac, opts);
    }
    if (opts.linux) {
        await bundleExecutable(cartFile,
            path.resolve(__dirname, "../assets/natives/wasm4-linux"), opts.linux, opts);
    }
}

exports.run = bundle;
