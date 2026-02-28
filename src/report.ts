import { damageZone, getShipsLeft } from "./brain.js";
import { PlayerType } from "./enums.js";
import { endgame, moveToNextTurn } from "./interact.js";
import { createReportRow } from "./setup.js";
import { ShipTypeAbbr } from "./ships.js";

export type TurnReportPerShip = {
    hits: number;
    damages: number;
}

export type PrettyTurnReport = {
    report: string;
}

export type TurnReport = {
    report?: Record<ShipTypeAbbr, TurnReportPerShip>;
    prettyReport?: Record<ShipTypeAbbr, string>;
}

export class Victory {
    playerVictory: boolean = false;
    computerVictory: boolean = false;

    setComputerVictory(value: boolean): void {
        this.computerVictory = value;
    }

    setPlayerVictory(value: boolean): void {
        this.playerVictory = value;
    }

    evaluateVictory(): void {
        if (!this.playerVictory && !this.computerVictory) {
            moveToNextTurn();
        } else if (this.playerVictory) {
            (document.getElementById("attack")! as HTMLButtonElement).disabled = true;
            if (this.computerVictory) {
                alert("It's a tie!");
            } else {
                alert("You win!");
            }
            endgame();
        } else {
            alert("You lose :(");
            endgame();
        }
    }
}

export function getTurnReports(
    attack: number[],
    potDam: number[],
    playerType: PlayerType,
    playerShips: any,
    computerShips: any,
    playerGrid: any,
    computerGrid: any,
    victory: Victory): TurnReport {
    if (playerType == PlayerType.Computer) {
        const destroyerReport = getReport(attack, potDam, ShipTypeAbbr.Destroyer, playerType, playerShips, computerShips, playerGrid, computerGrid, victory);
        const tankerReport = getReport(attack, potDam, ShipTypeAbbr.Tanker, playerType, playerShips, computerShips, playerGrid, computerGrid, victory);
        const cruiserReport = getReport(attack, potDam, ShipTypeAbbr.Cruiser, playerType, playerShips, computerShips, playerGrid, computerGrid, victory);
        const battleshipReport = getReport(attack, potDam, ShipTypeAbbr.Battleship, playerType, playerShips, computerShips, playerGrid, computerGrid, victory);
        const submarineReport = getReport(attack, potDam, ShipTypeAbbr.Submarine, playerType, playerShips, computerShips, playerGrid, computerGrid, victory);

        return {
            report: {
                [ShipTypeAbbr.Destroyer]: destroyerReport,
                [ShipTypeAbbr.Tanker]: tankerReport,
                [ShipTypeAbbr.Cruiser]: cruiserReport,
                [ShipTypeAbbr.Battleship]: battleshipReport,
                [ShipTypeAbbr.Submarine]: submarineReport
            }
        }
    } else {
        const destroyerReport = getPrettyReport(attack, potDam, ShipTypeAbbr.Destroyer, computerShips, computerGrid, victory);
        const tankerReport = getPrettyReport(attack, potDam, ShipTypeAbbr.Tanker, computerShips, computerGrid, victory);
        const cruiserReport = getPrettyReport(attack, potDam, ShipTypeAbbr.Cruiser, computerShips, computerGrid, victory);
        const battleshipReport = getPrettyReport(attack, potDam, ShipTypeAbbr.Battleship, computerShips, computerGrid, victory);
        const submarineReport = getPrettyReport(attack, potDam, ShipTypeAbbr.Submarine, computerShips, computerGrid, victory);

        return {
            prettyReport: {
                [ShipTypeAbbr.Destroyer]: destroyerReport.report,
                [ShipTypeAbbr.Tanker]: tankerReport.report,
                [ShipTypeAbbr.Cruiser]: cruiserReport.report,
                [ShipTypeAbbr.Battleship]: battleshipReport.report,
                [ShipTypeAbbr.Submarine]: submarineReport.report
            }
        };
    }
}

