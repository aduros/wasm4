const fs = require("fs");
const { run, runAll } = require("../png2src");

function convertHexArrayToString(hexArray, prefix, separator) {
  return hexArray.map(hex => `${prefix}${hex.toString(16).padStart(2, '0')}`).join(separator);
}

describe("PNG2SRC", () => {
  describe("run function", () => {
    const testCases = [
      {
        title: "Two-color sprite - 8x8",
        filePath: __dirname + "/data/smile_8x8_1BPP.png",
        expectedBytes: [
          0b11000011,
          0b10000001,
          0b00100100,
          0b00100100,
          0b00000000,
          0b00100100,
          0b10011001,
          0b11000011,
        ],
        height: 8,
        width: 8,
        flags: 0,
        flagsHumanReadable: "BLIT_1BPP",
        bpp: 1,
        name: "smile_8x8_1BPP",
        rustName: "SMILE_8X8_1_B_P_P",
        odinName: "smile_8x8_1_b_p_p",
        odinFlags: "nil"
      },
      {
        title: "Four-color sprite - 8x8",
        filePath: __dirname + "/data/smile_8x8_2BPP.png",
        expectedBytes: [
          0b11110000, 0b00001111,
          0b11000000, 0b00000011,
          0b00000100, 0b00010000,
          0b00000100, 0b00010000,
          0b00000000, 0b00000000,
          0b00001000, 0b00100000,
          0b11000010, 0b10000011,
          0b11110000, 0b00001111,
        ],
        height: 8,
        width: 8,
        flags: 1,
        flagsHumanReadable: "BLIT_2BPP",
        bpp: 2,
        name: "smile_8x8_2BPP",
        rustName: "SMILE_8X8_2_B_P_P",
        odinName: "smile_8x8_2_b_p_p",
        odinFlags: "{ .USE_2BPP }"
      },
      {
        title: "bunny sprite",
        filePath: __dirname + "/../../../site/static/img/bunny.png",
        expectedBytes: [
          0xaa, 0x9e, 0xac, 0xaa, 0xaa, 0x57, 0xbf, 0x2a,
          0xaa, 0x57, 0xbf, 0x2a, 0xaa, 0x17, 0xbf, 0x2a,
          0xaa, 0x17, 0x03, 0x2a, 0xaa, 0x57, 0x54, 0x2a,
          0xa8, 0x55, 0x55, 0x6a, 0xa9, 0x55, 0x05, 0x0a,
          0xaf, 0xd5, 0x55, 0x4a, 0xa8, 0x75, 0x55, 0x4a,
          0xaa, 0xd5, 0x57, 0x2a, 0xaa, 0x1d, 0x7c, 0xaa,
          0xa8, 0x75, 0x15, 0x2a, 0xa8, 0x45, 0x15, 0x2a,
          0xaa, 0x10, 0x54, 0xaa, 0xaa, 0x85, 0x52, 0xaa
        ],
        height: 16,
        width: 16,
        flags: 1,
        flagsHumanReadable: "BLIT_2BPP",
        bpp: 2,
        name: "bunny",
        rustName: "BUNNY",
        odinName: "bunny",
        odinFlags: "{ .USE_2BPP }"
      },
      {
        title: "Two-color sprite - 7x7 - with a width not dividable by eight",
        filePath: __dirname + "/data/smile_7x7_1BPP.png",
        expectedBytes: [0xc7, 0x75, 0x53, 0xe4, 0x57, 0x71, 0x80],
        height: 7,
        width: 7,
        flags: 0,
        flagsHumanReadable: "BLIT_1BPP",
        bpp: 1,
        name: "smile_7x7_1BPP",
        rustName: "SMILE_7X7_1_B_P_P",
        odinName: "smile_7x7_1_b_p_p",
        odinFlags: "nil"
      },
      {
        title: "Four-color sprite - 7x7 - with a width not dividable by eight",
        filePath: __dirname + "/data/smile_7x7_2BPP.png",
        expectedBytes: [0xf0, 0x3f, 0x15, 0x31, 0x99, 0x05, 0x54, 0x1a, 0x93, 0x15, 0x3f, 0x03, 0xc0],
        height: 7,
        width: 7,
        flags: 1,
        flagsHumanReadable: "BLIT_2BPP",
        bpp: 2,
        name: "smile_7x7_2BPP",
        rustName: "SMILE_7X7_2_B_P_P",
        odinName: "smile_7x7_2_b_p_p",
        odinFlags: "{ .USE_2BPP }"
      },
    ];

    testCases.forEach(testCase => {
      it(`should handle ${testCase.title} correctly`, () => {
        const result = run(testCase.filePath);

        expect(result.height).toBe(testCase.height);
        expect(result.width).toBe(testCase.width);

        expect(result.flags).toBe(testCase.flags);
        expect(result.flagsHumanReadable).toBe(testCase.flagsHumanReadable);
        expect(result.bpp).toBe(testCase.bpp);
        expect(result.name).toBe(testCase.name);
        expect(result.rustName).toBe(testCase.rustName);
        expect(result.odinName).toBe(testCase.odinName);
        expect(result.odinFlags).toBe(testCase.odinFlags);

        expect(result.length).toBe(testCase.expectedBytes.length);
        expect(result.bytes).toBe(convertHexArrayToString(testCase.expectedBytes, "0x", ','));
        expect(result.charBytes).toBe(convertHexArrayToString(testCase.expectedBytes, "\\x", ''));
        expect(result.firstByte).toBe(convertHexArrayToString([testCase.expectedBytes[0]], "0x", ','));
        expect(result.restBytes).toBe(convertHexArrayToString(testCase.expectedBytes.slice(1), "0x", ','));
        expect(result.wasmBytes).toBe(convertHexArrayToString(testCase.expectedBytes, "\\", ''));
        expect(result.porthBytes).toBe(convertHexArrayToString(testCase.expectedBytes, "\\\\", ''));
      });
    });

    it("should throw an error for too many colors", () => {
      const pngPath = __dirname + "/data/smile_8x8_5colors.png";
      expect(() => run(pngPath)).toThrowError(/Too many colors:/);
    });
  });
});


