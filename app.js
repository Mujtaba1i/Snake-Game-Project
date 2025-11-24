/*-------------------------------- Constants --------------------------------*/

// grid size 
const gridSize = 40

// DOM elements
const section = document.querySelector('#grid')
const startButton = document.querySelector('#startButton')
const healthEle = document.querySelector('#health')
const highScoreEle = document.querySelector('#highScore')



/*--------------------------------- Setup -----------------------------------*/

// creating grid
for (let i = 0; i < gridSize * gridSize; i++) {
    const div = document.createElement('div')
    div.className = 'grid-cell'
    section.appendChild(div)
}

// filling
const divs = section.querySelectorAll('div')
const gameSquares = new Array(gridSize * gridSize).fill('')

// head
const snakeHeadup = './assets/Head/up.png'
const snakeHeaddown = './assets/Head/down.png'
const snakeHeadleft = './assets/Head/left.png'
const snakeHeadright = './assets/Head/right.png'

// body
const bodyH = './assets/body/horizontal.png'
const bodyV = './assets/body/vertical.png'
const bodyBR = './assets/body/90topright.png'
const bodyBL = './assets/body/90topleft.png'
const bodyTR = './assets/body/90bottomright.png'
const bodyTL = './assets/body/90bottomleft.png'

// tail
const snakeTailDown = './assets/tail/down.png'
const snakeTailUp = './assets/tail/up.png'
const snakeTailLeft = './assets/tail/left.png'
const snakeTailRight = './assets/tail/right.png'

// apple
const appleEmoji = './assets/apple/apple.png'

// obstacles
const wallEmoji = "🧱"
const obstacleEmoji = "./assets/obstacle/blade.png"

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
let thereisobstacle = false
let obstacleLocation = null
let health = 3
let bodyOrientation = []
let highScore = 0

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

    // spawn the snake with correct head direction
    snakeBody = [headPosition, headPosition - gridSize, headPosition - gridSize*2]

    // orientations
    bodyOrientation = ['Down', 'Down', 'Down']

    // SET TO DOWN on spawn
    snakeBody.forEach((pos, i) => {
        if (i === 0) {
            // Head
            divs[pos].style.backgroundImage = `url(${snakeHeaddown})`
            divs[pos].style.backgroundSize = 'contain'
            divs[pos].style.backgroundRepeat = 'no-repeat'
        } 
        else if (i === snakeBody.length - 1) {
            // Tail
            divs[pos].style.backgroundImage = `url(${snakeTailDown})`
            divs[pos].style.backgroundSize = 'contain'
            divs[pos].style.backgroundRepeat = 'no-repeat'
        } 
        else {
            // Body
            divs[pos].style.backgroundImage = `url(${bodyV})`
            divs[pos].style.backgroundSize = 'contain'
            divs[pos].style.backgroundRepeat = 'no-repeat'
        }
    })

}

// function to set the game speed
// gradually increasing the speed depending on the score 
function startSnakeMovement() {
    if (score<10) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 125)}
    else if (score<20) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 100)}
    else if (score<30) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 75)}
    else if (score<40) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 50)}
}


// checking the snake position
function moveSnake(){
    
    if (snakeAimingDirection === 'Up') moveUp()
    else if (snakeAimingDirection === 'Down') moveDown()
    else if (snakeAimingDirection === 'Left') moveLeft()
    else if (snakeAimingDirection === 'Right') moveRight()
    
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

    // Determine correct head image based on direction
    let snakeHead
    if (snakeAimingDirection === 'Up') snakeHead = snakeHeadup
    else if (snakeAimingDirection === 'Down') snakeHead = snakeHeaddown
    else if (snakeAimingDirection === 'Left') snakeHead = snakeHeadleft
    else if (snakeAimingDirection === 'Right') snakeHead = snakeHeadright

    // moving the head
    snakeBody.unshift(newHead)
    
    // Tracking direction
    bodyOrientation.unshift(snakeAimingDirection) 
    gameSquares[newHead] = snakeHead
    divs[newHead].style.backgroundImage = `url(${snakeHead})`
    divs[newHead].style.backgroundSize = 'contain'
    divs[newHead].style.backgroundRepeat = 'no-repeat'

    // remove the last tail
    if (!ateApple) {
        let oldTail = snakeBody.pop()
        bodyOrientation.pop()
        gameSquares[oldTail] = ""
        divs[oldTail].style.backgroundImage = ''
    }

    updateBodySegments()
    checkCollision()
    isThereApple()
    isThereObstacle()
}

