import { populateDatabase, possibilitiesUpdate, rebootPossibilities } from '../src/brain.js';

describe("populateDatabase", () => {
    test("should detect all Destroyer placements", () => {
        const shipDatabase = { dest: [], tank: [], cruise: [], bat: [], sub: [] };
        populateDatabase(shipDatabase);
        expect(shipDatabase.dest.length).toBe(96);
    });

    test("should detect all Tanker placements", () => {
        const shipDatabase = { dest: [], tank: [], cruise: [], bat: [], sub: [] };
        populateDatabase(shipDatabase);
        expect(shipDatabase.tank.length).toBe(130);
    });

    test("should detect all Cruiser and Battleship placements", () => {
        const shipDatabase = { dest: [], tank: [], cruise: [], bat: [], sub: [] };
        populateDatabase(shipDatabase);
        expect(shipDatabase.cruise.length).toBe(168);
        expect(shipDatabase.bat.length).toBe(168);
    });

    test("should detect all Submarine placements", () => {
        const shipDatabase = { dest: [], tank: [], cruise: [], bat: [], sub: [] };
        populateDatabase(shipDatabase);
        expect(shipDatabase.sub.length).toBe(64);
    });
});

describe("rebootPossibilities", () => {
    let shipDatabase: any;
    let playerGrid: any;
    let cellPossibilities: number[];

    beforeEach(() => {
        shipDatabase = { dest: [], tank: [], cruise: [], bat: [], sub: [] };
        playerGrid = Array(65).fill(null).map(() => ({ attackTurn: 0 }));
        cellPossibilities = Array(65).fill(0);
    });

    test("should reset cell possibilities based on ship database", () => {
        // Manually populate shipDatabase for testing
        shipDatabase.dest.push([1, 2, 3, 4, 5]);
        shipDatabase.tank.push([6, 7, 8, 9]);
        shipDatabase.cruise.push([10, 11, 12]);
        shipDatabase.bat.push([13, 14, 15]);
        shipDatabase.sub.push([16]);

        // Mark some cells as attacked
        playerGrid[1].attackTurn = 1;
        playerGrid[2].attackTurn = 1;
        playerGrid[3].attackTurn = 1;
        playerGrid[4].attackTurn = 2;
        playerGrid[5].attackTurn = 2;
        playerGrid[6].attackTurn = 2;

        cellPossibilities[1] = -1; // attacked
        cellPossibilities[2] = -1; // attacked
        cellPossibilities[3] = -1; // attacked

        rebootPossibilities(cellPossibilities, shipDatabase, playerGrid);

        // Check that cell possibilities are updated correctly
        expect(cellPossibilities[1]).toBe(-1);
        expect(cellPossibilities[2]).toBe(-1);
        expect(cellPossibilities[3]).toBe(-1);
        expect(cellPossibilities[4]).toBe(0);
        expect(cellPossibilities[5]).toBe(0);

        expect(cellPossibilities[6]).toBe(0);
        expect(cellPossibilities[7]).toBe(1);
        expect(cellPossibilities[8]).toBe(1);
        expect(cellPossibilities[9]).toBe(1);

        expect(cellPossibilities[10]).toBe(1);
        expect(cellPossibilities[11]).toBe(1);
        expect(cellPossibilities[12]).toBe(1);

        expect(cellPossibilities[13]).toBe(1);
        expect(cellPossibilities[14]).toBe(1);
        expect(cellPossibilities[15]).toBe(1);

        expect(cellPossibilities[16]).toBe(1);
    });
});

describe("possibilitiesUpdate", () => {
    let playerGrid: any;
    let cellPossibilities: number[];

    beforeEach(() => {
        playerGrid = Array(65).fill(null).map(() => ({ attackTurn: 0 }));
        cellPossibilities = Array(65).fill(0);
    });

    test("should add possibilities correctly", () => {
        const cellsToAdd = [1, 2, 3];
        possibilitiesUpdate(cellsToAdd, "add", playerGrid, cellPossibilities);
        expect(cellPossibilities[1]).toBe(1);
        expect(cellPossibilities[2]).toBe(1);
        expect(cellPossibilities[3]).toBe(1);
    });

    test("should not add possibilities for attacked cells", () => {
        playerGrid[2].attackTurn = 1; // Mark cell 2 as attacked
        const cellsToAdd = [1, 2, 3];
        possibilitiesUpdate(cellsToAdd, "add", playerGrid, cellPossibilities);
        expect(cellPossibilities[1]).toBe(1);
        expect(cellPossibilities[2]).toBe(0); // Should not increment
        expect(cellPossibilities[3]).toBe(1);
    });

    test("should remove possibilities correctly", () => {
        cellPossibilities[1] = 2;
        cellPossibilities[2] = 2;
        cellPossibilities[3] = 2;
        const cellsToRemove = [1, 2, 3];
        possibilitiesUpdate(cellsToRemove, "remove", playerGrid, cellPossibilities);
        expect(cellPossibilities[1]).toBe(1);
        expect(cellPossibilities[2]).toBe(1);
        expect(cellPossibilities[3]).toBe(1);
    });

    test("should not decrement below zero when removing possibilities", () => {
        cellPossibilities[1] = 0;
        const cellsToRemove = [1];
        possibilitiesUpdate(cellsToRemove, "remove", playerGrid, cellPossibilities);
        expect(cellPossibilities[1]).toBe(0);
    });
});