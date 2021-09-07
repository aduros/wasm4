/**
 * @param {Buffer|string|Array<number>|Uint8Array} src
 * @returns {string}
 */
function encode(src) {
    const ENCODER =
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#'.split(
            ''
        );

    const size = src.length;
    const extra = size % 4;
    const paddedSize = extra ? size + 4 - extra : size;

    let str = '',
        byte_nbr = 0,
        value = 0;
    while (byte_nbr < paddedSize) {
        const b = byte_nbr < size ? src[byte_nbr] : 0;
        ++byte_nbr;
        value = value * 256 + b;
        if (byte_nbr % 4 == 0) {
            let divisor = 85 * 85 * 85 * 85;
            while (divisor >= 1) {
                const idx = Math.floor(value / divisor) % 85;
                str += ENCODER[idx];
                divisor /= 85;
            }
            value = 0;
        }
    }

    return str;
}

module.exports = { encode };