function updateBodySegments() {
    // updates body
    for (let i = 1; i < snakeBody.length; i++) {
        let pos = snakeBody[i]
        let tailDirection = bodyOrientation[i]
        let tailImage
        
        // tail
        if (i === snakeBody.length - 1) {
            
            // compares the tail position with the body position
            let tail    = snakeBody[i]
            let before  = snakeBody[i - 1]
            let diff    = before - tail

            // if there is a diffrance change the tail
            if (diff === -gridSize) tailImage = snakeTailUp
            else if (diff === gridSize) tailImage = snakeTailDown
            else if (diff === -1) tailImage = snakeTailLeft
            else if (diff === 1) tailImage = snakeTailRight

            // draw the tail
            gameSquares[pos] = tailImage
            divs[pos].style.backgroundImage = `url(${tailImage})`
            divs[pos].style.backgroundSize = 'contain'
            divs[pos].style.backgroundRepeat = 'no-repeat'
        }

        // body
        else {

            // checks the body position with previous part
            let currentDir = bodyOrientation[i]
            let prevDir = bodyOrientation[i - 1]
            let bodyImage
            
            // if iw was straight
            if (currentDir === prevDir) {
                if (currentDir === 'Up' || currentDir === 'Down') {
                    bodyImage = bodyV
                } else {
                    bodyImage = bodyH
                }
            }

            // if it was a corner
            else {
                if ((prevDir === 'Right' && currentDir === 'Up') || (prevDir === 'Down' && currentDir === 'Left')) {
                    bodyImage = bodyBL
                }
                else if ((prevDir === 'Left' && currentDir === 'Up') || (prevDir === 'Down' && currentDir === 'Right')) {
                    bodyImage = bodyBR
                }
                else if ((prevDir === 'Right' && currentDir === 'Down') || (prevDir === 'Up' && currentDir === 'Left')) {
                    bodyImage = bodyTL
                }
                else if ((prevDir === 'Left' && currentDir === 'Down') || (prevDir === 'Up' && currentDir === 'Right')) {
                    bodyImage = bodyTR
                }
            }
            
            // draw the body
            gameSquares[pos] = bodyImage
            divs[pos].style.backgroundImage = `url(${bodyImage})`
            divs[pos].style.backgroundSize = 'contain'
            divs[pos].style.backgroundRepeat = 'no-repeat'
        }
    }
}

function checkCollision() {
    let head = snakeBody[0]

    // if with body part
    if (snakeBody.slice(1).includes(head)) gameOVER()

    if (head === obstacleLocation){
        // hitting a rock
        health--
        healthEle.textContent=("Health: " + ("❤️".repeat(health)))
        thereisobstacle = false
        if (health===0){
            gameOVER()
        } 
    }

    // if collision with apple
    if (ateApple) {
        apple = false
        snakeLength++
        score++
        if (score > highScore) {
            highScore = score
            highScoreEle.textContent = "High Score: " + highScore
        }
        startSnakeMovement()
        document.querySelector('#score').textContent = "Score: " + score
    }
}

function gameOVER(){
    // clear Interval 
    if (gameInterval) clearInterval(gameInterval)
    
    // displays the button
    startButton.style.display = 'block'
    section.style.filter = 'blur(5px)'
    
    // resets the variables
    snakeLength = 3
    snakeAimingDirection = 'Down'
    apple = false
    snakeBody = []
    ateApple = false
    thereisobstacle = false

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
        divs[randomIndex].style.backgroundImage = `url(${appleEmoji})`
        divs[randomIndex].style.backgroundSize = 'contain'
        divs[randomIndex].style.backgroundRepeat = 'no-repeat'
    }
}

function isThereObstacle(){
    // at a random time spawn an obstacle
    if(!thereisobstacle && Math.random() < 0.4){
        
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
        
        // place obstacle
        thereisobstacle = true
        gameSquares[randomIndex] = obstacleEmoji
        divs[randomIndex].style.backgroundImage = `url(${obstacleEmoji})`
        divs[randomIndex].style.backgroundSize = 'contain'
        divs[randomIndex].style.backgroundRepeat = 'no-repeat'
        obstacleLocation = randomIndex
    }

    if(thereisobstacle && Math.random() < 0.008){
        // remove the obstacle
        thereisobstacle = false
        gameSquares[obstacleLocation] = ""
        divs[obstacleLocation].style.backgroundImage = ''
    }
}

function startGame(){
    // showing the button
    startButton.style.display = 'none'
    section.style.filter = 'none'

    // resets the variables
    score = 0
    document.querySelector('#score').textContent = "Score: " +score
    health=3
    healthEle.textContent=("Health: " + ("❤️".repeat(health)))

    // clears the board except the walls
    for (let i = 0; i < gameSquares.length; i++) {
        if (!wallArray.includes(i)) {
            gameSquares[i] = ""
            // divs[i].textContent = ""
            divs[i].style.backgroundImage = ""
        }
    }

    //start the game
    apple = false
    setTimeout(() => isThereApple(), 0)
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