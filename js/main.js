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

class Character {
    constructor(imageSrc, x, y) {
        this.image = new Image();
        this.image.src = imageSrc;
        this.x = x;
        this.y = y;
        this.width = 100; // Ajusta según el tamaño de la imagen
        this.height = 60;
    }

    draw() {
        ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}

// Crear el personaje en el centro del canvas
let player = new Character("./recursos/personaje.png", canvas.width / 2, canvas.height / 2);

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
        }, 300);

        // Opcionalmente, detener los alientos después de un tiempo
        setTimeout(() => {
            clearInterval(interval);
        }, 10000);
    }, 2000); // La alerta dura 2 segundos antes de que empiecen los alientos
}

const customCursor = "url('./recursos/mouse.png') 16 16, auto"; // Reemplaza con la ruta de tu imagen

scoreboard.addEventListener("mouseenter", () => {
    scoreboard.style.cursor = customCursor;
});

scoreboard.addEventListener("mouseleave", () => {
    scoreboard.style.cursor = "default";
});

// Velocidad del personaje
let playerSpeed = 5;
let keys = {};

// Detectar teclas presionadas
window.addEventListener("keydown", (event) => {
    keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

// Función para actualizar la posición del personaje
function movePlayer() {
    if (keys["ArrowUp"] && player.y - player.height / 2 > 0) {
        player.y -= playerSpeed;
    }
    if (keys["ArrowDown"] && player.y + player.height / 2 < canvas.height) {
        player.y += playerSpeed;
    }
    if (keys["ArrowLeft"] && player.x - player.width / 2 > 0) {
        player.x -= playerSpeed;
    }
    if (keys["ArrowRight"] && player.x + player.width / 2 < canvas.width) {
        player.x += playerSpeed;
    }
}

let lives = 3;
const livesElement = document.getElementById("lives");
livesElement.textContent = lives;
let invulnerable = false; // Nueva variable

function checkCollision(obj) {
    let dx = player.x - obj.x;
    let dy = player.y - obj.y;
    let distance = Math.sqrt(dx * dx + dy * dy); // Distancia entre el centro del personaje y el objeto

    let collisionDistance = (player.width / 2) + obj.radius; // Suma de radios efectivos
    return distance < collisionDistance; // Solo cuenta como colisión si realmente se tocan
}

function loseLife() {
    if (invulnerable) return; // No perder vida si es invulnerable
    
    lives--;
    livesElement.textContent = lives;
    invulnerable = true; // Activar invulnerabilidad temporal

    if (lives > 0) {
        console.log(`Vida perdida. Vidas restantes: ${lives}`);
    } else {
        console.log("¡Juego terminado!");
        gameOver = true; // Detiene el juego

        // Detiene la actualización del tiempo y nivel
        clearInterval(scoreInterval);
        clearInterval(levelInterval);

        setTimeout(() => {
            document.getElementById("game-over-screen").style.display = "flex"; // Muestra el Game Over
        }, 25); // Espera 0.025 segundos antes de recargar
    }

    // Desactivar invulnerabilidad después de 1 segundo
    setTimeout(() => {
        invulnerable = false;
    }, 2000);
}

// Evento para reiniciar el juego
document.getElementById("restart-btn").addEventListener("click", () => {
    location.reload(); // Recarga la página para reiniciar el juego
});

let gameOver = false; // Controla si el juego ha terminado

function updateGame() {

    if (gameOver) return; // Si el juego ha terminado, no sigue actualizando

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    fireballs.forEach((fireball) => {
        fireball.update();
        fireball.draw();
        
        if (checkCollision(fireball)) {
            loseLife();
            fireballs = fireballs.filter(f => f !== fireball); // Eliminar la bola de fuego que impactó
        }
    });

    bowserBreaths = bowserBreaths.filter((breath) => breath.update());
    bowserBreaths.forEach((breath) => {
        breath.update();
        breath.draw();
        
        if (checkCollision(breath)) {
            loseLife();
            bowserBreaths = bowserBreaths.filter(b => b !== breath); // Eliminar el aliento de Bowser impactado
        }
    });

    bowserAlerts.forEach((alert) => alert.draw());

    movePlayer(); // Actualiza la posición del personaje
    // Dibuja al personaje
    player.draw();
    
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