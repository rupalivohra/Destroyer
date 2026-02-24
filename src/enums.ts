export enum Stage {
    PlaceShips = 'place_ships',
    PlayerAttack = 'player_attack',
    RecieveReport = 'recieve_report',
    OpponentAttack = 'opponent_attack',
    OpponentReport = 'opponent_report',
}

export enum PlayerType {
    Player = 0,
    Computer = 1,
}

export enum Direction {
    Up = 1,
    TopRight = 2,
    Right = 3,
    BottomRight = 4,
    Down = 5,
    BottomLeft = 6,
    Left = 7,
    TopLeft = 8,
}

export enum MouseClick {
    Left,
    Right,
    Unknown
}