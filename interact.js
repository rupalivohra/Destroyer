var stage = 2; //used to keep track of game progress for instructional purposes.
var playerGrid = []; //array of cell objects. Each object contains two fields: ship, attackTurn
//ship = "D","T", "B", "C", "S", or null
//attackTurn = the turn in which the cell was attacked (can be 0+)
var computerGrid = [];
var computerShips = { destroyer: 5, tanker: 4, cruiser: 3, battleship: 3, submarine: 1 };
var playerShips = { destroyer: 5, tanker: 4, cruiser: 3, battleship: 3, submarine: 1 };
var computerVision = []; //array of objects for the computer to keep track of its report.
var computerReport = [{dest:[0,0], tank:[0,0], cruise:[0,0], bat:[0,0], sub:[0,0]}]; //index = turn, {dest: [int hit, int dam], tank: [int hit, int dam], ...}}, {...},
var turn = 1; //used for keeping track of reports
var playerAttack = []; //should have 3 cell numbers at the end of player's turn; emptiied after attack is finalized for the turn.
var shipDatabase = { dest: [], tank: [], cruise: [], bat: [], sub: [] }; //key = ship type; value = array of arrays of cell numbers in which the specific ship can lie; used by computer to plan attacks
var computerAttacks = [[0,0,0]]; //each element of the array is an array of three elements. each element is a cell number where the computer attacked in the turn corresponding to computerAttack's index.
var cellPossibilities = []; // an array of 65 where each element contains an int that says how many ships could be located there
var playerVictory = 0; //1 if player wins
var computerVictory = 0; //1 if computer wins
var futureComputerAttacks = []; //used if final locations of ships are known, but there aren't enough attacks for them


function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function contains(a, obj) {
    //taken from stackoverflow. a is an array, obj is an object potentially in a.
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

window.onload = function () {
    //document.getElementById("tutorialDiv").style.display = "none";
    getInstructions();
    for (var i = 0 ; i < 65; i++) {
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
    populateDatabase();
    //document.getElementById("selfShips").innerHTML = getShipsLeft(0);
    getShipsLeft(1);
    placeDestroyers("p");
    placeTankers("p");
    placeBC("B", "p");
    placeBC("C", "p");
    placeSub("p");
    placeDestroyers("o");
    placeTankers("o");
    placeBC("B", "o");
    placeBC("C", "o");
    placeSub("o");
    //getInstructions();
}

//function tutorialOver() {
//    document.getElementById("expect").style.display = "none";
//    document.getElementById("instructionsDiv").style.display = "inline";
//    document.getElementById("okay").style.display = "none";
//}

function getInstructions() {
    //stage 1 = place ships
    //stage 2 = make attack
    if (stage == 2) {
        if (turn == 1) {
            document.getElementById("instructions").innerHTML = "Make three attacks on your opponent by clicking on three squares on your opponents grid where you would like to attack."
        } else {
            document.getElementById("instructions").innerHTML = "Evaluate your report and make three more attacks on your opponent. Keep in mind that ships can be placed diagonally. <br />Damaging a ship means that at least one of your attacks was within one unit of the enemy's ship.<br />If you hit a ship with an attack, the report will not indicate whether you also damaged a ship with that attack."
        }
    }
    //stage 3 = receive report
    if (stage == 3) {
        document.getElementById("instructions").innerHTML = "Your report indicates how many ships you hit and how many you damaged. You can not hit and damage any ship with one attack."
    }
    //stage 4 = opponent makes attacks
    //stage 5 = opponent gets report
    //back to stage 2
}

function populateDatabase() {
    /*key = ship type; value = array of arrays of cell numbers in which the specific ship can lie; used by computer to plan attacks*/
    var cells = [];
    for (var i = 1; i < 65; i++) {
        //handle all Destroyer possibilities: There are 96 possiblities
        if (i <= 32) {
            if (i % 8 <= 4 && i % 8 > 0) {
                cells = getCells(i, 3, 5, null);
                cells.sort(function (a, b) { return a - b });
                possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
                cells = getCells(i, 4, 5, null);
                cells.sort(function (a, b) { return a - b });
                possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
                cells = getCells(i, 5, 5, null);
                cells.sort(function (a, b) { return a - b });
                possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
            }
            if (i % 8 > 4 || i % 8 == 0) {
                cells = getCells(i, 5, 5, null);
                cells.sort(function (a, b) { return a - b });
                possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
            }
        } else {
            if (i % 8 <= 4 && i % 8 > 0) {
                cells = getCells(i, 2, 5, null);
                cells.sort(function (a, b) { return a - b });
                possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
                cells = getCells(i, 3, 5, null);
                cells.sort(function (a, b) { return a - b });
                possibilitiesUpdate(cells, 1);
                shipDatabase.dest.push(cells);
            }
        }
        
        //handle all Tanker possibilities: There are 132 possibilities
        if (i <= 40) {
            if (i % 8 <= 5 && i % 8 > 0) {
                cells = getCells(i, 3, 4, null);
                cells.sort(function (a, b) { return a - b });
                possibilitiesUpdate(cells, 1);
                shipDatabase.tank.push(cells);
                cells = getCells(i, 4, 4, null);
                cells.sort(function (a, b) { return a - b });
                possibilitiesUpdate(cells, 1);
                shipDatabase.tank.push(cells);
                cells = getCells(i, 5, 4, null);
                cells.sort(function (a, b) { return a - b });
                possibilitiesUpdate(cells, 1);
                shipDatabase.tank.push(cells);
            }
            if (i % 8 >= 4 || i % 8 == 0) {
                cells = getCells(i, 6, 4, null);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells);
                possibilitiesUpdate(cells, 1);
            }
            if (i % 8 >= 6 || i % 8 == 0) {
                cells = getCells(i, 5, 4, null);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells)
                possibilitiesUpdate(cells, 1);
            }
        } else {
            if (i % 8 <= 5 && i % 8 > 0) {
                cells = getCells(i, 3, 4, null);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.tank.push(cells);
                possibilitiesUpdate(cells, 1);
            }
        }
        //handle all Cruiser and Battleship possibilities: There are 168 possibilities.
        if (i % 8 >= 1 && i % 8 <= 6) {
            cells = getCells(i, 3, 3, null);
            cells.sort(function (a, b) { return a - b });
            shipDatabase.cruise.push(cells);
            shipDatabase.bat.push(cells);
            possibilitiesUpdate(cells, 1);
            possibilitiesUpdate(cells, 1);
            if (i <= 48) {
                cells = getCells(i, 4, 3, null);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.cruise.push(cells);
                shipDatabase.bat.push(cells);
                possibilitiesUpdate(cells, 1);
                possibilitiesUpdate(cells, 1);
            }
        }
        if (i <= 48) {
            cells = getCells(i, 5, 3, null);
            cells.sort(function (a, b) { return a - b });
            shipDatabase.cruise.push(cells);
            shipDatabase.bat.push(cells);
            possibilitiesUpdate(cells, 1);
            possibilitiesUpdate(cells, 1);
            if (i % 8 != 1 && i % 8 != 2) {
                cells = getCells(i, 6, 3, null);
                cells.sort(function (a, b) { return a - b });
                shipDatabase.cruise.push(cells);
                shipDatabase.bat.push(cells);
                possibilitiesUpdate(cells, 1);
                possibilitiesUpdate(cells, 1);
            }
        }
        //handle all Submarine possibilities: There are 64 possibilities.
        cells = [i];
        shipDatabase.sub.push(cells);
        possibilitiesUpdate(cells, 1);
        
    }
    //console.log("database for destroyers: " + shipDatabase.dest);
}

