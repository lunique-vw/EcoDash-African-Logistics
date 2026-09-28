const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
const keys={};
let battery=100;
let score=0;
let distanceTravelled=0;
let rainDrops=[];
let raining=true;
let gameStarted=false;
let gamePaused=false;
let gameOver=false;
let delivered=false;
let highScore=Number(localStorage.getItem("ecoDashHighScore"))||0;

for(let i=0;i<60;i++){
    rainDrops.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,speed:3+Math.random()*4});
}

class Drone{
    constructor(x,y){
        this.x=x;this.y=y;this.width=40;this.height=25;
        this.speed=0;this.acceleration=0.2;this.maxSpeed=4;this.angle=0;
    }
    move(){
        let moving=false;
        if(keys["ArrowUp"]){this.angle=-Math.PI/2;this.speed+=this.acceleration;moving=true;}
        if(keys["ArrowDown"]){this.angle=Math.PI/2;this.speed+=this.acceleration;moving=true;}
        if(keys["ArrowLeft"]){this.angle=Math.PI;this.speed+=this.acceleration;moving=true;}
        if(keys["ArrowRight"]){this.angle=0;this.speed+=this.acceleration;moving=true;}
        if(this.speed>this.maxSpeed)this.speed=this.maxSpeed;
        if(moving){
            const velocityX=Math.cos(this.angle)*this.speed;
            const velocityY=Math.sin(this.angle)*this.speed;
            this.x+=velocityX;this.y+=velocityY;
            battery-=0.03;
            distanceTravelled+=this.speed*0.01;
        }else this.speed*=0.9;
        if(this.x<0)this.x=0;
        if(this.x+this.width>canvas.width)this.x=canvas.width-this.width;
        if(this.y<0)this.y=0;
        if(this.y+this.height>canvas.height)this.y=canvas.height-this.height;
        if(battery<0)battery=0;
    }
    draw(){
        ctx.fillStyle="white";
        ctx.fillRect(this.x,this.y,this.width,this.height);
        ctx.fillStyle="black";
        ctx.fillRect(this.x-10,this.y+5,10,5);
        ctx.fillRect(this.x+this.width,this.y+5,10,5);
        ctx.fillStyle="green";
        ctx.beginPath();
        ctx.arc(this.x+this.width/2,this.y+this.height/2,4,0,Math.PI*2);
        ctx.fill();
    }
}

class Obstacle{
    constructor(x,y,width,height,type){
        this.x=x;this.y=y;this.width=width;this.height=height;this.type=type;
    }
    draw(){
        if(this.type==="tree"){
            ctx.fillStyle="brown";
            ctx.fillRect(this.x+15,this.y+15,10,25);
            ctx.fillStyle="green";
            ctx.beginPath();
            ctx.arc(this.x+20,this.y+15,20,0,Math.PI*2);
            ctx.fill();
        }
        if(this.type==="pothole"){
            ctx.fillStyle="black";
            ctx.beginPath();
            ctx.ellipse(this.x+this.width/2,this.y+this.height/2,this.width/2,this.height/2,0,0,Math.PI*2);
            ctx.fill();
        }
        if(this.type==="river"){
            ctx.fillStyle="#1565c0";
            ctx.fillRect(this.x,this.y,this.width,this.height);
        }
    }
}

const obstacles=[
    new Obstacle(300,120,50,50,"tree"),
    new Obstacle(500,300,60,30,"pothole"),
    new Obstacle(600,80,100,70,"river")
];

function checkCollision(drone,obstacle){
    return drone.x<obstacle.x+obstacle.width&&drone.x+drone.width>obstacle.x&&drone.y<obstacle.y+obstacle.height&&drone.y+drone.height>obstacle.y;
}

function handleCollisions(){
    obstacles.forEach(function(obstacle){
        if(checkCollision(drone,obstacle)){
            battery-=0.5;
            score-=1;
            if(drone.angle===0)drone.x-=5;
            if(drone.angle===Math.PI)drone.x+=5;
            if(drone.angle===-Math.PI/2)drone.y+=5;
            if(drone.angle===Math.PI/2)drone.y-=5;
        }
    });
    if(battery<0)battery=0;
}

