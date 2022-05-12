var WIDTH = 800;
var HEIGHT = 800;
var ctx;
var canvas;
var leftSide = new Image();
leftSide.src = "./assets/leftSide.png";
var rightSide = new Image();
rightSide.src = "./assets/rightSide.png";
var log = new Image();
log.src = "./assets/log.png";
var scrollSpeed = 10;
var cameraHeight = 800;
var platformHeight = 100;
var numPlatforms = 100;
var platforms;
var player;
var keysPressed = {
    left: false,
    right: false,
    z: false,
    x: false
};
var Platform = /** @class */ (function () {
    function Platform(x, y, width, side) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = platformHeight;
        this.side = side;
    }
    Platform.prototype.draw = function (ctx) {
        if (this.side == "left") {
            ctx.fillStyle = "red";
            ctx.fillRect(0, cameraHeight - this.y, this.width, this.height); // drawing the platforms
        }
        else if (this.side == "right") {
            ctx.fillStyle = "blue";
            ctx.fillRect(WIDTH - this.width, cameraHeight - this.y, this.width, this.height);
        }
    };
    return Platform;
}());
var Player = /** @class */ (function () {
    function Player(x, y, width, height, image) {
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
    Player.prototype.draw = function (ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    };
    Player.prototype.jump = function () {
        if (keysPressed.z) {
            console.log("jumping");
            for (var jump = this.jumpHeight; jump <= 0; jump--) {
                this.y -= jump; // still needs gravity;
            }
        }
    };
    Player.prototype.dash = function () {
        if (keysPressed.x) {
            console.log("dashing");
            this.dashing = true;
            var currentY = this.y;
            for (var dash = this.dashLength; dash >= 0; dash / 2) {
                this.y = currentY;
                if (this.facing == "left") {
                    this.x -= dash;
                }
                if (this.facing == "right") {
                    this.x += dash;
                }
            }
            this.dashing = false;
        }
    };
    Player.prototype.move = function () {
        if (!this.dashing) {
            if (keysPressed.left) {
                this.facing = "left";
                this.x -= this.speed;
            }
            else if (keysPressed.right) {
                this.facing = "right";
                this.x += this.speed;
            }
        }
    };
    return Player;
}());
window.onload = function () {
    platforms = [];
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");
    // Creates the platforms
    for (var i = 0; i < numPlatforms; i++) {
        platforms[platforms.length] = new Platform(Math.floor(Math.random() * WIDTH), i * 500, Math.floor(Math.random() * 1000), (Math.random() <= 0.5) ? "left" : "right"); // testing platform + cool camera
    }
    player = new Player(WIDTH / 2, HEIGHT - 50, 100, 100, log);
    // Creates the game loop
    setInterval(update, 16.66); // 60 fps
    document.addEventListener("keydown", function (event) {
        if (event.key == "ArrowLeft") {
            keysPressed.left = true;
        }
        else if (event.key == "ArrowRight") {
            keysPressed.right = true;
        }
        else if (event.key == "z") {
            keysPressed.z = true;
        }
        else if (event.key == "x" || event.key == "c") {
            keysPressed.x = true;
        }
    });
    document.addEventListener("keyup", function (event) {
        if (event.key == "ArrowLeft") {
            keysPressed.left = false;
        }
        else if (event.key == "ArrowRight") {
            keysPressed.right = false;
        }
        else if (event.key == "z") {
            keysPressed.z = false;
        }
        else if (event.key == "x" || event.key == "c") {
            keysPressed.x = false;
        }
    });
};
function update() {
    // Clears the canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Increases camera height
    cameraHeight += scrollSpeed;
    // Draws the platforms
    for (var i = 0; i < platforms.length; i++) {
        platforms[i].draw(ctx);
    }
    // Draws the player
    player.draw(ctx);
    // Moves the player
    player.move();
    player.jump();
    player.dash();
    // Draws the side images
    ctx.drawImage(leftSide, 45, 0, 45, HEIGHT);
    ctx.drawImage(rightSide, WIDTH - rightSide.width / 2, 0, 45, HEIGHT);
    // Debugging
    console.log(cameraHeight);
    console.log(platforms);
}
