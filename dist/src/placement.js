import { Direction, PlayerType } from "./enums.js";
import { Ship, ShipTypes } from "./ships.js";
import { randomIntFromInterval } from "./utils.js";
export function getCells(startCell, shipDirection, shipSize, playerType, playerGrid, computerGrid) {
    /* startCell is the head of the ship
    shipDirection is the direction relative to the head the ship should be placed
    shipSize is the number of units the desired ship should have
    This function returns a list of cell numbers in which the ship should be placed.*/
    let shipPlacementCells = [];
    shipPlacementCells.push(startCell);
    var location = startCell;
    for (var i = 0; i < shipSize - 1; i++) {
        if (shipDirection == Direction.Up) {
            location = location - 8;
            shipPlacementCells.push(location);
        }
        else if (shipDirection == Direction.TopRight) {
            location = location - 7;
            shipPlacementCells.push(location);
        }
        else if (shipDirection == Direction.Right) {
            location = location + 1;
            shipPlacementCells.push(location);
        }
        else if (shipDirection == Direction.BottomRight) {
            location = location + 9;
            shipPlacementCells.push(location);
        }
        else if (shipDirection == Direction.Down) {
            location = location + 8;
            shipPlacementCells.push(location);
        }
        else if (shipDirection == Direction.BottomLeft) {
            location = location + 7;
            shipPlacementCells.push(location);
        }
        else if (shipDirection == Direction.Left) {
            location = location - 1;
            shipPlacementCells.push(location);
        }
        else {
            location = location - 9;
            shipPlacementCells.push(location);
        }
        if (playerType != null) {
            const grid = playerType == PlayerType.Player ? playerGrid : computerGrid;
            if (checkEmpty(location, grid) === false) { /*check to make sure the cells are empty*/
                //alert("the cell was not empty");
                shipPlacementCells = [];
                break;
            }
        }
    }
    //alert(ret)
    return shipPlacementCells;
}
export function placeShips(playerType, playerGrid, computerGrid) {
    for (let ship in Ship) { // this automatically goes from largest to smallest ship to maximize placement success
        let startCell = getStartingCellForShip(playerType, playerGrid, computerGrid);
        let direction;
        let cells = [startCell];
        while (cells.length != ShipTypes[ship].size) {
            switch (ship) {
                case Ship.Destroyer:
                    direction = getDestroyerDirection(startCell);
                    break;
                case Ship.Tanker:
                    direction = getTankerDirection(startCell);
                    break;
                case Ship.Battleship:
                case Ship.Cruiser:
                    direction = getBCDirection(startCell);
                    break;
                default:
                    // technically the Sub falls here, but it doesn't need a direction
                    direction = Direction.Up;
            }
            cells = getCells(startCell, direction, ShipTypes[ship].size, playerType, playerGrid, computerGrid);
        }
        placeCells(cells, ship, playerType, playerGrid, computerGrid);
    }
}
function getStartingCellForShip(playerType, playerGrid, computerGrid) {
    let grid = playerType == PlayerType.Player ? playerGrid : computerGrid;
    var startingCell = randomIntFromInterval(1, grid?.length - 1);
    while (checkEmpty(startingCell, grid) === false) { /*make sure startingCell is an empty cell*/
        startingCell = randomIntFromInterval(1, grid?.length - 1);
    }
    return startingCell;
}
function placeCells(cells, shipName, playerType, playerGrid, computerGrid) {
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
        }
        else {
            computerGrid[cells[i]].ship = ShipTypes[shipName].shorthand;
        }
    }
    console.debug("Placed " + playerType + " " + ShipTypes[shipName].shorthand + " at cells " + cells);
}
function checkEmpty(cell, grid) {
    /* cell is the number of the cell to check.
    returns True if the cell is empty. returns False if the cell is occupied or grid is null.*/
    return grid[cell].ship == null;
}
function getDestroyerDirection(startingDestCell) {
    let destDirection;
    if ((startingDestCell % 8) == 1 || (startingDestCell % 8) == 2 || (startingDestCell % 8) == 3 || (startingDestCell % 8) == 4) { /*left half*/
        if (startingDestCell < 32) { /*top left quadrant*/
            destDirection = randomIntFromInterval(3, 5);
        }
        else { /*bottom left quadrant*/
            destDirection = randomIntFromInterval(1, 3);
        }
    }
    else { /*right half*/
        if (startingDestCell <= 32) { /*top right quadrant*/
            destDirection = randomIntFromInterval(5, 7);
        }
        else { /*bottom right quadrant*/
            destDirection = randomIntFromInterval(6, 8);
            if (destDirection == Direction.BottomLeft) {
                destDirection = Direction.Up;
            }
        }
    }
    return destDirection;
}
function getTankerDirection(startingTankerCell) {
    let tankerDirection;
    if ((startingTankerCell % 8) == 1 || (startingTankerCell % 8) == 2 || (startingTankerCell % 8) == 3) { /*left third*/
        if (startingTankerCell < 24) { /*top left*/
            tankerDirection = randomIntFromInterval(3, 5);
        }
        else if (startingTankerCell < 40) { /*middle left*/
            tankerDirection = randomIntFromInterval(1, 5);
        }
        else { /*bottom left*/
            tankerDirection = randomIntFromInterval(1, 3);
        }
    }
    else if ((startingTankerCell % 8) == 4 || (startingTankerCell % 8) == 5) { /*middle third*/
        if (startingTankerCell < 24) { /*top middle*/
            tankerDirection = randomIntFromInterval(3, 7);
        }
        else if (startingTankerCell < 40) { /*middle*/
            tankerDirection = randomIntFromInterval(1, 8);
        }
        else { /*bottom middle*/
            tankerDirection = randomIntFromInterval(1, 5);
            if (tankerDirection == 4) {
                tankerDirection = 7;
            }
            if (tankerDirection == 5) {
                tankerDirection = 8;
            }
        }
    }
    else { /*right third*/
        if (startingTankerCell <= 24) { /*top right*/
            tankerDirection = randomIntFromInterval(5, 7);
        }
        else if (startingTankerCell <= 40) { /*middle right*/
            tankerDirection = randomIntFromInterval(4, 8);
            if (tankerDirection == 4) {
                tankerDirection = 1;
            }
        }
        else { /*bottom right*/
            tankerDirection = randomIntFromInterval(6, 8);
            if (tankerDirection == 6) {
                tankerDirection = 1;
            }
        }
    }
    return tankerDirection;
}
function getBCDirection(bcStartingCell) {
    let bcDirection;
    if ((bcStartingCell % 8) == 1 || (bcStartingCell % 8) == 2) { /*left third*/
        if (bcStartingCell < 16) { /*top left*/
            bcDirection = randomIntFromInterval(3, 5);
        }
        else if (bcStartingCell < 48) { /*middle left*/
            bcDirection = randomIntFromInterval(1, 5);
        }
        else { /*bottom left*/
            bcDirection = randomIntFromInterval(1, 3);
        }
    }
    else if ((bcStartingCell % 8) == 3 || (bcStartingCell % 8) == 4 || (bcStartingCell % 8) == 5 || (bcStartingCell % 8) == 6) { /*middle third*/
        if (bcStartingCell < 16) { /*top middle*/
            bcDirection = randomIntFromInterval(3, 7);
        }
        else if (bcStartingCell < 48) { /*middle*/
            bcDirection = randomIntFromInterval(1, 8);
        }
        else { /*bottom middle*/
            bcDirection = randomIntFromInterval(1, 5);
            if (bcDirection == 4) {
                bcDirection = 7;
            }
            if (bcDirection == 5) {
                bcDirection = 8;
            }
        }
    }
    else { /*right third*/
        if (bcStartingCell <= 16) { /*top right*/
            bcDirection = randomIntFromInterval(5, 7);
        }
        else if (bcStartingCell <= 48) { /*middle right*/
            bcDirection = randomIntFromInterval(4, 8);
            if (bcDirection == 4) {
                bcDirection = 1;
            }
        }
        else { /*bottom right*/
            bcDirection = randomIntFromInterval(6, 8);
            if (bcDirection == 6) {
                bcDirection = 1;
            }
        }
    }
    return bcDirection;
}
export const forTesting = {
    placeCells,
    checkEmpty,
    getStartingCellForShip
};
//# sourceMappingURL=placement.js.map