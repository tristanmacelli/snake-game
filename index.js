import "lodash";

// Constants
// Playable boundaries
const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;
// The number of units of increase in snake length per unit of food devoured
const SNAKE_LENGTH_INCR = 5;
// the timeout for the game clock
const CLOCK_INCR_MS = 500;

const createAndFill2DArray = ({
    rows,
    columns,
    defaultValue
}) => {
    return Array.from({ length: rows }, () => (
        Array.from({ length: columns }, () => defaultValue)
    ));
};
// 
const gameBoard = createAndFill2DArray(MAX_WIDTH, MAX_HEIGHT, 0)
const gameBoardLegend = new Map([
    [0, "empty"],
    [1, "snake"],
    [2, "food"],
]);

// A list of coordinates representing the current snake
const snakeCoords = [[250, 250], [250, 249], [250, 248], [250, 247], [250, 246]];
// 0-3 representing up, right, down, left respectively
let snakeDirection = 1;
// the current user input for a new direction
let proposedDirection = 1;
// Current # of units the snake is increasing in length
let snakeLengthIncr = 0;
// Whether or not the game is being played (or has not yet been started)
let gameIsActive = false;

let foodCoords = [20, 20];
let proposedFoodCoords = [20, 20];

const keyToSnakeDirection = new Map([
    ["ArrowUp", 0],
    ["ArrowRight", 1],
    ["ArrowDown", 2],
    ["ArrowLeft", 3],
]);

const generateFoodLocation = () => {
    return [
        Math.floor(Math.random() * MAX_WIDTH),
        Math.floor(Math.random() * MAX_HEIGHT)
    ];
};

const generateSnakeLocation = (oldHeadLocation, snakeDirection) => {
    switch (snakeDirection) {
        case 0: {
            return [oldHeadLocation[0], oldHeadLocation[1] - 1];
        }
        case 1: {
            return [oldHeadLocation[0] + 1, oldHeadLocation[1]];
        }
        case 2: {
            return [oldHeadLocation[0], oldHeadLocation[1] + 1];
        }
        case 3: {
            return [oldHeadLocation[0] - 1, oldHeadLocation[1]];
        }
    }
};

const generateNewSnakeDirection = (newDirection, oldDirection) => {
    // no update on same direction or 180 degree change (reversal)
    if (newDirection === oldDirection || Math.abs(newDirection - oldDirection) === 2) {
        return oldDirection;
    };
    return newDirection;
};

const nextFoodLocationIsValid = (foodCoordinates) => {
    return !snakeCoords.includes(foodCoordinates);
};

const snakeIsOutOfBounds = (newHeadCoordinates) => {
    const x = newHeadCoordinates[0], y = newHeadCoordinates[1];
    return x > MAX_WIDTH || x < 0 || y > MAX_HEIGHT || y < 0;
};

// The ouroboros or uroboros is an ancient symbol depicting a serpent or dragon eating its own tail ;)
const snakeIsOuroboros = (newHeadCoordinates) => {
    return snakeCoords.includes(newHeadCoordinates);
};

const snakeShouldGrow = (newHeadCoordinates, foodCoordinates) => {
    return newHeadCoordinates[0] === foodCoordinates[0] && newHeadCoordinates[1] === foodCoordinates[1];
};

// Increase length from the back (as the snake moves forward)
const increaseSnakeLength = (currentTail) => {
    // TODO: Chec that this boolean updates as expected
    snakeIsGrowing = true;
    snakeLengthIncr += SNAKE_LENGTH_INCR;

    for (let unitsIncreased = 0; unitsIncreased < SNAKE_LENGTH_INCR; unitsIncreased++) {
        window.setTimeout(() => {
            snakeCoords.push(currentTail);
            // The last iteration (no longer growing)
            snakeLengthIncr--;
            if (snakeLengthIncr === 0) snakeIsGrowing = false;
        }, CLOCK_INCR_MS);
    }
};

updateSnakeOnGameBoard = (gameBoard, newHead, oldTail, snakeLengthIncr) => {
    gameBoard[newHead[0]][newHead[1]] = 1;
    // Keep the old tail on the board so long as the snake in increasing in length
    gameBoard[oldTail[0]][oldTail[1]] = snakeLengthIncr > 0 ? 1 : 0;
};

updateFoodOnGameBoard = (gameBoard, newFoodCoords, oldFoodCoords) => {
    gameBoard[newFoodCoords[0]][newFoodCoords[1]] = 2;
    gameBoard[oldFoodCoords[0]][oldFoodCoords[1]] = 0;
};

const directionChangeInputListener = () => {
    window.addEventListener("keydown", ({ key }) => {
        proposedDirection = keyToSnakeDirection.get(key);
    })
};

const activeGameEventLoop = (gameBoard, snakeCoords, proposedDirection, snakeDirection, snakeLengthIncr) => {
    const newHeadCoords = snakeCoords[0];

    // Check game ending conditions
    if (snakeIsOutOfBounds(newHeadCoords) || snakeIsOuroboros(newHeadCoords)) {
        gameIsActive = false;
        return;
    }
    if (snakeShouldGrow(snakeCoords[0], foodCoords)) {
        increaseSnakeLength(snakeCoords[snakeCoords.length - 1]);
    }
    // Update the game board view
    updateSnakeOnGameBoard(gameBoard, snakeCoords[0], snakeCoords[snakeCoords.length - 1]);
    updateFoodOnGameBoard(gameBoard, proposedFoodCoords, foodCoords, snakeLengthIncr);

    // Update the food location
    do {
        proposedFoodCoords = generateFoodLocation();
    } while (!nextFoodLocationIsValid(proposedFoodCoords));

    // Update the snake data structure
    const nextSnakeDirection = generateNewSnakeDirection(proposedDirection, snakeDirection);
    snakeCoords.unshift(generateSnakeLocation(snakeCoords[0], nextSnakeDirection));
    snakeCoords.pop();
};

const startGame = () => {
    gameIsActive = true;
    while (gameIsActive) {
        setInterval(() => {
            activeGameEventLoop(gameBoard, snakeCoords, proposedDirection, snakeDirection, snakeLengthIncr);
        }, CLOCK_INCR_MS);
    }
};

startGame();
