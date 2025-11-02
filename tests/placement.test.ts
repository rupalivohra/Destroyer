import { PlayerType } from "../src/enums.js";
import { Ship, ShipTypeAbbr, ShipTypes } from "../src/ships.js";
import { forTesting, getStartingCellForShip } from "../src/placement.js";

describe("checkEmpty", () => {
    let grid: any;

    beforeEach(() => {
        grid = Array(65).fill(null).map(() => ({ ship: null }));
    });

    test("should return true for empty cell", () => {
        expect(forTesting.checkEmpty(1, grid)).toBe(true);
    });

    test("should return false for occupied cell", () => {
        grid[1].ship = ShipTypeAbbr.Destroyer;
        expect(forTesting.checkEmpty(1, grid)).toBe(false);
    });
});

describe("placeCells", () => {
    let playerGrid: any;
    let computerGrid: any;

    beforeEach(() => {
        playerGrid = Array(65).fill(null).map(() => ({ ship: null }));
        computerGrid = Array(65).fill(null).map(() => ({ ship: null }));
        document.body.innerHTML = `
            <div id="p1"></div>
            <div id="p2"></div>
            <div id="p3"></div>
            <div id="p4"></div>
        `;
    });

    test.each([Ship.Destroyer, Ship.Tanker, Ship.Battleship, Ship.Cruiser, Ship.Submarine])("should update the player grid & DOM for %s", (shipType) => {
        const cells = Array.from({ length: ShipTypes[shipType].size }, (_, i) => i + 1);
        const playerType = PlayerType.Player;

        // Call the function to test
        forTesting.placeCells(cells, shipType, playerType, playerGrid, computerGrid);

        // Check grid
        for (const cell of cells) {
            expect(playerGrid[cell].ship).toBe(ShipTypes[shipType].shorthand);
        }

        // Check DOM
        const element = document.getElementById(`p1`);
        expect(element!.innerHTML).toBe(ShipTypes[shipType].shorthand);
        expect(element!.style.backgroundColor).toBe(ShipTypes[shipType].backgroundColor);
    });

    test("should place ship on computer's grid without updating DOM", () => {
        const cells = [1, 2, 3, 4];
        const shipType = ShipTypeAbbr.Tanker;
        const playerType = PlayerType.Computer;

        // Call the function to test
        forTesting.placeCells(cells, Ship.Tanker, playerType, playerGrid, computerGrid);

        // Check grid
        for (const cell of cells) {
            expect(computerGrid[cell].ship).toBe(shipType);
        }

        // Check DOM remains unchanged
        for (const cell of cells) {
            const element = document.getElementById(`p${cell}`);
            expect(element!.innerHTML).toBe("");
            expect(element!.style.backgroundColor).toBe("");
        }
    });
});

describe("getStartingCellForShip", () => {
    let playerGrid: any;
    let computerGrid: any;

    beforeEach(() => {
        playerGrid = Array(3).fill(null).map(() => ({ ship: null }));
        computerGrid = Array(3).fill(null).map(() => ({ ship: null }));
    });

    test("should return an empty cell for player", () => {
        playerGrid[1].ship = ShipTypeAbbr.Destroyer; // occupy cell 1
        const cell = getStartingCellForShip(PlayerType.Player, playerGrid, computerGrid);
        expect(cell).not.toBe(1);
        expect(playerGrid[cell].ship).toBeNull();
    });

    test("should return an empty cell for computer", () => {
        computerGrid[1].ship = ShipTypeAbbr.Tanker; // occupy cell 1
        const cell = getStartingCellForShip(PlayerType.Computer, playerGrid, computerGrid);
        expect(cell).not.toBe(1);
        expect(computerGrid[cell].ship).toBeNull();
    });
});