/*
Stuff To Implement:
 + Up punch?

Color Palette:
 + Yellows
  + e08300 - Yellow-Orange
  + fcca46 - Yellow
  + fddc81 - White-Yellow
 + Reds
  + ff4433 - Red
  + ff8a80 - Lighter Red
  + f9beb9 - Pink
  + ffdedb - White-pink
 + Blues
  + 00e0bf - Torquoise
  + 6afbe5 - Cyan/Aqua
  + b8f9f0 - Light Blue
 + Purples
  + 792db4 - Violet
  + ba7de8 - Lavender
  + e7d5f6 - Light Purple
 + Greys
  + 0a0e10 - Black
  + 11232b - Dark Grey
  + 2a3d45 - Grey
  + 495960 - Light Grey

 + 969696 - Game background color (color picked from desaturated lavender)
*/

//A global object to pass values between functions and files alike
const gameState = {
  play: false,         //Set to true when the Play Game is pressed on the menu
  gamemode: 1,         //Which gamemode to load the game in
  htp: false,          //Set to true when the How To Play menu is visible
  musicVol: 0.9,       //How loud the music is
  sfxVol: 0.85,        //How loud sound effects are
  background: true,    //Whether or not to use the background art or a solid background when playing
  replay: false,       //Whether or not the player can restart the game after dying
  action: 0,           //Represents the player's current action (-1: moving left, 0: nothing, 1: moving right, 2: punching)
  canJump: true,       //Whether or not the player is able to jump
  isJumping: false,    //Whether or not the player is jumping
  jumpCooldown: false, //A cooldown in case the player is holding the jump button, as to allow thme to double jump
  canPunch: true,      //Whether or not the player can punch
  velo: 0,             //The player's current horizontal velocity
  scale: [],           //A 2d array that saves objects & amount of weight on whatever side of the scale they're on
  theta: 0,            //Rotation (in degrees) of the scale arm
  slimes: [],          //A 2d arrary of all of the slimes in the scene (contains the a reference to the slime, the slime's color, and the slime's cooldown)
  slimeQueue: [],      //An array that queues up slimes to be added to the scene
  projectiles: [],     //An array of all of the projectiles in the scene
  slimesKilled: 0,     //How many slimes have been killed
  highScore: 0,        //The player's high score (frantic mode)
  simpleHighScore: 0,  //The player's high score (simplified mode)
  spawnCooldown: 0,    //How many frames before another slime can be spawned
  hp: 3,               //The player's current hp
  iframes: false,      //Whether or not the player can be damaged
  timer: 280,          //The current timer value
  slimeTimer: 900,     //The current slime timer value
  dead: 0,             //Scene flag for whether or not the player has died D:
  death: 0,            //Whether the player ran out of balance or health
  reset: false,        //Is set true when it's time to reset the level
  escape: false,       //Is set to true in some scene files when the player presses esc
  pause: false,        //Is set to true when the game is paused
  emergencyCancel: 0,  //Helps stop infinite loops that could cause errors or memory leaks later on
};

function resetGameState() {
  gameState.replay = false
  gameState.action = 0;
  gameState.canJump = true;
  gameState.isJumping = false;
  gameState.jumpCooldown = false;
  gameState.canPunch = true;
  gameState.velo = 0;
  gameState.scale = [];
  gameState.theta = 0;
  gameState.slimes = [];
  gameState.slimeQueue = [];
  gameState.projectiles = [];
  gameState.slimesKilled = 0;
  gameState.spawnCooldown = 0;
  gameState.hp = 3;
  gameState.iframes = false;
  gameState.timer = 280;
  gameState.slimeTimer = 900;
  gameState.dead = 0;
  gameState.death = 0;
  gameState.reset = false;
  gameState.escape = false;
};

//Load Local Storage
if (localStorage.getItem("highScore") != null) {
  gameState.highScore = Number(localStorage.getItem("highScore"));
  document.body.querySelector(".highScore").innerHTML = "Frantic Mode High Score: " + gameState.highScore;
}
if (localStorage.getItem("simpleScore") != null) {
  gameState.simpleHighScore = Number(localStorage.getItem("simpleScore"));
}
  
//Config creates the entire scene, you can change backgroundColor and game size here without breaking any other code
const config = {
  height: 720,
  width: 1280,
  backgroundColor: 0x969696,
  scene: [Scene1],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 750 },
      debug: false,
    }
  },
  pixelArt: true, //Turns off anti-aliasing
  scale: {
    parent: document.body.querySelector(".game"),
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      height: 360,
      width: 640,
    },
    max: {
      height: 10800,
      width: 19200,
    },
    zoom: 1,
  },
  autoRound: false,
};
  
