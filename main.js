document.addEventListener("DOMContentLoaded", function(event) {
  console.log('content loaded');
})
//Global variables
var count, gameState, edges, chances;
var bg, hoop, ballGroup, scoreIncreement, ballTracker, gameOver, lifeGroup;
var bgImage, ballImage, hoopImage, scoreImage, gameOverImage;
var catchSound, gameOverSound, homeMusic, gameMusic;
var soundButton, muteButton, reloadButton, playButton, title, titleImage;
var ballCount;

function preload() {
  //loads all images, animation and sound required for the air ball
  gameOverImage = loadAnimation("./assets/images/gameover2.png", "./assets/images/gameover.png", "./assets/images/gameover2.png",
    "./assets/images/gameover.png");

  bgImage = loadImage("./assets/images/bg.png");
  ballImage = loadImage("./assets/images/ball.png");
  hoopImage = loadImage("./assets/images/hoop.png");
  scoreImage = loadImage("./assets/images/score.png");
  titleImage = loadImage("./assets/images/title.png");

  catchSound = loadSound("assets/sounds/catch.mp3");
  homeMusic = loadSound("assets/sounds/home.mp3");
  gameOverSound = loadSound("assets/sounds/gameOver.mp3");
}

function setup() {
  //Creates various buttons for the game
  soundButton = createButtons('./assets/images/sound.png', 'lf-sound');
  soundButton.position(10, 10);
  soundButton.size(38, 38);

  //mobile touch function
  soundButton.touchStarted(function () {
    soundButton.hide();
    muteButton.show();
    toggleHomeMusic();
  });

  //computer mouse event
  soundButton.mousePressed(function () {
    soundButton.hide();
    muteButton.show();
    toggleHomeMusic();
  });

  muteButton = createButtons('./assets/images/mute.png', 'lf-sound');
  muteButton.size(33, 33);
  muteButton.position(15, 15);

  //mobile touch function
  muteButton.touchStarted(function () {
    muteButton.hide();
    soundButton.show();
    toggleHomeMusic();
  });

  //computer mouse events
  muteButton.mousePressed(function () {
    muteButton.hide();
    soundButton.show();
    toggleHomeMusic();
  });
  muteButton.hide();

  reloadButton = createButtons('./assets/images/reload.png', 'lf-reload');
  reloadButton.size(25, 25);
  reloadButton.position(50, 18);

  reloadButton.touchStarted(function () {
    gameState = "start";
  });

  reloadButton.mousePressed(function () {
    gameState = "start";
  });

  playButton = createButtons('./assets/images/playButton.png', 'lf-play-button');
  playButton.position(0, windowHeight / 3);

  playButton.touchStarted(function () {
    gameState = "play";
  });

  playButton.mousePressed(function () {
    gameState = "play";
  });



  //Creates Canvas of device window size
  createCanvas(windowWidth, windowHeight);

  //variables
  count = 0;
  ballGroup = new Group();
  lifeGroup = new Group();
  gameState = "start";
  chances = 3;
  ballCount = 0;

  toggleHomeMusic();

  //background properties
  bg = createSprite(windowWidth / 2, windowHeight / 2);
  bg.addImage(bgImage);
  bg.scale = windowWidth / 250;

  //Gameover object properties
  gameOverImage.frameDelay = 15;
  gameOver = createSprite(windowWidth / 2, windowHeight / 3);
  gameOver.addAnimation("failed", gameOverImage);
  gameOver.scale = 0.8;
  gameOver.visible = false;

  //hoop object properties
  hoop = createSprite(width / 2, height / 1.5);
  hoop.addImage(hoopImage);

  //scoreIncreement object properties
  scoreIncreement = createSprite(200, 300);
  scoreIncreement.addImage(scoreImage);
  scoreIncreement.visible = false;

  //ballTracker object properties
  ballTracker = createSprite(windowWidth / 2, windowHeight / 1.35, windowWidth, 10);
  ballTracker.visible = false;

  //Onboarding screen object
  title = createSprite(windowWidth / 2, windowHeight / 3);
  title.addImage(titleImage);
  title.scale = 2.5;

  createLife();
}

