const WIDTH = 800;
const HEIGHT = 800;

let ctx: CanvasRenderingContext2D;

let scrollSpeed = 10;
let cameraHeight = 800;
let platformHeight = 100;
let numPlatforms = 100;
let platforms: Platform[];

class Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    side: "left" | "right"
    constructor(x: number, y: number, width: number, side: "left" | "right"){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = platformHeight;
        this.side = side;
    }
    draw(ctx: CanvasRenderingContext2D){
        if(this.side == "left"){
            ctx.fillRect(0, cameraHeight - this.y, this.width, this.height) // drawing the platforms
        } else if (this.side == "right"){
            ctx.fillRect(WIDTH - this.width, cameraHeight - this.y, this.width, this.height);
        }
    }
}

window.onload = function(){
    platforms = [];
    ctx = document.getElementById("mainCanvas").getContext("2d");
    // Creates the platforms
    for(let i = 0; i < numPlatforms; i++){
        platforms[platforms.length] = new Platform(Math.floor(Math.random() * WIDTH), i * 500, Math.floor(Math.random() * 1000), (Math.random() <= 0.5) ? "left" : "right") // testing platform + cool camera
    }
    // Creates the game loop
    setInterval(update, 16); // 60 fps
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
}