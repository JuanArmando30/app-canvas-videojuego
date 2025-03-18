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
        ctx.fillStyle = "orange";
        ctx.fill();
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
    }
}

class BowserBreath {
    
    constructor(x, y, side) {
        this.image = new Image();
        this.image.src = "./recursos/aliento.png"; // Asegúrate de la ruta correcta
        this.x = x;
        this.y = y;
        this.width = 130;
        this.height = 130;
        this.side = side;
        this.speed = 1;
        this.loaded = false; // Bandera para saber si la imagen está cargada

        this.image.onload = () => {
            this.loaded = true; // La imagen está lista para usarse
        };
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
        if (this.loaded) {
            ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }
}

class BowserAlert {
    constructor(x, y) {
        this.image = new Image();
        this.image.src = "./recursos/alerta.png"; // Nueva imagen para la alerta
        this.x = x;
        this.y = y;
        this.width = 100; // Ajusta el tamaño según la imagen
        this.height = 100;
        this.loaded = false;

        this.image.onload = () => {
            this.loaded = true;
        };
    }

    draw() {
        if (this.loaded) {
            ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }
}

let fireballs = [];
let bowserBreaths = [];
let bowserAlerts = [];

function spawnFireball() {
    let x, y, speedX, speedY;
    let side = Math.floor(Math.random() * 4);

    // Velocidad escala con el nivel (mínimo 0.2, aumentando con el nivel)
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
    let margin = 50; // Margen de seguridad
    
    switch (side) {
        case 0: // arriba
            x = (Math.floor(Math.random() * ((canvas.width - 20) - 100 + 1)) + 80);
            y = margin;
            break;
        case 1: // abajo
            x = (Math.floor(Math.random() * ((canvas.width - 20) - 100 + 1)) + 80);
            y = canvas.height - margin;
            break;
        case 2: // izquierda
            x = margin;
            y = (Math.floor(Math.random() * ((canvas.height - 20) - 100 + 1)) + 80);
            break;
        case 3: // derecha
            x = canvas.width - margin;
            y = (Math.floor(Math.random() * ((canvas.height - 20) - 100 + 1)) + 80);
            break;
    }
    
    let alert = new BowserAlert(x, y);
    bowserAlerts.push(alert);
    
    setTimeout(() => {
        // Eliminar la alerta antes de comenzar los alientos de fuego
        bowserAlerts = bowserAlerts.filter(a => a !== alert);

        let interval = setInterval(() => {
            showBowserBreath(side, x, y);
        }, 125);

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
let playerSpeed = 1;
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
const hearts = document.querySelectorAll(".life-heart");

let invulnerable = false; // Nueva variable

function checkCollision(obj) {
    if (obj instanceof BowserBreath) {
        // Detección de colisión rectangular (AABB)
        return (
            player.x + player.width / 2 > obj.x - obj.width / 2 &&
            player.x - player.width / 2 < obj.x + obj.width / 2 &&
            player.y + player.height / 2 > obj.y - obj.height / 2 &&
            player.y - player.height / 2 < obj.y + obj.height / 2
        );
    } else {
        // Detección de colisión circular (para bolas de fuego)
        let dx = player.x - obj.x;
        let dy = player.y - obj.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let collisionDistance = (player.width / 2) + obj.radius;
        return distance < collisionDistance;
    }
}

// Función para detener el sonido de inicio
function stopSound() {
    startSound.pause();
    startSound.currentTime = 0;  // Vuelve al principio
}

let gameOverSound = new Audio("./recursos/game-over.mp3");
// Cargar el sonido para cuando el jugador pierda una vida
const lifeLostSound = new Audio("./recursos/choca.mp3");  // Asegúrate de tener este archivo de sonido

function loseLife() {
    if (invulnerable) return; // No perder vida si es invulnerable
    
    lives--;
    invulnerable = true; // Activar invulnerabilidad temporal

    // Reproducir el sonido de vida perdida
    lifeLostSound.play();

    if (lives > 0) {
        console.log(`Vida perdida. Vidas restantes: ${lives}`);
        hearts[lives].style.display = "none"; // Esconde un corazón
    } else {
        console.log("¡Juego terminado!");
        gameOver = true; // Detiene el juego

        // Detiene la actualización del tiempo y nivel
        clearInterval(scoreInterval);
        clearInterval(levelInterval);

        hearts[lives].style.display = "none"; // Esconde un corazón

        // Detener el sonido de inicio y reproducir sonido de Game Over
        stopSound();  // Detener el sonido de inicio
        gameOverSound.play();  // Reproducir sonido de Game Over

        setTimeout(() => {
            document.getElementById("game-over-screen").style.display = "flex"; // Muestra el Game Over
        }, 25); // Espera 0.025 segundos antes de recargar
    }

    // Desactivar invulnerabilidad después de .5 segundos
    setTimeout(() => {
        invulnerable = false;
    }, 500);
}

// Evento para reiniciar el juego
document.getElementById("restart-btn").addEventListener("click", () => {
    location.reload(); // Recarga la página para reiniciar el juego
});

let gameOver = false; // Controla si el juego ha terminado
const background = new Image();
background.src = "./recursos/fondo.png";

background.onload = () => {
    updateGame(); // Iniciar el juego solo cuando la imagen esté lista
};

function updateGame() {

    if (gameOver) return; // Si el juego ha terminado, no sigue actualizando

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar la imagen de fondo antes de todo
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
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

// Crear un objeto de audio
const startSound = new Audio("./recursos/inicio.mp3");

document.getElementById("start-btn").addEventListener("click", () => {
    
    startSound.play(); // Reproducir sonido al iniciar el juego

    score = 0;
    level = 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    
    scoreInterval = setInterval(() => scoreElement.textContent = ++score, 1000);

    levelInterval = setInterval(() => {
        level++;
        levelElement.textContent = level;

        let spawnRate = Math.max(300, 1000 - level * 50);
        let fireballCount = Math.min(10, 3 + Math.floor(level / 2));

        clearInterval(fireballInterval);
        fireballInterval = setInterval(() => {
            for (let i = 0; i < fireballCount; i++) {
                spawnFireball();
            }
        }, spawnRate);
    }, 25000);

    setInterval(showBowserAlert, 8500);

    // Generar las primeras bolas de fuego
    fireballInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            spawnFireball();
        }
    }, 1000);

    updateGame();
});

document.getElementById("instructions-btn").addEventListener("click", () => {
    document.getElementById("instructions-screen").style.display = "flex";
});

document.getElementById("close-instructions-btn").addEventListener("click", () => {
    document.getElementById("instructions-screen").style.display = "none";
});