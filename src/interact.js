/*
Created by Rupali Vohra
Aug. 9, 2014
*/

import { PlayerType, Stage } from './enums.js'
import { ShipTypeAbbr } from './ships.js'
import { placeShips } from './placement.js';
import { randomIntFromInterval, cellTranslator, contains } from './utils.js';
import { populateDatabase, possibilitiesUpdate, rebootPossibilities, getShipsLeft, damageZone, generateReportForComputer } from './brain.js';
import { getTurnReports } from './report.js';

let stage = Stage.PlayerAttack; //used to keep track of game progress for instructional purposes.
var playerGrid = []; //array of cell objects. Each object contains two fields: ship, attackTurn
//ship = "D","T", "B", "C", "S", or null
//attackTurn = the turn in which the cell was attacked (can be 0+)
var computerGrid = [];
var computerShips = { destroyer: 5, tanker: 4, cruiser: 3, battleship: 3, submarine: 1 };
var playerShips = { destroyer: 5, tanker: 4, cruiser: 3, battleship: 3, submarine: 1 };
var computerVision = []; //array of objects for the computer to keep track of its report.
var computerReport = [{ dest: [0, 0], tank: [0, 0], cruise: [0, 0], bat: [0, 0], sub: [0, 0] }]; //index = turn, {dest: [int hit, int dam], tank: [int hit, int dam], ...}}, {...},
var turn = 1; //used for keeping track of reports
var playerAttack = []; //should have 3 cell numbers at the end of player's turn; emptiied after attack is finalized for the turn.
var shipDatabase = { dest: [], tank: [], cruise: [], bat: [], sub: [] }; //key = ship type; value = array of arrays of cell numbers in which the specific ship can lie; used by computer to plan attacks
var computerAttacks = [[0, 0, 0]]; //each element of the array is an array of three elements. each element is a cell number where the computer attacked in the turn corresponding to computerAttack's index.
var cellPossibilities = []; // an array of 65 where each element contains an int that says how many ships could be located there
var playerVictory = false;
var computerVictory = false;
var futureComputerAttacks = []; //used if final locations of ships are known, but there aren't enough attacks for them

window.onload = function () {
    getInstructions();
    for (var i = 0; i < 65; i++) {
        playerGrid.push({
            ship: null,
            attackTurn: 0
        });
        computerGrid.push({
            ship: null,
            attackTurn: 0
        });
        cellPossibilities[i] = 0;
        computerVision[i] = "";
    }
    populateDatabase(shipDatabase);
    rebootPossibilities(cellPossibilities, shipDatabase, playerGrid);
    getShipsLeft(computerShips);
    placeShips(PlayerType.Player, playerGrid, computerGrid);
    placeShips(PlayerType.Computer, playerGrid, computerGrid);

    // Attach left-click to selectAttackLocation and right-click (contextmenu) to deselectAttack.
    for (let i = 1; i <= 64; i++) {
        let oid = "o" + i;
        let el = document.getElementById(oid);
        if (el) {
            // left click -> select attack (passes id and event)
            el.addEventListener("click", function (ev) {
                selectAttackLocation(oid, ev);
            });
            // right click -> deselect attack (prevent default context menu)
            el.addEventListener("contextmenu", function (ev) {
                ev.preventDefault();
                deselectAttack(oid);
            });
        }
    }

    // Ensure the "attack" button triggers finalizeAttack from the module
    const attackBtn = document.getElementById("attack");
    if (attackBtn) {
        // remove any inline onclick that might exist and add a modern listener
        try { attackBtn.onclick = null; } catch (e) { /* ignore */ }
        attackBtn.addEventListener("click", finalizeAttack);
    }
};

