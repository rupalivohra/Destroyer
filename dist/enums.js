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
//# sourceMappingURL=enums.js.map