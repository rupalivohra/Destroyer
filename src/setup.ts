import { Stage } from "./enums.js"

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