function getInstructions() {
    //stage 1 = place ships
    //stage 2 = make attack
    if (stage == Stage.PlayerAttack) {
        if (turn == 1) {
            document.getElementById("instructions").innerHTML = "Make three attacks on your opponent by clicking on three squares on your opponents grid where you would like to attack."
        } else {
            document.getElementById("instructions").innerHTML = "Evaluate your report and make three more attacks on your opponent. Keep in mind that ships can be placed diagonally. <br />Damaging a ship means that at least one of your attacks was within one unit of the enemy's ship.<br />If you hit a ship with an attack, the report will not indicate whether you also damaged a ship with that attack."
        }
    }
    //stage 3 = receive report
    if (stage == Stage.RecieveReport) {
        document.getElementById("instructions").innerHTML = "Your report indicates how many ships you hit and how many you damaged. You can not hit and damage any ship with one attack."
    }
    //stage 4 = opponent makes attacks
    //stage 5 = opponent gets report
    //back to stage 2
}

var whichButton = function (e) {
    // Handle different event models
    var e = e || window.event;
    var btnCode;

    if ('object' === typeof e) {
        btnCode = e.button;
        return btnCode;
    }
}

function selectAttackLocation(id, event) {
    var split = id.split("o");
    var cellNum = parseInt(split[1]);
    if (contains(playerAttack, cellNum)) {
        deselectAttack(id);
        return;
    }

    if (playerAttack.length < 3) {
        //console.log("You clicked cell #" + cellNum);
        var leftClick = whichButton(event);
        if (leftClick == 0) {
            var cell = document.getElementById(id);
            if (!(cell.style.color == "black" || contains(playerAttack, cellNum))) {
                cell.style.color = "red";
                cell.innerHTML = turn.toString();
                playerAttack.push(cellNum);
            }
        }
    }

}

function deselectAttack(id) {
    var split = id.split("o");
    var cellNum = parseInt(split[1]);
    if (contains(playerAttack, cellNum)) {
        var index = playerAttack.indexOf(cellNum);
        playerAttack.splice(index, 1);
        var cell = document.getElementById(id);
        if (cell.style.color == "red") {
            cell.innerHTML = "";
            cell.style.color == "black";
        }
    }
}