function getCells(startCell, shipDirection, shipSize, prefix) {
    /* startCell is the head of the ship
    shipDirection is the direction relative to the head the ship should be placed
    shipSize is the number of units the desired ship should have
    This function returns a list of cell numbers in which the ship should be placed.*/
    var ret = [];
    ret.push(startCell);
    var location = startCell;
    for (var i = 0; i < shipSize - 1; i++) {
        if (shipDirection == 1) {
            location = location - 8;
            ret.push(location);
        } else if (shipDirection == 2) {
            location = location - 7;
            ret.push(location);
        } else if (shipDirection == 3) {
            location = location + 1;
            ret.push(location);
        } else if (shipDirection == 4) {
            location = location + 9;
            ret.push(location);
        } else if (shipDirection == 5) {
            location = location + 8;
            ret.push(location);
        } else if (shipDirection == 6) {
            location = location + 7;
            ret.push(location);
        } else if (shipDirection == 7) {
            location = location - 1;
            ret.push(location);
        } else {
            location = location - 9;
            ret.push(location);
        }
        if (prefix != null) {
            if (checkEmpty(location, prefix) === false) { /*check to make sure the cells are empty*/
                //alert("the cell was not empty");
                ret = [];
                break;
            }
        }
    }
    //alert(ret)
    return ret;
}

function checkEmpty(cell, prefix) {
    /* cell is the number of the cell to check.
    returns True if the cell is empty. returns False if the cell is occupied.*/
    if (prefix == "p") {
        if (playerGrid[cell].ship == null) {
            return true;
        }
    } else {
        if (computerGrid[cell].ship == null) {
            return true;
        }
    }
    return false;
}

function placeDestroyers(prefix) {
    var desthead; /*first D cell*/
    var destdir; /*direction of D cells relative to desthead*/
    desthead = randomIntFromInterval(1, 64);
    //alert("desthead=" + desthead);
    if ((desthead % 8) == 1 || (desthead % 8) == 2 || (desthead % 8) == 3 || (desthead % 8) == 4) { /*left half*/
        if (desthead < 32) {/*top left quadrant*/
            destdir = randomIntFromInterval(3, 5);
        } else { /*bottom left quadrant*/
            destdir = randomIntFromInterval(1, 3);
        }
    } else { /*right half*/
        if (desthead <= 32) { /*top right quadrant*/
            destdir = randomIntFromInterval(5, 7);
        } else { /*bottom right quadrant*/
            destdir = randomIntFromInterval(6, 8);
            if (destdir == 6) {
                destdir = 1;
            }
        }
    }
    //alert("destdir=" + destdir);
    /*have lead and direction. now just place the letters*/
    var cells = getCells(desthead, destdir, 5, prefix);
    var id;
    for (var i = 0; i < cells.length; i++) {
        //id = prefix.concat(cells[i].toString());
        //document.getElementById(id).innerHTML = "D";
        if (prefix == "p") {
            id = prefix.concat(cells[i].toString());
            var cell = document.getElementById(id);
            cell.innerHTML = "D"; /*for other ships, check to make sure cells are available*/
            cell.style.backgroundColor = "DCB2B2";
            playerGrid[cells[i]].ship = "D";
        } else {
            computerGrid[cells[i]].ship = "D";
            //console.log("Destroyer ship location is at: " + cells[i] + " ");
        }
    }
}

function getTankhead(prefix) {
    var tankhead = randomIntFromInterval(1,64);
    while (checkEmpty(tankhead, prefix) === false) { /*make sure tankhead is an empty cell*/
        tankhead = randomIntFromInterval(1,64);
    }
    return tankhead;
}

function getTankdir(tankhead){ 
    var tankdir;
    if ((tankhead % 8) == 1 || (tankhead % 8) == 2 || (tankhead % 8) == 3) { /*left third*/
        if (tankhead < 24) {/*top left*/
            tankdir = randomIntFromInterval(3,5);
        } else if (tankhead < 40) { /*middle left*/
            tankdir = randomIntFromInterval(1,5);
        } else { /*bottom left*/
            tankdir = randomIntFromInterval(1,3);
        }
    } else if ((tankhead % 8) == 4 || (tankhead % 8) == 5) { /*middle third*/
        if (tankhead < 24) { /*top middle*/
            tankdir = randomIntFromInterval(3,7);
        } else if (tankhead < 40) { /*middle*/
            tankdir = randomIntFromInterval(1,8);
        } else { /*bottom middle*/
            tankdir = randomIntFromInterval(1,5);
            if (tankdir == 4) {
                tankdir = 7;
            }
            if (tankdir == 5) {
                tankdir = 8;
            }
        }
    } else { /*right third*/
        if (tankhead <= 24) { /*top right*/
            tankdir = randomIntFromInterval(5,7);
        } else if (tankhead <= 40) { /*middle right*/
            tankdir = randomIntFromInterval(4,8);
            if (tankdir == 4) {
                tankdir = 1;
            }
        } else { /*bottom right*/
            tankdir = randomIntFromInterval(6,8);
            if (tankdir == 6) {
                tankdir = 1;
            }
        }
    }
    return tankdir;
}

