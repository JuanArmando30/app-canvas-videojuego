const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");

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

class BowserBreath {
    constructor(x, y, side, radius = 50, color = "orange") {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.side = side;
        this.speed = 1;
        this.color = color;
    }

    update() {
        switch (this.side) {
            case 0:
                this.y += this.speed;
                if (this.y > canvas.height) return false;
                break;
            case 1:
                this.y -= this.speed;
                if (this.y < 0) return false;
                break;
            case 2:
                this.x += this.speed;
                if (this.x > (canvas.width)) return false;
                break;
            case 3:
                this.x -= this.speed;
                if (this.x < 0) return false;
                break;
        }
        return true;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

let fireballs = [];
let bowserBreaths = [];
let bowserAlerts = [];

function spawnFireball() {
    let x, y, speedX, speedY;
    let side = Math.floor(Math.random() * 4);
    let baseSpeed = (Math.random() * 0.5 + 0.2) * (1 + level * 0.1);
    
    switch (side) {
        case 0:
            x = Math.random() * canvas.width;
            y = 0;
            speedX = (Math.random() - 0.5) * baseSpeed;
            speedY = baseSpeed;
            break;
        case 1:
            x = Math.random() * canvas.width;
            y = canvas.height;
            speedX = (Math.random() - 0.5) * baseSpeed;
            speedY = -baseSpeed;
            break;
        case 2:
            x = 0;
            y = Math.random() * canvas.height;
            speedX = baseSpeed;
            speedY = (Math.random() - 0.5) * baseSpeed;
            break;
        case 3:
            x = canvas.width;
            y = Math.random() * canvas.height;
            speedX = -baseSpeed;
            speedY = (Math.random() - 0.5) * baseSpeed;
            break;
    }
    
    fireballs.push(new Fireball(x, y, speedX, speedY));
}

function showBowserBreath(side, x, y) {
    bowserBreaths.push(new BowserBreath(x, y, side));
}

function showBowserAlert() {
    let side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
        case 0: // arriba
            x = (Math.floor(Math.random() * ((canvas.width - 20) - 100 + 1)) + 80);
            y = 0;
            break;
        case 1: // abajo
            x = (Math.floor(Math.random() * ((canvas.width - 20) - 100 + 1)) + 80);
            y = canvas.height;
            break;
        case 2: // izquierda
            x = 0;
            y = (Math.floor(Math.random() * ((canvas.height - 20) - 100 + 1)) + 80);
            break;
        case 3: // derecha
            x = canvas.width;
            y = (Math.floor(Math.random() * ((canvas.height - 20) - 100 + 1)) + 80);
            break;
    }
    
    let alert = new BowserBreath(x, y, side, 50, "yellow");
    bowserAlerts.push(alert);
    
    setTimeout(() => {
        // Eliminar la alerta antes de comenzar los alientos de fuego
        bowserAlerts = bowserAlerts.filter(a => a !== alert);

        let interval = setInterval(() => {
            showBowserBreath(side, x, y);
        }, 700);

        // Opcionalmente, detener los alientos después de un tiempo
        setTimeout(() => {
            clearInterval(interval);
        }, 10000);
    }, 2000); // La alerta dura 2 segundos antes de que empiecen los alientos
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireballs.forEach((fireball) => {
        fireball.update();
        fireball.draw();
    });
    bowserBreaths = bowserBreaths.filter((breath) => breath.update());
    bowserBreaths.forEach((breath) => breath.draw());
    bowserAlerts.forEach((alert) => alert.draw());
    requestAnimationFrame(updateGame);
}

document.getElementById("start-btn").addEventListener("click", () => {
    score = 0;
    level = 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    scoreInterval = setInterval(() => scoreElement.textContent = ++score, 1000);
    levelInterval = setInterval(() => levelElement.textContent = ++level, 15000);
    setInterval(showBowserAlert, 7000);
    
    setTimeout(() => {
        for (let i = 0; i < 15; i++) {
            spawnFireball();
        }
        setInterval(spawnFireball, 500);
    }, 3000);
    
    updateGame();
});