function finalizeAttack() {
    if (playerAttack.length > 3) {
        alert("You may only select three attack locations per turn. You have currently selected " + playerAttack.length + " attacks, located at " + cellTranslator(playerAttack) + ". Right click to deselect attack locations.")
    } else if (playerAttack.length < 3 && playerAttack.length > 0) {
        alert("You must select three attack locations per turn. You have currently selected " + playerAttack.length + " attack(s), located at " + cellTranslator(playerAttack) + ". Left click on the computer's grid to attack the location.");
    } else if (playerAttack.length == 0) {
        alert("You must select three attack locations per turn. Left-click on the computer's grid to attack the location.");
    } else {
        document.getElementById("attack").disabled = true;
        for (var i = 0; i < 3; i++) {
            computerGrid[playerAttack[i]].attackTurn = turn;
            var id = "o".concat(playerAttack[i].toString());
            var cell = document.getElementById(id);
            cell.style.color = "black";
            cell.innerHTML = turn.toString();
        }
        stage = Stage.RecieveReport;
        getInstructions();
        generateReportForPlayer();
        stage = Stage.OpponentAttack;
        getInstructions();
        generateComputerAttack();
        stage = Stage.OpponentReport;
        getInstructions();
        generateReportForComputer(computerAttacks, playerGrid, computerGrid, turn, playerShips, shipDatabase, cellPossibilities, computerReport, playerVictory, computerVictory);
        turn++;
        stage = Stage.PlayerAttack;
        getInstructions();
        if (!playerVictory && !computerVictory) {
            document.getElementById("attack").disabled = false;
        } else if (playerVictory) {
            document.getElementById("attack").disabled = true;
            if (computerVictory) {
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

function generateReportForPlayer() {
    var table = document.getElementById("report");

    var rowCount = table.rows.length;

    var row = table.insertRow(rowCount);

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);

    cell1.innerHTML = "<b>" + turn + "</b>";
    cell1.style.border = 0;

    var attack1 = playerAttack.pop();
    var attack2 = playerAttack.pop();
    var attack3 = playerAttack.pop();
    var attack = [attack1, attack2, attack3]; //took it out of a list and into another to clear the recycled global variable (playerAttack)
    var potDam = damageZone(attack, PlayerType.Player, playerGrid, computerGrid);

    let turnReports = getTurnReports(attack, potDam, PlayerType.Player, undefined, computerShips, undefined, computerGrid);
    playerVictory = turnReports.playerVictory;
    computerVictory = turnReports.computerVictory;

    cell2.innerHTML = turnReports.prettyReport.D;
    cell3.innerHTML = turnReports.prettyReport.T;
    cell4.innerHTML = turnReports.prettyReport.C;
    cell5.innerHTML = turnReports.prettyReport.B;
    cell6.innerHTML = turnReports.prettyReport.S;

    if (cell2.innerHTML.length == 0 && cell3.innerHTML.length == 0 && cell4.innerHTML.length == 0 && cell5.innerHTML.length == 0 && cell6.innerHTML.length == 0) {
        cell2.innerHTML = "N O";
        cell4.innerHTML = "R E";
        cell5.innerHTML = "P   O";
        cell6.innerHTML = "R T";
    }
}

function getMaxPossibility(avoidCell, avoidCell2) {
    var max = 0;
    var ret = 0; //returns index of greatest value
    for (var i = 0; i < cellPossibilities.length; i++) {
        if (cellPossibilities[i] > max) {
            max = cellPossibilities[i];
            ret = i;
        }
        if (ret == 0 && playerGrid[i].attackTurn == 0 && cellPossibilities[i] >= 0) {
            ret = i;
        }
    }

    return ret;
}

function checkNeighbors(cell1, cell2) {
    /*returns true if cell1 and cell2 are next to each other horizontally, vertically, or diagonally*/
    var difference = Math.abs(cell2 - cell1);
    if (difference == 8 || difference == 9 || difference == 7 || difference == 1) {
        return true;
    }
    return false;
}

function estimateDestroyer() {
    //figure out where destroyers are based on information so far
    //at this point, the database has been cleared out at every turn
    var attacksThatHit = []; //array of turns in which a destroyer was hit
    for (var i = 1; i < computerReport.length - 1; i++) {
        if (computerReport[i].dest[0] > 0) {
            attacksThatHit.push(i); //populate attacksThatHit
        }
    }
    for (var j = 0; j < shipDatabase.dest.length; j++) { //if there isn't an attack from each attack turn in each ship left in the database, remove that ship
        for (var i = 0; i < attacksThatHit.length; i++) {
            var arr = computerAttacks[attacksThatHit[i]];
            if (!(contains(shipDatabase.dest[j], arr[0]) || contains(shipDatabase.dest[j], arr[1]) || contains(shipDatabase.dest[j], arr[2]))) {
                //console.log("Destroyer removed from " + shipDatabase.dest[j] + " based on attack at " + arr);
                possibilitiesUpdate(shipDatabase.dest[j], "remove", playerGrid, cellPossibilities);
                shipDatabase.dest.splice(j, 1);
                --j;
                break;
            }
        }
    }

    //based on number of destroyers hit so far, figure out which attacks in the corresponding turns were next to each other
    //make sure you check the computerVision array for cells that are known to be certain ships
    for (var i = 0; i < attacksThatHit.length; i++) {
        //handle three hits from the same attack turn
        if (computerReport[attacksThatHit[i]].dest[0] == 3) {
            var att = computerAttacks[attacksThatHit[i]]; //the three attacks that hit the ship
            att.sort(function (a, b) { return a - b });
            for (var j = 0; j < att.length; j++) {
                computerVision[att[j]] = ShipTypeAbbr.Destroyer;
                //assuming that by this point, the three hits in one turn have already eliminated other destroyer possibilities from the database
                //predict where the others are
            }
            var difference = 0;
            if (checkNeighbors(att[0], att[1])) {
                difference = Math.abs(att[0] - att[1]);
            } else if (checkNeighbors(att[1], att[2])) {
                difference = Math.abs(att[2] - att[1]);
            } else {
                difference = (Math.abs(att[2] - att[1])) / 2;
            }
            var destLeft = playerShips.destroyer;
            if (destLeft == 2) { //if two destroyers are left
                var newAtt = att[0] - difference;
                if (computerVision[newAtt] == "" && playerGrid[newAtt].attackTurn == 0) {
                    if (!contains(futureComputerAttacks, newAtt)) {
                        futureComputerAttacks.push(newAtt);
                    }
                } else {
                    newAtt = att[0] + difference;
                    if (computerVision[newAtt] == "" && playerGrid[newAtt].attackTurn == 0) {
                        if (!contains(futureComputerAttacks, newAtt)) {
                            futureComputerAttacks.push(newAtt);
                        }
                    } else {
                        newAtt = att[1] + difference;
                        if (computerVision[newAtt] == "" && playerGrid[newAtt].attackTurn == 0) {
                            if (!contains(futureComputerAttacks, newAtt)) {
                                futureComputerAttacks.push(newAtt);
                            }
                        } else {
                            newAtt = att[2] + difference;
                            if (computerVision[newAtt] == "" && playerGrid[newAtt].attackTurn == 0) {
                                if (!contains(futureComputerAttacks, newAtt)) {
                                    futureComputerAttacks.push(newAtt);
                                }
                            }
                        }
                    }
                }
            }
            if (destLeft == 1) { //if there is one destroyer left
                //get the other attack
                var requiredAttackTurn = 0;
                if (i = 0) {
                    requiredAttackTurn = attacksThatHit[i + 1];
                } else {
                    requiredAttackTurn = attacksThatHit[i - 1];
                }
                var attacksFromSingleHitTurn = computerAttacks[requiredAttackTurn];
                for (var j = 0; j < attacksFromSingleHitTurn; j++) {
                    //figure out the orientation of ships hit
                    if (checkNeighbors(attacksFromSingleHitTurn[j], att[0]) && (Math.abs(att[0] - attacksFromSingleHitTurn[j]) % difference == 0) && (computerVision[attacksFromSingleHitTurn[j]] == "" || computerVision[attacksFromSingleHitTurn[j]] == ShipTypeAbbr.Destroyer)) {
                        att.push(attacksFromSingleHitTurn[j]);
                    }
                    if (checkNeighbors(attacksFromSingleHitTurn[j], att[1]) && (Math.abs(att[1] - attacksFromSingleHitTurn[j]) % difference == 0) && (computerVision[attacksFromSingleHitTurn[j]] == "" || computerVision[attacksFromSingleHitTurn[j]] == ShipTypeAbbr.Destroyer)) {
                        att.push(attacksFromSingleHitTurn[j])
                    }
                    if (checkNeighbors(attacksFromSingleHitTurn[j], att[2]) && (Math.abs(att[2] - attacksFromSingleHitTurn[j]) % difference == 0) && (computerVision[attacksFromSingleHitTurn[j]] == "" || computerVision[attacksFromSingleHitTurn[j]] == ShipTypeAbbr.Destroyer)) {
                        att.push(attacksFromSingleHitTurn[j]);
                    }
                }
                att.sort(function (a, b) { return a - b });
                if (att.length == 4) { //if there are more than 4, then there was some trouble figuring out the hits in the previous for loop
                    //four in a row
                    if (checkNeighbors(att[0], att[1]) && checkNeighbors(att[1], att[2]) && checkNeighbors(att[2], att[3])) {
                        var potAtt = att[0] - difference;
                        if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                            if (!contains(futureComputerAttacks, potAtt)) {
                                futureComputerAttacks.push(potAtt);
                            }
                        } else {
                            potAtt = att[3] + difference;
                            if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                                if (!contains(futureComputerAttacks, potAtt)) {
                                    futureComputerAttacks.push(potAtt);
                                }
                            }
                        }
                    } else if ((att[1] - att[0]) == (2 * difference) && checkNeighbors(att[1], att[2]) && checkNeighbors(att[2], att[3])) { //one, blank, three
                        var potAtt = att[0] + difference;
                        if (!contains(futureComputerAttacks, potAtt)) {
                            futureComputerAttacks.push(potAtt);
                        }
                    } else if (checkNeighbors(att[0], att[1]) && (att[2] - att[1]) == (2 * difference) && checkNeighbors(att[2], att[3])) { //two, blank, two
                        var potAtt = att[1] + difference;
                        if (!contains(futureComputerAttacks, potAtt)) {
                            futureComputerAttacks.push(potAtt);
                        }
                    } else {//three, blank, one
                        var potAtt = att[2] + difference;
                        if (!contains(futureComputerAttacks, potAtt)) {
                            futureComputerAttacks.push(potAtt);
                        }
                    }
                }
            }
        } else if (computerReport[attacksThatHit[i]].dest[0] == 2) { //handle two hits from the same attack turn
            var att = computerAttacks[attacksThatHit[i]]; //the three attacks; 2 of these hit the ship
            att.sort(function (a, b) { return a - b });
            for (var j = 0; j < att.length; j++) {
                if (computerVision[att[j]] != "" || computerVision[att[j]] != ShipTypeAbbr.Destroyer) { //if one of the attacks is known to be another ship, remove it from this possibility
                    att.splice(j, 1);
                    --j;
                }
                //computerVision[att[j]] = "D";
                //assuming that by this point, the two hits in one turn have already eliminated other destroyer possibilities from the database
                //predict where the others are
            }
            var removed = 0;
            if (att.length == 3) {
                if (checkCellsInLine(att[0], att[1]) && !checkCellsInLine(att[0], att[2])) {
                    removed = att[2];
                    att.splice(2, 1);
                }
                if (checkCellsInLine(att[1], att[2]) && !checkCellsInLine(att[0], att[1])) {
                    removed = att[0];
                    att.splice(0, 1);
                }
            }
            for (var j = 0; j < shipDatabase.dest.length; j++) {
                if (contains(shipDatabase.dest[j], removed)) {
                    shipDatabase.dest.splice(j, 1);
                    --j;
                }
            }
            if (att.length == 2) {
                computerVision[att[0]] == ShipTypeAbbr.Destroyer;
                computerVision[att[1]] == ShipTypeAbbr.Destroyer;
                var difference = Math.abs(att[1] - att[0]);
                var destLeft = playerShips.destroyer;
                if (checkNeighbors(att[0], att[1])) { //two attacked are next to each other
                    var potAtt = att[0] - difference;
                    if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                        if (!contains(futureComputerAttacks, potAtt)) {
                            futureComputerAttacks.push(potAtt);
                        }
                    } else {
                        potAtt = att[1] + difference;
                        if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                            if (!contains(futureComputerAttacks, potAtt)) {
                                futureComputerAttacks.push(potAtt);
                            }
                        }
                    }
                } else {
                    //figure out which two were attacked
                    if (difference % 9 == 0) {
                        difference = 9;
                    } else if (difference % 8 == 0) {
                        difference = 8;
                    } else if (difference % 7 == 0) {
                        difference = 7;
                    } else if (difference <= 4) {
                        difference = 1;
                    } else {
                        console.log("ALERT: the difference is messed up");
                    }
                    //one,blank,blank,blank,one
                    if ((att[1] - att[0]) == (4 * difference)) {
                        var potAtt = att[0] + difference;
                        if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                            if (!contains(futureComputerAttacks, potAtt)) {
                                futureComputerAttacks.push(potAtt);
                            }
                        } else {
                            potAtt += difference;
                            if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                                if (!contains(futureComputerAttacks, potAtt)) {
                                    futureComputerAttacks.push(potAtt);
                                }
                            } else {
                                potAtt = att[1] - difference;
                                if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                                    if (!contains(futureComputerAttacks, potAtt)) {
                                        futureComputerAttacks.push(potAtt);
                                    }
                                }
                            }
                        }
                    }
                    //blank,one,blank,blank,one
                    //one,blank,blank,one,blank
                    else if ((att[1] - att[0]) == (3 * difference)) {
                        //don't know if att[0]-difference or att[1] + difference
                        potAtt = att[0] + difference;
                        if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                            if (!contains(futureComputerAttacks, potAtt)) {
                                futureComputerAttacks.push(potAtt);
                            }
                        } else {
                            potAtt += difference;
                            if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                                if (!contains(futureComputerAttacks, potAtt)) {
                                    futureComputerAttacks.push(potAtt);
                                }
                            } else {
                                potAtt = att[0] - difference;
                                if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                                    if (!contains(futureComputerAttacks, potAtt)) {
                                        futureComputerAttacks.push(potAtt);
                                    }
                                } else {
                                    potAtt = att[1] + difference;
                                    if ((computerVision[potAtt] == "" || computerVision[potAtt] == ShipTypeAbbr.Destroyer) && playerGrid[potAtt].attackTurn == 0) {
                                        if (!contains(futureComputerAttacks, potAtt)) {
                                            futureComputerAttacks.push(potAtt);
                                        }
                                    }
                                }
                            }
                        }
                    } else if ((att[1] - att[0]) == (2 * difference)) {
                        //blank,blank,one,blank,one
                        //one,blank,one,blank,blank
                        //blank,one,blank,one,blank
                        if (playerShips.destroyer < 3) {
                            if (attacksThatHit.length > 1) {
                                var prevAttThatHit = []; //array of cell numbers that were attacked in turns that hit the ship

                            }

                        }
                        //consider attacks over turns
                        if (playerShips.destroyer == 3) {

                        }
                    }

                }
                //}
            }

        } else {

        }
    }
}

