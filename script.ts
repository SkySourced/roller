const WIDTH = 800;
const HEIGHT = 800;

let ctx: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;

const leftSide = new Image();
leftSide.src = "./assets/leftSide.png";
const rightSide = new Image();
rightSide.src = "./assets/rightSide.png";
const log = new Image();
log.src = "./assets/log.png";

let scrollSpeed = 10;
let cameraHeight = 800;
let platformHeight = 100;
let numPlatforms = 100;
let platforms: Platform[];
let player: Player;

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
    speed: number;
    constructor(x: number, y: number, width: number, height: number, image: HTMLImageElement){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.speed = 10;
        this.jumpHeight = 10;
        this.dashLength = 100;
        this.facing = "right";
        this.dashing = false;
    }
    draw(ctx: CanvasRenderingContext2D){
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    jump(){
        for(let jump = this.jumpHeight; jump <= 0; jump--){
            this.y -= jump; // still needs gravity;
        }
    }
    dash(){
        this.dashing = true;
        let currentY = this.y;
        for(let dash = this.dashLength; dash >= 0; dash/2){
            this.y = currentY;
            if(this.facing == "left"){
                this.x -= dash;
            }
            if(this.facing == "right"){
                this.x += dash;
            }
        }
    }
    move(direction: "left" | "right"){
        this.facing = direction;
        if(!this.dashing){
            if(direction == "left"){
                this.x -= this.speed;
            } else if (direction == "right"){
                this.x += this.speed;
            }
        }
    }
}
window.onload = function(){
    platforms = [];
    canvas = <HTMLCanvasElement> document.getElementById("mainCanvas")
    ctx = canvas.getContext("2d");
    // Creates the platforms
    for(let i = 0; i < numPlatforms; i++){
        platforms[platforms.length] = new Platform(Math.floor(Math.random() * WIDTH), i * 500, Math.floor(Math.random() * 1000), (Math.random() <= 0.5) ? "left" : "right") // testing platform + cool camera
    }
    player = new Player(WIDTH/2, HEIGHT-50, 100, 100, log);
    // Creates the game loop
    setInterval(update, 16.66); // 60 fps
}
function update(){ // this loop runs 60 times per second
    // Clears the canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Increases camera height
    cameraHeight += scrollSpeed;
    // Draws the platforms
    for(let i = 0; i < platforms.length; i++){
        platforms[i].draw(ctx)
    }
    // Draws the player
    player.draw(ctx);
    // Draws the side images
    ctx.drawImage(leftSide, 45, 0, 45, HEIGHT);
    ctx.drawImage(rightSide, WIDTH - rightSide.width/2, 0, 45, HEIGHT);
    // Debugging
    console.log(cameraHeight);
    console.log(platforms);
}