//Initiates the config
const game = new Phaser.Game(config);

//Remove the loading screen
setTimeout(() => {document.body.querySelector('.loadingScreen').style.zIndex = -1}, 1000);

//Quality of Life Functions:
  
//  Timed Events Function  \\
//func is function to be executed,
//length is the time inbetween intervals (in ms),
//loop is whether or not the interval should loop (bool),
//maxLoop is the maximum amount of times the function can loop (number for specific value, or empty/null for infinite)
function timeEvent(func, length, loop, maxLoop) {
  if (loop === false) {
    setTimeout(func, length);
  } else if (maxLoop != NaN) {
    let timeEventInterval = setInterval(func, length);
    let savedVal = gameState.emergencyCancel;
    let cancelInterval = setInterval(function () {
      if (gameState.emergencyCancel != savedVal) {
        clearInterval(timeEventInterval);
        clearInterval(cancelInterval);
      } else if (maxLoop === 0) {
        clearInterval(timeEventInterval);
        clearInterval(cancelInterval);
      } else {
        maxLoop -= 1;
      };
    }, length);
  } else {
    let timeEventInterval = setInterval(func, length);
    let savedVal = gameState.emergencyCancel;
    let cancelInterval = setInterval(function () {
      if (gameState.emergencyCancel != savedVal) {
        clearInterval(timeEventInterval);
        clearInterval(cancelInterval);
      };
    }, length);
  };
};

//Pressing tab while the game is being played causes an uninteractable title screen to cover the page, so tab is deactivated while the game is being played and isn't paused
document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab' && (gameState.play || gameState.htp)) {
    e.preventDefault(); // Stops tab behavior
  }
});

function controls() {
  if (gameState.player.body.onFloor()) {
    gameState.canJump = true;
    gameState.isJumping = false;
    gameState.jumpCooldown = false;
  } else if (gameState.canPunch) {
    gameState.isJumping = true;
    gameState.player.anims.stop();
    gameState.player.body.velocity.y <= 0 ? gameState.player.setFrame(5) : gameState.player.setFrame(4);
  }

  if (gameState.x && gameState.canJump && !gameState.jumpCooldown) {
    if (!gameState.player.body.onFloor()) {
      gameState.canJump = false;
    } else {
      gameState.jumpCooldown = true;
      timeEvent(() => {gameState.jumpCooldown = false;}, 400, false);
    }
    gameState.sounds[1].play();
    gameState.player.setVelocityY(-400);
    gameState.isJumping = true;
  }

  if (gameState.z && gameState.canPunch) {
    gameState.action = 2;
    gameState.canPunch = false;
    gameState.player.anims.stop();
    gameState.player.setFrame(11);
    gameState.sounds[3].play();
    gameState.punch.y = gameState.player.y;
    if (gameState.player.flipX) {
      gameState.punch.x = gameState.player.x - 64;
      gameState.punch.flipX = true;
    } else {
      gameState.punch.x = gameState.player.x + 64;
      gameState.punch.flipX = false;
    }
    gameState.punch.setAlpha(1).refreshBody();
    gameState.punch.anims.play("punchFX", true);
    setTimeout(() => {
      gameState.punch.x = -32;
      gameState.punch.y = -32;
      gameState.punch.anims.stop();
      gameState.punch.setAlpha(0).refreshBody();
    }, 250);
    setTimeout(() => {
      gameState.action = 0;
      gameState.player.setFrame(0);
    }, 200);
    setTimeout(() => {gameState.canPunch = true}, 450);
  }

  if (gameState.action != 2 && (gameState.cursors.right.isDown || gameState.d)) {
    gameState.player.flipX = false;
    if (gameState.velo < 200) {
      gameState.velo += 20;
      gameState.player.setVelocityX(gameState.velo);
    };
    if (!gameState.isJumping) {gameState.action = 1; gameState.player.anims.play("walk", true)};
  } else if (gameState.action != 2 && (gameState.cursors.left.isDown || gameState.a)) {
    gameState.player.flipX = true;
    if (gameState.velo > -200) {
      gameState.velo -= 20;
      gameState.player.setVelocityX(gameState.velo);
    };
    if (!gameState.isJumping) {gameState.action = -1; gameState.player.anims.play("walk", true)};
  } else {
    if (gameState.velo != 0) {
      gameState.velo > 0 ? gameState.velo -= 20 : gameState.velo += 20;
      gameState.player.setVelocityX(gameState.velo);
    }
    if (!gameState.isJumping && gameState.action != 2) {
      gameState.action = 0;
      gameState.player.anims.stop();
      gameState.player.setFrame(0);
    }
  }
}