function checkCellsInLine(cell1, cell2, distance) {
    if (cell1 > cell2) { //make sure cell1 is the smaller one
        var temp = cell1;
        cell1 = cell2;
        cell2 = temp;
    }
    //distance = 1,2,3, or 4 (cell numbers; less for smaller ships)
    //for destroyer, x _ _ _ x has distance 4, x _ _ x _ has distance 3, x _ x _ _ has distance 2, x x _ _ _ has distance 1
    if (arguments.length == 2) {
        var difference = Math.abs(cell2 - cell1);
        if (difference % 9 == 0 || difference % 8 == 0 || difference % 7 == 0 || difference <= 4) {
            return true;
        }
        return false;
    } else if (arguments.length == 3) {
        var difference = Math.abs(cell2 - cell1);
        if (difference % 9 == 0) {
            if (cell1 + 9 * distance == cell2) {
                return true;
            }
            return false;
        } else if (difference % 8 == 0) {
            if (cell1 + 8 * distance == cell2) {
                return true;
            }
            return false;
        } else if (difference % 7 == 0) {
            if (cell1 + 7 * distance == cell2) {
                return true;
            }
            return false;
        } else if (difference <= 4) {
            if (cell1 + distance == cell2) {
                return true;
            }
            return false;
        }
    } else {
        return false;
    }
}

