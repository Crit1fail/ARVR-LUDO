// Get references to various HTML elements
const infoDiv = document.getElementById('info');
const currentPlayerDiv = document.getElementById('current-player');
const rollDiceButton = document.getElementById('roll-button');
const root = document.querySelector(':root');
const side = document.querySelector('side');
const main = document.querySelector('main');
const dice = document.querySelector('.dice');

// Store references to all the tokens
const tokens = {};

// Initialize the game object
let game;

// Game class to manage the game state
class Game {
    /**
     * Constructor to initialize the game state.
     * @param {Array} players - List of player colors participating in the game.
     * @param {Array} computerOpponentLevels - Difficulty levels for AI players (Easy/Hard).
     * @param {Object} tokenPositions - Initial token positions for all players.
     */
    constructor(players, computerOpponentLevels = [], tokenPositons = undefined) {
        // Initialize player data
        this.players = players;
        this.numberOfPlayers = players.length;
        this.currentPlayerIndex = 0;
        this.currentPossibleMoves = [];
        this.lastRolledValue = 0;

        // Set initial token positions
        this.tokenPositons = {};
        if (tokenPositons === undefined) {
            // If no positions are provided, set all tokens at the start position
            for (let player of this.players) {
                this.tokenPositons[player] = [-6, -6, -6, -6];
            }
        } else {
            this.tokenPositons = tokenPositons;
        }

        // Get references to tokens and set their click event handlers
        for (let player of this.players) {
            tokens[player] = [];
            for (let i = 0; i < 4; i++) {
                const id = `${player}-token-${i + 1}`;
                const token = document.getElementById(id);
                tokens[player].push(token);

                // Set click event for human players
                document.querySelector(`#${player}-token-${i + 1}__pawn-shape`).addEventListener('click', () => {
                    if (game.isCurrentPlayerComputerOpponent()) return;
                    game.moveToken(player, i);
                });

                // Set initial token positions
                const startPosition = startPositions[player][i];
                const position = this.tokenPositons[player][i];
                if (position === -6) {
                    token.setAttribute('translation', `${startPosition[1]} 1 ${startPosition[0]}`);
                } else {
                    const tile = playerPaths[player][position];
                    token.setAttribute('translation', `${tile[1]} 1 ${tile[0]}`);
                    this.distributeTokensOnOneTile(tile);
                }
            }
        }

        // Hide tokens of colors that are not used because of the set number of players
        for (let player of allPossiblePlayers) {
            if (this.players.findIndex(possiblePlayer => possiblePlayer === player) !== -1) {
                for (let i = 0; i < 4; i++) {
                    const id = `${player}-token-${i + 1}`;
                    const token = document.getElementById(id);
                    token.setAttribute('visible', 'true');
                }
            } else {
                document.querySelector(`.scoreboard .${player}`).style.display = 'none';
            }
        }

        // Create computer opponents
        this.computerOpponents = {};
        this.computerOpponentIndices = []; // which of the indices of players are robots
        for (let i = 0; i < computerOpponentLevels.length; i++) {
            const index = i + this.numberOfPlayers - computerOpponentLevels.length;
            this.computerOpponentIndices.push(index);
            this.computerOpponents[index] = new (computerOpponentLevels[i] === 'Hard' ? MonteCarloOpponent : ComputerOpponent)(this, this.players[index], index);
            document.querySelector(`.scoreboard > .${this.players[index]} .dot`).dataset.ai = 'true';
        }

        // Update player scores
        for (let player of this.players) {
            this.updatePlayerScore(player);
        }
    }

    /**
     * Roll the dice and return a promise that resolves when the animation is complete.
     * @param {number} [value] - Optional dice roll value, if not provided, a random value will be used.
     * @returns {Promise<boolean>} - True if any move is possible after the roll, false otherwise.
     */
    rollDice(value) {
        const rolledValue = value ?? Math.floor(Math.random() * 6) + 1;
        rollDiceAnimate(rolledValue);

        return new Promise(resolve => {
            setTimeout(() => {
                infoDiv.innerText = `Rolled: ${rolledValue}`;
                this.lastRolledValue = rolledValue;

                // Check if any moves are possible after the roll
                if (!this.checkPossibleMoves()) {
                    // If no moves are possible, move to the next player
                    setTimeout(() => this.nextPlayer(), 300);
                    resolve(false);
                }

                resolve(true);
            }, diceAnimationLength + 50);
        });
    }

    /**
     * Check if any moves are possible for the current player based on the last dice roll.
     * @returns {boolean} - True if any move is possible, false otherwise.
     */
    checkPossibleMoves() {
        this.clearPossibleMoves();
        let isAnyPossible = false;

        for (let i = 0; i < 4; i++) {
            const player = this.players[this.currentPlayerIndex];
            const position = this.tokenPositons[player][i];
            const newPosition = position + this.lastRolledValue;

            if (newPosition >= 0 && newPosition < playerPaths[player].length) {
                isAnyPossible = true;

                // Highlight the token to indicate a possible move
                document.querySelector(`#${player}-token-${i + 1}__pawn-material`).setAttribute('emissiveColor', '0.5 0.5 0.5');
            }
        }

        return isAnyPossible;
    }

