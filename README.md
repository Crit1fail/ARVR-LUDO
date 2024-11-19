# ARVR-LUDO
**Ludo Game - 3D using Three.js**

This project is a 3D implementation of the classic board game Ludo, built using Three.js. The game features an interactive 3D Ludo board, pieces, and a dice that can be rolled to play the game.

The objective of this game is to recreate the traditional Ludo experience in a browser with 3D visuals, where players can roll dice, move their pieces across the board, and try to get all their pieces to the end before others.

**Features:**

-Fully rendered 3D Ludo board and pieces.

-Animated dice rolling.

-Dynamic Lighting

-Camera Controls

-Responsive UI

-Turn-based gameplay for up to 4 players.

-Basic game logic for piece movement and capturing.

# Getting Started
**Prerequisites**
-Node.js (for installing dependencies if needed)

-A modern browser with WebGL support.

**File Structure:**

-index.html: The main page with a simple start menu.

-assets/: Store your textures here, such as the Ludo board and dice faces.

**Running the Game**
Open the index.html file in your browser to launch the game.
Click "Play Game" to hide the menu and load the 3D Ludo environment.

**Game Rules**
The rules follow the traditional Ludo format:

Each player is assigned a set of colored coins.
Roll the dice to move your coins.
The objective is to get all your coins to the home before other players.
Multiplayer mode can be added on same device.

# Code Overview

-index.html
This file serves as the starting point for the game. It includes a basic Play Game menu and loads the Three.js library.

-UI: The menu has a button that triggers the game when clicked.

-Three.js Import: The game is rendered using main.js, which is referenced via <script>.
main.js

-Three.js Setup: Creates a 3D scene, adds a Ludo board, player coins, and dice.

-Lighting: Ambient and directional lights create realistic shadow effects. The directional light moves based on the mouse position.

-Pawns: Player coins are positioned in a 4x4 grid, color-coded for each player.

-Dice: Textured dice with animated rotation for a dynamic feel.

-Controls: OrbitControls allow users to rotate the board, offering a 3D perspective.

**Future Enhancements**

-Game Logic: Implementing complete Ludo game rules.

-Improved UI: Adding a score tracker and player turn indication.
