const WIDTH = 800;
const HEIGHT = 800;
const GRAVITY = 0.1;
const SPEED_CAP = 10;
const PLAYER_SIZE = 100;
const PLATFORM_DISTANCE = 500;
const SIDEBAR_WIDTH = 45; 

let ctx: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;
let score: number = 0;

let gameState: "start" | "game" | "end" = "game";

const LEFTSIDE = new Image();
LEFTSIDE.src = "./assets/leftSide.png";
const RIGHTSIDE = new Image();
RIGHTSIDE.src = "./assets/rightSide.png";
const LOG = new Image();
LOG.src = "./assets/log.png";

let scrollSpeed = 1; // speed the camera scrolls at
let cameraHeight = 800; // height the camera starts at
let platformHeight = 100; // height of platforms
let numPlatforms = 100;
let platforms: Platform[];
let player: Player;
let collisionFlag: boolean; // used to check if player hits any platforms.

let keysPressed = {
    left: false,
    right: false,
    z: false,
    x: false
}

class Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    side: "left" | "right";
    constructor(x: number, y: number, width: number, side: "left" | "right"){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = platformHeight;
        this.side = side;
    }
    draw(ctx: CanvasRenderingContext2D){
        if(this.side == "left"){
            ctx.fillStyle = "red";
            ctx.fillRect(0, cameraHeight - this.y, this.width, this.height) // drawing the platforms
        } else if (this.side == "right"){
            ctx.fillStyle = "blue";
            ctx.fillRect(WIDTH - this.width, cameraHeight - this.y, this.width, this.height);
        }
    }
}

