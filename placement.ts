import { Direction } from "./enums.js";

export function getCells(startCell: number, shipDirection: Direction, shipSize: number, prefix: string | null, playerGrid: any, computerGrid: any): number[] {
    /* startCell is the head of the ship
    shipDirection is the direction relative to the head the ship should be placed
    shipSize is the number of units the desired ship should have
    This function returns a list of cell numbers in which the ship should be placed.*/
    console.log("getCells called with startCell: " + startCell + ", shipDirection: " + shipDirection + ", shipSize: " + shipSize + ", prefix: " + prefix);
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
        if (prefix != null) {
            if (checkEmpty(location, prefix, playerGrid, computerGrid) === false) { /*check to make sure the cells are empty*/
                //alert("the cell was not empty");
                shipPlacementCells = [];
                break;
            }
        }
    }
    //alert(ret)
    return shipPlacementCells;
}

function checkEmpty(cell: number, prefix: string | null, playerGrid: any, computerGrid: any): boolean {
    /* cell is the number of the cell to check.
    returns True if the cell is empty. returns False if the cell is occupied.*/
    if (prefix == "p") {
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