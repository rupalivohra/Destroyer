import { damageZone } from '../src/brain.js';
import { PlayerType } from '../src/enums.js';
import { forTesting, Victory } from '../src/report.js';
import { ShipTypeAbbr } from '../src/ships.js';
import { jest } from '@jest/globals'
import { getTestHtml } from './utils.js';

describe("getReport", () => {
    let playerGrid: any;
    let computerGrid: any;
    let playerShips: any;
    let computerShips: any;
    let victory: Victory;

    beforeEach(() => {
        document.body.innerHTML = getTestHtml();
        playerGrid = Array(65).fill(null).map(() => ({ ship: null, attackTurn: 0 }));
        computerGrid = Array(65).fill(null).map(() => ({ ship: null, attackTurn: 0 }));
        for (let i = 1; i <= 5; i++) {
            playerGrid[i].ship = ShipTypeAbbr.Destroyer;
        }
        for (let i = 9; i <= 12; i++) {
            playerGrid[i].ship = ShipTypeAbbr.Tanker;
        }
        playerShips = {
            D: { cells: [1, 2, 3, 4, 5], hits: [] },
            T: { cells: [9, 10, 11, 12], hits: [] }
        };
        computerGrid[1].ship = ShipTypeAbbr.Destroyer;
        computerGrid[9].ship = ShipTypeAbbr.Destroyer;
        computerGrid[17].ship = ShipTypeAbbr.Destroyer;
        computerGrid[25].ship = ShipTypeAbbr.Destroyer;
        computerGrid[33].ship = ShipTypeAbbr.Destroyer;
        for (let i = 3; i <= 5; i++) {
            computerGrid[i].ship = ShipTypeAbbr.Tanker;
        }
        computerShips = {
            D: { cells: [1, 9, 17, 25, 33], hits: [] },
            T: { cells: [3, 4, 5], hits: [] }
        };
        victory = new Victory();
    });

    test("should report hits correctly", () => {
        const attacks = [1, 3];
        const potDam = damageZone(attacks, PlayerType.Computer, playerGrid, computerGrid);
        const report = forTesting.getReport(attacks, potDam, ShipTypeAbbr.Destroyer, PlayerType.Computer, playerShips, computerShips, playerGrid, computerGrid, victory);

        expect(report.hits).toBe(2);
        expect(report.damages).toBe(0);
        expect(victory.playerVictory).toBe(false);
        expect(victory.computerVictory).toBe(false);
    });

    test("should report damages correctly for 1 attack bordering ship(s)", () => {
        const attacks = [13];
        const potDam = damageZone(attacks, PlayerType.Computer, playerGrid, computerGrid);

        const destroyerReport = forTesting.getReport(attacks, potDam, ShipTypeAbbr.Destroyer, PlayerType.Computer, playerShips, computerShips, playerGrid, computerGrid, victory);
        expect(destroyerReport.hits).toBe(0);
        expect(destroyerReport.damages).toBe(2);
        expect(victory.playerVictory).toBe(false);
        expect(victory.computerVictory).toBe(false);

        const tankerReport = forTesting.getReport(attacks, potDam, ShipTypeAbbr.Tanker, PlayerType.Computer, playerShips, computerShips, playerGrid, computerGrid, victory);
        expect(tankerReport.hits).toBe(0);
        expect(tankerReport.damages).toBe(1);
        expect(victory.playerVictory).toBe(false);
        expect(victory.computerVictory).toBe(false);
    });

    test("should not double count damages for multiple attacks bordering same ship", () => {
        const attacks = [13, 21];
        const potDam = damageZone(attacks, PlayerType.Computer, playerGrid, computerGrid);

        const destroyerReport = forTesting.getReport(attacks, potDam, ShipTypeAbbr.Destroyer, PlayerType.Computer, playerShips, computerShips, playerGrid, computerGrid, victory);
        expect(destroyerReport.hits).toBe(0);
        expect(destroyerReport.damages).toBe(2);
        expect(victory.playerVictory).toBe(false);
        expect(victory.computerVictory).toBe(false);

        const tankerReport = forTesting.getReport(attacks, potDam, ShipTypeAbbr.Tanker, PlayerType.Computer, playerShips, computerShips, playerGrid, computerGrid, victory);
        expect(tankerReport.hits).toBe(0);
        expect(tankerReport.damages).toBe(1);
        expect(victory.playerVictory).toBe(false);
        expect(victory.computerVictory).toBe(false);
    });
});

describe("evaluateVictory", () => {
    let victory: Victory;
    beforeEach(() => {
        document.body.innerHTML = `
            <button id="attack"></button>
        `;
        victory = new Victory();
    });

    test("No victors in the beginning", () => {
        expect(victory.playerVictory).toBe(false);
        expect(victory.computerVictory).toBe(false);
    });

    test("Tie is handled", () => {
        victory.setPlayerVictory(true);
        victory.setComputerVictory(true);
        window.alert = jest.fn();
        victory.evaluateVictory();
        expect(window.alert).toHaveBeenCalledWith("It's a tie!");
    });

    test("Player victory is handled", () => {
        victory.setPlayerVictory(true);
        victory.setComputerVictory(false);
        window.alert = jest.fn();
        victory.evaluateVictory();
        expect(window.alert).toHaveBeenCalledWith("You win!");
    });

    test("Computer victory is handled", () => {
        victory.setPlayerVictory(false);
        victory.setComputerVictory(true);
        window.alert = jest.fn();
        victory.evaluateVictory();
        expect(window.alert).toHaveBeenCalledWith("You lose :(");
    });
});