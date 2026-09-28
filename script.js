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

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        if (battery < 0) battery = 0;
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = "black";
        ctx.fillRect(this.x - 10, this.y + 5, 10, 5);
        ctx.fillRect(this.x + this.width, this.y + 5, 10, 5);

        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Obstacle {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw() {
        if (this.type === "tree") {
            ctx.fillStyle = "brown";
            ctx.fillRect(this.x + 15, this.y + 15, 10, 25);
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(this.x + 20, this.y + 15, 20, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === "pothole") {
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === "river") {
            ctx.fillStyle = "#1565c0";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

const obstacles = [
    new Obstacle(300, 120, 50, 50, "tree"),
    new Obstacle(500, 300, 60, 30, "pothole"),
    new Obstacle(600, 80, 100, 70, "river")
];

function checkCollision(drone, obstacle) {
    return drone.x < obstacle.x + obstacle.width &&
           drone.x + drone.width > obstacle.x &&
           drone.y < obstacle.y + obstacle.height &&
           drone.y + drone.height > obstacle.y;
}

function handleCollisions() {
    obstacles.forEach(function(obstacle) {
        if (checkCollision(drone, obstacle)) {
            battery -= 0.5;
            score -= 1;

            if (drone.angle === 0) drone.x -= 5;
            if (drone.angle === Math.PI) drone.x += 5;
            if (drone.angle === -Math.PI / 2) drone.y += 5;
            if (drone.angle === Math.PI / 2) drone.y -= 5;
        }
    });

    if (battery < 0) battery = 0;
}

document.addEventListener("keydown", function(event) {
    keys[event.key] = true;
});

document.addEventListener("keyup", function(event) {
    keys[event.key]