function placeTankers(prefix) {
    var tankhead = getTankhead(prefix); /*first T cell*/
    var tankdir; /*direction of T cells relative to tankhead*/
    /*have lead and direction. now just place the letters*/
    var cells = [];
    while (cells.length == 0) {
        /* ensures we get empty cells*/
        tankdir = getTankdir(tankhead);
        //alert("tankhead=" + tankhead + ", tankdir" + tankdir);
        cells = getCells(tankhead, tankdir, 4, prefix);
    }
    var id;
    for (var i = 0; i < cells.length; i++) {
        //id = prefix.concat(cells[i].toString());
        //document.getElementById(id).innerHTML = "T";
        if (prefix == "p") {
            playerGrid[cells[i]].ship = "T";
            id = prefix.concat(cells[i].toString());
            var cell = document.getElementById(id);
            cell.innerHTML = "T";
            cell.style.backgroundColor = "FFD9CA";
        } else {
            computerGrid[cells[i]].ship = "T";
            //console.log("Tanker location is: " + cells[i]);
        }
    }
}

function getbchead(prefix) {
    var bchead = randomIntFromInterval(1, 64);
    while (checkEmpty(bchead, prefix) === false) { /*make sure bchead is an empty cell*/
        bchead = randomIntFromInterval(1, 64);
    }
    return bchead;
}

function getbcdir(bchead) {
    var bcdir;
    if ((bchead % 8) == 1 || (bchead % 8) == 2) { /*left third*/
        if (bchead < 16) {/*top left*/
            bcdir = randomIntFromInterval(3, 5);
        } else if (bchead < 48) { /*middle left*/
            bcdir = randomIntFromInterval(1, 5);
        } else { /*bottom left*/
            bcdir = randomIntFromInterval(1, 3);
        }
    } else if ((bchead % 8) == 3 || (bchead % 8) == 4 || (bchead % 8) == 5 || (bchead % 8) == 6) { /*middle third*/
        if (bchead < 16) { /*top middle*/
            bcdir = randomIntFromInterval(3, 7);
        } else if (bchead < 48) { /*middle*/
            bcdir = randomIntFromInterval(1, 8);
        } else { /*bottom middle*/
            bcdir = randomIntFromInterval(1, 5);
            if (bcdir == 4) {
                bcdir = 7;
            }
            if (bcdir == 5) {
                bcdir = 8;
            }
        }
    } else { /*right third*/
        if (bchead <= 16) { /*top right*/
            bcdir = randomIntFromInterval(5, 7);
        } else if (bchead <= 48) { /*middle right*/
            bcdir = randomIntFromInterval(4, 8);
            if (bcdir == 4) {
                bcdir = 1;
            }
        } else { /*bottom right*/
            bcdir = randomIntFromInterval(6, 8);
            if (bcdir == 6) {
                bcdir = 1;
            }
        }
    }
    return bcdir;
}

function placeBC(ship, prefix) {
    /* ship is a string that tells what the ship type should be - battleship or cruiser */
    var bchead = getbchead(prefix); /*first B/C cell*/
    var bcdir; /*direction of B/C cells relative to tankhead*/
    /*have head and direction. now just place the letters*/
    var cells = [];
    while (cells.length == 0) {
        /* ensures we get empty cells*/
        bcdir = getbcdir(bchead);
        //alert("bchead=" + bchead + ", bcdir=" + bcdir);
        cells = getCells(bchead, bcdir, 3, prefix);
    }
    var id;
    for (var i = 0; i < cells.length; i++) {
        //id = prefix.concat(cells[i].toString());
        //document.getElementById(id).innerHTML = ship;
        if (prefix == "p") {
            playerGrid[cells[i]].ship = ship;
            id = prefix.concat(cells[i].toString());
            var cell = document.getElementById(id);
            cell.innerHTML = ship;
            if (ship == "B") {
                cell.style.backgroundColor = "B2B2DC";
            } else {
                cell.style.backgroundColor = "navajoWhite";
            }
        } else {
            computerGrid[cells[i]].ship = ship;
            //console.log(ship + " location: " + cells[i]);
        }
    }
}

function placeSub(prefix) {
    var location = randomIntFromInterval(1,64);
    while (checkEmpty(location, prefix) === false) {
        location = randomIntFromInterval(1,64);
    }
    //document.getElementById(prefix.concat(location.toString())).innerHTML = "S";
    if (prefix == "p") {
        playerGrid[location].ship = "S";
        var cell = document.getElementById(prefix.concat(location.toString()));
        cell.innerHTML = "S";
        cell.style.backgroundColor = "plum";
    } else {
        computerGrid[location].ship = "S";
        //console.log("Submarine location: " + location);
    }

}

var whichButton = function (e) {
    // Handle different event models
    var e = e || window.event;
    var btnCode;

    if ('object' === typeof e) {
        btnCode = e.button;
        return btnCode;
        /*switch (btnCode) {
            case 0:
                alert('Left button clicked.');
                break;
            case 1:
                alert('Middle button clicked.');
                break;
            case 2:
                alert('Right button clicked.');
                break;
            default:
                alert('Unexpected code: ' + btnCode);
        }*/
    }
}

function selectAttackLocation(id,event) {
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
        //} else {
        //    return true;
        }
    }
}

function finalizeAttack() {
    if (playerAttack.length > 3) {
        alert("You may only select three attack locations per turn. You have currently selected " + playerAttack.length + " attacks, located at " + cellTranslator(playerAttack) + ". Right click to deselect attack locations.")
    } else if (playerAttack.length < 3 && playerAttack.length > 0) {
        alert("You must select three attack locations per turn. You have currently selected " + playerAttack.length + " attack(s), located at " + cellTranslator(playerAttack) + ". Left click on the computer's grid to attack the location.");
    } else if (playerAttack.length == 0) {
        alert("You must select three attack locations per turn. Left clicko n the computer's grid to attack the location.");
    } else {
        document.getElementById("attack").disabled = true;
        for (var i = 0; i < 3; i++) {
            computerGrid[playerAttack[i]].attackTurn = turn;
            var id = "o".concat(playerAttack[i].toString());
            var cell = document.getElementById(id);
            cell.style.color = "black";
            cell.innerHTML = turn.toString();
        }
        stage = 3;
        getInstructions();
        generateReportForPlayer();
        stage = 4;
        getInstructions();
        generateComputerAttack();
        stage = 5;
        getInstructions();
        generateReportForComputer();
        turn++;
        stage = 2;
        getInstructions();
        if (playerVictory == 0 && computerVictory == 0) {
            document.getElementById("attack").disabled = false;
        } else if (playerVictory == 1) {
            document.getElementById("attack").disabled = true;
            alert("You win!");
            endgame();
        } else {
            alert("You lose :(");
            endgame();
        }
    }
}

