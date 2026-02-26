import { MouseClick } from "./enums.js";
import { contains, whichButton } from "./utils.js";

export function clickOnPotentialAttackLocation(id: string, event: MouseEvent, currentAttack: number[], turn: number): void {
    var split = id.split("o");
    var cellNum = parseInt(split[1]);
    var clickType = whichButton(event);

    if (contains(currentAttack, cellNum) || clickType == MouseClick.Right) {
        deselectAttack(id, currentAttack);
        return;
    }

    if (currentAttack.length < 3 && clickType == MouseClick.Left) {
        var cell = document.getElementById(id);
        if (cell !== null && !(cell.style.color == "black" || contains(currentAttack, cellNum))) {
            cell.style.color = "red";
            cell.innerHTML = turn.toString();
            currentAttack.push(cellNum);
        }
    }

}

function deselectAttack(id: string, currentAttack: number[]): void {
    var split = id.split("o");
    var cellNum = parseInt(split[1]);
    if (contains(currentAttack, cellNum)) {
        var index = currentAttack.indexOf(cellNum);
        currentAttack.splice(index, 1);
        var cell = document.getElementById(id);
        if (cell !== null && cell.style.color == "red") {
            cell.innerHTML = "";
        }
    }
}