function draw() {
  background(220);
  edges = createEdgeSprites();

  //when the player plays the game
  if (gameState === "start") {
    hoop.visible = false;
    ballCount = 0;
    count = 0;
    title.visible = "true";
    playButton.show();
    gameOver.visible = false;
    ballGroup.destroyEach();
  }
  else if (gameState === "play") {
    title.visible = false;
    hoop.visible = true;
    scoreIncreement.visible = false;
    playButton.hide();
    scoreIncreement.x = hoop.x;
    scoreIncreement.y = hoop.y - 150;
    createBall();

    if (!isTouchDevice()) {
      hoop.x = World.mouseX;
    }
    else {
      document.querySelector('canvas').addEventListener('touchmove', function (e) {
        //Updates the hoop's position to the touch position for touch devices
        hoop.x = e.touches[0].pageX;
      });
    }

    hoop.setVelocity(0, 0);

    if (ballGroup.isTouching(hoop)) {
      ballGroup.setVelocityEach(0, 1);
      hoop.scale = 0.4;
      ballGroup.destroyEach();
      ballGroup.visible = false;
      count = count + 2;
      scoreIncreement.visible = true;
      catchSound.play();
      scoreIncreement.scale = 0.5;
    }
    else {
      hoop.scale = 0.2;
    }

    ballGroup.setScaleEach(0.1);

    if (ballGroup.isTouching(ballTracker)) {
      ballGroup.destroyEach();

      if (chances <= 1) {
        lifeGroup.destroyEach();
        gameState = "end";
        gameOverSound.play();
      }
      else {
        lifeGroup.destroyEach();
        chances--;
        createLife();
      }
    }

    hoop.bounceOff(edges);
    //Prevents the ball from moving out of the screen;
    ballGroup.bounceOff(edges[0]);
    ballGroup.bounceOff(edges[1]);
  }

  else if (gameState === "end") {
    //when player lost the game
    ballGroup.setVelocityEach(0, 0);
    hoop.setVelocity(0, 0);
    gameOver.visible = true;
  }
  //displays all the object
  drawSprites();

  //Display score text and text properties
  textFont("Coiny");
  fill("red");
  textSize(25);
  text("Score: " + count, windowWidth - 150, 50);
}

//Creates ball
function createBall() {
  //Creates ball for the frameCondition
  var frameCondition = ballCount < 10 ? 100 : 60;

  if (World.frameCount % frameCondition === 0) {
    var ball = createSprite(random(10, windowWidth - 10), 0);
    ballCount++;
    ball.addImage(ballImage);
    //The velocity of the ball increases gradually for every 5 balls
    ball.velocityY = 5 + 3 * ballCount / 5;
    ball.velocityX = random(1, 8);
    ball.depth = hoop.depth - 1;
    ballGroup.add(ball);
  }
}

//Checks the type of device
function isTouchDevice() {
  return typeof window.ontouchstart !== 'undefined';
}

// Generalised function for the button creation
function createButtons(img, className) {
  var button = createImg(img);
  button.addClass(className);
  return button;
}

//Mute and unmute music
function toggleHomeMusic() {
  if (homeMusic.isPlaying()) {
    // .isPlaying() returns a boolean
    homeMusic.pause();
  } else {
    homeMusic.loop();
  }
}

//Create chances
function createLife() {
  for (var i = 0; i < chances; i++) {
    var distance = isTouchDevice() ? windowWidth / 2 - 50 + 35 * i : windowWidth / 2 - 80 + 35 * i;
    var life = createSprite(distance, 40);
    life.addImage(ballImage);
    life.scale = 0.08;
    lifeGroup.add(life);
  }
}