function damageZone(attack, player) {
    //generates an array of cell numbers that the given attacks can damage. Can be adjusted by caller depending on attacks hitting ships.
    var grid;
    if (player == 0) { //for player
        grid = computerGrid;
    } else {
        grid = playerGrid; //for computer
    }
    var ret = [];
    var pots = [];

    for (var i = 0; i < 3; i++) { //for each attack
        if (grid[attack[i]].ship == null) { //if the attack is not a hit location for any ship
            var pot1 = attack[i] - 9; //a potential damage location is in its surrounding one-block radius
            var pot2 = attack[i] - 8; 
            var pot3 = attack[i] - 7; 
            var pot4 = attack[i] - 1;
            var pot5 = attack[i] + 1;
            //var pot5 = { value: attack[i] + 1, attackPoint: [attack[i]] };
            var pot6 = attack[i] + 7;
            var pot7 = attack[i] + 8;
            var pot8 = attack[i] + 9;
            if (attack[i] == 1) { //the damage area does not wrap around the grid
                pots = [pot5, pot7, pot8];
            } else if (attack[i] == 8) { //so the potentially damaged areas must be limited depending on where the attack is
                pots = [pot4, pot6, pot7];
            } else if (attack[i] == 57) {
                pots = [pot2, pot3, pot5];
            } else if (attack[i] == 64) {
                pots = [pot1, pot2, pot4];
            } else if (attack[i] < 8) {
                pots = [pot4, pot5, pot6, pot7, pot8];
            } else if (attack[i] > 57) {
                pots = [pot1, pot2, pot3, pot4, pot5];
            } else if (attack[i] % 8 == 1) {
                pots = [pot2, pot3, pot5, pot7, pot8];
            } else if (attack[i] % 8 == 0) {
                pots = [pot1, pot2, pot4, pot6, pot7];
            } else {
                pots = [pot1, pot2, pot3, pot4, pot5, pot6, pot7, pot8];
            }
            for (var j = 0; j < pots.length; j++) {
                //console.log(pots[j]);
                var max = ret.length;
                //console.log("max = " + max);
                if (max == 0) {
                    ret.push(pots[j]);
                } else {
                    if (!contains(ret, pots[j])) { // if ret does not already has the damage location 
                            ret.push(pots[j]); //add the damage location
                    }
                }
            }
        }
    }
    return ret;
}

function getReport(attack, potDam, shipName, player) {
    //if player == 0, player. if player == 1, computer.
    var grid;
    var ships;
    if (player == 0) {
        grid = computerGrid;
        ships = computerShips;
    } else {
        grid = playerGrid;
        ships = playerShips;
    }

    var numHit = 0;
    var numDamage = 0;

    for (var r = 0; r < attack.length; r++) { //for each attack
        if (grid[attack[r]].ship == shipName) { //if attack is a hit for the ship in question
            ++numHit;
            if (shipName == "D") {
                --ships.destroyer;
                if (ships.destroyer == 0 && player == 0) {
                    document.getElementById("dest").style.backgroundColor = "lawngreen";
                }
            } else if (shipName == "T") {
                --ships.tanker;
                if (ships.tanker == 0 && player == 0) {
                    document.getElementById("tank").style.backgroundColor = "lawngreen";
                }
            } else if (shipName == "B") {
                --ships.battleship;
                if (ships.battleship == 0 && player == 0) {
                    document.getElementById("bat").style.backgroundColor = "lawngreen";
                }
            } else if (shipName == "C") {
                --ships.cruiser;
                if (ships.cruiser == 0 && player == 0) {
                    document.getElementById("cruise").style.backgroundColor = "lawngreen";
                }
            } else { //sub is hit
                --ships.submarine;
                if (player == 0) {
                    document.getElementById("sub").style.backgroundColor = "lawngreen";
                }
            }
            //document.getElementById("selfShips").innerHTML = getShipsLeft(0);
            getShipsLeft(1);
            if (ships.destroyer == 0 && ships.tanker == 0 && ships.battleship == 0 && ships.cruiser == 0 && ships.submarine == 0) {
                if (player == 0) {
                    playerVictory = 1;
                } else {
                    computerVictory = 1;
                }
                break;
            }
            for (var i = 0; i < potDam.length; i++) { //go through the potential damaged areas
                if (potDam[i] == attack[r]) { //if the hit location was a potential damage from another attack
                    potDam.splice(i, 1); //remove this location from the damage location
                    --i;
                }
            }
        }
    }
    for (var i = 0; i < potDam.length; i++) { //process damaged ships
        if (grid[potDam[i]].ship == shipName && grid[potDam[i]].attackTurn == 0) {
            ++numDamage;
            potDam.splice(i, 1); //removes damage site from the damage list so that the same ship isn't counted twice
            --i;
        }
    }
    if (player == 0) {
        var hitstring = "";
        var damstring = "";

        if (numHit > 0) {
            hitstring = "<font color = 'CC0066'>" + numHit + "h</font>";
        }
        if (numDamage > 0 && numHit > 0) {
            damstring = ", <font color = '6633FF'>" + numDamage + "d</font>";
        }
        if (numDamage > 0 && numHit == 0) {
            damstring = "<font color = '6633FF'>" + numDamage + "d</font>";
        }
        var ret = hitstring.concat(damstring);
    } else {
        var ret = [numHit, numDamage];
    }
    return ret;
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
    //var element1 = document.createElement("h1");
    //element1.innerHTML = turn;
    //cell1.appendChild(element1);

    cell1.innerHTML = "<b>" + turn + "</b>";
    cell1.style.border = 0;

    var attack1 = playerAttack.pop();
    var attack2 = playerAttack.pop();
    var attack3 = playerAttack.pop();
    var attack = [attack1, attack2, attack3]; //took it out of a list and into another to clear the recycled global variable (playerAttack)
    var potDam = damageZone(attack, 0);

    cell2.innerHTML = getReport(attack, potDam, "D", 0);
    cell3.innerHTML = getReport(attack, potDam, "T", 0);
    cell4.innerHTML = getReport(attack, potDam, "C", 0);
    cell5.innerHTML = getReport(attack, potDam, "B", 0);
    cell6.innerHTML = getReport(attack, potDam, "S", 0);

    if (cell2.innerHTML.length == 0 && cell3.innerHTML.length == 0 && cell4.innerHTML.length == 0 && cell5.innerHTML.length == 0 && cell6.innerHTML.length == 0) {
        cell2.innerHTML = "N O";
        cell4.innerHTML = "R E";
        cell5.innerHTML = "P   O";
        cell6.innerHTML = "R T";
    }
}

