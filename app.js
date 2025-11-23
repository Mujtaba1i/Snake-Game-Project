/*-------------------------------- Constants --------------------------------*/

// grid size 
const gridSize = 40

// DOM elements
const section = document.querySelector('#grid')
const startButton = document.querySelector('#startButton')

// creating grid
for (let i = 0; i < gridSize * gridSize; i++) {
    const div = document.createElement('div')
    section.appendChild(div)
}

// filling
const divs = section.querySelectorAll('div')
const gameSquares = new Array(gridSize * gridSize).fill('')

// style?
const snakeHead = "🐸"
const snakeTail = "🐍"
const appleEmoji = "🍎"
const wallEmoji = "🧱"

// walls fill
const wallArray = []
for (let i = 0; i < gridSize; i++) {
    wallArray.push(i) // top
    wallArray.push((gridSize * gridSize) - gridSize + i) // bottom
    wallArray.push(i * gridSize) // left
    wallArray.push(i * gridSize + gridSize - 1) // right

    divs[i].textContent = wallEmoji
    divs[(gridSize * gridSize) - gridSize + i].textContent = wallEmoji
    divs[i * gridSize].textContent = wallEmoji
    divs[i * gridSize + gridSize - 1].textContent = wallEmoji
}



/*---------------------------- Variables (state) ----------------------------*/

// defualt Variables
let snakeLength = 3
let snakeAimingDirection = 'Down'
let apple = false
let snakeBody = []
let ateApple = false
let gameInterval = null
let score = 0

/*-------------------------------- Functions --------------------------------*/

function snakeSpawn() {
    // delcare where its safe to spawn the snake
    const safeZoneStart = gridSize * snakeLength + snakeLength
    const safeZoneEnd = gridSize * (gridSize - snakeLength) - snakeLength

    // checks if it is safe to spawn
    let headPosition
    do headPosition = Math.floor(Math.random() * (gridSize * gridSize))
        while (
        wallArray.includes(headPosition) ||
        headPosition < safeZoneStart ||
        headPosition > safeZoneEnd ||
        headPosition % gridSize < snakeLength ||
        headPosition % gridSize > gridSize - (snakeLength+1)
    )

    // spawn the snake
    gameSquares[headPosition] = snakeHead
    snakeBody = [headPosition, headPosition - gridSize, headPosition - gridSize*2]
    snakeBody.forEach((pos, i) => {
        gameSquares[pos] = i === 0 ? snakeHead : snakeTail
        divs[pos].textContent = gameSquares[pos]
    })
}

// function to set the game speed
function startSnakeMovement() {
    gameInterval = setInterval(moveSnake, 75)
}


// checking the snake position
function moveSnake(){
    
    if (snakeAimingDirection === 'Up') moveUp()
    else if (snakeAimingDirection === 'Down') moveDown()
    else if (snakeAimingDirection === 'Left') moveLeft()
    else if (snakeAimingDirection === 'Right') moveRight()
    
    isThereApple()
}

// moving the snake
function moveUp()    { moveSnakeGeneric(-gridSize) }
function moveDown()  { moveSnakeGeneric(gridSize) }
function moveLeft()  { moveSnakeGeneric(-1) }
function moveRight() { moveSnakeGeneric(1) }

// moving logic
function moveSnakeGeneric(movement) {
    let head = snakeBody[0]
    let newHead = head + movement

    //checks if its a wall
    if (wallArray.includes(newHead)) return gameOVER()

    // checks if snake head on the apple and setting it to true
    ateApple = (gameSquares[newHead] === appleEmoji)

    // moving the head
    snakeBody.unshift(newHead)
    gameSquares[newHead] = snakeHead
    divs[newHead].textContent = snakeHead

    // remove the last tail
    if (!ateApple) {
        let oldTail = snakeBody.pop()
        gameSquares[oldTail] = ""
        divs[oldTail].textContent = ""
    }

    // changes old head to body
    gameSquares[head] = snakeTail
    divs[head].textContent = snakeTail

    checkCollision()
}

function checkCollision() {
    let head = snakeBody[0]

    // if with body part
    if (snakeBody.slice(1).includes(head)) gameOVER()

    // if collision with apple
    if (ateApple) {
        apple = false
        snakeLength++
        score++
        document.querySelector('#score').textContent = "Score: " + score
    }
}

function gameOVER(){
    // clear Interval 
    if (gameInterval) clearInterval(gameInterval)
    
    // displays the button
    startButton.style.display = 'block'
    section.style.filter = 'blur(5px)'

    // clears the board except the walls
    for (let i = 0; i < gameSquares.length; i++) {
        if (!wallArray.includes(i)) {
            gameSquares[i] = ""
            divs[i].textContent = ""
        }
    }
    
    // resets the variables
    snakeLength = 3
    snakeAimingDirection = 'Down'
    apple = false
    snakeBody = []
    ateApple = false

    // change text to Restart
    startButton.textContent = 'Restart'
}

function isThereApple() {
    // if there are no apple
    if (apple === false) {
        // finds all empty spots
        let emptySpots = []
        for (let i = 0; i < gameSquares.length; i++) {
            if (gameSquares[i] === "" && !wallArray.includes(i)){
                emptySpots.push(i)
            }
        }

        // if there are no empty spots do nothing
        if (emptySpots.length === 0) return
        
        // picks a random spot where it is empty
        let randomIndex = emptySpots[Math.floor(Math.random() * emptySpots.length)]
        
        // place apple
        apple = true
        gameSquares[randomIndex] = appleEmoji
        divs[randomIndex].textContent = appleEmoji
    }
}


function startGame(){
    // showing the button
    startButton.style.display = 'none'
    section.style.filter = 'none'

    // resets the variables
    score = 0
    document.querySelector('#score').textContent = "Score: " +score

    //start the game
    snakeSpawn()
    startSnakeMovement()
}


function buttonClicks(e){
    // saving the clickedkey
    const key = e.key.toLowerCase()
    
    //checks what VALID button clicked
    if (key === 'w' && snakeAimingDirection !== 'Down') {
        snakeAimingDirection = 'Up'
    }
    else if (key === 's' && snakeAimingDirection !== 'Up') {
        snakeAimingDirection = 'Down'
    }
    else if (key === 'a' && snakeAimingDirection !== 'Right') {
        snakeAimingDirection = 'Left'
    }
    else if (key === 'd' && snakeAimingDirection !== 'Left') {
        snakeAimingDirection = 'Right'
    }
}

/*----------------------------- Event Listeners -----------------------------*/

// clicking the Start/Restart button
startButton.addEventListener('click', startGame)

// moving with WASD
document.addEventListener('keydown', buttonClicks)