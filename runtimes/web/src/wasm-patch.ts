type PatchSlice = [0, number, number] | [1, Uint8Array];

const WASM_SECTION_GLOBAL = 6;
const WASM_SECTION_EXPORTS = 7;
const WASM_EXPORT_GLOBAL = 3;

export function wasmPatchExportGlobals(data: Uint8Array): Uint8Array {
    // Make sure binary is valid WASM
    const view = new DataView(data.buffer);
    const magic = view.getUint32(0);
    const version = view.getUint32(4, true);
    if (magic !== 0x0061736d || version !== 0x1) {
        throw new Error('Invalid WASM binary');
    }
    let dataI = 8;

    // Iterate all sections and begin patching
    const outputSlices: PatchSlice[] = [];
    let globalCount = 0, lastCut = 0, secSize;
    while (dataI < data.byteLength) {
        const secType = data[dataI];
        const secRawStartI = dataI;
        [secSize, dataI] = uleb128Decode(data, dataI + 1);
        const secRawEndI = dataI + secSize;
        let secI = dataI;
        dataI += secSize;

        if (secType === WASM_SECTION_GLOBAL) {
            globalCount += uleb128Decode(data, secI)[0];
        } else if (secType === WASM_SECTION_EXPORTS) {
            // Push everything up until this section into output and "ignore" this section
            outputSlices.push([0, lastCut, secRawStartI]);
            lastCut = secRawEndI;

            // Iterate all current exports and see which globals are missing
            const exportedGlobals = new Set<number>();
            const exportSlices: PatchSlice[] = [];
            let exCount, exNameLen, exIdx;
            [exCount, secI] = uleb128Decode(data, secI);
            for (let exI = 0; exI < exCount; exI++) {
                const exStart = secI;
                [exNameLen, secI] = uleb128Decode(data, secI);
                secI += exNameLen;
                const exType = data[secI++];
                [exIdx, secI] = uleb128Decode(data, secI);
                if (exType === WASM_EXPORT_GLOBAL) {
                    exportedGlobals.add(exIdx);
                }
                exportSlices.push([0, exStart, secI]);
            }

            // Add exports for missing globals
            for (let glI = 0; glI < globalCount; glI++) {
                if (!exportedGlobals.has(glI)) {
                    const nameBytes = new TextEncoder().encode(`__global_${glI}`);
                    const nameLenBytes = uleb128Encode(nameBytes.length);
                    const exIdxBytes = uleb128Encode(glI);
                    const exBytes = new Uint8Array(nameBytes.length + nameLenBytes.length + exIdxBytes.length + 1);
                    exBytes.set(nameLenBytes);
                    exBytes.set(nameBytes, nameLenBytes.length);
                    exBytes[nameLenBytes.length + nameBytes.length] = WASM_EXPORT_GLOBAL;
                    exBytes.set(exIdxBytes, nameLenBytes.length + nameBytes.length + 1);
                    exportSlices.push([1, exBytes]);
                }
            }

            // Push new export section
            const newExCountBytes = uleb128Encode(exportSlices.length);
            const newExListBytes = joinPatchSlices(data, exportSlices);
            const newExSize = uleb128Encode(newExCountBytes.length + newExListBytes.length);
            outputSlices.push([1, new Uint8Array([WASM_SECTION_EXPORTS])]);
            outputSlices.push([1, newExSize]);
            outputSlices.push([1, newExCountBytes]);
            outputSlices.push([1, newExListBytes]);
        }
    }
    // Push leftovers into output
    outputSlices.push([0, lastCut, dataI]);

    return joinPatchSlices(data, outputSlices);
}

function joinPatchSlices(source: Uint8Array, slices: PatchSlice[]): Uint8Array {
    const totalSize = slices.reduce((a, v) => a + (v[0] === 0 ? v[2] - v[1] : v[1].length), 0);
    const outBuf = new Uint8Array(totalSize);
    let outBufI = 0;
    for (const slice of slices) {
        if (slice[0] === 0) {
            outBuf.set(source.slice(slice[1], slice[2]), outBufI);
            outBufI += slice[2] - slice[1];
        } else {
            outBuf.set(slice[1], outBufI);
            outBufI += slice[1].length;
        }
    }
    return outBuf;
}

function uleb128Encode(num: number): Uint8Array {
    const output: number[] = [];
    do {
        const low = num & 0x7f;
        num >>= 7;
        output.push(num ? (low | 0x80) : low);
    } while (num);
    return new Uint8Array(output);
}

function uleb128Decode(view: Uint8Array, offset: number = 0): [number, number] {
    let byte = 0, result = 0, shift = 0;
    do {
        byte = view[offset++];
        result |= (byte & 0x7f) << shift;
        shift += 7;
    } while (byte & 0x80);
    return [result, offset];
}