describe("PNG2SRC", () => {
  describe("runAll function", () => {
    beforeEach(() => {
      // Replace console functions with a spy
      jest.spyOn(console, 'error').mockImplementation(() => { });
      jest.spyOn(console, 'log').mockImplementation(() => { });
      jest.spyOn(fs, 'writeFileSync').mockReset();
    });

    afterEach(() => {
      // Restore originals after tests
      jest.restoreAllMocks();
    });

    it("should throw an error for invalid template path", () => {
      expect(() =>
        runAll([__dirname + "/data/smile_8x8_1BPP.png"], {
          template: "/invalid/path",
          lang: "rust",
          output: "-",
        })
      ).toThrow(/ENOENT: no such file or directory/);
    });

    it("should abort and output an error message for invalid image paths", () => {
      expect(() => 
        runAll(["/invalid/path"], {
        lang: "rust",
        output: "-",
      })).toThrowError(/Error processing \/invalid\/path: ENOENT: no such file or directory, stat '\/invalid\/path'/);
    });

    it("should console log one sprite", () => {
      runAll([__dirname + "/data/smile_8x8_1BPP.png"], {
        lang: "c",
        output: "-",
      });
      expect(console.log).toHaveBeenCalledWith(
        "// smile_8x8_1BPP\n" +
        "#define smile_8x8_1BPPWidth 8\n" +
        "#define smile_8x8_1BPPHeight 8\n" +
        "#define smile_8x8_1BPPFlags BLIT_1BPP\n" +
        "const uint8_t smile_8x8_1BPP[8] = { 0xc3,0x81,0x24,0x24,0x00,0x24,0x99,0xc3 };\n\n");
    });

    it("should write one sprite", () => {
      runAll([__dirname + "/data/smile_8x8_1BPP.png"], {
        lang: "c",
        output: "output.h",
      });

      expect(fs.writeFileSync).toHaveBeenCalledWith('output.h',
        "// smile_8x8_1BPP\n" +
        "#define smile_8x8_1BPPWidth 8\n" +
        "#define smile_8x8_1BPPHeight 8\n" +
        "#define smile_8x8_1BPPFlags BLIT_1BPP\n" +
        "const uint8_t smile_8x8_1BPP[8] = { 0xc3,0x81,0x24,0x24,0x00,0x24,0x99,0xc3 };\n\n"
      );

    });

    it("should write multiple sprites", () => {
      runAll(
        [
          __dirname + "/data/smile_8x8_1BPP.png",
          __dirname + "/data/smile_8x8_2BPP.png",
          __dirname + "/data/smile_7x7_1BPP.png",
          __dirname + "/data/smile_7x7_2BPP.png",
        ],
        {
          lang: "c",
          output: "output.h",
        }
      );

      expect(console.log).toHaveBeenCalledTimes(3);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it("should process directories", () => {
      runAll(
        [
          __dirname + "/data_ok",
        ],
        {
          lang: "c",
          output: "output.h",
        }
      );

      expect(console.log).toHaveBeenCalledTimes(3);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });
  });
});
