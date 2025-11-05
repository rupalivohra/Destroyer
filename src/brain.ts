import { Direction } from "./enums.js";
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
                //possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
                cells = getCells(i, Direction.BottomRight, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                //possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
                cells = getCells(i, Direction.Down, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                //possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
            }
            if (i % 8 > 4 || i % 8 === 0) { /* top-right quadrant */
                cells = getCells(i, Direction.Down, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                //possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
            }
        } else { /* bottom half */
            if (i % 8 <= 4 && i % 8 !== 0) { /* bottom-left quadrant */
                cells = getCells(i, Direction.TopRight, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                //possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
                cells = getCells(i, Direction.Right, ShipTypes.Destroyer.size);
                cells.sort(function (a, b) { return a - b });
                //possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
            }
        }

        //handle all Tanker possibilities: There are 130 possibilities
        if (i <= 40) { /* top 5 rows */
            if (i % 8 <= 5 && i % 8 !== 0) { /* first five columns */
                cells = getCells(i, Direction.Right, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                //possibilitiesUpdate(cells, 1);
                shipDatabase.tank.push(cells);
                cells = getCells(i, Direction.BottomRight, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                //possibilitiesUpdate(cells, 1);
                shipDatabase.tank.push(cells);
                cells = getCells(i, Direction.Down, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                //possibilitiesUpdate(cells, 1);
                shipDatabase.tank.push(cells);
            }
            if (i % 8 >= 4 || i % 8 === 0) { /* last five columns */
                cells = getCells(i, Direction.BottomLeft, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells);
                //possibilitiesUpdate(cells, 1);
            }
            if (i % 8 >= 6 || i % 8 === 0) { /* last three columns */
                cells = getCells(i, Direction.Down, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells)
                //possibilitiesUpdate(cells, 1);
            }
        } else {
            if (i % 8 <= 5 && i % 8 !== 0) { /* first five columns of bottom three rows */
                cells = getCells(i, Direction.Right, ShipTypes.Tanker.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells);
                //possibilitiesUpdate(cells, 1);
            }
        }
        //handle all Cruiser and Battleship possibilities: There are 168 possibilities.
        if (i % 8 >= 1 && i % 8 <= 6) {
            cells = getCells(i, Direction.Right, ShipTypes.Cruiser.size);
            cells.sort(function (a, b) { return a - b });
            shipDatabase.cruise.push(cells);
            shipDatabase.bat.push(cells);
            //possibilitiesUpdate(cells, 1);
            //possibilitiesUpdate(cells, 1);
            if (i <= 48) {
                cells = getCells(i, Direction.BottomRight, ShipTypes.Cruiser.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.cruise.push(cells);
                shipDatabase.bat.push(cells);
                //possibilitiesUpdate(cells, 1);
                //possibilitiesUpdate(cells, 1);
            }
        }
        if (i <= 48) {
            cells = getCells(i, Direction.Down, ShipTypes.Cruiser.size);
            cells.sort(function (a, b) { return a - b });
            shipDatabase.cruise.push(cells);
            shipDatabase.bat.push(cells);
            //possibilitiesUpdate(cells, 1);
            //possibilitiesUpdate(cells, 1);
            if (i % 8 !== 1 && i % 8 !== 2) {
                cells = getCells(i, Direction.BottomLeft, ShipTypes.Cruiser.size);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.cruise.push(cells);
                shipDatabase.bat.push(cells);
                //possibilitiesUpdate(cells, 1);
                //possibilitiesUpdate(cells, 1);
            }
        }
        //handle all Submarine possibilities: There are 64 possibilities.
        cells = [i];
        shipDatabase.sub.push(cells);
        //possibilitiesUpdate(cells, 1);   
    }
}