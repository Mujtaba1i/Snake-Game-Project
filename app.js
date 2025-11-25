/*-------------------------------- Constants --------------------------------*/

// grid size 
const easyGridSize = 40
const insaneGridSize = 20

// DOM elements
const section = document.querySelector('#grid')
const startButton = document.querySelector('#startButton')
const healthEle = document.querySelector('#health')
const highScoreEle = document.querySelector('#highScore')
const radioEasyEle = document.querySelector('#difficulty-easy')
const radioInsaneEle = document.querySelector('#difficulty-insane')
const radioContainer = document.querySelectorAll('.radioLabel')

/*--------------------------------- Variables --------------------------------*/
section.style.gridTemplateColumns = `repeat(${easyGridSize.toString()}, 1fr)`

// if reload happens
highScoreEle.textContent = "Easy High Score: " + localStorage.getItem('Easyhighscore')

// defualt Variables
let snakeLength = 3
let snakeAimingDirection = 'Down'
let apple = false
let snakeBody = []
let ateApple = false
let gameInterval = null
let score = 0
let thereisobstacle = false
let obstacleLocation = []
let health = 3
let bodyOrientation = []
let highScore = 0
let grid = 0
let wallArray = []
let isHurt = false
let healLocations = []
let directionChanged = false


createGrid()
// filling
let divs = section.querySelectorAll('div')
let gameSquares = new Array(grid * grid).fill('')
fillWalls()

/*--------------------------------- Images(Animations) -----------------------------------*/

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
const obstacleEmoji = "./assets/obstacle/blade.png"

// Heal
const healEmoji = "./assets/heal/Heal.png"


/*-------------------------------- Functions --------------------------------*/
function createGrid(){
    // creating grid
    if (radioEasyEle.checked){
        grid=easyGridSize
    }
    else{
        grid=insaneGridSize
    }

    for (let i = 0; i < grid * grid; i++) {
        const div = document.createElement('div')
        div.className = 'grid-cell'
        section.appendChild(div)
    }
}

// walls fill
function fillWalls() {
    const wallEmoji = "🧱"
    wallArray = []
    for (let i = 0; i < grid; i++) {
        wallArray.push(i) // top
        wallArray.push((grid * grid) - grid + i) // bottom
        wallArray.push(i * grid) // left
        wallArray.push(i * grid + grid - 1) // right

        divs[i].textContent = wallEmoji
        divs[(grid * grid) - grid + i].textContent = wallEmoji
        divs[i * grid].textContent = wallEmoji
        divs[i * grid + grid - 1].textContent = wallEmoji
    }
}

function snakeSpawn() {
    // delcare where its safe to spawn the snake
    const safeZoneStart = grid * snakeLength + snakeLength
    const safeZoneEnd = grid * (grid - snakeLength) - snakeLength

    // checks if it is safe to spawn
    let headPosition
    do headPosition = Math.floor(Math.random() * (grid * grid))
        while (
        wallArray.includes(headPosition) ||
        headPosition < safeZoneStart ||
        headPosition > safeZoneEnd ||
        headPosition % grid < snakeLength ||
        headPosition % grid > grid - (snakeLength+1)
    )

    // spawn the snake with correct head direction
    snakeBody = [headPosition, headPosition - grid, headPosition - grid*2]

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
// increasing the speed depending on the score 
function startSnakeMovement() {
    if(radioEasyEle.checked){
        if (score<10) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 125)}
        else if (score<20) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 100)}
        else if (score<30) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 75)}
        else if (score<40) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 50)}
    }
    else{
        if (score<5) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 75)}
        else if (score<10) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 60)}
        else if (score<15) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 30)}
        else if (score<20) {clearInterval(gameInterval); gameInterval = setInterval(moveSnake, 10)}
    }
}


// checking the snake position
function moveSnake(){
    
    if (snakeAimingDirection === 'Up') moveUp()
    else if (snakeAimingDirection === 'Down') moveDown()
    else if (snakeAimingDirection === 'Left') moveLeft()
    else if (snakeAimingDirection === 'Right') moveRight()
    
}

// moving the snake
function moveUp()    { moveSnakeGeneric(-grid) }
function moveDown()  { moveSnakeGeneric(grid) }
function moveLeft()  { moveSnakeGeneric(-1) }
function moveRight() { moveSnakeGeneric(1) }