function generateComputerAttack() {
    var attack1 = 0;
    var attack2 = 0;
    var attack3 = 0;
    if (turn == 1) {
        var line = randomIntFromInterval(1, 2);
        if (line == 1) {
            attack1 = randomIntFromInterval(10, 15);
            attack2 = randomIntFromInterval(26, 31);
            attack3 = randomIntFromInterval(42, 47);
        } else {
            attack1 = randomIntFromInterval(18, 23);
            attack2 = randomIntFromInterval(34, 39);
            attack3 = randomIntFromInterval(50, 55);
        }
    } else {
        estimateDestroyer();
        if (!(futureComputerAttacks.length == 0)) { //if there are future attacks from the last turns
            if (futureComputerAttacks.length >= 3) {
                attack1 = futureComputerAttacks.pop();
                attack2 = futureComputerAttacks.pop();
                attack3 = futureComputerAttacks.pop();
            } else if (futureComputerAttacks.length == 2) {
                attack1 = futureComputerAttacks.pop();
                attack2 = futureComputerAttacks.pop();
            } else {
                attack1 = futureComputerAttacks.pop();
            }
        }//if there are no future attacks from the last turns

        for (let key in shipDatabase) { //if there's only one ship location left
            if (shipDatabase[key].length == 1) {
                for (var j = 0; j < shipDatabase[key][0].length; j++) {
                    computerVision[shipDatabase[key][0][j]] = key.toString();
                }
                if (attack1 == 0 || attack2 == 0 || attack3 == 0) {
                    for (var i = 0; i < shipDatabase[key][0].length; i++) {
                        if (playerGrid[shipDatabase[key][0][i]].attackTurn == 0) {
                            if (attack1 == 0) {
                                attack1 = shipDatabase[key][0][i];
                            } else if (attack2 == 0) {
                                attack2 = shipDatabase[key][0][i];
                            } else if (attack3 == 0) {
                                attack3 = shipDatabase[key][0][i];
                            } else {
                                break;
                            }
                        }
                    }
                } else {
                    for (var i = 0; i < shipDatabase[key][0].length; i++) {
                        if (playerGrid[shipDatabase[key][0][i]].attackTurn == 0) {
                            futureComputerAttacks.push(shipDatabase[key][0][i]);
                        }
                    }
                    break;
                }
            }
        }
        if (attack1 == 0) {
            attack1 = getMaxPossibility();
        }
        cellPossibilities[attack1] = -1;
        if (attack2 == 0) {
            attack2 = getMaxPossibility(attack1);
        }
        cellPossibilities[attack2] = -1;
        if (attack3 == 0) {
            attack3 = getMaxPossibility(attack1, attack2);
        }
        cellPossibilities[attack3] = -1;
    }
    var arr = [attack1, attack2, attack3];
    for (var i = 0; i < arr.length; i++) {
        cellPossibilities[arr[i]] = -1;
        playerGrid[arr[i]].attackTurn = turn;
    }
    computerAttacks.push(arr);
    if (turn > 1) {
        var prevTurn = turn - 1;
        var id = "p".concat(computerAttacks[prevTurn][0].toString());
        var cell = document.getElementById(id);
        cell.style.color = "6633FF";
        cell.innerHTML = prevTurn.toString();
        id = "p".concat(computerAttacks[prevTurn][1].toString());
        var cell = document.getElementById(id);
        cell.style.color = "6633FF";
        cell.innerHTML = prevTurn.toString();
        id = "p".concat(computerAttacks[prevTurn][2].toString());
        var cell = document.getElementById(id);
        cell.style.color = "6633FF";
        cell.innerHTML = prevTurn.toString();
    }


    id = "p".concat(attack1.toString());
    cell = document.getElementById(id);
    cell.style.color = "red";
    cell.innerHTML = turn.toString();

    id = "p".concat(attack2.toString());
    cell = document.getElementById(id);
    cell.style.color = "red";
    cell.innerHTML = turn.toString();

    id = "p".concat(attack3.toString());
    cell = document.getElementById(id);
    cell.style.color = "red";
    cell.innerHTML = turn.toString();
}

function endgame() {
    document.getElementById("attack").innerHTML = "Play again?";
    document.getElementById("attack").disabled = false;
    document.getElementById("attack").onclick = function () {
        location.reload(false);
    }
}