export enum Stage {
    PlaceShips = 'place_ships',
    PlayerAttack = 'player_attack',
    RecieveReport = 'recieve_report',
    OpponentAttack = 'opponent_attack',
    OpponentReport = 'opponent_report',
}

export enum ShipTypeAbbr {
    Destroyer = 'D',
    Tanker = 'T',
    Battleship = 'B',
    Cruiser = 'C',
    Submarine = 'S',
}

export enum PlayerType {
    Player = 0,
    Computer = 1,
}