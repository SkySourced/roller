const WIDTH = 800;
const HEIGHT = 800;

let ctx: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;

const LEFTSIDE = new Image();
LEFTSIDE.src = "./assets/leftSide.png";
const RIGHTSIDE = new Image();
RIGHTSIDE.src = "./assets/rightSide.png";
const LOG = new Image();
LOG.src = "./assets/log.png";

let scrollSpeed = 10;
let cameraHeight = 800;
let platformHeight = 100;
let numPlatforms = 100;
let platforms: Platform[];
let player: Player;

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
    constructor(x: number, y: number, width: number, height: number, image: HTMLImageElement){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.moveSpeed = 10;
        this.jumpHeight = 10;
        this.dashLength = 100;
        this.facing = "right";
        this.dashing = false;
        this.ySpeed = 0;
        this.onGround = false;
    }
    draw(ctx: CanvasRenderingContext2D){
        ctx.drawImage(this.image, this.x, this.y - cameraHeight, this.width, this.height);
    }
    jump(){
        if(keysPressed.z){
            console.log("jumping");
            this.ySpeed = -10;
            this.onGround = false;
        }
    }
    dash(){
        if(keysPressed.x){
            console.log("dashing");
            this.dashing = true;
            let currentY = this.y;
            for(let i = 0; i >= this.dashLength; i++){
                this.y = currentY;
                if(this.facing == "left"){
                    this.x--;
                }
                if(this.facing == "right"){
                    this.x++;
                }
            }
            this.dashing = false;
        }
    }
    move(){
        if(!this.dashing){
            this.y -= this.ySpeed;
            if(keysPressed.left){
                this.facing = "left";
                this.x -= this.moveSpeed;
                for(let i = 0; i < platforms.length; i++){
                    if(this.x < platforms[i].x + platforms[i].width && this.x + this.width > platforms[i].x && this.y + this.height > platforms[i].y && this.y < platforms[i].y + platforms[i].height){
                        this.x += this.moveSpeed;
                    }
                }
            } else if (keysPressed.right){
                this.facing = "right";
                this.x += this.moveSpeed;
                for(let i = 0; i < platforms.length; i++){
                    if(this.x < platforms[i].x + platforms[i].width && this.x + this.width > platforms[i].x && this.y + this.height > platforms[i].y && this.y < platforms[i].y + platforms[i].height){
                        this.x -= this.moveSpeed;
                    }
                }
            }
        }
        if(this.x < 45){
            this.x = 45;
        }
        if(this.x > WIDTH - this.width - 45){
            this.x = WIDTH - this.width - 45;
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
    // Creates the player
    player = new Player(WIDTH/2, HEIGHT-50, 100, 100, LOG);
    // Creates the game loop
    setInterval(update, 16.66); // 60 fps
    document.addEventListener("keydown", function(event){
        if(event.key == "ArrowLeft"){
            keysPressed.left = true;
        } else if (event.key == "ArrowRight"){
            keysPressed.right = true;
        } else if (event.key == "z"){
            keysPressed.z = true;
        } else if (event.key == "x" || event.key == "c"){
            keysPressed.x = true;
        }
    })
    document.addEventListener("keyup", function(event){
        if(event.key == "ArrowLeft"){
            keysPressed.left = false;
        } else if (event.key == "ArrowRight"){
            keysPressed.right = false;
        } else if (event.key == "z"){
            keysPressed.z = false;
        } else if (event.key == "x" || event.key == "c"){
            keysPressed.x = false;
        }
    })
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
    // Gravity
    for(let i = 0; i < platforms.length; i++){
        if(player.y + player.height > platforms[i].y && player.y + player.height < platforms[i].y + platforms[i].height){ // y collision
            player.onGround = true;
        } else {
            //player.ySpeed += .1;
        }
    }
    // Draws the player
    player.draw(ctx);
    // Moves the player
    player.move();
    player.jump();
    player.dash();
    // Draws the side images
    ctx.drawImage(LEFTSIDE, 0, 0, 45, HEIGHT);
    ctx.drawImage(RIGHTSIDE, WIDTH - RIGHTSIDE.width, 0, 45, HEIGHT);
    platforms.forEach(element => {
        if(player.x + player.width > element.x && player.x < element.x + element.width && player.y + player.height > element.y && player.y < element.y + element.height){
            console.log("collision with " + element);
        }
    });
    // Debugging
    //console.log(cameraHeight);
    //console.log(platforms);
}