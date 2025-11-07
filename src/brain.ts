import { Direction, PlayerType } from "./enums.js";
import { getCells } from "./placement.js";
import { ShipTypes } from "./ships.js";

export function populateDatabase(shipDatabase: any): void {
    // var shipDatabase = { dest: [], tank: [], cruise: [], bat: [], sub: [] }; //key = ship type; value = array of arrays of cell numbers in which the specific ship can lie; used by computer to plan attacks

    /*key = ship type; value = array of arrays of cell numbers in which the specific ship can lie; used by computer to plan attacks*/
    var cells = [];
    for (var i = 1; i < 65; i++) {
        //handle all Destroyer possibilities: There are 96 possiblities
        if (i <= 32) { /* top half */
            if (i % 8 <= 4 && i % 8 !== 0) { /* top-left quadrant */
                cells = getCells(i, Direction.Right, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.dest.push(cells);
                cells = getCells(i, Direction.BottomRight, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.dest.push(cells);
                cells = getCells(i, Direction.Down, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.dest.push(cells);
            }
            if (i % 8 > 4 || i % 8 === 0) { /* top-right quadrant */
                cells = getCells(i, Direction.Down, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.dest.push(cells);
            }
        } else { /* bottom half */
            if (i % 8 <= 4 && i % 8 !== 0) { /* bottom-left quadrant */
                cells = getCells(i, Direction.TopRight, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.dest.push(cells);
                cells = getCells(i, Direction.Right, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.dest.push(cells);
            }
        }

        //handle all Tanker possibilities: There are 130 possibilities
        if (i <= 40) { /* top 5 rows */
            if (i % 8 <= 5 && i % 8 !== 0) { /* first five columns */
                cells = getCells(i, Direction.Right, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells);
                cells = getCells(i, Direction.BottomRight, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells);
                cells = getCells(i, Direction.Down, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells);
            }
            if (i % 8 >= 4 || i % 8 === 0) { /* last five columns */
                cells = getCells(i, Direction.BottomLeft, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells);
            }
            if (i % 8 >= 6 || i % 8 === 0) { /* last three columns */
                cells = getCells(i, Direction.Down, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells)
            }
        } else {
            if (i % 8 <= 5 && i % 8 !== 0) { /* first five columns of bottom three rows */
                cells = getCells(i, Direction.Right, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells);
            }
        }
        //handle all Cruiser and Battleship possibilities: There are 168 possibilities.
        if (i % 8 >= 1 && i % 8 <= 6) {
            cells = getCells(i, Direction.Right, ShipTypes.Cruiser.size);
            cells.sort(function (a, b) { return a - b });
            shipDatabase.cruise.push(cells);
            shipDatabase.bat.push(cells);
            if (i <= 48) {
                cells = getCells(i, Direction.BottomRight, ShipTypes.Cruiser.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.cruise.push(cells);
                shipDatabase.bat.push(cells);
            }
        }
        if (i <= 48) {
            cells = getCells(i, Direction.Down, ShipTypes.Cruiser.size);
            cells.sort(function (a, b) { return a - b });
            shipDatabase.cruise.push(cells);
            shipDatabase.bat.push(cells);
            if (i % 8 !== 1 && i % 8 !== 2) {
                cells = getCells(i, Direction.BottomLeft, ShipTypes.Cruiser.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.cruise.push(cells);
                shipDatabase.bat.push(cells);
            }
        }
        //handle all Submarine possibilities: There are 64 possibilities.
        cells = [i];
        shipDatabase.sub.push(cells);
    }
}

export function rebootPossibilities(cellPossibilities: number[], shipDatabase: any, playerGrid: any): void {
    /* an element of cellPossibilities is -1 if that cell has already been attacked */
    /*If cellPossibilities contains any information, that information is wiped out (except for previously made attacks). Then, the function runs through shipDatabase and updates cellPossibilities. */
    for (var i = 0; i < cellPossibilities.length; i++) {
        if (cellPossibilities[i] >= 0) {
            cellPossibilities[i] = 0;
        }
    }
    for (var i = 0; i < shipDatabase.dest.length; i++) {
        possibilitiesUpdate(shipDatabase.dest[i], "add", playerGrid, cellPossibilities);
    }
    for (var i = 0; i < shipDatabase.tank.length; i++) {
        possibilitiesUpdate(shipDatabase.tank[i], "add", playerGrid, cellPossibilities);
    }
    for (var i = 0; i < shipDatabase.cruise.length; i++) {
        possibilitiesUpdate(shipDatabase.cruise[i], "add", playerGrid, cellPossibilities);
    }
    for (var i = 0; i < shipDatabase.bat.length; i++) {
        possibilitiesUpdate(shipDatabase.bat[i], "add", playerGrid, cellPossibilities);
    }
    for (var i = 0; i < shipDatabase.sub.length; i++) {
        possibilitiesUpdate(shipDatabase.sub[i], "add", playerGrid, cellPossibilities);
    }
}

export function possibilitiesUpdate(cells: number[], direction: "add" | "remove", playerGrid: any, cellPossibilities: number[]): void {
    if (direction == "add") {
        for (var j = 0; j < cells.length; j++) {
            if (playerGrid[cells[j]].attackTurn == 0) {
                ++cellPossibilities[cells[j]];
            }
        }
    } else {
        for (var j = 0; j < cells.length; j++) {
            if (cellPossibilities[cells[j]] > 0) {
                --cellPossibilities[cells[j]];
            }
        }
    }
}

export function getShipsLeft(computerShips: any): void {
    document.getElementById("oppShipsDest")!.innerHTML = "<b> Destroyer [" + computerShips.destroyer + "/5] <b>";
    document.getElementById("oppShipsTank")!.innerHTML = "<b> Tanker [" + computerShips.tanker + "/4] <b>";
    document.getElementById("oppShipsCruise")!.innerHTML = "<b> Cruiser [" + computerShips.cruiser + "/3] <b>";
    document.getElementById("oppShipsBat")!.innerHTML = "<b> Battleship [" + computerShips.battleship + "/3] <b>";
    document.getElementById("oppShipsSub")!.innerHTML = "<b> Submarine [" + computerShips.submarine + "/1] <b>";
}