function checkAllHits() {
    if (computerReport[turn].dest[0] + computerReport[turn].tank[0] + computerReport[turn].cruise[0] + computerReport[turn].bat[0] + computerReport[turn].sub[0] == 3) {
        return true;
    }
    return false;
}

function generateReportForComputer() {
    var potDam = damageZone(computerAttacks[turn], 1);
    //console.log("before: " + potDam);

    var destroy = getReport(computerAttacks[turn], potDam, "D", 1);
    var tanker = getReport(computerAttacks[turn], potDam, "T", 1);
    var cruiser = getReport(computerAttacks[turn], potDam, "C", 1);
    var battle = getReport(computerAttacks[turn], potDam, "B", 1);
    var submarine = getReport(computerAttacks[turn], potDam, "S", 1);
    computerReport.push({ dest: destroy, tank: tanker, cruise: cruiser, bat: battle, sub: submarine });
    //console.log("after: " + potDam);

    //console.log("turn " + turn + "- destroyer report:" + destroy + "; tanker report: " + tanker + "; cruiser report: " + cruiser + "; battleship report: " + battle + "; submarine report: " + submarine);
    //update cellPossibilities & database
    //process hits
    //console.log("cell Possibilities before hits processed: " + cellPossibilities);
    processHits("D", destroy);
    processHits("T", tanker);
    processHits("C", cruiser);
    processHits("B", battle);
    processHits("S", submarine);
    //console.log("cell Possibilities after hits processed, before damaged: " + cellPossibilities);
    //process damages
    potDam = damageZone(computerAttacks[turn], 1);
    processDamage("D", destroy, potDam);
    processDamage("T", tanker, potDam);
    processDamage("C", cruiser, potDam);
    processDamage("B", battle, potDam);
    processDamage("S", submarine, potDam);
    //console.log("cell Possibilities after damage processing: " + cellPossibilities);
}

function processHits(shipName, report) { //updates future attack choices by eliminating impossibilities based on hit locations
    var ship = null;
    if (shipName == "D") {
        ship = shipDatabase.dest;
    } else if (shipName == "T") {
        ship = shipDatabase.tank;
    } else if (shipName == "C") {
        ship = shipDatabase.cruise;
    } else if (shipName == "B") {
        ship = shipDatabase.bat;
    } else {
        ship = shipDatabase.sub;
    }
    if (report[0] == 1) {
        for (var i = 0; i < ship.length; i++) {
            if (!(contains(ship[i], computerAttacks[turn][0]) || contains(ship[i], computerAttacks[turn][1]) || contains(ship[i], computerAttacks[turn][2]))) {
                //console.log("attacks: " + computerAttacks[turn][0] + ", " + computerAttacks[turn][1] + ", " + computerAttacks[turn][2])
                //console.log(shipName + " possibility removed from " + ship[i].toString() + " by attack at " + computerAttacks[turn].toString());
                possibilitiesUpdate(ship[i], 0);
                ship.splice(i, 1);
                --i;
            }
        }
    }
    if (report[0] == 2) {
        for (i = 0; i < ship.length; i++) {
            if (!((contains(ship[i], computerAttacks[turn][0]) && contains(ship[i], computerAttacks[turn][1])) || (contains(ship[i], computerAttacks[turn][1]) && contains(ship[i], computerAttacks[turn][2])) || (contains(ship[i], computerAttacks[turn][0]) && contains(ship[i], computerAttacks[turn][2])))) {
                //console.log(shipName + " possibility removed from " + ship[i].toString() + " by attack at " + computerAttacks[turn].toString());
                possibilitiesUpdate(ship[i], 0);
                ship.splice(i, 1);
                --i;
            }
        }
    }
    if (report[0] == 3) {
        report[1] = undefined;
        for (i = 0; i < ship.length; i++) {
            if (!(contains(ship[i], computerAttacks[turn][0]) && contains(ship[i], computerAttacks[turn][1]) && contains(ship[i], computerAttacks[turn][2]))) {
                //console.log(shipName + " possibility removed from " + ship[i].toString() + " by attack at " + computerAttacks[turn].toString());
                possibilitiesUpdate(ship[i], 0);
                ship.splice(i, 1);
                --i;
            }
        }
    }
}

