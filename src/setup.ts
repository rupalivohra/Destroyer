import { Stage } from "./enums.js"
import { ShipTypeAbbr } from "./ships.js";

export function getInstructions(stage?: Stage, turn?: number) {
    if (turn && turn === 1 && stage && stage === Stage.PlayerAttack) {
        document.getElementById("instructions")!.innerHTML = `
        Make three attacks on your opponent by clicking on three squares on your opponents grid where you would like to attack.
        `;
    } else {
        document.getElementById("instructions")!.innerHTML = `
        Evaluate your report and make three more attacks on your opponent. Keep in mind that ships can be placed diagonally.<br /><br />
        Damaging a ship means that at least one of your attacks was within one unit of the enemy's ship.<br /><br />
        If you hit a ship with an attack, the report will not indicate whether you also damaged a ship with that attack. In other words, you can not hit and damage any ship with a single attack.
        `;
    }
}

export function createReportRow(turn: number, prettyTurnReport: Record<ShipTypeAbbr, string>) {
    const table = document.getElementById("report") as HTMLTableElement;
    const row = table!.insertRow(turn);

    const turnNumberCell = row.insertCell(0);
    turnNumberCell.innerHTML = "<b>" + turn + "</b>";
    turnNumberCell.style.border = "0px";

    const turnDestroyerReport = row.insertCell(1);
    turnDestroyerReport.innerHTML = prettyTurnReport.D;

    const turnTankerReport = row.insertCell(2);
    turnTankerReport.innerHTML = prettyTurnReport.T;

    const turnCruiserReport = row.insertCell(3);
    turnCruiserReport.innerHTML = prettyTurnReport.C;

    const turnBattleshipReport = row.insertCell(4);
    turnBattleshipReport.innerHTML = prettyTurnReport.B;

    const turnSubmarineReport = row.insertCell(5);
    turnSubmarineReport.innerHTML = prettyTurnReport.S;

    if (prettyTurnReport.D == "" && prettyTurnReport.T == "" && prettyTurnReport.C == "" && prettyTurnReport.B == "" && prettyTurnReport.S == "") {
        turnDestroyerReport.innerHTML = "N O";
        turnCruiserReport.innerHTML = "R E";
        turnBattleshipReport.innerHTML = "P   O";
        turnSubmarineReport.innerHTML = "R T";
    }
}