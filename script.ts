// *********
// CONSTANTS
// *********

const WIDTH = 800;
const HEIGHT = 800;
const GRAVITY = 0.1;
const SPEED_CAP = 10;
const PLAYER_SIZE = 100;
const PLATFORM_SPACING_DIST = 500;
const SIDEBAR_WIDTH = 45; 
const SPEED_INCREASE = 0.4;
const SPEED_INCREASE_LENGTH = 100;

// *********
// IMAGES
// *********

const LEFTSIDE = new Image();
LEFTSIDE.src = "./assets/leftSide.png";
const RIGHTSIDE = new Image();
RIGHTSIDE.src = "./assets/rightSide.png";
const LOG = new Image();
LOG.src = "./assets/log.png";
const PLATFORM_TEXTURE = new Image();
PLATFORM_TEXTURE.src = "./assets/platform.png";
const SPLASH_SCREEN = new Image();
SPLASH_SCREEN.src = "./assets/splash screen.png";

// *********
// VARIABLES
// *********

let ctx: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;
let score: number = 0;
let gameState: "start" | "game" | "end" = "start";
let scrollSpeed = 1; // speed the camera scrolls at
let cameraHeight = 800; // height the camera starts at
let platformHeight = 100; // height of platforms
let numPlatforms = 100;
let platforms: Platform[];
let player: Player;
let collisionFlag: boolean; // used to check if player hits any platforms.
let speedChangeFrameCount: number; // used to gradually increase the speed when required
let speedChanging: boolean = false;
let keysPressed = {
    left: false,
    right: false,
    z: false,
    x: false
}

// *********
// CLASSES
// *********

class Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    side: "left" | "right" | "centre";
    constructor(y: number, side: "left" | "right" | "centre"){
        this.x = (side == "left") ? 0 : (side == "right") ? WIDTH - PLATFORM_TEXTURE.width : WIDTH / 2 - PLATFORM_TEXTURE.width / 2;
        this.y = y;
        this.width = PLATFORM_TEXTURE.width;
        this.height = platformHeight;
        this.side = side;
    }
    draw(ctx: CanvasRenderingContext2D){
        ctx.fillStyle = "black";
        ctx.drawImage(PLATFORM_TEXTURE, this.x, cameraHeight - this.y);
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
        this.jumpHeight = 65;
        this.dashLength = 170;
        this.facing = "right";
        this.dashing = false;
        this.ySpeed = 0.1;
        this.onGround = false;
        this.canDash = false;
        this.canJump = false;
    }
    draw(ctx: CanvasRenderingContext2D){ // draw player
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
                this.x += this.dashLength; //regular right dash
            } else if (this.facing == "left" && this.x - this.dashLength > SIDEBAR_WIDTH) {
                this.x -= this.dashLength; //regular left dash
            } else if (this.facing == "right" && this.x + this.dashLength > WIDTH - SIDEBAR_WIDTH){
                this.x == WIDTH - SIDEBAR_WIDTH; // right dash off screen
            } else if (this.facing == "left" && this.x - this.dashLength < SIDEBAR_WIDTH) {
                this.x == SIDEBAR_WIDTH; // left dash off screen
            }
            this.dashing = false; 
        }
    }
    move(){
        if(!this.dashing){
            this.y -= this.ySpeed; // might not be neccessary
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
        if(this.x < SIDEBAR_WIDTH){ // keep player from going off screen
            this.x = SIDEBAR_WIDTH;
        }
        if(this.x > WIDTH - this.width - SIDEBAR_WIDTH){
            this.x = WIDTH - this.width - SIDEBAR_WIDTH;
        }
    }
}
window.onload = function(){ // start function
    platforms = [];
    canvas = <HTMLCanvasElement> document.getElementById("mainCanvas")
    ctx = canvas.getContext("2d");
    if(gameState == "start"){
        ctx.drawImage(SPLASH_SCREEN, 0, 0);
    }
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
}
function gameSetup(){
    if(gameState == "game"){
        // Creates the platforms
        for(let i = 0; i < numPlatforms; i++){
            let sideDeterminant = Math.random();
            platforms[platforms.length] = new Platform(i * PLATFORM_SPACING_DIST, (sideDeterminant <= 0.33) ? "left" : (sideDeterminant <= 0.66) ? "right" : "centre")
        }
        // Creates the player
        player = new Player(WIDTH/2, HEIGHT-50, PLAYER_SIZE, PLAYER_SIZE, LOG);
        // Creates the game loop
        setInterval(update, 1000/60); // 60 fps
    }
}
function update(){ // this loop runs 60 times per second
    // Clears the canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Increases camera height
    if(gameState == "game"){
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
    if(Math.floor(player.y / PLATFORM_SPACING_DIST) > score){
        score = Math.floor(player.y / PLATFORM_SPACING_DIST);
        // Attempting to increase scroll speed
        if(score % 5 == 0){
            speedChanging = true;
            speedChangeFrameCount = 0;
        }
    }
    if(speedChanging){
        if(Math.floor(speedChangeFrameCount / 10) % 2 == 0){ // every other 10 frames
            ctx.fillStyle = "lime";
            ctx.font = "30px Arial";
            ctx.fillText("Speed Up!", WIDTH/2 - 100, HEIGHT/2);
        }
        scrollSpeed += SPEED_INCREASE / SPEED_INCREASE_LENGTH;
        speedChangeFrameCount++;
        if(speedChangeFrameCount >= SPEED_INCREASE_LENGTH){
            speedChanging = false;
        }

    }
    // Score display
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, SIDEBAR_WIDTH + 20, 50);
    // Level display
    ctx.fillText("Level: " + Math.ceil(score / 5), SIDEBAR_WIDTH + 20, 100);
    // Game over
    if(cameraHeight - player.y + player.height > HEIGHT){
        gameState = "end"
        ctx.fillStyle = "black";
        ctx.font = "60px Arial";
        ctx.fillText("Game Over", WIDTH/2 - 200, HEIGHT/2);
        ctx.fillText("Final Score: " + score, WIDTH/2 - 200, HEIGHT/2 + 50);
        ctx.fillText("Press 'r' to restart", WIDTH/2 - 200, HEIGHT/2 + 100);
    }
    // Gravity 
    collisionFlag = false;
    platforms.forEach(platform => {
        if(player.x + player.width >= platform.x && player.x <= platform.x + platform.width && 
            player.y + player.height > platform.y && player.y < platform.y + platform.height){
            collisionFlag = true;
            if(player.ySpeed > 0){ // stop player from falling through platforms
                player.ySpeed = 0;
            }
            if(player.y > platform.y){ // collision from above
                player.onGround = true;
            } else if (platform.y + platform.height > player.y) { // collision from below
                player.ySpeed = 0.1;
            }
            console.log("Player X: " + player.x);
            console.log("Platform height: " + player.width);
            console.log("Platform X: " + platform.x);
            console.log("Platform width: " + platform.width);
            if(player.y + player.width )
        }
    });
    if(!collisionFlag){ // sets player as off the ground if not colliding with anything
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
// Keyboard input
function keyDownHandler(event: KeyboardEvent){
    let key = event.key;
    if(event.key == "z" && gameState == "start"){
        gameState = "game";
        gameSetup();
    }
    if(event.key == "r"){
        location.reload();
    }
    if(gameState=="game"){
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
    }
}
function keyUpHandler(event: KeyboardEvent){
    let key = event.key;
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
}