    // Check if the current player is a computer opponent
    isCurrentPlayerComputerOpponent() {
        return this.computerOpponentIndices.includes(this.currentPlayerIndex);
    }

    // Move to the next player
    nextPlayer() {
        this.currentPlayerIndex++;
        this.currentPlayerIndex %= this.numberOfPlayers;
        this.lastRolledValue = 0;

        currentPlayerDiv.innerText = this.players[this.currentPlayerIndex];

        // Update the UI to reflect the new current player
        root.style.setProperty('--background-color', `var(--${this.players[this.currentPlayerIndex]}-bg)`);
        root.style.setProperty('--text-color', `var(--${this.players[this.currentPlayerIndex]}-text)`);
        viewPoints[this.players[this.currentPlayerIndex]].setAttribute('set_bind', 'true');

        if (this.isCurrentPlayerComputerOpponent()) {
            // Disable the roll button for computer opponents
            rollDiceButton.style.opacity = '0.5';
            this.moveComputerOpponent(this.currentPlayerIndex);
        } else {
            rollDiceButton.style.opacity = '1';
        }
    }

    /**
     * Move a token for the current player.
     * @param {string} player - The color of the player.
     * @param {number} i - The index of the token to move.
     * @returns {boolean} - True if the token was moved successfully, false otherwise.
     */
    moveToken(player, i) {
        const token = tokens[player][i];

        if (player != this.players[this.currentPlayerIndex] || this.lastRolledValue == 0) return false;

        let oldTile = playerPaths[player][this.tokenPositons[player][i]];
        if (oldTile === undefined) {
            const position = token.getAttribute('translation').split(' ');
            oldTile = [parseFloat(position[2]), parseFloat(position[0])];
        }

        const oldPosition = this.tokenPositons[player][i];
        const newPosition = this.tokenPositons[player][i] += this.lastRolledValue;

        if (newPosition < 0) return false;

        const newTile = playerPaths[player][newPosition];

        // Check for sending opponent players home
        if (safeTiles.findIndex(safeTile => arraysEqual(safeTile, newTile)) === -1) {
            for (let otherPlayer of this.players) {
                if (otherPlayer === player) continue;

                const otherTilesFoundIndices = [];

                for (let i = 0; i < 4; i++) {
                    const otherTokenTile = playerPaths[otherPlayer][this.tokenPositons[otherPlayer][i]];

                    if (arraysEqual(otherTokenTile, newTile)) {
                        otherTilesFoundIndices.push(i);
                    }
                }

                if (otherTilesFoundIndices.length === 1) {
                    const otherTileIndex = otherTilesFoundIndices[0];
                    this.tokenPositons[otherPlayer][otherTileIndex] = -6;
                    const startPosition = this.getFreeStartPosition(otherPlayer);

                    // Start the animation to move the other player's token back to the start
                    setTimeout(() => {
                        let keyValue = `${newTile[1]} 1 ${newTile[0]}  ${newTile[1]} 5 ${newTile[0]}  ${startPosition[1]} 1 ${startPosition[0]}`;
                        let key = '0 0.2 1';

                        const timeSensor = document.getElementById(`time-${otherPlayer}-${otherTileIndex + 1}`);
                        const positionInterpolator = document.getElementById(`move-${otherPlayer}-${otherTileIndex + 1}`);

                        const time = `${new Date().getTime() / 1000}`;

                        positionInterpolator.setAttribute('keyValue', keyValue);
                        positionInterpolator.setAttribute('key', key);
                        timeSensor.setAttribute('cycleInterval', `2`);
                        timeSensor.setAttribute('starttime', time);

                        tokens[otherPlayer][otherTileIndex].setAttribute('translation', `${startPosition[1]} 1 ${startPosition[0]}`);

                        this.updatePlayerScore(otherPlayer);
                    }, this.lastRolledValue * 500);
                }
            }
        }

        // Set up and run the move animation for the current token
        let movesCount = 0;
        let keyValue = `${oldTile[1]} 1 ${oldTile[0]}`;

        for (let positionIndex = Math.max(oldPosition, -1); positionIndex < newPosition; positionIndex++) {
            const position = (positionIndex == -1) ? oldTile : playerPaths[player][positionIndex];
            const nextPosition = playerPaths[player][positionIndex + 1];

            keyValue += `  ${(position[1] + nextPosition[1]) / 2} 2 ${(position[0] + nextPosition[0]) / 2}  ${nextPosition[1]} 1 ${nextPosition[0]}  `;
            movesCount += 2;
        }

        let key = '0';
        for (let j = 1; j <= movesCount; j++) {
            key += ` ${j / movesCount}`;
        }

        const timeSensor = document.getElementById(`time-${player}-${i + 1}`);
        const positionInterpolator = document.getElementById(`move-${player}-${i + 1}`);

        const time = `${new Date().getTime() / 1000}`;

        positionInterpolator.setAttribute('keyValue', keyValue);
        positionInterpolator.setAttribute('key', key);
        timeSensor.setAttribute('cycleInterval', `${movesCount / 4}`);
        timeSensor.setAttribute('starttime', time);

        // Update the token position and distribution after the animation
        setTimeout(() => {
            tokens[player][i].setAttribute('translation', `${newPosition[1]} 1 ${newPosition[0]}`);
            if (oldTile) this.distributeTokensOnOneTile(oldTile);
            this.distributeTokensOnOneTile(newTile);

            this.updatePlayerScore(player);

            if (!this.checkForGameOver(player) && this.lastRolledValue !== 6) {
                this.nextPlayer();
            }

            if (this.lastRolledValue === 6 && this.isCurrentPlayerComputerOpponent()) {
                this.moveComputerOpponent(this.currentPlayerIndex);
            }

            this.resetRolledValue();

        }, movesCount * 250 + 50);

        this.clearPossibleMoves();

        return true;
    }

