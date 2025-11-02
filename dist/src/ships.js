export var ShipTypeAbbr;
(function (ShipTypeAbbr) {
    ShipTypeAbbr["Destroyer"] = "D";
    ShipTypeAbbr["Tanker"] = "T";
    ShipTypeAbbr["Battleship"] = "B";
    ShipTypeAbbr["Cruiser"] = "C";
    ShipTypeAbbr["Submarine"] = "S";
})(ShipTypeAbbr || (ShipTypeAbbr = {}));
export var Ship;
(function (Ship) {
    Ship["Destroyer"] = "Destroyer";
    Ship["Tanker"] = "Tanker";
    Ship["Battleship"] = "Battleship";
    Ship["Cruiser"] = "Cruiser";
    Ship["Submarine"] = "Submarine";
})(Ship || (Ship = {}));
export const ShipTypes = {
    Destroyer: {
        shorthand: ShipTypeAbbr.Destroyer,
        size: 5,
        backgroundColor: "rgb(220, 178, 178)"
    },
    Tanker: {
        shorthand: ShipTypeAbbr.Tanker,
        size: 4,
        backgroundColor: "rgb(255, 217, 202)"
    },
    Battleship: {
        shorthand: ShipTypeAbbr.Battleship,
        size: 3,
        backgroundColor: "rgb(178, 178, 220)"
    },
    Cruiser: {
        shorthand: ShipTypeAbbr.Cruiser,
        size: 3,
        backgroundColor: "rgb(255, 222, 173)"
    },
    Submarine: {
        shorthand: ShipTypeAbbr.Submarine,
        size: 1,
        backgroundColor: "rgb(221, 160, 221)"
    }
};
//# sourceMappingURL=ships.js.map