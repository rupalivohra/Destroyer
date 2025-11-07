export function randomIntFromInterval(min: number, max: number): number { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function cellTranslator(cellNumber: number[]): string {
    var ret = "";

    for (var i = 0; i < cellNumber.length; i++) {
        if (cellNumber[i] % 8 == 0) {
            ret += "H";
        } else if (cellNumber[i] % 8 == 1) {
            ret += "A";
        } else if (cellNumber[i] % 8 == 2) {
            ret += "B";
        } else if (cellNumber[i] % 8 == 3) {
            ret += "C";
        } else if (cellNumber[i] % 8 == 4) {
            ret += "D";
        } else if (cellNumber[i] % 8 == 5) {
            ret += "E";
        } else if (cellNumber[i] % 8 == 6) {
            ret += "F";
        } else {
            ret += "G";
        }

        if (cellNumber[i] <= 8) {
            ret += "1";
        } else if (cellNumber[i] <= 16) {
            ret += "2";
        } else if (cellNumber[i] <= 24) {
            ret += "3";
        } else if (cellNumber[i] <= 32) {
            ret += "4";
        } else if (cellNumber[i] <= 40) {
            ret += "5";
        } else if (cellNumber[i] <= 48) {
            ret += "6";
        } else if (cellNumber[i] <= 56) {
            ret += "7";
        } else {
            ret += "8";
        }

        if (i < cellNumber.length - 1 && cellNumber.length >= 3) {
            ret += ", "
        }
        if (i == cellNumber.length - 2) {
            ret += "and ";
        }
    }
    return ret;
}

export function contains(a: any[], obj: any): boolean {
    //taken from stackoverflow. a is an array, obj is an object potentially in a.
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}