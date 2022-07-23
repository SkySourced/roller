"use strict";
// Roller
// a game by Luka Scott
// *********
// CONSTANTS
// *********
const WIDTH = 800; // canvas width
const HEIGHT = 800; // canvas height
const GRAVITY = 0.1; // player y-axis acceleration
const SPEED_CAP = 10; // speed cap
const PLAYER_SIZE = 100; // size of player sprite
const PLATFORM_SPACING_DIST = 500; // distance between platforms
const SIDEBAR_WIDTH = 45; // width of images on the sides
const SPEED_INCREASE = 0.4; // how much the camera speed increases
const SPEED_INCREASE_LENGTH = 100; // how long the speed up is
// *********
// IMAGES
// *********
const LEFTSIDE = new Image(); // left sidebar image
LEFTSIDE.src = "./assets/leftSide.png";
const RIGHTSIDE = new Image(); // right sidebar image
RIGHTSIDE.src = "./assets/rightSide.png";
const LOG = new Image(); // player image
LOG.src = "./assets/log.png";
const PLATFORM_TEXTURE = new Image(); // platform image
PLATFORM_TEXTURE.src = "./assets/platform.png";
const SPLASH_SCREEN = new Image(); // starting image
SPLASH_SCREEN.src = "./assets/splash screen.png";
// *********
// VARIABLES
// *********
let ctx; // drawing context
let canvas; // canvas
let score = 0; // game score
let level = 1; // game speed level
let gameState = "start"; // state of the game
let scrollSpeed = 1; // speed the camera scrolls at
let cameraHeight = 800; // height the camera starts at
let platformHeight = 100; // height of platforms
let numPlatforms = 100; // number of platforms generated at once
let platforms; // array of platforms
let player; // player object
let collisionFlag; // used to check if player hits any platforms.
let speedChangeFrameCount; // used to gradually increase the speed when required
let speedChanging = false; // is speed increasing
let lastFrameCollision = false; // was the player colliding last frame
let lastPlatformCollided;
let keysPressed = {
    left: false,
    right: false,
    z: false,
    x: false
};
// *********
// CLASSES
// *********
class Platform {
    constructor(y, side) {
        this.x = (side == "left") ? 0 : (side == "right") ? WIDTH - PLATFORM_TEXTURE.width : WIDTH / 2 - PLATFORM_TEXTURE.width / 2; // where the platform starts
        this.y = y;
        this.width = PLATFORM_TEXTURE.width;
        this.height = platformHeight;
        this.side = side;
    }
    draw(ctx) {
        //ctx.fillStyle = "black";
        //ctx.drawRect(this.x, cameraHeight - this.y, this.width, this.height)
        ctx.drawImage(PLATFORM_TEXTURE, this.x, cameraHeight - this.y);
    }
}
class Player {
    constructor(x, y, width, height, image) {
        this.x = x; // player position
        this.y = y; // "
        this.width = width; // player size
        this.height = height; // "
        this.image = image; // image
        this.moveSpeed = 10; // horizontal move speed
        this.jumpHeight = 65; // jump ySpeed
        this.dashLength = 170; // dash length
        this.facing = "right"; // direction last moved for dashing
        this.dashing = false; // is player dashing
        this.ySpeed = 0.1; // y speed
        this.onGround = false; // is player on ground (can it jump)
        this.canDash = false; // prevents holding button down and always moving
        this.canJump = false; // "
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.x, cameraHeight - this.y, this.width, this.height);
        console.log(cameraHeight - this.y, cameraHeight);
    }
    jump() {
        if (this.canJump && this.onGround && keysPressed.z) {
            console.log("jumping");
            this.ySpeed = -this.jumpHeight;
            this.onGround = false;
        }
    }
    dash() {
        if (this.canDash && !this.dashing) {
            console.log("dashing");
            this.dashing = true;
            if (this.facing == "right" && this.x + this.dashLength < WIDTH - SIDEBAR_WIDTH) {
                this.x += this.dashLength; //regular right dash
            }
            else if (this.facing == "left" && this.x - this.dashLength > SIDEBAR_WIDTH) {
                this.x -= this.dashLength; //regular left dash
            }
            else if (this.facing == "right" && this.x + this.dashLength > WIDTH - SIDEBAR_WIDTH) {
                this.x == WIDTH - SIDEBAR_WIDTH; // right dash off screen
            }
            else if (this.facing == "left" && this.x - this.dashLength < SIDEBAR_WIDTH) {
                this.x == SIDEBAR_WIDTH; // left dash off screen
            }
            platforms.forEach((platform) => {
                if (this.x + this.dashLength > platform.x && this.x - this.dashLength < platform.x + platform.width && this.y + this.height - 5 > platform.y && this.y + 5 < platform.y + platform.height) {
                    if (this.facing == "left") {
                        this.x = platform.x + platform.width;
                    }
                    else if (this.facing == "right") {
                        this.x = platform.x - this.width;
                    }
                }
            });
            this.dashing = false;
        }
    }
    move() {
        if (!this.dashing) {
            this.y -= this.ySpeed; // might not be neccessary
            if (keysPressed.left) {
                console.log("moving left");
                this.facing = "left";
                this.x -= this.moveSpeed;
            }
            else if (keysPressed.right) {
                console.log("moving right");
                this.facing = "right";
                this.x += this.moveSpeed;
            }
        }
        platforms.forEach(platform => {
            if (this.x + this.width > platform.x && this.x < platform.x && this.y + this.height - 5 > platform.y && this.y + 5 < platform.y + platform.height) {
                this.x -= this.moveSpeed;
            }
            if (platform.x + platform.width > this.x && platform.x < this.x + this.width && this.y + this.height - 5 > platform.y && this.y + 5 < platform.y + platform.height) {
                this.x += this.moveSpeed;
            }
        });
        if (this.x < SIDEBAR_WIDTH) { // keep player from going off screen (left)
            this.x = SIDEBAR_WIDTH;
        }
        if (this.x > WIDTH - this.width - SIDEBAR_WIDTH) { // keep player from going off screen (right)
            this.x = WIDTH - this.width - SIDEBAR_WIDTH;
        }
    }
}
window.onload = function () {
    platforms = []; // inits platforms array
    canvas = document.getElementById("mainCanvas"); // gets canvas dom object
    ctx = canvas.getContext("2d"); // gets ctx
    if (gameState == "start") { // draw splash image
        ctx.drawImage(SPLASH_SCREEN, 0, 0);
    }
    // initialise event listeners
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
};
function gameSetup() {
    if (gameState == "game") {
        // Creates the platforms
        for (let i = 0; i < numPlatforms; i++) {
            let sideDeterminant = Math.random(); // is used to randomly generate position of platforms
            platforms[platforms.length] = new Platform(i * PLATFORM_SPACING_DIST, (sideDeterminant <= 0.33) ? "left" : (sideDeterminant <= 0.66) ? "right" : "centre");
        }
        // Creates the player
        player = new Player(WIDTH / 2, HEIGHT - 50, PLAYER_SIZE, PLAYER_SIZE, LOG);
        // Creates the game loop
        setInterval(update, 1000 / 60); // 60 fps
    }
}
function update() {
    // Clears the canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Increases camera height
    if (gameState == "game") {
        cameraHeight += scrollSpeed;
    }
    // Draws the platforms
    for (let i = 0; i < platforms.length; i++) {
        platforms[i].draw(ctx);
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
    if (Math.floor(player.y / PLATFORM_SPACING_DIST) > score) {
        score = Math.floor(player.y / PLATFORM_SPACING_DIST);
        // Attempting to increase scroll speed
        if (score % 5 == 0) {
            level++;
            speedChanging = true;
            speedChangeFrameCount = 0;
        }
    }
    if (speedChanging) {
        //if(Math.floor(speedChangeFrameCount / 10) % 2 == 0){ // every other 10 frames
        ctx.fillStyle = "lime";
        ctx.font = "60px Arial";
        ctx.fillText("Speed Up!", WIDTH / 2 - 130, HEIGHT / 2);
        //}
        scrollSpeed += SPEED_INCREASE / SPEED_INCREASE_LENGTH;
        speedChangeFrameCount++;
        if (speedChangeFrameCount >= SPEED_INCREASE_LENGTH) {
            speedChanging = false;
        }
    }
    // Score display
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, SIDEBAR_WIDTH + 20, 50);
    // Level display
    ctx.fillText("Level: " + level, SIDEBAR_WIDTH + 20, 100);
    // Game over
    if (cameraHeight - player.y + player.height > HEIGHT) {
        gameState = "end";
        ctx.fillStyle = "black";
        ctx.font = "60px Arial";
        ctx.fillText("Game Over", WIDTH / 2 - 200, HEIGHT / 2 - 60);
        ctx.fillText("Final Score: " + score, WIDTH / 2 - 200, HEIGHT / 2);
        ctx.fillText("Press 'r' to restart", WIDTH / 2 - 200, HEIGHT / 2 + 60);
    }
    checkCollision();
    // Debugging
    //console.log(cameraHeight);
    //console.log(platforms);
    //console.log(player.ySpeed)
}
function checkCollision() {
    // Collision
    collisionFlag = false;
    platforms.forEach(platform => {
        if (player.x + player.width >= platform.x && player.x <= platform.x + platform.width && player.y + player.height > platform.y && player.y < platform.y + platform.height) {
            collisionFlag = true;
            if (player.ySpeed > 0) { // stop player from falling through platforms
                player.ySpeed = 0;
            }
            if (player.y > platform.y) { // collision from above
                player.onGround = true;
            }
            else if (platform.y + platform.height > player.y) { // collision from below
                player.ySpeed = 0.1;
            }
            //else {
            //    if(platform == lastPlatformCollided){ // if player has glitched into platforms
            //        console.log("glitched into platforms");
            //        if(platform.side == "left"){
            //            console.log("left");
            //            player.x = platform.width;
            //        } else if(platform.side == "right"){
            //            console.log("right");
            //            player.x = platform.x - player.width;
            //        } else if(platform.side == "centre" && player.x < WIDTH/2){ // centre from the left
            //            console.log("centre from left");
            //            player.x = platform.x - player.width;
            //        } else if(platform.side == "centre" && player.x > WIDTH/2){ // centre from the right
            //            console.log("centre from right");
            //            player.x = platform.x + platform.width;
            //        }
            //    }
            //}
            //Debugging collision
            //console.log("Player X: " + player.x);
            //console.log("Platform height: " + player.width);
            //console.log("Platform X: " + platform.x);
            //console.log("Platform width: " + platform.width);
            lastPlatformCollided = platform;
        }
    });
    if (collisionFlag) {
        lastFrameCollision = true;
    }
    // Gravity
    if (!collisionFlag) { // sets player as off the ground if not colliding with anything
        if (lastFrameCollision) {
            player.ySpeed += GRAVITY;
            lastFrameCollision = false;
        }
        player.onGround = false;
        if (player.ySpeed != 0) { // gravity
            player.ySpeed += GRAVITY;
        }
        if (player.ySpeed > SPEED_CAP) { // speed cap (down)
            player.ySpeed = SPEED_CAP;
        }
        if (player.ySpeed < -SPEED_CAP) { // speed cap (up)
            player.ySpeed = -SPEED_CAP;
        }
    }
}
// Keyboard input
function keyDownHandler(event) {
    if (event.key == "z" && gameState == "start") {
        gameState = "game";
        gameSetup();
    }
    if (event.key == "r") {
        location.reload();
    }
    if (gameState == "game") {
        if (event.key == "ArrowLeft") {
            keysPressed.left = true;
        }
        else if (event.key == "ArrowRight") {
            keysPressed.right = true;
        }
        else if (event.key == "z") {
            keysPressed.z = true;
            player.jump();
            player.canJump = false;
        }
        else if (event.key == "x" || event.key == "c") {
            keysPressed.x = true;
            player.dash();
            player.canDash = false;
        }
    }
}
function keyUpHandler(event) {
    if (event.key == "ArrowLeft") {
        keysPressed.left = false;
    }
    else if (event.key == "ArrowRight") {
        keysPressed.right = false;
    }
    else if (event.key == "z") {
        keysPressed.z = false;
        player.canJump = true;
    }
    else if (event.key == "x" || event.key == "c") {
        keysPressed.x = false;
        player.canDash = true;
    }
}