function getReport(
    attack: number[],
    potDam: number[],
    shipName: ShipTypeAbbr,
    player: PlayerType,
    playerShips: any,
    computerShips: any,
    playerGrid: any,
    computerGrid: any,
    victory: Victory
): TurnReportPerShip {
    var grid;
    var ships;
    if (player == PlayerType.Player) {
        grid = computerGrid;
        ships = computerShips;
    } else {
        grid = playerGrid;
        ships = playerShips;
    }

    let numHit = 0;
    let numDamage = 0;

    for (let r = 0; r < attack.length; r++) {
        //for each attack
        if (grid[attack[r]].ship == shipName) {
            //if attack is a hit for the ship in question
            ++numHit;
            if (shipName == ShipTypeAbbr.Destroyer) {
                --ships.destroyer;
                if (ships.destroyer == 0 && player == PlayerType.Player) {
                    document.getElementById("dest")!.style.backgroundColor = "lawngreen";
                }
            } else if (shipName == ShipTypeAbbr.Tanker) {
                --ships.tanker;
                if (ships.tanker == 0 && player == PlayerType.Player) {
                    document.getElementById("tank")!.style.backgroundColor = "lawngreen";
                }
            } else if (shipName == ShipTypeAbbr.Battleship) {
                --ships.battleship;
                if (ships.battleship == 0 && player == PlayerType.Player) {
                    document.getElementById("bat")!.style.backgroundColor = "lawngreen";
                }
            } else if (shipName == ShipTypeAbbr.Cruiser) {
                --ships.cruiser;
                if (ships.cruiser == 0 && player == PlayerType.Player) {
                    document.getElementById("cruise")!.style.backgroundColor =
                        "lawngreen";
                }
            } else {
                //sub is hit
                --ships.submarine;
                if (player == PlayerType.Player) {
                    document.getElementById("sub")!.style.backgroundColor = "lawngreen";
                }
            }
            getShipsLeft(ships);
            if (
                ships.destroyer == 0 &&
                ships.tanker == 0 &&
                ships.battleship == 0 &&
                ships.cruiser == 0 &&
                ships.submarine == 0
            ) {
                if (player == PlayerType.Player) {
                    victory.setPlayerVictory(true);
                } else {
                    victory.setComputerVictory(true);
                }
                break;
            }
            for (var i = 0; i < potDam.length; i++) {
                //go through the potential damaged areas
                if (potDam[i] == attack[r]) {
                    //if the hit location was a potential damage from another attack
                    potDam.splice(i, 1); //remove this location from the damage location
                    --i;
                }
            }
        }
    }
    for (var i = 0; i < potDam.length; i++) {
        //process damaged ships
        if (grid[potDam[i]].ship == shipName && grid[potDam[i]].attackTurn == 0) {
            ++numDamage;
            potDam.splice(i, 1); //removes damage site from the damage list so that the same ship isn't counted twice
            --i;
        }
    }

    return { hits: numHit, damages: numDamage };
}

function getPrettyReport(attack: number[], potDam: number[], shipName: ShipTypeAbbr, computerShips: any, computerGrid: any, victory: Victory): PrettyTurnReport {
    let turnReport = getReport(attack, potDam, shipName, PlayerType.Player, undefined, computerShips, undefined, computerGrid, victory);
    let prettyString = "";
    if (turnReport.hits > 0) {
        prettyString += "<font color = 'CC0066'>" + turnReport.hits + "h</font>";
        if (turnReport.damages > 0) {
            prettyString += ", ";
        }
    }
    if (turnReport.damages > 0) {
        prettyString += "<font color = '6633FF'>" + turnReport.damages + "d</font>";
    }

    return { report: prettyString };
}

export function generateReportForPlayer(attack: number[], turn: number, playerGrid: any, computerGrid: any, computerShips: any, victory: Victory) {
    var potDam = damageZone(attack, PlayerType.Player, playerGrid, computerGrid);
    let turnReports = getTurnReports(attack, potDam, PlayerType.Player, undefined, computerShips, undefined, computerGrid, victory);

    createReportRow(turn, turnReports.prettyReport!);
}

export const forTesting = {
    getReport,
    getPrettyReport
}