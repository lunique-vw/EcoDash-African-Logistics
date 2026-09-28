const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const keys = {};

let battery = 100;
let score = 0;
let distanceTravelled = 0;

class Drone {

    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.width = 40;
        this.height = 25;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = 4;
        this.angle = 0;
    }
  
    move() {

        let moving = false;

        if (keys["ArrowUp"]) {
            this.angle = -Math.PI / 2;
            this.speed += this.acceleration;
            moving = true;
        }

        if (keys["ArrowDown"]) {
            this.angle = Math.PI / 2;
            this.speed += this.acceleration;
            moving = true;
        }

        if (keys["ArrowLeft"]) {
            this.angle = Math.PI;
            this.speed += this.acceleration;
            moving = true;
        }

        if (keys["ArrowRight"]) {
            this.angle = 0;
            this.speed += this.acceleration;
            moving = true;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        if (moving) {
            const velocityX = Math.cos(this.angle) * this.speed;
            const velocityY = Math.sin(this.angle) * this.speed;
            this.x += velocityX;
            this.y += velocityY;
            battery -= 0.03;
            distanceTravelled += this.speed * 0.01;
        } else {
            this.speed *= 0.9;
        }

        if (this.x < 0) {
            this.x = 0;
        }

        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }

        if (this.y < 0) {
            this.y = 0;
        }

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }

        if (battery < 0) {
            battery = 0;
        }
    }
  
    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x,this.y,this.width,this.height);
        ctx.fillStyle = "black";
        ctx.fillRect(this.x - 10,this.y + 5,10,5);
        ctx.fillRect(this.x + this.width,this.y + 5,10,5);
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2,this.y + this.height / 2,4,0,Math.PI * 2);
        ctx.fill();
    }
}

const drone = new Drone(100, 200);

document.addEventListener("keydown", function(event) {
    keys[event.key] = true;
});

document.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});

function updateHUD() {

    document.getElementById("battery").textContent =
        Math.round(battery) + "%";

    document.getElementById("score").textContent =
        score;

    document.getElementById("distance").textContent =
        distanceTravelled.toFixed(1);
}

function gameLoop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drone.move();
    drone.draw();
    updateHUD();
    requestAnimationFrame(gameLoop);
}

gameLoop();