// moving logic
function moveSnakeGeneric(movement) {
    directionChanged = false

    let head = snakeBody[0]
    let newHead = head + movement

    // Check collision with body
    if (snakeBody.includes(newHead)) return gameOVER()
    
    // checks if its a wall
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
    heal()
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
            if (diff === -grid) tailImage = snakeTailUp
            else if (diff === grid) tailImage = snakeTailDown
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

    // if with obstacle in easy mode
    if (radioEasyEle.checked){
        if (obstacleLocation.includes(head)){
            health--
            isHurt = true
            healthEle.textContent=("Health: " + ("❤️".repeat(health)))
            if (health===0) gameOVER()
        }
    }
    // if with obstacle in insane mode
    else{
        if (obstacleLocation.includes(head)){
            health--
            healthEle.textContent=("Health: " + ("❤️".repeat(health)))
            gameOVER()
        }
    }
    // if collision with apple
    if (ateApple) {
        apple = false
        snakeLength++
        score++

        // EASY MODE high score
        if (radioEasyEle.checked) {
            if (score > highScore) {
                if (localStorage.getItem('Easyhighscore') === null) {
                    highScore = score
                    highScoreEle.textContent = "Easy High Score: " + highScore
                    localStorage.setItem('Easyhighscore', highScore)
                }
                else if (score > localStorage.getItem('Easyhighscore')) {
                    highScore = score
                    highScoreEle.textContent = "Easy High Score: " + highScore
                    localStorage.setItem('Easyhighscore', highScore)
                }
            }
        }

        // INSANE MODE high score
        if (radioInsaneEle.checked) {
            if (score > highScore) {
                if (localStorage.getItem('Insanehighscore') === null) {
                    highScore = score
                    highScoreEle.textContent = "Insane High Score: " + highScore
                    localStorage.setItem('Insanehighscore', highScore)
                }
                else if (score > localStorage.getItem('Insanehighscore')) {
                    highScore = score
                    highScoreEle.textContent = "Insane High Score: " + highScore
                    localStorage.setItem('Insanehighscore', highScore)
                }
            }
        }
    }
    // collision with Heal
    if (healLocations.includes(head)){
        health++
        healthEle.textContent=("Health: " + ("❤️".repeat(health)))
        thereisheal = false
        let healIndex = healLocations.indexOf(head)
        healLocations.splice(healIndex, 1)
    }
    startSnakeMovement()
    document.querySelector('#score').textContent = "Score: " + score
    
    }

function gameOVER(){
    // clear Interval 
    if (gameInterval) clearInterval(gameInterval)
    
    // displays the button
    startButton.style.display = 'block'
    section.style.filter = 'blur(5px)'
        for (let buttonEl of radioContainer){
        buttonEl.style.display = 'inline-block'
    }
    
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
    // easy mode 
    if(radioEasyEle.checked){
        // at a random time spawn an obstacle
        if (Math.random() < 0.4 && obstacleLocation.length < 5){
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
            obstacleLocation.push(randomIndex)

            // place obstacle
            gameSquares[randomIndex] = obstacleEmoji
            divs[randomIndex].style.backgroundImage = `url(${obstacleEmoji})`
            divs[randomIndex].style.backgroundSize = 'contain'
            divs[randomIndex].style.backgroundRepeat = 'no-repeat'
        }

        // removes the oldest at random time
        if (obstacleLocation.length > 0 && Math.random() < 0.008){
            let removeIndex = obstacleLocation.shift()
            gameSquares[removeIndex] = ""
            divs[removeIndex].style.backgroundImage = ''
        }
    }

    // insane mode 
    else if (radioInsaneEle.checked){
        // at a random time spawn an obstacle
        if(Math.random() < 0.15){
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
            obstacleLocation.push(randomIndex)

            // place obstacle
            gameSquares[randomIndex] = obstacleEmoji
            divs[randomIndex].style.backgroundImage = `url(${obstacleEmoji})`
            divs[randomIndex].style.backgroundSize = 'contain'
            divs[randomIndex].style.backgroundRepeat = 'no-repeat'
        }
    }
}