function drawEnvironment(){
    ctx.fillStyle="#8bc34a";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#c8a165";
    ctx.fillRect(0,220,canvas.width,80);
    ctx.fillStyle="#795548";
    ctx.fillRect(680,350,80,60);
    ctx.fillStyle="#d7ccc8";
    ctx.beginPath();
    ctx.moveTo(670,350);ctx.lineTo(720,300);ctx.lineTo(770,350);
    ctx.closePath();ctx.fill();
    ctx.fillStyle="#4caf50";
    ctx.beginPath();
    ctx.arc(100,100,30,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#795548";
    ctx.fillRect(90,100,20,45);
    ctx.fillStyle="#ffd54f";
    ctx.fillRect(40,350,70,40);
    ctx.fillStyle="#333";
    ctx.fillRect(50,360,50,20);
    ctx.fillStyle="black";
    ctx.font="14px Arial";
    ctx.fillText("SOLAR STATION",35,410);
    ctx.fillText("VILLAGE",690,430);
}

function drawRain(){
    if(!raining)return;
    ctx.strokeStyle="rgba(255,255,255,0.7)";
    ctx.lineWidth=1;
    rainDrops.forEach(function(drop){
        ctx.beginPath();
        ctx.moveTo(drop.x,drop.y);
        ctx.lineTo(drop.x,drop.y+10);
        ctx.stroke();
        drop.y+=drop.speed;
        if(drop.y>canvas.height){
            drop.y=-10;
            drop.x=Math.random()*canvas.width;
        }
    });
}

function updateHUD(){
    document.getElementById("battery").textContent=Math.round(battery)+"%";
    document.getElementById("score").textContent=score;
    document.getElementById("distance").textContent=distanceTravelled.toFixed(1);
}

function startGame(){
    if(gameOver)restartGame();
    gameStarted=true;
    gamePaused=false;
}

function pauseGame(){
    if(gameStarted&&!gameOver)gamePaused=!gamePaused;
}

function restartGame(){
    battery=100;
    score=0;
    distanceTravelled=0;
    drone.x=100;
    drone.y=200;
    drone.speed=0;
    gameStarted=true;
    gamePaused=false;
    gameOver=false;
    delivered=false;
}

function saveScore(){
    if(score>highScore){
        highScore=score;
        localStorage.setItem("ecoDashHighScore",highScore);
    }
}

function drawGameState(){
    if(!gameStarted){
        ctx.fillStyle="rgba(0,0,0,0.6)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="white";
        ctx.font="30px Arial";
        ctx.fillText("EcoDash",330,220);
        ctx.font="18px Arial";
        ctx.fillText("Press Start to begin",305,255);
        return;
    }

    if(gamePaused){
        ctx.fillStyle="rgba(0,0,0,0.6)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="white";
        ctx.font="30px Arial";
        ctx.fillText("PAUSED",345,240);
    }

    if(delivered){
        ctx.fillStyle="rgba(0,0,0,0.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="white";
        ctx.font="30px Arial";
        ctx.fillText("DELIVERY COMPLETE",270,220);
        ctx.font="18px Arial";
        ctx.fillText("Score: "+score,350,255);
        ctx.fillText("Press Restart",335,290);
    }
    
    if(gameOver){
        ctx.fillStyle="rgba(0,0,0,0.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="white";
        ctx.font="30px Arial";
        ctx.fillText("GAME OVER",315,210);
        ctx.font="18px Arial";
        ctx.fillText("Score: "+score,350,245);
        ctx.fillText("High Score: "+highScore,330,275);
        ctx.fillText("Press Restart",335,310);
    }
}

document.addEventListener("keydown",function(event){
    keys[event.key]=true;
});

document.addEventListener("keyup",function(event){
    keys[event.key]=false;
});

function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawEnvironment();
    obstacles.forEach(function(obstacle){obstacle.draw();});

    if(gameStarted&&!gamePaused&&!gameOver&&!delivered){
        drone.move();
        handleCollisions();
        checkDelivery();

        if(battery<=0){
            battery=0;
            gameOver=true;
            saveScore();
        }
    }

    drone.draw();
    drawRain();
    updateHUD();
    drawGameState();
    requestAnimationFrame(gameLoop);
}

const drone=new Drone(100,200);

function checkDelivery(){
    if(!delivered&&drone.x<760&&drone.x+drone.width>680&&drone.y<410&&drone.y+drone.height>350){
        delivered=true;
        score+=100;
        saveScore();
    }
}
gameLoop();
