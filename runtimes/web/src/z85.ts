// Encodes binary data into text, like base64 but more efficient.
//
// Implements http://rfc.zeromq.org/spec:32
// Ported from https://github.com/zeromq/libzmq/blob/8cda54c52b08005b71f828243f22051cdbc482b4/src/zmq_utils.cpp#L77-L168

const ENCODER = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#".split("");

const DECODER = [
    0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00,
    0x4B, 0x4C, 0x46, 0x41, 0x00, 0x3F, 0x3E, 0x45,
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47,
    0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A,
    0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32,
    0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A,
    0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00,
    0x00, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10,
    0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
    0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20,
    0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00
];

export function encode (src: number[] | Uint8Array | Uint8ClampedArray): string {
    const size = src.length;
    const extra = (size % 4);
    const paddedSize = extra ? size + 4-extra : size;

	let str = "",
		byte_nbr = 0,
		value = 0;
	while (byte_nbr < paddedSize) {
        const b = (byte_nbr < size) ? src[byte_nbr] : 0;
        ++byte_nbr;
		value = (value * 256) + b;
		if ((byte_nbr % 4) == 0) {
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

export function decode (string: string, dest: number[] | Uint8Array | Uint8ClampedArray): number {
    let byte_nbr = 0,
        char_nbr = 0,
        value = 0;
    const string_len = string.length,
        dest_len = dest.length;

    if ((string.length % 5) == 0) {
        while (char_nbr < string_len) {
            const idx = string.charCodeAt(char_nbr++) - 32;
            if ((idx < 0) || (idx >= DECODER.length)) {
                return byte_nbr;
            }
            value = (value * 85) + DECODER[idx];
            if ((char_nbr % 5) == 0) {
                let divisor = 256 * 256 * 256;
                while (divisor >= 1) {
                    if (byte_nbr >= dest_len) {
                        return byte_nbr;
                    }
                    dest[byte_nbr++] = (value / divisor) % 256;
                    divisor /= 256;
                }
                value = 0;
            }
        }
    }

    return byte_nbr;
}