function processDamage(shipName, report, potDam) {
    var ship = null;
    if (shipName == "D") {
        ship = shipDatabase.dest;
    } else if (shipName == "T") {
        ship = shipDatabase.tank;
    } else if (shipName == "C") {
        ship = shipDatabase.cruise;
    } else if (shipName == "B") {
        ship = shipDatabase.bat;
    } else {
        ship = shipDatabase.sub;
    }

    /*if (report[1] == 0 && !checkAllHits()) { //0 damaged
        for (var j = 0; j < ship.length; j++) {
            for (var i = 0; i < potDam.length; i++) {
                if (contains(ship[j], potDam[i])) {
                    console.log(shipName + " possibility removed from " + ship[j].toString() + " by attack at " + computerAttacks[turn].toString());
                    possibilitiesUpdate(ship[j], 0); 
                    ship.splice(j, 1);
                    --j;
                    break;
                }
            }
        }
    } else {*/
        var counter; //keeps track of how many damages an attack should have
        for (var j = 0; j < ship.length; j++) { //for every ship possibility
            counter = 0;
            for (var i = 0; i < potDam.length; i++) { //for each potential damage location
                if (contains(ship[j], potDam[i]) && playerGrid[potDam[i]].attackTurn == 0) { //if the ship possibility contains a potential damage location
                    counter++; //increase the counter
                }
            }
            if (counter > (report[1] + report[0])) { //if the number of damages in that ship location is greater than the number of damages from the report
                //console.log("counter = " + counter + "; report[1] = " + report[1]);
                //console.log(shipName + " possibility removed from " + ship[j].toString() + " by attack at " + computerAttacks[turn].toString());
                possibilitiesUpdate(ship[j], 0); //remove that ship location.
                ship.splice(j, 1);
                --j;
            }
        }
    //}

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
    //if (arguments.length == 1) {
    //    if (checkNeighbors(avoidCell, ret)) {
    //        ret = 0;
    //        while (playerGrid[ret].attackTurn != 0 || ret == 0 || cellPossibilities[ret] < 0) {
    //            ret = randomIntFromInterval(1, 64);
    //        }
    //    }
    //}
    //if (arguments.length == 2) {
    //    if (checkNeighbors(avoidCell, ret) || checkNeighbors(avoidCell2, ret)) {
    //        ret = 0;
    //        while (playerGrid[ret].attackTurn != 0 || ret == 0 || cellPossibilities[ret] < 0) {
    //            ret = randomIntFromInterval(1, 64);
    //        }
    //    }
    //}
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
    for (var i = 1; i < computerReport.length-1; i++) {
        if (computerReport[i].dest[0] > 0) {
            attacksThatHit.push(i); //populate attacksThatHit
        }
    }
    for (var j = 0; j < shipDatabase.dest.length; j++) { //if there isn't an attack from each attack turn in each ship left in the database, remove that ship
        for (var i = 0; i < attacksThatHit.length; i++) {
            var arr = computerAttacks[attacksThatHit[i]];
            if (!(contains(shipDatabase.dest[j], arr[0]) || contains(shipDatabase.dest[j], arr[1]) || contains(shipDatabase.dest[j], arr[2]))) {
                //console.log("Destroyer removed from " + shipDatabase.dest[j] + " based on attack at " + arr);
                possibilitiesUpdate(shipDatabase.dest[j], 0);
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
        if (computerReport[attacksThatHit[i]].dest[0] == 3){ 
            var att = computerAttacks[attacksThatHit[i]]; //the three attacks that hit the ship
            att.sort(function(a, b){return a-b});
            for (var j = 0; j < att.length; j++) {
                computerVision[att[j]] = "D";
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
                        //console.log("future attack at " + newAtt + " pushed");
                        futureComputerAttacks.push(newAtt);
                    }
                } else {
                    newAtt = att[0] + difference;
                    if (computerVision[newAtt] == "" && playerGrid[newAtt].attackTurn == 0) {
                        if (!contains(futureComputerAttacks, newAtt)) {
                           // console.log("future attack at " + newAtt + " pushed");
                            futureComputerAttacks.push(newAtt);
                        }
                    } else {
                        newAtt = att[1] + difference;
                        if (computerVision[newAtt] == "" && playerGrid[newAtt].attackTurn == 0) {
                            if (!contains(futureComputerAttacks, newAtt)) {
                                //console.log("future attack at " + newAtt + " pushed");
                                futureComputerAttacks.push(newAtt);
                            }
                        } else {
                            newAtt = att[2] + difference;
                            if (computerVision[newAtt] == "" && playerGrid[newAtt].attackTurn == 0) {
                                if (!contains(futureComputerAttacks, newAtt)) {
                                    //console.log("future attack at " + newAtt + " pushed");
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
                var destHit = 0; //cell number of the fourth attack on the destroyer
                if (i = 0) {
                    requiredAttackTurn = attacksThatHit[i + 1];
                } else {
                    requiredAttackTurn = attacksThatHit[i - 1];
                }
                var attacksFromSingleHitTurn = computerAttacks[requiredAttackTurn];
                for (var j = 0; j < attacksFromSingleHitTurn; j++) {
                    //figure out the orientation of ships hit
                    if (checkNeighbors(attacksFromSingleHitTurn[j], att[0]) && (Math.abs(att[0]-attacksFromSingleHitTurn[j]) % difference == 0) && (computerVision[attacksFromSingleHitTurn[j]] == "" || computerVision[attacksFromSingleHitTurn[j]] == "D")) {
                        att.push(attacksFromSingleHitTurn[j]);
                        //console.log(attacksFromSingleHitTurn[j] + "from turn " + requiredAttackTurn + " is probably a destroyer; it is next to " + att[0]);
                    }
                    if (checkNeighbors(attacksFromSingleHitTurn[j], att[1]) && (Math.abs(att[1] - attacksFromSingleHitTurn[j]) % difference == 0) && (computerVision[attacksFromSingleHitTurn[j]] == "" || computerVision[attacksFromSingleHitTurn[j]] == "D")) {
                        att.push(attacksFromSingleHitTurn[j])
                        //console.log(attacksFromSingleHitTurn[j] + "from turn " + requiredAttackTurn + " is probably a destroyer; it is next to " + att[1]);
                    }
                    if (checkNeighbors(attacksFromSingleHitTurn[j], att[2]) && (Math.abs(att[2] - attacksFromSingleHitTurn[j]) % difference == 0) && (computerVision[attacksFromSingleHitTurn[j]] == "" || computerVision[attacksFromSingleHitTurn[j]] == "D")) {
                        att.push(attacksFromSingleHitTurn[j]);
                        //console.log(attacksFromSingleHitTurn[j] + "from turn " + requiredAttackTurn + " is probably a destroyer; it is next to " + att[2]);
                    }
                }
                att.sort(function (a, b) { return a - b });
                if (att.length == 4) { //if there are more than 4, then there was some trouble figuring out the hits in the previous for loop
                    //four in a row
                    if (checkNeighbors(att[0], att[1]) && checkNeighbors(att[1], att[2]) && checkNeighbors(att[2], att[3])) {
                        var potAtt = att[0] - difference;
                        if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                            if (!contains(futureComputerAttacks, potAtt)) {
                                //console.log("future attack at " + potAtt + " pushed");
                                futureComputerAttacks.push(potAtt);
                            }
                        } else {
                            potAtt = att[3] + difference;
                            if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                                if (!contains(futureComputerAttacks, potAtt)) {
                                   // console.log("future attack at " + potAtt + " pushed");
                                    futureComputerAttacks.push(potAtt);
                                }
                            }
                        }
                    } else if ((att[1] - att[0]) == (2 * difference) && checkNeighbors(att[1], att[2]) && checkNeighbors(att[2], att[3])) { //one, blank, three
                        var potAtt = att[0] + difference;
                        if (!contains(futureComputerAttacks, potAtt)) {
                            //console.log("future attack at " + potAtt + " pushed");
                            futureComputerAttacks.push(potAtt);
                        }
                    } else if (checkNeighbors(att[0], att[1]) && (att[2] - att[1]) == (2 * difference) && checkNeighbors(att[2], att[3])) { //two, blank, two
                        var potAtt = att[1] + difference;
                        if (!contains(futureComputerAttacks, potAtt)) {
                            //console.log("future attack at " + potAtt + " pushed");
                            futureComputerAttacks.push(potAtt);
                        }
                    } else {//three, blank, one
                        var potAtt = att[2] + difference;
                        if (!contains(futureComputerAttacks, potAtt)) {
                           // console.log("future attack at " + potAtt + " pushed");
                            futureComputerAttacks.push(potAtt);
                        }
                    }
                }
            }
        } else if (computerReport[attacksThatHit[i]].dest[0] == 2) { //handle two hits from the same attack turn
            var att = computerAttacks[attacksThatHit[i]]; //the three attacks; 2 of these hit the ship
            att.sort(function (a, b) { return a - b });
            for (var j = 0; j < att.length; j++) {
                if (computerVision[att[j]] != "" || computerVision[att[j]] != "D") { //if one of the attacks is known to be another ship, remove it from this possibility
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
                    //console.log("D possibility at " + shipDatabase.dest[j] + " removed because attack at " + cellTranslator(removed) + " was not a hit.");
                    shipDatabase.dest.splice(j, 1);
                    --j;
                }
            }
            if (att.length == 2) {
                computerVision[att[0]] == "D";
                computerVision[att[1]] == "D";
                var difference = Math.abs(att[1] - att[0]);
                var destLeft = playerShips.destroyer;
                //if (destLeft == 3) { //these two were the only two hits on the ship so far
                    if (checkNeighbors(att[0], att[1])) { //two attacked are next to each other
                        var potAtt = att[0] - difference;
                        if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                            if (!contains(futureComputerAttacks, potAtt)) {
                                //console.log("future attack at " + potAtt + " pushed");
                                futureComputerAttacks.push(potAtt);
                            }
                        } else {
                            potAtt = att[1] + difference;
                            if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                                if (!contains(futureComputerAttacks, potAtt)) {
                                    //console.log("future attack at " + potAtt + " pushed");
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
                            if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                                if (!contains(futureComputerAttacks, potAtt)) {
                                    //console.log("future attack at " + potAtt + " pushed");
                                    futureComputerAttacks.push(potAtt);
                                }
                            } else {
                                potAtt += difference;
                                if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                                    if (!contains(futureComputerAttacks, potAtt)) {
                                        //console.log("future attack at " + potAtt + " pushed");
                                        futureComputerAttacks.push(potAtt);
                                    }
                                } else {
                                    potAtt = att[1] - difference;
                                    if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                                        if (!contains(futureComputerAttacks, potAtt)) {
                                            //console.log("future attack at " + potAtt + " pushed");
                                            futureComputerAttacks.push(potAtt);
                                        }
                                    }
                                }
                            }
                        }
                            //blank,one,blank,blank,one
                            //one,blank,blank,one,blank
                        else if ((att[1]-att[0]) == (3*difference)) {
                            //don't know if att[0]-difference or att[1] + difference
                            potAtt = att[0] + difference;
                            if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                                if (!contains(futureComputerAttacks, potAtt)) {
                                    //console.log("future attack at " + potAtt + " pushed");
                                    futureComputerAttacks.push(potAtt);
                                }
                            } else {
                                potAtt += difference;
                                if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                                    if (!contains(futureComputerAttacks, potAtt)) {
                                        //console.log("future attack at " + potAtt + " pushed");
                                        futureComputerAttacks.push(potAtt);
                                    }
                                } else {
                                    potAtt = att[0] - difference;
                                    if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                                        if (!contains(futureComputerAttacks, potAtt)) {
                                            //console.log("future attack at " + potAtt + " pushed");
                                            futureComputerAttacks.push(potAtt);
                                        }
                                    } else {
                                        potAtt = att[1] + difference;
                                        if ((computerVision[potAtt] == "" || computerVision[potAtt] == "D") && playerGrid[potAtt].attackTurn == 0) {
                                            if (!contains(futureComputerAttacks, potAtt)) {
                                                //console.log("future attack at " + potAtt + " pushed");
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
                                if (attacksThatHit.length >1) {
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
        var difference = Math.abs(cell2-cell1);
        if (difference % 9 == 0 || difference % 8 == 0 ||difference % 7 == 0 || difference <= 4) {
            return true;
        }
        return false;
    } else if (arguments.length == 3) {
        var difference = Math.abs(cell2-cell1);
        if (difference % 9 == 0) {
            if (cell1 + 9*distance == cell2) {
                return true;
            } 
            return false;
        } else if (difference % 8 == 0) {
            if (cell1 + 8*distance == cell2) {
                return true;
            }
            return false;
        } else if (difference % 7 == 0) {
            if (cell1 + 7*distance == cell2) {
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

function verifyInLine(cell1, potentialAttackCell, difference) {
    if (Math.abs(potentialAttackCell - cell1) % difference == 0) {
        return true;
    }
    return false;
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
        for (key in shipDatabase) { //if there's only one ship location left
            if (shipDatabase[key].length == 1) {
                //console.log("The last possible " + key + " is located at " + shipDatabase[key][0]);
                for (var j = 0; j < shipDatabase[key][0].length; j++) {
                    computerVision[shipDatabase[key][0][j]] = key.toString();
                }
                //console.log("cell possibilities: " + cellPossibilities);
                if (attack1 == 0 || attack2 == 0 || attack3 == 0) {
                    for (var i = 0; i < shipDatabase[key][0].length; i++) {
                        if (playerGrid[shipDatabase[key][0][i]].attackTurn == 0) {
                            if (attack1 == 0) {
                                attack1 = shipDatabase[key][0][i];
                            } else if (attack2 == 0) {
                                attack2 = shipDatabase[key][0][i];
                            } else if (attack3 == 0) {
                                attack3 == shipDatabase[key][0][i];
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
            attack3 = getMaxPossibility(attack1,attack2);
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

function possibilitiesUpdate(cells, direction) {
    //direction = 1 means add cells; direction = 0 means remove cells
    if (direction == 1) {
        for (var j = 0; j < cells.length; j++) {
            if (playerGrid[cells[j]].attackTurn == 0) {
                ++cellPossibilities[cells[j]];
            }
        }
    } else {
        for (var j = 0; j < cells.length; j++) {
            if (cellPossibilities[cells[j]] > 0) {
                --cellPossibilities[cells[j]];
                if (cellPossibilities[cells[j]] == 0) {
                    //secondDegreePossibilitiesUpdate(cells[j]);
                }
            }
        }
    }
    //console.log("Cell possibilities: " + cellPossibilities);
}

function secondDegreePossibilitiesUpdate(cellNum) {
    var arr = [shipDatabase.dest, shipDatabase.tank, shipDatabase.cruise, shipDatabase.bat, shipDatabase.sub];
    var ship = "";
    for (var j = 0; j < arr.length; j++) {
        if (j == 0) {
            ship = "D";
        } else if (j == 1) {
            ship = "T";
        } else if (j == 2) {
            ship = "C";
        } else if (j == 3) {
            ship = "B";
        } else {
            ship = "S";
        }
        for (var i = 0; i < arr[j].length; i++) {
            if (contains(arr[j][i], cellNum)) {
                //console.log(ship + " removed from " + arr[j][i] + " by emptying of " + cellNum);
                cells = arr[j][i];
                for (var k = 0; k < cells.length; k++) {
                    if (cells[k] == 1) {
                        //console.log("Cell " + cells[k] + " emptied by removal of " + arr[j][i]);
                    }
                }
                arr[j].splice(i, 1);
                --i;
                possibilitiesUpdate(cells, 0);

            }
        }
    }
}

function rebootPossibilities() {
    for (var i = 0; i < cellPossibilities.length; i++) {
        if (cellPossibilities[i] >= 0) {
            cellPossibilities[i] = 0;
        }
    }
    for (var i = 0; i < shipDatabase.dest.length; i++) {
        possibilitiesUpdate(shipDatabase.dest[i], 1);
    }
    for (var i = 0; i < shipDatabase.tank.length; i++) {
        possibilitiesUpdate(shipDatabase.tank[i], 1);
    }
    for (var i = 0; i < shipDatabase.cruise.length; i++) {
        possibilitiesUpdate(shipDatabase.cruise[i], 1);
    }
    for (var i = 0; i < shipDatabase.bat.length; i++) {
        possibilitiesUpdate(shipDatabase.bat[i], 1);
    }
    for (var i = 0; i < shipDatabase.sub.length; i++) {
        possibilitiesUpdate(shipDatabase.sub[i], 1);
    }
}

function getShipsLeft(specify) {
    /*specify = 0 for player's ships, specify = 1 for computer's ships*/
    var ret = "";
    if (specify == 0) {
        ret = "Destroyers: " + playerShips.destroyer + ", Tankers: " + playerShips.tanker + ", Cruisers: " + playerShips.cruiser + ", Battleships: " + playerShips.battleship + ", Submarine: " + playerShips.submarine;
        if (playerShips.destroyer == 0) {
            shipDatabase.dest = [];
            rebootPossibilities();
        }
        if (playerShips.tanker == 0) {
            shipDatabase.tank = [];
            rebootPossibilities();
        }
        if (playerShips.cruiser == 0) {
            shipDatabase.cruise = [];
            rebootPossibilities();
        }
        if (playerShips.battleship == 0) {
            shipDatabase.bat = [];
            rebootPossibilities();
        }
        if (playerShips.submarine == 0) {
            shipDatabase.sub = [];
            rebootPossibilities();
        }
       
    } else {
        document.getElementById("oppShipsDest").innerHTML = "<b> Destroyer [" + computerShips.destroyer + "] <b>";
        document.getElementById("oppShipsTank").innerHTML = "<b> Tanker [" + computerShips.tanker + "] <b>";
        document.getElementById("oppShipsCruise").innerHTML = "<b> Cruiser [" + computerShips.cruiser + "] <b>";
        document.getElementById("oppShipsBat").innerHTML = "<b> Battleship [" + computerShips.battleship + "] <b>";
        document.getElementById("oppShipsSub").innerHTML = "<b> Submarine [" + computerShips.submarine + "] <b>";
        //ret = "Destroyers: " + computerShips.destroyer + ", Tankers: " + computerShips.tanker + ", Cruisers: " + computerShips.cruiser + ", Battleships: " + computerShips.battleship + ", Submarine: " + computerShips.submarine;
    }

    return ret;
}

function cellTranslator(cellNumber) {
    var ret = "";

    for (var i = 0; i < cellNumber.length; i++) {
        if (cellNumber[i] % 8 == 0) {
            ret += "H";
        } else if (cellNumber[i] % 8 == 1) {
            ret += "A";
        } else if (cellNumber[i] % 8 == 2) {
            ret += "B";
        } else if (cellNumber[i] % 8 == 3) {
            ret += "C";
        } else if (cellNumber[i] % 8 == 4) {
            ret += "D";
        } else if (cellNumber[i] % 8 == 5) {
            ret += "E";
        } else if (cellNumber[i] % 8 == 6) {
            ret += "F";
        } else {
            ret += "G";
        }

        if (cellNumber[i] <= 8) {
            ret += "1";
        } else if (cellNumber[i] <= 16) {
            ret += "2";
        } else if (cellNumber[i] <= 24) {
            ret += "3";
        } else if (cellNumber[i] <= 32) {
            ret += "4";
        } else if (cellNumber[i] <= 40) {
            ret += "5";
        } else if (cellNumber[i] <= 48) {
            ret += "6";
        } else if (cellNumber[i] <= 56) {
            ret += "7";
        } else {
            ret += "8";
        }

        if (i < cellNumber.length - 1 && cellNumber.length >= 3) {
            ret += ", "
        }
        if (i == cellNumber.length - 2) {
            ret += " and ";
        }
    }
    return ret;
}

function endgame() {
    document.getElementById("attack").innerHTML = "Play again?";
    document.getElementById("attack").disabled = false;
    document.getElementById("attack").onclick = function () {
        location.reload(false);
    }
}