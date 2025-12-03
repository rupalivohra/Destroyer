import { Direction, PlayerType } from "./enums.js";
import { getCells } from "./placement.js";
import { getTurnReports, TurnReportPerShip } from "./report.js";
import { ShipTypeAbbr, ShipTypes } from "./ships.js";
import { contains } from "./utils.js";

//key = ship type; value = array of arrays of cell numbers in which the specific ship can lie; used by computer to plan attacks
export type ShipDatabase = {
    dest: number[][];
    tank: number[][];
    cruise: number[][];
    bat: number[][];
    sub: number[][];
};

export function populateDatabase(shipDatabase: ShipDatabase): void {
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

export function damageZone(attack: number[], player: PlayerType, playerGrid: any, computerGrid: any): number[] {
    //generates an array of cell numbers that the given attacks can damage. Can be adjusted by caller depending on attacks hitting ships.
    var grid;
    if (player == PlayerType.Player) {
        grid = computerGrid;
    } else {
        grid = playerGrid;
    }
    const ret: number[] = [];
    let pots: number[] = [];

    for (var i = 0; i < attack.length; i++) { //for each attack
        if (grid[attack[i]].ship == null) { //if the attack is not a hit location for any ship
            var pot1 = attack[i] - 9; //a potential damage location is in its surrounding one-block radius
            var pot2 = attack[i] - 8;
            var pot3 = attack[i] - 7;
            var pot4 = attack[i] - 1;
            var pot5 = attack[i] + 1;
            var pot6 = attack[i] + 7;
            var pot7 = attack[i] + 8;
            var pot8 = attack[i] + 9;
            if (attack[i] == 1) { //the damage area does not wrap around the grid
                pots = [pot5, pot7, pot8];
            } else if (attack[i] == 8) { //so the potentially damaged areas must be limited depending on where the attack is
                pots = [pot4, pot6, pot7];
            } else if (attack[i] == 57) {
                pots = [pot2, pot3, pot5];
            } else if (attack[i] == 64) {
                pots = [pot1, pot2, pot4];
            } else if (attack[i] < 8) {
                pots = [pot4, pot5, pot6, pot7, pot8];
            } else if (attack[i] > 57) {
                pots = [pot1, pot2, pot3, pot4, pot5];
            } else if (attack[i] % 8 == 1) {
                pots = [pot2, pot3, pot5, pot7, pot8];
            } else if (attack[i] % 8 == 0) {
                pots = [pot1, pot2, pot4, pot6, pot7];
            } else {
                pots = [pot1, pot2, pot3, pot4, pot5, pot6, pot7, pot8];
            }
            for (var j = 0; j < pots.length; j++) {
                var max = ret.length;
                if (max == 0) {
                    ret.push(pots[j]);
                } else {
                    if (!contains(ret, pots[j])) { // if ret does not already has the damage location 
                        ret.push(pots[j]); //add the damage location
                    }
                }
            }
        }
    }
    return ret;
}

/*updates future attack choices by eliminating impossibilities based on hit locations*/
function processHits(shipName: ShipTypeAbbr, report: TurnReportPerShip, shipDatabase: ShipDatabase, turn: number, computerAttacks: any, playerGrid: any, cellPossibilities: number[]) { //
    var ship = null;
    if (shipName == ShipTypeAbbr.Destroyer) {
        ship = shipDatabase.dest;
    } else if (shipName == ShipTypeAbbr.Tanker) {
        ship = shipDatabase.tank;
    } else if (shipName == ShipTypeAbbr.Cruiser) {
        ship = shipDatabase.cruise;
    } else if (shipName == ShipTypeAbbr.Battleship) {
        ship = shipDatabase.bat;
    } else {
        ship = shipDatabase.sub;
    }
    if (report.hits == 1) {
        for (var i = 0; i < ship.length; i++) {
            if (!(contains(ship[i], computerAttacks[turn][0]) || contains(ship[i], computerAttacks[turn][1]) || contains(ship[i], computerAttacks[turn][2]))) {
                possibilitiesUpdate(ship[i], "remove", playerGrid, cellPossibilities);
                ship.splice(i, 1);
                --i;
            }
        }
    }
    if (report.hits == 2) {
        for (i = 0; i < ship.length; i++) {
            if (!((contains(ship[i], computerAttacks[turn][0]) && contains(ship[i], computerAttacks[turn][1])) || (contains(ship[i], computerAttacks[turn][1]) && contains(ship[i], computerAttacks[turn][2])) || (contains(ship[i], computerAttacks[turn][0]) && contains(ship[i], computerAttacks[turn][2])))) {
                possibilitiesUpdate(ship[i], "remove", playerGrid, cellPossibilities);
                ship.splice(i, 1);
                --i;
            }
        }
    }
    if (report.hits == 3) {
        // TODO move this logic out into its own function
        report.damages = 0; // if all three attacks are hits, there cannot be any damages
        for (i = 0; i < ship.length; i++) {
            if (!(contains(ship[i], computerAttacks[turn][0]) && contains(ship[i], computerAttacks[turn][1]) && contains(ship[i], computerAttacks[turn][2]))) {
                possibilitiesUpdate(ship[i], "remove", playerGrid, cellPossibilities);
                ship.splice(i, 1);
                --i;
            }
        }
    }
}

function processDamage(shipName: ShipTypeAbbr, report: TurnReportPerShip, potDam: number[], shipDatabase: ShipDatabase, playerGrid: any, cellPossibilities: number[]) {
    var ship = null;
    if (shipName == ShipTypeAbbr.Destroyer) {
        ship = shipDatabase.dest;
    } else if (shipName == ShipTypeAbbr.Tanker) {
        ship = shipDatabase.tank;
    } else if (shipName == ShipTypeAbbr.Cruiser) {
        ship = shipDatabase.cruise;
    } else if (shipName == ShipTypeAbbr.Battleship) {
        ship = shipDatabase.bat;
    } else {
        ship = shipDatabase.sub;
    }

    var counter; //keeps track of how many damages an attack should have
    for (var j = 0; j < ship.length; j++) { //for every ship possibility
        counter = 0;
        for (var i = 0; i < potDam.length; i++) { //for each potential damage location
            if (contains(ship[j], potDam[i]) && playerGrid[potDam[i]].attackTurn == 0) { //if the ship possibility contains a potential damage location
                counter++; //increase the counter
            }
        }
        if (counter > (report.damages + report.hits)) { //if the number of damages in that ship location is greater than the number of damages from the report
            possibilitiesUpdate(ship[j], "remove", playerGrid, cellPossibilities); //remove that ship location.
            ship.splice(j, 1);
            --j;
        }
    }
}

export function generateReportForComputer(computerAttacks: any, playerGrid: any, computerGrid: any, turn: number, playerShips: any, shipDatabase: ShipDatabase, cellPossibilities: number[], computerReport: any[], playerVictory: boolean, computerVictory: boolean): void {
    var potDam = damageZone(computerAttacks[turn], PlayerType.Computer, playerGrid, computerGrid);

    let turnReports = getTurnReports(computerAttacks[turn], potDam, PlayerType.Computer, playerShips, undefined, playerGrid, undefined);
    playerVictory = turnReports.playerVictory;
    computerVictory = turnReports.computerVictory;

    computerReport.push({ dest: turnReports.report!.D, tank: turnReports.report!.T, cruise: turnReports.report!.C, bat: turnReports.report!.B, sub: turnReports.report!.S });

    //update cellPossibilities & database
    //process hits
    processHits(ShipTypeAbbr.Destroyer, turnReports.report!.D, shipDatabase, turn, computerAttacks, playerGrid, cellPossibilities);
    processHits(ShipTypeAbbr.Tanker, turnReports.report!.T, shipDatabase, turn, computerAttacks, playerGrid, cellPossibilities);
    processHits(ShipTypeAbbr.Cruiser, turnReports.report!.C, shipDatabase, turn, computerAttacks, playerGrid, cellPossibilities);
    processHits(ShipTypeAbbr.Battleship, turnReports.report!.B, shipDatabase, turn, computerAttacks, playerGrid, cellPossibilities);
    processHits(ShipTypeAbbr.Submarine, turnReports.report!.S, shipDatabase, turn, computerAttacks, playerGrid, cellPossibilities);
    //process damages
    potDam = damageZone(computerAttacks[turn], PlayerType.Computer, playerGrid, computerGrid);
    processDamage(ShipTypeAbbr.Destroyer, turnReports.report!.D, potDam, shipDatabase, playerGrid, cellPossibilities);
    processDamage(ShipTypeAbbr.Tanker, turnReports.report!.T, potDam, shipDatabase, playerGrid, cellPossibilities);
    processDamage(ShipTypeAbbr.Cruiser, turnReports.report!.C, potDam, shipDatabase, playerGrid, cellPossibilities);
    processDamage(ShipTypeAbbr.Battleship, turnReports.report!.B, potDam, shipDatabase, playerGrid, cellPossibilities);
    processDamage(ShipTypeAbbr.Submarine, turnReports.report!.S, potDam, shipDatabase, playerGrid, cellPossibilities);
}

export const forTesting = {
    processDamage,
    processHits
};