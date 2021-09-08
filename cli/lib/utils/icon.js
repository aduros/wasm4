const fs = require('fs').promises;
const path = require('path');

const mapSupportedFileExtensionToMimeType = {
    png: 'image/png',
    ico: 'image/x-icon',
    svg: 'image/svg+xml',
};

function supportedIconExtensions() {
    return Object.keys(mapSupportedFileExtensionToMimeType);
}

/**
 * Acquires image from file, then returns it as data url.
 * @param {string} filePath
 * @returns {string}
 */
async function iconToBase64DataUrl(filePath) {
    const fileExt = path.extname(filePath).toLowerCase().replace(/\W+/g, '');
    const mimeType = mapSupportedFileExtensionToMimeType[fileExt];

    if (!fileExt || !mimeType) {
        throw new TypeError(
            `icon: unsupported file ext "${fileExt}". Filepath: "${filePath}"`
        );
    }

    const buffer = await fs.readFile(filePath);
    const asBase64 = buffer.toString('base64');

    return `data:${mimeType};base64,${asBase64}`;
}

module.exports = { iconToBase64DataUrl, supportedIconExtensions };