function tilt() {
  let balance = 0;
  if (gameState.scale.length != 0) {
    gameState.scale.forEach((v) => {
      v[2] === 0 ? balance -= v[1] : balance += v[1];
    });
  };
  gameState.theta += balance / 10;
  gameState.leftScale.setTexture("plate");
  gameState.rightScale.setTexture("plate");
  if (gameState.theta < -30) {
    gameState.theta = -30;
    gameState.timer -= 1;
    gameState.leftScale.setTexture("dangerPlate");
  } else if (gameState.theta > 30) {
    gameState.theta = 30;
    gameState.timer -= 1;
    gameState.rightScale.setTexture("dangerPlate");
  } else if (balance === 0 && gameState.theta != 0) {
    gameState.theta < 0 ? gameState.theta += 0.1 : gameState.theta -= 0.1;
    if (gameState.timer < 280) {gameState.timer += 1};
    if ((gameState.theta < 0 && gameState.theta + 0.1 > 0) || (gameState.theta > 0 && gameState.theta - 0.1 < 0)) {gameState.theta = 0;}
  } else if (gameState.timer < 280) {gameState.timer += 1};
  gameState.arm.setAngle(gameState.theta);
  if (gameState.timer >= 0) {gameState.timeRect.width = gameState.timer} else if (gameState.dead === 0) {gameState.dead = 1; gameState.death = 1};

  let xBefore = gameState.rightScale.x;
  let yBefore = gameState.rightScale.y;
  gameState.rightScale.x = 205 + 435 * Math.cos(gameState.theta * Math.PI / 180);
  gameState.rightScale.y = 360 + 435 * Math.sin((gameState.theta) * Math.PI / 180);
  gameState.rScaleHitbox.body.x = (640 + 435 * Math.cos(gameState.theta * Math.PI / 180)) - 155;
  gameState.rScaleHitbox.body.y = (415 + 435 * Math.sin((gameState.theta) * Math.PI / 180)) - 5;
  gameState.leftScale.x = 1075 - 435 * Math.cos(gameState.theta * Math.PI / 180);
  gameState.leftScale.y = 360 - 435 * Math.sin((gameState.theta) * Math.PI / 180);
  gameState.lScaleHitbox.body.x = (640 - 435 * Math.cos(gameState.theta * Math.PI / 180)) - 155;
  gameState.lScaleHitbox.body.y = (415 - 435 * Math.sin((gameState.theta) * Math.PI / 180)) - 5;
  let xDif = gameState.rightScale.x - xBefore;
  let yDif = gameState.rightScale.y - yBefore;
  gameState.scale.forEach((v) => {
    if (v[2] === 0) {
      v[0].x -= xDif;
      v[0].y -= yDif;
    } else {
      v[0].x += xDif;
      v[0].y += yDif;
    }
  });
  
  gameState.scale = [];
}

