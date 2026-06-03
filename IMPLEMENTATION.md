# Implementation Notes

This game is built with plain HTML, CSS, and JavaScript.

## File Overview

- `index.html` contains the game structure.
- `styles.css` contains the mobile-first layout, colorful design, and animations.
- `script.js` contains the game state, turn logic, score handling, and win detection.

## HTML Structure

### `main.app-shell`

Centers the game on the page and provides the main app container.

### `section.hero-card`

Holds the full game UI, including the title, score section, status text, board, and buttons.

### `section.score-panel`

Contains three score cards:

- `#scoreX` for Player X wins
- `#scoreDraw` for draw count
- `#scoreO` for Player O wins

### `#statusText`

Shows the current game message, such as:

- `Player X starts`
- `Player O's turn`
- `Player X wins!`
- `It's a juicy draw!`

### `#board`

Contains nine button elements with the class `.cell`.

Each cell has a `data-index` value from `0` to `8`, which lets JavaScript connect the clicked button to the matching board position.

### Action Buttons

- `#nextRoundBtn` starts a fresh round while keeping scores.
- `#resetBtn` resets the full game and clears scores.

## CSS Responsibilities

### Mobile-first Layout

The layout starts optimized for small screens:

- The app uses compact spacing.
- The board scales to the screen width.
- Buttons stack vertically by default.

At wider screens, the action buttons become two columns using a media query.

### Visual Design

The CSS creates the juicy style with:

- Bright gradients
- Rounded cards
- Large playful typography
- Soft glass-like panels
- Colorful score cards
- Deep button shadows

### Animations

Important animations include:

- `popIn` for the main card entrance
- `tilePop` when X or O is placed
- `winnerPulse` for the winning cells
- `statusBump` when the status message changes
- `confettiDrop` for celebration pieces
- `floaty` for animated background blobs

## JavaScript State

### `cells`

Stores all nine `.cell` buttons as an array.

Used to update clicked tiles, reset tiles, attach event listeners, and highlight winning cells.

### `statusText`

References the status message element.

Used by `setStatus()` to update the current game message.

### `scoreX`, `scoreO`, and `scoreDraw`

Reference the visible score numbers in the score panel.

Used by `updateScores()`.

### `nextRoundBtn` and `resetBtn`

Reference the two action buttons.

Used to attach click events for starting a new round or resetting the full game.

### `confetti`

References the confetti container.

Used by `launchConfetti()` when a player wins.

### `winningLines`

Stores every possible winning combination:

- Three horizontal rows
- Three vertical columns
- Two diagonals

The game checks this list after every move.

### `scores`

Stores the current scoreboard values:

- `scores.X`
- `scores.O`
- `scores.draw`

### `board`

Stores the current board state as an array of nine values.

Each value is:

- `""` for an empty cell
- `"X"` for Player X
- `"O"` for Player O

### `currentPlayer`

Stores whose turn it currently is.

It switches between `"X"` and `"O"` after every valid move.

### `gameActive`

Controls whether moves are allowed.

It becomes `false` after a win or draw so players cannot keep placing marks after the round is finished.

## Function Duties

### `setStatus(message)`

Updates the status text shown to the player.

It also restarts the `.bump` animation by removing and re-adding the class.

The line `void statusText.offsetWidth` forces the browser to recalculate layout so the animation can replay every time the message changes.

### `updateScores()`

Copies the values from the `scores` object into the visible score elements.

This keeps the UI synchronized with the game state.

### `getWinningLine()`

Checks every combination in `winningLines`.

It returns the winning line if three matching marks are found.

If there is no winner, it returns `undefined`.

### `launchConfetti()`

Creates animated confetti pieces after a player wins.

It clears old confetti first, then creates multiple `span` elements with random positions, colors, delays, and rotation values.

### `finishRound(winner, winningLine)`

Ends the current round.

If there is a winner:

- Sets `gameActive` to `false`
- Adds one point to the winning player
- Highlights the winning cells
- Updates the status text
- Starts confetti

If there is no winner:

- Adds one point to the draw score
- Updates the status text with the draw message

Finally, it calls `updateScores()`.

### `handleMove(event)`

Runs whenever a board cell is clicked.

Its job is to:

1. Find which cell was clicked.
2. Ignore the click if the game is finished or the cell is already filled.
3. Save the current player's mark into the `board` array.
4. Update the clicked cell visually.
5. Check for a winning line.
6. Check for a draw.
7. Switch to the next player if the round continues.
8. Update the status text.

### `startRound()`

Starts a fresh round without changing the score values.

It:

- Clears the board array
- Sets Player X as the starting player
- Sets `gameActive` to `true`
- Removes confetti
- Resets the status text
- Clears all cell text and classes
- Restores each cell's accessibility label

### `resetGame()`

Resets the complete game.

It:

- Sets Player X score to zero
- Sets Player O score to zero
- Sets draw score to zero
- Updates the visible scores
- Starts a clean round

## Event Listeners

At the bottom of `script.js`:

- Each cell receives a click listener connected to `handleMove`.
- `#nextRoundBtn` receives a click listener connected to `startRound`.
- `#resetBtn` receives a click listener connected to `resetGame`.
- `updateScores()` runs once at load time to initialize the visible scoreboard.
