import { Direction, PlayerType } from "./enums.js";
import { Ship, ShipTypes } from "./ships.js";
import { randomIntFromInterval } from "./utils.js";

export function getCells(startCell: number, shipDirection: Direction, shipSize: number, playerType: PlayerType | null, playerGrid: any, computerGrid: any): number[] {
    /* startCell is the head of the ship
    shipDirection is the direction relative to the head the ship should be placed
    shipSize is the number of units the desired ship should have
    This function returns a list of cell numbers in which the ship should be placed.*/
    let shipPlacementCells: number[] = [];
    shipPlacementCells.push(startCell);
    var location = startCell;
    for (var i = 0; i < shipSize - 1; i++) {
        if (shipDirection == Direction.Up) {
            location = location - 8;
            shipPlacementCells.push(location);
        } else if (shipDirection == Direction.TopRight) {
            location = location - 7;
            shipPlacementCells.push(location);
        } else if (shipDirection == Direction.Right) {
            location = location + 1;
            shipPlacementCells.push(location);
        } else if (shipDirection == Direction.BottomRight) {
            location = location + 9;
            shipPlacementCells.push(location);
        } else if (shipDirection == Direction.Down) {
            location = location + 8;
            shipPlacementCells.push(location);
        } else if (shipDirection == Direction.BottomLeft) {
            location = location + 7;
            shipPlacementCells.push(location);
        } else if (shipDirection == Direction.Left) {
            location = location - 1;
            shipPlacementCells.push(location);
        } else {
            location = location - 9;
            shipPlacementCells.push(location);
        }
        if (playerType != null) {
            if (checkEmpty(location, playerType, playerGrid, computerGrid) === false) { /*check to make sure the cells are empty*/
                //alert("the cell was not empty");
                shipPlacementCells = [];
                break;
            }
        }
    }
    //alert(ret)
    return shipPlacementCells;
}

export function placeDestroyers(playerType: PlayerType, playerGrid: any, computerGrid: any): void {
    let destHead: number; /*first D cell*/
    let destDirection: Direction; /*direction of D cells relative to desthead*/
    destHead = randomIntFromInterval(1, 64);

    if ((destHead % 8) == 1 || (destHead % 8) == 2 || (destHead % 8) == 3 || (destHead % 8) == 4) { /*left half*/
        if (destHead < 32) {/*top left quadrant*/
            destDirection = randomIntFromInterval(3, 5);
        } else { /*bottom left quadrant*/
            destDirection = randomIntFromInterval(1, 3);
        }
    } else { /*right half*/
        if (destHead <= 32) { /*top right quadrant*/
            destDirection = randomIntFromInterval(5, 7);
        } else { /*bottom right quadrant*/
            destDirection = randomIntFromInterval(6, 8);
            if (destDirection == Direction.BottomLeft) {
                destDirection = Direction.Up;
            }
        }
    }

    /*have lead and direction. now just place the letters*/
    var cells = getCells(destHead, destDirection, ShipTypes[Ship.Destroyer].size, playerType, playerGrid, computerGrid);
    placeCells(cells, Ship.Destroyer, playerType, playerGrid, computerGrid);
}

function placeCells(cells: number[], shipName: Ship, playerType: PlayerType, playerGrid: any, computerGrid: any): void {
    var id;
    for (var i = 0; i < cells.length; i++) {
        if (playerType == PlayerType.Player) {
            id = "p".concat(cells[i].toString());
            var cell = document.getElementById(id);
            if (cell != null) {
                cell.innerHTML = ShipTypes[shipName].shorthand; /*for non-Destroyer ships, check to make sure cells are available*/
                cell.style.backgroundColor = ShipTypes[shipName].backgroundColor;
            }
            playerGrid[cells[i]].ship = ShipTypes[shipName].shorthand;
        } else {
            computerGrid[cells[i]].ship = ShipTypes[shipName].shorthand;
        }
    }

    console.log("Placed " + playerType + " " + ShipTypes[shipName].shorthand + " at cells " + cells);
}

export function checkEmpty(cell: number, playerType: PlayerType | null, playerGrid: any, computerGrid: any): boolean {
    /* cell is the number of the cell to check.
    returns True if the cell is empty. returns False if the cell is occupied.*/
    if (playerType == PlayerType.Player) {
        if (playerGrid[cell].ship == null) {
            return true;
        }
    } else {
        if (computerGrid[cell].ship == null) {
            return true;
        }
    }
    return false;
}

export const forTesting = {
    placeCells,
};