function slimes() {
  if (gameState.projectiles.length > 0) {
    for (let i = 0; i < gameState.projectiles.length; i++) {
      if (gameState.projectiles[i].body.velocity.x === 0 || gameState.projectiles[i].body.velocity.y === 0) {
        gameState.projectiles[i].destroy();
        gameState.projectiles.splice(i, 1);
        i--;
      }
    }
  }

  let yellowSlimeCount = 0;
  let purpleSlimeCount = 0;
  gameState.slimes.forEach((v, i) => {
    if (v[2] > 0) {gameState.slimes[i][2]--};
    let targetX = 0;
    let targetY = 0;

    if (v[1] != 3 && v[0].body.onFloor()) {v[0].setVelocity(0, 0)};

    if (v[2] === 70) {
      switch (v[1]) {
        case 0:
          v[0].setFrame(17);
          break;
        case 1:
          v[0].setFrame(19);
          break;
        case 2:
          v[0].setFrame(21);
          break;
        case 5:
          v[0].setFrame(27);
          break;
        default:
          break;
      }
    }

    if ((v[1] === 0 || v[1] === 2) && v[2] === 0) {
      let onScale = false;
      let playerScale = false;
      gameState.scale.forEach((w) => {if (w[0] === v[0]) {onScale = w[2]} else if (w[0] === gameState.player) {playerScale = w[2]}});
      if (onScale === false) {
        if (v[0].x <= 640) {
          targetX = gameState.lScaleHitbox.x + Math.floor(Math.random() * 301 - 150);
          targetY = gameState.lScaleHitbox.y - 5;
        } else {
          targetX = gameState.rScaleHitbox.x + Math.floor(Math.random() * 301 - 150);
          targetY = gameState.rScaleHitbox.y - 5;
        };
        if ((Math.abs(gameState.player.x - v[0].x) < Math.abs(targetX - v[0].x)) || (v[0].body.touching.down && ((v[0].x > gameState.rScaleHitbox.x - 155 && v[0].x < gameState.rScaleHitbox.x + 155) || (v[0].x > gameState.lScaleHitbox.x - 155 && v[0].x < gameState.lScaleHitbox.x + 155)))) {
          targetX = gameState.player.x + Math.floor(Math.random() * 41 - 20);
          targetY = gameState.player.y - Math.floor(Math.random() * 21 + 5);
        } else if (Math.floor(Math.random() * 3) === 1) {
          targetX = Math.floor(targetX / 2);
        };
        if (v[0].y - targetY > 240) {
          targetX = + Math.floor(Math.random() * 81 + 600);
        } else if (v[0].y - targetY < 0 && v[0].x > 507 && v[0].x < 773) {
          v[0].x <= 640 ? targetX = gameState.lScaleHitbox.x + Math.floor(Math.random() * 301 - 150) : targetX = gameState.rScaleHitbox.x + Math.floor(Math.random() * 301 - 150);;
        }

        let veloX = (targetX - v[0].x) * (Math.floor(Math.abs(targetX - v[0].x) / 100) / 50 + 0.6);
        if (veloX > 300) {veloX = 300} else if (veloX < -300) {veloX = -300};
        v[0].setVelocity(veloX, -550);
      } else if (playerScale != false && playerScale === onScale) {
        v[0].setVelocity(gameState.player.x - v[0].x, -450);
      } else {
        v[0].setVelocity(Math.floor(Math.random() * 61 - 30), Math.floor(Math.random() * 5 + 14) * -25);
      }
      gameState.sounds[4].play();
      gameState.slimes[i][2] = Math.floor(Math.random() * 181 + 120);
      if (v[1] === 0) {gameState.slimes[i][2] += 60;}
      v[1] === 0 ? v[0].setFrame(16) : v[0].setFrame(20);
    } else if (v[1] === 1 && v[2] === 0) {
      gameState.redSlimeProjectile(v[0].x, v[0].y);
      gameState.slimes[i][2] = Math.floor(Math.random() * 181 + 180);
      v[0].setFrame(18);
    } else if (v[1] === 3) {
      yellowSlimeCount++;
      v[0].body.velocity.x < 0 ? v[0].flipX = true : v[0].flipX = false;
    } else if (v[1] === 4) {
      purpleSlimeCount++;
      if (!v[0].isTinted || (v[0].isTinted && v[3] === 0)) {
        let speed = [gameState.player.x - v[0].x, gameState.player.y - v[0].y];
        Math.abs(speed[0]) > Math.abs(speed[1]) ? speed = [speed[0] * Math.abs(125 / speed[0]), speed[1] * Math.abs(125 / speed[0])] : speed = [speed[0] * Math.abs(125 / speed[1]), speed[1] * Math.abs(125 / speed[1])];
        v[0].setVelocity(speed[0], speed[1]);
      }
      if (v[2] === 0) {
        gameState.slimes[i][2] = 30;
        v[0].setFrame(23);
      } else if (v[2] === 15) {
        v[0].setFrame(24);
      }
      if (v[0].body.velocity.x === 0 && v[0].body.velocity.y === 0) {v[0].x <= 640 ? v[0].setVelocity(125, 125) : v[0].setVelocity(-125, 125)};
    } else if (v[1] === 5 && v[2] === 0) {
      let onScale = false;
      gameState.scale.forEach((w) => {if (w[0] === v[0]) {onScale = w[2]}});
      if (onScale === false) {
        if (v[0].x <= 640) {
          targetX = gameState.lScaleHitbox.x + Math.floor(Math.random() * 301 - 150);
          targetY = gameState.lScaleHitbox.y - 5;
        } else {
          targetX = gameState.rScaleHitbox.x + Math.floor(Math.random() * 301 - 150);
          targetY = gameState.rScaleHitbox.y - 5;
        };
        if ((Math.abs(gameState.player.x - v[0].x) < Math.abs(targetX - v[0].x)) || (v[0].body.touching.down && ((v[0].x > gameState.rScaleHitbox.x - 155 && v[0].x < gameState.rScaleHitbox.x + 155) || (v[0].x > gameState.lScaleHitbox.x - 155 && v[0].x < gameState.lScaleHitbox.x + 155)))) {
          targetX = gameState.player.x + (100 * (Math.floor(Math.random() * 2) * 2 - 1));
          targetY = gameState.player.y - Math.floor(Math.random() * 21 + 5);
        } else if (Math.floor(Math.random() * 3) === 1) {
          targetX = Math.floor(targetX / 2);
        };
        if (v[0].y - targetY > 240) {
          targetX = + Math.floor(Math.random() * 81 + 600);
        } else if (v[0].y - targetY < 0 && v[0].x > 507 && v[0].x < 773) {
          v[0].x <= 640 ? targetX = gameState.lScaleHitbox.x + Math.floor(Math.random() * 301 - 150) : targetX = gameState.rScaleHitbox.x + Math.floor(Math.random() * 301 - 150);;
        }

        let veloX = (targetX - v[0].x) * (Math.floor(Math.abs(targetX - v[0].x) / 100) / 50 + 0.6);
        if (veloX > 300) {veloX = 300} else if (veloX < -300) {veloX = -300};
        v[0].setVelocity(veloX, -550);
      } else {
        let veloX = (Math.floor(Math.random() * 81 + 600) - v[0].x) * (Math.floor(Math.abs(targetX - v[0].x) / 100) / 50 + 0.6);
        if (veloX > 300) {veloX = 300} else if (veloX < -300) {veloX = -300};
        v[0].setVelocity(veloX, Math.floor(Math.random() * 6 + 4) * -50);
      }
      gameState.sounds[4].play();
      gameState.slimes[i][2] = Math.floor(Math.random() * 181 + 180);
      v[0].setFrame(26);
    }
  });

  /*Unsure if I want to stick to this difficulty curve; could also try:
  x = slimesKilled / 10 (could also be divided by 5 instead, for 2x scaling)
  exponential (current): 1.1^x + 0.3x + 3
  cubic (fast to slow): (x/10 - 2)^3 + 0.3x + 11
  cubic (all fast): (x/5 - 2)^3 + 0.2x + 11
  */
  let maxSlimes = Math.floor(1.1 ** (gameState.slimesKilled / 5) + 0.6 * (gameState.slimesKilled / 5) + 3);
  if (gameState.slimes.length < maxSlimes && gameState.slimes.length < 12 && gameState.spawnCooldown <= 0) {
    gameState.spawnCooldown = Math.floor(Math.random() * 7 + 3) * 10;
    let slimeX = Math.floor(Math.random() * 1215 + 33);
    if ((gameState.theta <= -30 && slimeX < 400) || (gameState.theta >= 30 && slimeX > 880)) {slimeX = 1280 - slimeX;}
    if (slimeX > gameState.player.x - 100 && slimeX < gameState.player.x + 100) {
      if (slimeX < 640 && slimeX > gameState.player.x) {
        slimeX += 250;
      } else if (slimeX > 640 && slimeX < gameState.player.x) {
        slimeX -= 250;
      } else {
        slimeX < 640 ? slimeX += 640 : slimeX -= 640;
      };
    }
    if (gameState.slimeQueue.length === 0) {
      let arr = [];
      if (maxSlimes >= 8) {
        arr = [0, 1, 2, 3, 4];
        let max = 0;
        while (max < 10) {
          let add = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
          arr.push(add);
          max += (add + 1);
        }
      } else if (maxSlimes >= 7) {
        arr = [0, 0, 1, 2, 3];
      } else if (maxSlimes >= 6) {
        arr = [0, 0, 0, 1, 1, 3, 3];
      } else if (maxSlimes >= 5) {
        arr = [0, 0, 0, 1];
      } else {
        let max = Math.floor(Math.random() * 3 + 3);
        for (let i = 0; i < max; i++) {gameState.slimeQueue.push(0)};
      }
      if (yellowSlimeCount >= 3) {
        arr.forEach((v, i) => {if (v === 3) {arr[i] = Math.floor(Math.random() * 3);}});
      }
      if (purpleSlimeCount >= 1) {
        arr.forEach((v, i) => {if (v === 4) {arr[i] = Math.floor(Math.random() * 3);}});
      }
      while (arr.length > 0) {
        let remove = Math.floor(Math.random() * arr.length);
        gameState.slimeQueue.push(arr[remove]);
        arr.splice(remove, 1);
      }
    }
    gameState.addSlime(slimeX, gameState.slimeQueue.shift());
  } else {gameState.spawnCooldown--;}
}

function slimeTimer() {
  gameState.slimeTimer--;
  if (gameState.slimeTimer === 0 && gameState.dead === 0) {
    gameState.dead++;
    gameState.death = 2;
  } else if (gameState.slimeTimer > 900) {
    gameState.slimeTimer = 900;
  }
  gameState.slimeRect.height = 190 * (gameState.slimeTimer / 900);
}
