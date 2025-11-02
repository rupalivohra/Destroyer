export enum ShipTypeAbbr {
    Destroyer = 'D',
    Tanker = 'T',
    Battleship = 'B',
    Cruiser = 'C',
    Submarine = 'S',
}

type ShipMetadata = {
    shorthand: ShipTypeAbbr;
    size: number;
    backgroundColor: string;
}

export enum Ship {
    Destroyer = "Destroyer",
    Tanker = "Tanker",
    Battleship = "Battleship",
    Cruiser = "Cruiser",
    Submarine = "Submarine"
}

export const ShipTypes: Record<Ship, ShipMetadata> = {
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