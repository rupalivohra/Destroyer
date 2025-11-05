import { populateDatabase } from '../src/brain.js';

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