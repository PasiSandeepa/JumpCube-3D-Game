import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

let scene, camera, renderer;
let player, obstacles = [];
let isJumping = false;
let jumpVelocity = 0;
let score = 0;
let gameOver = false;
let scoreInterval;
let hasShownWinMessage = false;
let gamePaused = false;


init();
animate();

function init() {
  scene = new THREE.Scene();    
  scene.background = new THREE.Color(0x111111);

   const startSound = new Audio('resources/Sound.mp3');
  startSound.play();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  // Player
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  player = new THREE.Mesh(geometry, material);
  player.position.y = 0.5;
  scene.add(player);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(50, 0.1, 200),
    new THREE.MeshStandardMaterial({ color: 0x222222 })

    
  );
  
  floor.position.y = -0.05;
  scene.add(floor);

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown);

  setInterval(spawnObstacle, 2000);

  document.addEventListener('keydown', () => {
    const startSound = new Audio('sounds/start.mp3');
    startSound.play();
  }, { once: true });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
//Game eka control /////////
function onKeyDown(e) {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !isJumping) {
    isJumping = true;
    jumpVelocity = 0.2;
  }
 if (e.code === 'Enter') {
    gamePaused = !gamePaused;

    if (!gamePaused) {
      animate(); 
    }
  }

}

function spawnObstacle() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const obs = new THREE.Mesh(geometry, material);
  obs.position.set(0, 0.5, player.position.z - 50);
  obs.passed = false;  
  scene.add(obs);
  obstacles.push(obs);
}


function animate() {
 if (gameOver || gamePaused) return;

  requestAnimationFrame(animate);


  player.position.z -= 0.1;

  // Jump
  if (isJumping) {
    player.position.y += jumpVelocity;
    jumpVelocity -= 0.01;
    if (player.position.y <= 0.5) {
      player.position.y = 0.5;
      isJumping = false;
    }
  }

  // Move obstacles and check collision & scoring
  for (let obs of obstacles) {
    obs.position.z += 0.1;

    // Collision detection
    if (obs.position.distanceTo(player.position) < 1 && player.position.y <= 1) {
      showGameOver(score);
    }

    // Scoring logic
    if (!obs.passed && obs.position.z > player.position.z + 1) {
      obs.passed = true;
      score++;
   document.getElementById('score').innerText = `Score: ${score}`;

 if (score >= 10 && !hasShownWinMessage) {
    hasShownWinMessage = true;  //use 1 only
    showWin(score);
    }

    }
  }

  camera.position.z = player.position.z + 10;
  renderer.render(scene, camera);

  
}function showGameOver(score) {
  gameOver = true;
  clearInterval(scoreInterval);

  // Play game over sound
  const gameOverSound = new Audio('resources/Error.mp3');
  gameOverSound.play();



  // Update both visible score and modal score
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('finalScore').innerText = `Score: ${score}`;
  document.getElementById("gameOverModal").style.display = "flex";

  }


  function showWin(score) {
  
  clearInterval(scoreInterval); 

 
  const winSound = new Audio('resources/win.mp3');
  winSound.play();

     const winModal = document.getElementById('winModal');
  document.getElementById('finalScore').innerText = `Score: ${score}`;
  winModal.style.display = 'flex';

  // 3 seconds පසු auto-hide වෙන්න
  setTimeout(() => {
    winModal.style.display = 'none';
  }, 1000); // 3000ms = 3 seconds
}


window.restartGame = function() {
  window.location.reload();
}
const aiInput = document.getElementById('aiInput');
const askAIButton = document.getElementById('askAIButton');
const aiResponseDiv = document.getElementById('aiResponse');

async function askGemini(prompt) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': 'YOUR_REAL_API_KEY' 
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

askAIButton.addEventListener('click', async () => {
  const question = aiInput.value.trim();
  if (!question) {
    aiResponseDiv.innerText = "Please type a question.";
    return;
  }
const q = question.toLowerCase();
//ask questio//////////////////////////////////////////

if (q === 'hi' || q === 'hello') {
  aiResponseDiv.innerText = "Hi! How are you?";
  return;
}

if (q === 'how are you' || q === "how's it going") {
  aiResponseDiv.innerText = "I'm just a virtual assistant, but I'm doing great! 😊";
  return;
}
if (q === 'what is game' || q.includes('what is the game')) {
  aiResponseDiv.innerText = "This is a 3D running and jumping game where you avoid obstacles and increase your score!";
  return;
}


if (
  q === 'which library is used in this game' ||
  q.includes('which library') ||
  q.includes('what library is used')
) {
  aiResponseDiv.innerText = "This game uses the Three.js library to create and render 3D graphics in the browser using WebGL.";
  return;
}

  aiResponseDiv.innerText = "Thinking... 🤖";

  try {
    const prompt = `You are a helpful assistant for a 3D running-jumping game. Player asked: "${question}"`;
    const response = await askGemini(prompt);
    aiResponseDiv.innerText = response;
  } catch (error) {
    aiResponseDiv.innerText = "Sorry, something went wrong.";
    console.error(error);
  }
});


