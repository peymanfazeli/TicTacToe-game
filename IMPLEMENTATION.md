# Implementation Notes

This game is built with plain HTML, CSS, and JavaScript. It runs as a human-versus-system Tic Tac Toe game with selectable difficulty levels.

## File Overview

- `index.html` contains the game structure.
- `styles.css` contains the mobile-first layout, colorful design, and animations.
- `script.js` contains the game state, turn logic, score handling, difficulty logic, system rival logic, win detection, and sound effects.

## HTML Structure

### `main.app-shell`

Centers the game on the page and provides the main app container.

### `section.hero-card`

Holds the full game UI, including the title, side chooser, level chooser, score section, status text, board, and buttons.

### `#choicePanel`

Shows the first interaction where the user chooses to play as X or O.

The selected symbol becomes the human player, and the opposite symbol becomes the system player.

### `#levelPanel`

Shows the difficulty selector.

The game supports:

- `easy`
- `medium`
- `hard`

Easy uses mostly weak system moves, medium mixes weak and smart moves, and hard almost always uses the strongest move.

### `section.score-panel`

Contains three score cards:

- `#scoreX` for X wins
- `#scoreDraw` for draw count
- `#scoreO` for O wins

The labels update after the user chooses a symbol, so X and O can show whether they belong to the user or the system.

### `#statusText`

Shows the current game message, such as:

- `Choose X or O to start`
- `Your turn`
- `System starts`
- `System is thinking on easy...`
- `System is thinking on medium...`
- `System is thinking on hard...`
- `You win!`
- `System wins!`
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
- Choice buttons sit side by side for quick mobile selection.

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

### `choiceButtons`

Stores the X/O selection buttons.

Used to attach side-selection events and visually mark the selected side.

### `levelButtons`

Stores the difficulty selection buttons.

Used to attach level-selection events and visually mark the selected difficulty.

### `statusText`

References the status message element.

Used by `setStatus()` to update the current game message.

### `labelX` and `labelO`

Reference the score card labels for X and O.

Used by `updateScoreLabels()` to show whether each symbol belongs to the user or the system.

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
- `"X"` for X
- `"O"` for O

### `currentPlayer`

Stores whose turn it currently is.

It switches between the human symbol and the system symbol during the round.

### `humanPlayer`

Stores the symbol selected by the user.

It is either `"X"` or `"O"` after the user chooses a side.

### `systemPlayer`

Stores the rival symbol controlled by the system.

It is always the opposite of `humanPlayer`.

### `difficulty`

Stores the selected system level.

It starts as `"easy"` and can become `"medium"` or `"hard"` when the user selects a different level.

### `gameActive`

Controls whether moves are allowed.

It is `false` before the user chooses a side and after a win or draw.

### `systemThinking`

Prevents the human from placing marks while the system move is being prepared.

### `audioContext`

Stores the browser audio engine created by the Web Audio API.

It is created only after the player interacts with the game, which follows browser autoplay rules.

## Function Duties

### `getAudioContext()`

Creates and returns the shared audio context used by all game sounds.

The game reuses one audio context instead of creating a new audio engine for every sound.

### `playTone({ frequency, duration, type, volume, delay })`

Creates one short synthesized tone.

It uses `frequency`, `duration`, `type`, `volume`, and `delay` to shape each sound.

The gain ramps up and down quickly so each sound feels smooth instead of harsh.

### `playClickSound(player)`

Plays a short bright tap sound after a valid move.

X and O use slightly different pitches so each side feels distinct.

### `playWinSound()`

Plays a rising celebratory arpeggio when a side wins.

This sound is triggered inside `finishRound()` when a winner exists.

### `playDrawSound()`

Plays a softer descending sound when the board fills without a winner.

This sound is triggered inside `finishRound()` when there is no winner.

### `setStatus(message)`

Updates the status text shown to the player.

It also restarts the `.bump` animation by removing and re-adding the class.

The line `void statusText.offsetWidth` forces the browser to recalculate layout so the animation can replay every time the message changes.

### `updateScores()`

Copies the values from the `scores` object into the visible score elements.

This keeps the UI synchronized with the game state.

### `updateScoreLabels()`

Updates the score card labels after the user chooses X or O.

For example, if the user chooses X, the labels become `You X` and `System O`.

### `getWinningLine(testBoard)`

Checks every combination in `winningLines`.

It returns the winning line if three matching marks are found.

