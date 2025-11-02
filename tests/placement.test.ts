import { PlayerType, ShipTypeAbbr } from "../src/enums.js";
import { checkEmpty, forTesting } from "../src/placement.js";

describe("checkEmpty", () => {
    let playerGrid: any;
    let computerGrid: any;

    beforeEach(() => {
        playerGrid = Array(65).fill(null).map(() => ({ ship: null }));
        computerGrid = Array(65).fill(null).map(() => ({ ship: null }));
    });

    test("should return true for empty cell", () => {
        expect(checkEmpty(1, PlayerType.Player, playerGrid, computerGrid)).toBe(true);
    });

    test("should return false for occupied cell", () => {
        playerGrid[1].ship = ShipTypeAbbr.Destroyer;
        expect(checkEmpty(1, PlayerType.Player, playerGrid, computerGrid)).toBe(false);
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

    test("should place ship on player grid and update DOM", () => {
        const cells = [1, 2, 3, 4];
        const shipType = ShipTypeAbbr.Tanker;
        const playerType = PlayerType.Player;

        // Call the function to test
        forTesting.placeCells(cells, shipType, playerType, playerGrid, computerGrid);

        // Check grid
        for (const cell of cells) {
            expect(playerGrid[cell].ship).toBe(shipType);
        }

        // Check DOM
        for (const cell of cells) {
            const element = document.getElementById(`p${cell}`);
            expect(element!.innerHTML).toBe(shipType);
            expect(element!.style.backgroundColor).toBe("rgb(220, 178, 178)");
        }
    });

    test("should place ship on computer grid without updating DOM", () => {
        const cells = [1, 2, 3, 4];
        const shipType = ShipTypeAbbr.Tanker;
        const playerType = PlayerType.Computer;

        // Call the function to test
        forTesting.placeCells(cells, shipType, playerType, playerGrid, computerGrid);

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