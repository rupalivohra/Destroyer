import { forTesting } from "../src/interact.js";
import { jest } from '@jest/globals'
import { Victory } from "../src/report.js";
import { getTestHtml } from "./utils.js";

describe("finalizeAttack", () => {
    describe("end of game conditions", () => {
        // Mock game state variables
        let playerGrid: any[];
        let computerGrid: any[];
        let playerAttack: number[];
        let playerShips: any;
        let computerShips: any;
        let turn: number;
        let computerVision: any[];
        let computerReport: any[];
        let computerAttacks: any[];
        let cellPossibilities: number[];
        let shipDatabase: any;
        let victory: Victory;

        /**
         * Initializes game state with grids, ships, and tracking arrays
         * Sets up scenario where both player and computer have 3 ships remaining
         */
        function initializeGameState() {
            // Initialize all 65 cells for both grids (index 0 unused, 1-64 used)
            playerGrid = [];
            computerGrid = [];
            for (let i = 0; i < 65; i++) {
                playerGrid.push({ ship: null, attackTurn: 0 });
                computerGrid.push({ ship: null, attackTurn: 0 });
            }

            // Place 3 remaining ships on computer's grid (cells 1, 2, 3)
            // These will be targets for player to win
            computerGrid[1] = { ship: 'D', attackTurn: 0 }; // Destroyer
            computerGrid[2] = { ship: 'T', attackTurn: 0 }; // Tanker
            computerGrid[3] = { ship: 'B', attackTurn: 0 }; // Battleship

            // Place 3 remaining ships on player's grid (cells 11, 12, 13)
            // These will be targets for computer to win
            playerGrid[11] = { ship: 'D', attackTurn: 0 };
            playerGrid[12] = { ship: 'T', attackTurn: 0 };
            playerGrid[13] = { ship: 'B', attackTurn: 0 };

            // Initialize ship remaining cell counts (all other ships already destroyed)
            playerShips = { destroyer: 1, tanker: 1, cruiser: 0, battleship: 1, submarine: 0 };
            computerShips = { destroyer: 1, tanker: 1, cruiser: 0, battleship: 1, submarine: 0 };

            // Initialize game state variables
            playerAttack = [];
            turn = 1;
            computerVision = new Array(65).fill('');
            computerReport = [{ dest: [0, 0], tank: [0, 0], cruise: [0, 0], bat: [0, 0], sub: [0, 0] }];
            computerAttacks = [[0, 0, 0]];
            cellPossibilities = new Array(65).fill(0);
            shipDatabase = { dest: [], tank: [], cruise: [], bat: [], sub: [] };
            victory = new Victory();
        }

        /**
         * Syncs local test variables to the interact.js module state via forTesting setters
         */
        function syncStateToModule() {
            forTesting.setPlayerGrid(playerGrid);
            forTesting.setComputerGrid(computerGrid);
            forTesting.setPlayerAttack(playerAttack);
            forTesting.setPlayerShips(playerShips);
            forTesting.setComputerShips(computerShips);
            forTesting.setTurn(turn);
            forTesting.setComputerVision(computerVision);
            forTesting.setComputerReport(computerReport);
            forTesting.setComputerAttacks(computerAttacks);
            forTesting.setCellPossibilities(cellPossibilities);
            forTesting.setShipDatabase(shipDatabase);
            forTesting.setVictory(victory);
        }

        /**
         * Sets up scenario where player can win by attacking all remaining computer ships
         */
        function setUpPlayerWinScenario() {
            initializeGameState();
            playerAttack = [1, 2, 3]; // Attack all 3 remaining computer ships
            syncStateToModule();
        }

        /**
         * Sets up scenario where computer can win by attacking all remaining player ships
         */
        function setUpComputerWinScenario() {
            initializeGameState();
            playerAttack = [20, 21, 22]; // Player misses
            // Computer's attack will target player's remaining ships at cells 11, 12, 13
            computerAttacks = [[0, 0, 0], [11, 12, 13]];
            syncStateToModule();
        }

        /**
         * Sets up scenario where both player and computer can win in the same turn
         */
        function setUpTieScenario() {
            initializeGameState();
            playerAttack = [1, 2, 3]; // Player attacks remaining computer ships
            // Computer also has attacks set to hit remaining player ships
            computerAttacks = [[0, 0, 0], [11, 12, 13]];
            syncStateToModule();
        }

        beforeEach(() => {
            document.body.innerHTML = getTestHtml();
            initializeGameState();
            // Mock alert to prevent actual alerts during tests
            jest.spyOn(window, 'alert').mockImplementation(() => { return; });
        });

        afterEach(() => {
            // Restore alert after each test
            jest.restoreAllMocks();
        });

        it("player victory", () => {
            setUpPlayerWinScenario();
            forTesting.finalizeAttack();
            expect(window.alert).toHaveBeenCalledWith("You win!");
        });

        it("should process computer victory when all player ships are destroyed", () => {
            setUpComputerWinScenario();
            forTesting.finalizeAttack();
            expect(window.alert).toHaveBeenCalledWith("You lose :(");
        });

        it("should process tie when both players lose all ships in the same turn", () => {
            setUpTieScenario();
            forTesting.finalizeAttack();
            expect(window.alert).toHaveBeenCalledWith("It's a tie!");
        });
    });
});