If there is no winner, it returns `undefined`.

The optional `testBoard` parameter lets the system preview possible moves without changing the real board.

### `launchConfetti()`

Creates animated confetti pieces after the human or system wins.

It clears old confetti first, then creates multiple `span` elements with random positions, colors, delays, and rotation values.

### `finishRound(winner, winningLine)`

Ends the current round.

If there is a winner:

- Sets `gameActive` to `false`
- Adds one point to the winning symbol
- Highlights the winning cells
- Updates the status text to show whether the user or system won
- Plays the win sound
- Starts confetti

If there is no winner:

- Adds one point to the draw score
- Updates the status text with the draw message
- Plays the draw sound

Finally, it calls `updateScores()`.

### `placeMark(index, player)`

Writes a move to both the state and the UI.

It:

- Saves the mark into the `board` array
- Updates the matching cell text
- Adds the visual X or O class
- Updates the cell accessibility label
- Plays the click sound

### `resolveTurn(player)`

Checks whether the latest move ended the round.

It checks for:

- A winning line
- A full board draw

It returns `true` if the round ended and `false` if play should continue.

### `getEmptyIndexes(testBoard)`

Returns the indexes of empty cells.

It can inspect the real board or a temporary board used by the system while planning.

### `getWinner(testBoard)`

Returns the winning symbol for a temporary board.

If no side has won, it returns an empty string.

### `minimax(testBoard, player, depth)`

Scores possible future game states.

Positive scores favor the system, negative scores favor the human, and zero means a draw.

The system uses this to understand which moves are strongest or weakest.

### `scoreSystemMoves()`

Creates a scored list of every available system move.

Each item contains the move index and its minimax score.

### `getRandomMove(moves)`

Returns a random move index from a list.

This keeps the system from playing the exact same way every round.

### `findBestSystemMove()`

Chooses one of the strongest available system moves.

### `findWeakSystemMove()`

Chooses one of the weakest available system moves.

This is what makes easy mode feel dumb.

### `findDifficultySystemMove()`

Chooses whether the system should play smart or weak for the current turn.

The current tuning is:

- Easy: 20% smart moves, 80% weak moves
- Medium: 60% smart moves, 40% weak moves
- Hard: 95% smart moves, 5% weak moves

### `makeSystemMove()`

Runs the system's turn.

It shows the current difficulty in the status text, waits briefly for a more natural feel, chooses a move with `findDifficultySystemMove()`, places the system mark, and either ends the round or returns the turn to the user.

### `handleMove(event)`

Runs whenever a board cell is clicked by the user.

Its job is to:

1. Find which cell was clicked.
2. Ignore the click if the game is finished, the system is thinking, it is not the user's turn, or the cell is already filled.
3. Place the user's mark.
4. Check whether the user won or caused a draw.
5. Switch the turn to the system.
6. Start the system move.

### `startRound()`

Starts a fresh round without changing the score values.

It:

- Clears the board array
- Sets X as the starting player
- Enables the game only if the user has selected X or O
- Removes confetti
- Resets the status text
- Clears all cell text and classes
- Restores each cell's accessibility label
- Starts the system move automatically if the user selected O

### `resetGame()`

Resets the complete game.

It:

- Sets X score to zero
- Sets O score to zero
- Sets draw score to zero
- Updates the visible scores
- Starts a clean round

### `choosePlayer(event)`

Runs when the user chooses X or O.

It:

- Saves the user's selected symbol
- Assigns the opposite symbol to the system
- Highlights the selected choice button
- Updates the score labels
- Resets the game with the new setup

### `chooseDifficulty(event)`

Runs when the user chooses easy, medium, or hard.

It:

- Saves the selected level
- Highlights the selected level button
- Starts a fresh round if the user has already chosen X or O
- Otherwise asks the user to choose a side

## Event Listeners

At the bottom of `script.js`:

- Each cell receives a click listener connected to `handleMove`.
- Each choice button receives a click listener connected to `choosePlayer`.
- Each level button receives a click listener connected to `chooseDifficulty`.
- `#nextRoundBtn` receives a click listener connected to `startRound`.
- `#resetBtn` receives a click listener connected to `resetGame`.
- `updateScores()` runs once at load time to initialize the visible scoreboard.
- `updateScoreLabels()` runs once at load time to initialize X and O labels.
- `startRound()` runs once at load time to disable the board until the user chooses a side.
