const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let drone = {
  x: 100,
  y: 200,
  width: 40,
  height: 25,
  speed: 5
};

function drawDrone() {
  ctx.fillStyle = "white";
  ctx.fillRect(drone.x, drone.y, drone.width, drone.height);

  ctx.fillStyle ="black";
  ctx.fillRect(drone.x - 10, drone.y + 5, 10, 5);
  ctx.fillRect(drone.x + drone.width, drone.y + 5, 10, 5);
}

document.addEventListener("keydown", function(event) {
  
  if (event.key === "ArrowUp") {
    drone.y -= drone.speed;
  }
  
  if (event.key === "ArrowDown") {
    drone.y += drone.speed;
  }

  if (event.key === "ArrowLeft") {
    drone.x -= drone.speed;
  }

  if (event.key === "ArrowRight") {
    drone.x += drone.speed;
  }
});

function droneLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawDrone();
  requestAnimationFrame(droneLoop);
}

droneLoop();
