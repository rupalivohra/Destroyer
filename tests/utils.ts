export function getTestHtml(): string {
    // Create the attack button (matching index.html)
    let html = `<button id="attack"></button>`;

    // Create all 64 cells for player's grid (o1-o64, matching index.html)
    for (let i = 1; i <= 64; i++) {
        html += `<div id="o${i}"></div>`;
    }

    // Create all 64 cells for computer's grid (p1-p64, matching index.html)
    for (let i = 1; i <= 64; i++) {
        html += `<div id="p${i}"></div>`;
    }

    // Create report table elements for ship tracking
    html += `
                <table id="report">
                    <colgroup>
                        <col id="turn" style="width:10px; background-color:white" />
                        <col id="dest" />
                        <col id="tank" />
                        <col id="cruise" />
                        <col id="bat" />
                        <col id="sub" />
                    </colgroup>
                    <tr>
                        <th></th>
                        <th style="background-color:white" id="oppShipsDest">Destroyer</th>
                        <th style="background-color:white" id="oppShipsTank">Tanker</th>
                        <th style="background-color:white" id="oppShipsCruise">Cruiser</th>
                        <th style="background-color:white" id="oppShipsBat">Battleship</th>
                        <th style="background-color:white" id="oppShipsSub">Submarine</th>
                    </tr>
                </table>
            `;

    // Create instructions div
    html += `<div id="instructionsDiv"><p id="instructions"></p></div>`;

    return html;
}