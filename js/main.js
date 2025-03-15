const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const bowserAlert = document.getElementById("bowser-alert");

let scoreboard = document.getElementById("scoreboard");
let scoreAncho = scoreboard.offsetWidth;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let level = 1;
let scoreInterval;
let levelInterval;

class Fireball {
    constructor(x, y, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speedX = speedX;
        this.speedY = speedY;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.strokeStyle = "orange";
        ctx.stroke();
        ctx.closePath();
    }
}

let fireballs = [];

function spawnFireball() {
    let x, y, speedX, speedY;
    let side = Math.floor(Math.random() * 4);
    let baseSpeed = (Math.random() * 0.5 + 0.2) * (1 + level * 0.1);
    
    switch (side) {
        case 0: // Arriba
            x = Math.random() * canvas.width;
            y = 0;
            speedX = (Math.random() - 0.5) * baseSpeed;
            speedY = baseSpeed;
            break;
        case 1: // Abajo
            x = Math.random() * canvas.width;
            y = canvas.height;
            speedX = (Math.random() - 0.5) * baseSpeed;
            speedY = -baseSpeed;
            break;
        case 2: // Izquierda
            x = 0;
            y = Math.random() * canvas.height;
            speedX = baseSpeed;
            speedY = (Math.random() - 0.5) * baseSpeed;
            break;
        case 3: // Derecha
            x = canvas.width;
            y = Math.random() * canvas.height;
            speedX = -baseSpeed;
            speedY = (Math.random() - 0.5) * baseSpeed;
            break;
    }
    
    fireballs.push(new Fireball(x, y, speedX, speedY));
}

function checkCollisions() {
    for (let i = 0; i < fireballs.length; i++) {
        for (let j = i + 1; j < fireballs.length; j++) {
            let dx = fireballs[i].x - fireballs[j].x;
            let dy = fireballs[i].y - fireballs[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let minDist = fireballs[i].radius + fireballs[j].radius;
            
            if (distance < minDist) {
                let tempSpeedX = fireballs[i].speedX;
                let tempSpeedY = fireballs[i].speedY;
                
                fireballs[i].speedX = fireballs[j].speedX;
                fireballs[i].speedY = fireballs[j].speedY;
                fireballs[j].speedX = tempSpeedX;
                fireballs[j].speedY = tempSpeedY;
            }
        }
    }
}

function updateScore() {
    score++;
    scoreElement.textContent = score;
}

function updateLevel() {
    level++;
    levelElement.textContent = level;
}

function showBowserAlert() {
    let side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
        case 0: // Arriba
            x = canvas.width / 2 - bowserAlert.offsetWidth / 2;
            y = 40;
            break;
        case 1: // Abajo
            x = canvas.width / 2 - bowserAlert.offsetWidth / 2;
            y = canvas.height - 120;
            break;
        case 2: // Izquierda
            x = 20;
            y = canvas.height / 2 - bowserAlert.offsetHeight / 2;
            break;
        case 3: // Derecha
            x = canvas.width - (scoreAncho + 70);
            y = canvas.height / 2 - bowserAlert.offsetHeight / 2;
            break;
    }
    
    bowserAlert.style.left = `${x}px`;
    bowserAlert.style.top = `${y}px`;
    bowserAlert.style.display = "block";
    
    setTimeout(() => {
        bowserAlert.style.display = "none";
    }, 2000);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireballs.forEach((fireball) => {
        fireball.update();
        fireball.draw();
    });
    checkCollisions();
    requestAnimationFrame(updateGame);
}

document.getElementById("start-btn").addEventListener("click", () => {
    score = 0;
    level = 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    scoreInterval = setInterval(updateScore, 1000);
    levelInterval = setInterval(updateLevel, 20000);
    setInterval(showBowserAlert, 7000); // Muestra la alerta cada cierto tiempo
    
    setTimeout(() => {
        for (let i = 0; i < 15; i++) {
            spawnFireball();
        }
        setInterval(spawnFireball, 500);
    }, 3000);
    
    updateGame();
});