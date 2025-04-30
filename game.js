const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Constants
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_INTERVAL = 90;
const PIPE_HEIGHT = 320; // Approx pipe height

// Game State
let bird = {
  x: 80,
  y: 200,
  width: 40, // Bird width
  height: 30, // Bird height
  velocity: 0
};

let pipes = [];
let frameCount = 0;
let score = 0;
let gameOver = false;

// Load images using Promise.all for better handling
const images = {
  bird: new Image(),
  bg: new Image(),
  pipe: new Image()
};

// Set image sources
images.bird.src = "assets/bird.png";
images.bg.src = "assets/bg.png";
images.pipe.src = "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/refs/heads/master/sprites/pipe-green.png";

// Wait until all images are loaded before starting the game
Promise.all([
  new Promise(resolve => images.bird.onload = resolve),
  new Promise(resolve => images.bg.onload = resolve),
  new Promise(resolve => images.pipe.onload = resolve)
]).then(gameLoop); // Start the game loop once all images are loaded

// Reset game
function resetGame() {
  bird.y = 200;
  bird.velocity = 0;
  pipes = [];
  frameCount = 0;
  score = 0;
  gameOver = false;
}

// Draw functions
function drawBackground() {
  ctx.drawImage(images.bg, 0, 0, canvas.width, canvas.height);
}

function drawBird() {
  ctx.drawImage(images.bird, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  pipes.forEach(pipe => {
    // Top pipe (flipped vertically)
    ctx.save();
    ctx.translate(pipe.x + PIPE_WIDTH / 2, pipe.top); // Move to the top of the pipe
    ctx.scale(1, -1); // Flip vertically
    ctx.drawImage(images.pipe, -PIPE_WIDTH / 2, 0, PIPE_WIDTH, pipe.top);
    ctx.restore();

    // Bottom pipe
    ctx.drawImage(images.pipe, pipe.x, canvas.height - pipe.bottom, PIPE_WIDTH, pipe.bottom);
  });
}

function drawScore() {
  ctx.fillStyle = "yellow";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.font = "700 30px 'Comic Sans MS'";

  // Draw score text with outline
  ctx.strokeText("Score: " + score, canvas.width - 150, 60);
  ctx.fillText("Score: " + score, canvas.width - 150, 60);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "700 36px 'Comic Sans MS'";
  ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2 - 20);

  ctx.font = "700 24px 'Comic Sans MS'";
  ctx.fillText("Click or Press Any Key to Restart", canvas.width / 2 - 160, canvas.height / 2 + 20);

  ctx.font = "700 28px 'Comic Sans MS'";
  ctx.fillText("Final Score: " + score, canvas.width / 2 - 90, canvas.height / 2 + 60);
}

// Pipe logic
function createPipe() {
  const topHeight = Math.random() * (canvas.height - PIPE_GAP - 100) + 20;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - topHeight - PIPE_GAP
  });
}

function updatePipes() {
  pipes.forEach((pipe, index) => {
    pipe.x -= 2;

    if (!pipe.scored && pipe.x + PIPE_WIDTH < bird.x) {
      score++;
      pipe.scored = true;
    }

    if (pipe.x + PIPE_WIDTH < 0) {
      pipes.splice(index, 1);
    }
  });
}

// Collision detection
function checkCollision() {
  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    return true;
  }

  return pipes.some(pipe => {
    return bird.x < pipe.x + PIPE_WIDTH &&
           bird.x + bird.width > pipe.x &&
           (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom);
  });
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  if (!gameOver) {
    frameCount++;
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    if (frameCount % PIPE_INTERVAL === 0) {
      createPipe();
    }

    updatePipes();

    if (checkCollision()) {
      gameOver = true;
    }
  }

  drawPipes();
  drawBird();
  drawScore();

  if (gameOver) {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

// Input handling
function flap() {
  if (gameOver) {
    resetGame();
  } else {
    bird.velocity = FLAP_STRENGTH;
  }
}

document.addEventListener("keydown", flap);
document.addEventListener("mousedown", flap);
