//game
let tileSize = 32;
let rows = 16;
let columns = 16;

let game;
let gameWidth = tileSize * columns; 
let gameHeight = tileSize * rows; 
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
const shipVelocityX = tileSize; 

//ghosts
let ghostArray = [];
const ghostWidth = tileSize;
const ghostHeight = tileSize;
const ghostX = tileSize;
const ghostY = tileSize;
let ghostImg;

let ghostRows = 4;
let ghostColumns = 3;
let ghostCount = 0; 
let ghostVelocityX = 2; 

//bullets
let bulletArray = [];
let bulletVelocityY = -10; //bullet moving speed

let score = 0;
let gameOver = false;

window.onload = function() {
    game = document.getElementById("game");
    game.width = gameWidth;
    game.height = gameHeight;
    context = game.getContext("2d"); 


    //load images
    shipImg = new Image();
    shipImg.src = "./big_boss1.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    ghostImg = new Image();
    ghostImg.src = "./ghost.png";
    createGhost();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

const update = () => {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, game.width, game.height);

    //ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //ghost
    for (let i = 0; i < ghostArray.length; i++) {
        let ghost = ghostArray[i];
        if (ghost.alive) {
            ghost.x += ghostVelocityX;

            //keeps ghosts from leaving boundary
            if (ghost.x + ghost.width >= game.width || ghost.x <= 0) {
                ghostVelocityX *= -1;
                ghost.x += ghostVelocityX*2;

                //moves down one row
                for (let j = 0; j < ghostArray.length; j++) {
                    ghostArray[j].y += ghostHeight;
                }
            }
            context.drawImage(ghostImg, ghost.x, ghost.y, ghost.width, ghost.height);

            if (ghost.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="red";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision
        for (let j = 0; j < ghostArray.length; j++) {
            let ghost = ghostArray[j];
            if (!bullet.used && ghost.alive && detectCollision(bullet, ghost)) {
                bullet.used = true;
                ghost.alive = false;
                ghostCount--;
                score += 100;
            }
        }
    }

    //clear bullet array
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); 
    }

    //next level
    if (ghostCount == 0) {
        
        score += ghostColumns * ghostRows * 100; 
        ghostColumns = Math.min(ghostColumns + 1, columns/2 -2); 
        ghostRows = Math.min(ghostRows + 1, rows-4);  
        if (ghostVelocityX > 0) {
            ghostVelocityX += 0.2;
        }
        else {
            ghostVelocityX -= 0.2; 
        }
        gostArray = [];
        bulletArray = [];
        createGhost();
    }

    //score
    context.fillStyle="yellow";
    context.font="28px courier";
    context.fillText(score, 5, 20);
}

const moveShip = (e) => {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= game.width) {
        ship.x += shipVelocityX; //move right one tile
    }
}

const createGhost = () => {
    for (let c = 0; c < ghostColumns; c++) {
        for (let r = 0; r < ghostRows; r++) {
            let ghost = {
                img : ghostImg,
                x : ghostX + c*ghostWidth,
                y : ghostY + r*ghostHeight,
                width : ghostWidth,
                height : ghostHeight,
                alive : true
            }
            ghostArray.push(ghost);
        }
    }
    ghostCount = ghostArray.length;
}

const shoot = (e) => {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        //shoot
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   
           a.x + a.width > b.x &&   
           a.y < b.y + b.height &&  
           a.y + a.height > b.y;    
}