class Player {
    x: number;
    y: number;
    width: number;
    height: number;
    image: HTMLImageElement;
    jumpHeight: number;
    dashLength: number;
    facing: "left" | "right";
    dashing: boolean;
    moveSpeed: number;
    ySpeed: number;
    onGround: boolean;
    canDash: boolean;
    canJump: boolean;
    constructor(x: number, y: number, width: number, height: number, image: HTMLImageElement){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.moveSpeed = 10;
        this.jumpHeight = 70;
        this.dashLength = 170;
        this.facing = "right";
        this.dashing = false;
        this.ySpeed = 0.1;
        this.onGround = false;
        this.canDash = false;
        this.canJump = false;
    }
    draw(ctx: CanvasRenderingContext2D){
        ctx.drawImage(this.image, this.x, cameraHeight - this.y, this.width, this.height);
        console.log(cameraHeight - this.y, cameraHeight)
    }
    jump(){
        if(this.canJump && this.onGround && keysPressed.z){
            console.log("jumping");
            this.ySpeed = -this.jumpHeight;
            this.onGround = false;
        }
    }
    dash(){
        if (this.canDash && !this.dashing) {
            console.log("dashing");
            this.dashing = true;
            if(this.facing == "right"&& this.x + this.dashLength < WIDTH - SIDEBAR_WIDTH){
                this.x += this.dashLength;
            } else if (this.facing == "left" && this.x - this.dashLength > SIDEBAR_WIDTH) {
                this.x -= this.dashLength;
            } else if (this.facing == "right" && this.x + this.dashLength > WIDTH - SIDEBAR_WIDTH){
                this.x == WIDTH - SIDEBAR_WIDTH;
            } else if (this.facing == "left" && this.x - this.dashLength < SIDEBAR_WIDTH) {
                this.x == SIDEBAR_WIDTH;
            }
            this.dashing = false; 
        }
    }
    move(){
        if(!this.dashing){
            this.y -= this.ySpeed;
            if(keysPressed.left){
                console.log("moving left");
                this.facing = "left";
                this.x -= this.moveSpeed;
            } else if (keysPressed.right){
                console.log("moving right");
                this.facing = "right";
                this.x += this.moveSpeed;
            }
        }
        if(this.x < SIDEBAR_WIDTH){
            this.x = SIDEBAR_WIDTH;
        }
        if(this.x > WIDTH - this.width - SIDEBAR_WIDTH){
            this.x = WIDTH - this.width - SIDEBAR_WIDTH;
        }
    }
}
window.onload = function(){
    platforms = [];
    canvas = <HTMLCanvasElement> document.getElementById("mainCanvas")
    ctx = canvas.getContext("2d");
    window.addEventListener("keydown", function(event){
        if(event.key == "z" && gameState == "start"){
            gameState = "game";
        }
    })
    if(gameState == "game"){
        // Creates the platforms
        for(let i = 0; i < numPlatforms; i++){
            platforms[platforms.length] = new Platform(Math.floor(Math.random() * WIDTH-SIDEBAR_WIDTH)+SIDEBAR_WIDTH, i * PLATFORM_DISTANCE, Math.floor(Math.random() * 1000), (Math.random() <= 0.5) ? "left" : "right") // testing platform + cool camera
        }
        // Creates the player
        player = new Player(WIDTH/2, HEIGHT-50, PLAYER_SIZE, PLAYER_SIZE, LOG);
        // Creates the game loop
        setInterval(update, 1000/60); // 60 fps
        document.addEventListener("keydown", function(event){
            if(event.key == "ArrowLeft"){
                keysPressed.left = true;
            } else if (event.key == "ArrowRight"){
                keysPressed.right = true;
            } else if (event.key == "z"){
                keysPressed.z = true;
                player.jump();
                player.canJump = false;
            } else if (event.key == "x" || event.key == "c"){
                keysPressed.x = true;
                player.dash()
                player.canDash = false;
            }
        })
        document.addEventListener("keyup", function(event){
            if(event.key == "ArrowLeft"){
                keysPressed.left = false;
            } else if (event.key == "ArrowRight"){
                keysPressed.right = false;
            } else if (event.key == "z"){
                keysPressed.z = false;
                player.canJump = true;
            } else if (event.key == "x" || event.key == "c"){
                keysPressed.x = false;
                player.canDash = true;
            }
        })
    }
}
function update(){ // this loop runs 60 times per second
    // Clears the canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Increases camera height
    if(gameState = "game"){
        cameraHeight += scrollSpeed;
    }
    // Draws the platforms
    for(let i = 0; i < platforms.length; i++){
        platforms[i].draw(ctx)
    }
    // Draws the player
    player.draw(ctx);
    // Moves the player
    player.move();
    player.jump();
    // Draws the side images
    ctx.drawImage(LEFTSIDE, 0, 0, SIDEBAR_WIDTH, HEIGHT);
    ctx.drawImage(RIGHTSIDE, WIDTH - SIDEBAR_WIDTH, 0, SIDEBAR_WIDTH, HEIGHT);
    // Score calculation
    if(Math.floor(player.y / PLATFORM_DISTANCE) > score){
        score = Math.floor(player.y / PLATFORM_DISTANCE);
    }
    // Score display
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, WIDTH - SIDEBAR_WIDTH + 10, 50);
    // Game over
    if(cameraHeight - player.y > HEIGHT){
        gameState = "end"
        ctx.fillStyle = "black";
        ctx.font = "60px Arial";
        ctx.fillText("Game Over", WIDTH/2 - 200, HEIGHT/2);
        ctx.fillText("Final Score: " + score, WIDTH/2 - 200, HEIGHT/2 + 50);
        ctx.fillText("Press 'r' to restart", WIDTH/2 - 200, HEIGHT/2 + 100);
        document.addEventListener("keydown", function(event){
            if(event.key == "r"){
                location.reload();
            }
        })
    }
    // Gravity
    collisionFlag = false;
    platforms.forEach(element => {
        if(player.x + player.width > element.x && player.x < element.x + element.width && player.y + player.height > element.y && player.y < element.y + element.height){
            console.log("collision with " + element);
            collisionFlag = true;
            if(player.ySpeed > 0){
                player.ySpeed = 0;
            }
            
        }
    });
    if(!collisionFlag){
        player.onGround = false;
    }
    if (!player.onGround){
        if (player.ySpeed != 0){ // gravity
            player.ySpeed += GRAVITY;
        }
        if (player.ySpeed > SPEED_CAP){ // speed cap (down)
            player.ySpeed = SPEED_CAP;
        }
        if (player.ySpeed < -SPEED_CAP) { // speed cap (up)
            player.ySpeed = -SPEED_CAP;
        }
    }
    // Debugging
    //console.log(cameraHeight);
    //console.log(platforms);
    console.log(player.ySpeed)
}