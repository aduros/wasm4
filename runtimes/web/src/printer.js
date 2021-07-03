export class Printer {
    constructor () {
        this.buffer = "";
    }

    printCStr (cstr) {
        let p = 0;
        while (cstr[p] != 0) {
            this.printChar(cstr[p++]);
        }
    }

    printChar (charCode) {
        if (charCode == 10) {
            this.flush();
        } else {
            this.buffer += String.fromCharCode(charCode);
        }
    }

    printHex (number) {
        this.buffer += "0x" + (number).toString(16);
    }

    printRaw (value) {
        this.buffer += value;
    }

    flush () {
        console.log(this.buffer);
        this.buffer = "";
    }
}