    // Get a free start position for a player's token
    getFreeStartPosition(player) {
        const takenStartPositions = tokens[player].map(token => {
            const translation = token.getAttribute('translation').split(' ');
            return [parseInt(translation[2]), parseInt(translation[0])];
        });

        for (let position of startPositions[player]) {
            if (takenStartPositions.findIndex(takenPosition => arraysEqual(takenPosition, position)) === -1) {
                return position;
            }
        }
    }

    // Move a computer opponent
    moveComputerOpponent(index) {
        setTimeout(
            () => infoDiv.innerText = 'Computer\'s turn',
            1000,
        );

        setTimeout(
            () => this.computerOpponents[index].makeMove(),
            2000,
        );
    }

    // Reset the last rolled value
    resetRolledValue() {
        this.lastRolledValue = 0;
        infoDiv.innerText = this.isCurrentPlayerComputerOpponent() ? 'Computer\'s turn' : 'Roll the dice!';
    }

    // Clear the possible moves highlights
    clearPossibleMoves() {
        for (let player of this.players) {
            for (let i = 0; i < 4; i++) {
                document.querySelector(`#${player}-token-${i + 1}__pawn-material`).setAttribute('emissiveColor', '0 0 0');
            }
        }
    }

    // Distribute tokens on a single tile
    distributeTokensOnOneTile(tile) {
        const allTokensOnTile = [];

        for (let player of this.players) {
            for (let i = 0; i < 4; i++) {
                const tokenTile = playerPaths[player][this.tokenPositons[player][i]];
                if (!tokenTile) continue;
                if (arraysEqual(tokenTile, tile)) {
                    if (tokens[player]) {
                        allTokensOnTile.push(tokens[player][i]);
                    }
                }
            }
        }

        const tokenCount = allTokensOnTile.length;
        const r = 0.35;

        for (let i = 0; i < tokenCount; i++) {
            if (allTokensOnTile[i]) {
                const xOffset = tokenCount == 1 ? 0 : r * Math.cos(Math.PI / 180 * i * (360 / tokenCount));
                const yOffset = tokenCount == 1 ? 0 : r * Math.sin(Math.PI / 180 * i * (360 / tokenCount));

                allTokensOnTile[i].setAttribute('translation', `${tile[1] + yOffset} 1 ${tile[0] + xOffset}`);
            }
        }
    }

    // Check if a player has won the game
    checkForGameOver(player) {
        for (let i = 0; i < 4; i++) {
            if (this.tokenPositons[player][i] !== playerPaths[player].length - 1) {
                return false;
            }
        }

        popup.innerHTML = `<div>${player} won!</div>`;
        popup.style.display = 'flex';
        side.style.opacity = 0;
        return true;
    }

    //Update the scores of the players
    updatePlayerScore(player) {
        scoreDivs[player].innerText = this.getPlayerScore(player);
    }

    getPlayerScore(player) {
        return this.tokenPositons[player].reduce((a, b) => a + b, 0) + 24;
    }
}

function onRollButtonClick() {
    if (game.isCurrentPlayerComputerOpponent()) return;

    if (game.lastRolledValue == 0) {
        game.rollDice();
    } else {
        alert('Already rolled, make a move!');
    }
}

rollDiceButton.addEventListener('click', onRollButtonClick);
window.addEventListener('keypress', event => {
    if (event.key === '.') {
        onRollButtonClick();
    }
});

function setPlayers(players, computerOpponentLevels) {
    game = new Game(players, computerOpponentLevels, {
        // red: [-6, -6, -6, -6],
        // yellow: [20, 20, 20, 20],
        // blue: [0, 1, 2, 3],
        // green: [31, 32, 33, 34],

        red: [-6, -6, -6, -6],
        yellow: [-6, -6, -6, -6],
        blue: [-6, -6, -6, -6],
        green: [-6, -6, -6, -6],
    });

    hideSetupPage();

    viewPoints['blue'].setAttribute('set_bind', 'true');
}

const scoreDivs = {};
const viewPoints = {};

for (let player of allPossiblePlayers) {
    scoreDivs[player] = document.querySelector(`.scoreboard .${player} .value`);
    viewPoints[player] = document.querySelector(`.${player}-viewpoint`);
}
