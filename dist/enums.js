export var Stage;
(function (Stage) {
    Stage["PlaceShips"] = "place_ships";
    Stage["PlayerAttack"] = "player_attack";
    Stage["RecieveReport"] = "recieve_report";
    Stage["OpponentAttack"] = "opponent_attack";
    Stage["OpponentReport"] = "opponent_report";
})(Stage || (Stage = {}));
export var ShipTypeAbbr;
(function (ShipTypeAbbr) {
    ShipTypeAbbr["Destroyer"] = "D";
    ShipTypeAbbr["Tanker"] = "T";
    ShipTypeAbbr["Battleship"] = "B";
    ShipTypeAbbr["Cruiser"] = "C";
    ShipTypeAbbr["Submarine"] = "S";
})(ShipTypeAbbr || (ShipTypeAbbr = {}));
export var PlayerType;
(function (PlayerType) {
    PlayerType[PlayerType["Player"] = 0] = "Player";
    PlayerType[PlayerType["Computer"] = 1] = "Computer";
})(PlayerType || (PlayerType = {}));
export var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["TopRight"] = 2] = "TopRight";
    Direction[Direction["Right"] = 3] = "Right";
    Direction[Direction["BottomRight"] = 4] = "BottomRight";
    Direction[Direction["Down"] = 5] = "Down";
    Direction[Direction["BottomLeft"] = 6] = "BottomLeft";
    Direction[Direction["Left"] = 7] = "Left";
    Direction[Direction["TopLeft"] = 8] = "TopLeft";
})(Direction || (Direction = {}));
//# sourceMappingURL=enums.js.map