function heal(){
    if(isHurt && Math.random() < 0.02){
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
        
        // place heal
        thereisheal = true
        isHurt = false
        gameSquares[randomIndex] = healEmoji
        divs[randomIndex].style.backgroundImage = `url(${healEmoji})`
        divs[randomIndex].style.backgroundSize = 'contain'
        divs[randomIndex].style.backgroundRepeat = 'no-repeat'
        healLocations.push(randomIndex)
    }
}

function startGame(){
    // showing the button
    startButton.style.display = 'none'
    for (let buttonEl of radioContainer){
        buttonEl.style.display = 'none'
    }
    section.style.filter = 'none'

    // resets the variables
    score = 0
    document.querySelector('#score').textContent = "Score: " +score

    // if easy
    if (radioEasyEle.checked){
    highScoreEle.textContent = "Easy High Score: " + localStorage.getItem('Easyhighscore')
    section.innerHTML = ""
    createGrid()
    divs = section.querySelectorAll('div')
    gameSquares = new Array(grid * grid).fill('')
    wallArray = []
    fillWalls()
    section.style.gridTemplateColumns = `repeat(${easyGridSize.toString()}, 1fr)`
    section.style.width = "800px"
    section.style.height = "800px"
    health=3
    healthEle.textContent=("Health: " + ("❤️".repeat(health)))
    thereisobstacle = false
    obstacleLocation = []
    }

    // if insane
    else{
    highScoreEle.textContent = "Insane High Score: " + localStorage.getItem('Insanehighscore')
    section.innerHTML = ""
    createGrid()
    divs = section.querySelectorAll('div')
    gameSquares = new Array(grid * grid).fill('')
    wallArray = []
    fillWalls()
    section.style.gridTemplateColumns = `repeat(${insaneGridSize.toString()}, 1fr)`
    section.style.width = "400px"
    section.style.height = "400px"
    health=1
    healthEle.textContent=("Health: " + ("❤️".repeat(health)))
    thereisobstacle = false
    obstacleLocation = []
    }

    // clears the board except the walls
    for (let i = 0; i < gameSquares.length; i++) {
        if (!wallArray.includes(i)) {
            gameSquares[i] = ""
            divs[i].style.backgroundImage = ""
        }
    }

    //start the game
    apple = false
    thereisobstacle = false
    setTimeout(() => isThereApple(), 0)
    setTimeout(() => isThereObstacle(), 0)
    snakeSpawn()
    startSnakeMovement()
}


function buttonClicks(e){
    if (directionChanged) return

    // saving the clickedkey
    const key = e.key.toLowerCase()
    
    if(radioEasyEle.checked){
        //checks what VALID button clicked
        if ((key === 'w' || key === 'arrowup') && snakeAimingDirection !== 'Down') {
            snakeAimingDirection = 'Up'
            directionChanged = true
        }
        else if ((key === 's' || key === 'arrowdown') && snakeAimingDirection !== 'Up') {
            snakeAimingDirection = 'Down'
            directionChanged = true
        }
        else if ((key === 'a' || key === 'arrowleft') && snakeAimingDirection !== 'Right') {
            snakeAimingDirection = 'Left'
            directionChanged = true
        }
        else if ((key === 'd' || key === 'arrowright') && snakeAimingDirection !== 'Left') {
            snakeAimingDirection = 'Right'
            directionChanged = true
        }
    }
    else{
        // flips
        if ((key === 'w' || key === 'arrowup') && snakeAimingDirection !== 'Up') {
            snakeAimingDirection = 'Down'
            directionChanged = true
        }
        else if ((key === 's' || key === 'arrowdown') && snakeAimingDirection !== 'Down') {
            snakeAimingDirection = 'Up'
            directionChanged = true
        }
        else if ((key === 'a' || key === 'arrowleft') && snakeAimingDirection !== 'Left') {
            snakeAimingDirection = 'Right'
            directionChanged = true
        }
        else if ((key === 'd' || key === 'arrowright') && snakeAimingDirection !== 'Right') {
            snakeAimingDirection = 'Left'
            directionChanged = true
        }
    }
}

/*----------------------------- Event Listeners -----------------------------*/

// clicking the Start/Restart button
startButton.addEventListener('click', startGame)

// moving with WASD
document.addEventListener('keydown', buttonClicks)