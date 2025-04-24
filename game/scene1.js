class Scene1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene1' });
  }
  preload() {
    this.load.spritesheet("sheet1", "assets/sprites/spritesheet.png", { frameWidth: 64, frameHeight: 64 });
    this.load.image("BG", "assets/sprites/BG.jpg");
    this.load.image("base", "assets/sprites/scaleBase.png");
    this.load.image("arm", "assets/sprites/scaleArm.png");
    this.load.image("plate", "assets/sprites/scalePlate.png");
    this.load.image("dangerPlate", "assets/sprites/dangerScale.png");
    this.load.image("time", "assets/sprites/scaleTimer.png");
    this.load.audio("hurt", "assets/misc/hurt.wav");
    this.load.audio("jump", "assets/misc/jump.wav");
    this.load.audio("projectile", "assets/misc/projectile.wav");
    this.load.audio("punch", "assets/misc/punch.wav");
    this.load.audio("sJump", "assets/misc/slimeJump.wav");
    this.load.audio("music", "assets/misc/SlimesAndScales.mp3");
  }
  create() {
    gameState.player = this.physics.add.sprite(640, 687, "sheet1").setDepth(5).setFrame(0);
    gameState.player.setCollideWorldBounds(true);
    gameState.player.setSize(36, 64).setOffset(16, 0);
    gameState.punch = this.physics.add.staticSprite(-32, -32, "sheet1").setAlpha(0).setFrame(12).setDepth(6);
    gameState.heart1 = this.add.image(576, 32, "sheet1").setFrame(30).setDepth(2);
    gameState.heart2 = this.add.image(640, 32, "sheet1").setFrame(30).setDepth(2);
    gameState.heart3 = this.add.image(704, 32, "sheet1").setFrame(30).setDepth(2);

    gameState.bg = this.add.image(640, 360, "BG").setDepth(-1);
    if (!gameState.background) {gameState.bg.setAlpha(0)};
    gameState.arm = this.add.image(640, 126, "arm").setDepth(0).setOrigin(0.5, 0.175);
    this.add.image(640, 360, "base").setDepth(1);
    gameState.scoreText = this.add.text(75, 7, "0", {fontFamily: 'yatra', fontSize: '35px', fill: '#0a0e10', align: 'center'}).setDepth(6).setOrigin(0, 0);
    this.add.rectangle(500, 685, 280, 28, 0xff8a80).setOrigin(0, 0).setDepth(1);
    gameState.timeRect = this.add.rectangle(500, 685, 280, 28, 0xfddc81).setOrigin(0, 0).setDepth(1);
    this.add.image(640, 360, "time").setDepth(2);
    gameState.leftScale = this.add.image(640, 360, "plate").setDepth(2);
    gameState.rightScale = this.add.image(640, 360, "plate").setDepth(2);
    gameState.rightScale.flipX = true;

    gameState.sounds = [
      this.sound.add("hurt", {volume: gameState.sfxVol}),
      this.sound.add("jump", {volume: gameState.sfxVol}),
      this.sound.add("projectile", {volume: gameState.sfxVol}),
      this.sound.add("punch", {volume: gameState.sfxVol}),
      this.sound.add("sJump", {volume: gameState.sfxVol}),
      this.sound.add("music", {volume: gameState.musicVol, loop: true})
    ];

    if (gameState.play) {gameState.sounds[5].play()};

    let slime = this.physics.add.group();
    let slimeCollider = this.add.group();
    let greySlimes = this.add.group();
    let lightSlimes = this.add.group();
    let redSlimeProjectile = this.physics.add.group();

    this.physics.add.overlap(slime, gameState.player, (obj1) => {
      if (!gameState.iframes) {
        gameState.hp--;
        gameState.iframes = true;
        gameState.player.setAlpha(0.50);
        gameState.sounds[0].play();
        gameState.player.y -= 1;
        if (gameState.player.x <= obj1.x) {
          gameState.velo = -400;
          gameState.player.setVelocity(-400, -400);
        } else {
          gameState.velo = 400;
          gameState.player.setVelocity(400, -400);
        }
        if (gameState.hp === 2) {
          gameState.heart3.setFrame(31);
          setTimeout(() => {gameState.player.setAlpha(1); gameState.iframes = false}, 3000);
        } else if (gameState.hp === 1) {
          gameState.heart2.setFrame(31);
          setTimeout(() => {gameState.player.setAlpha(1); gameState.iframes = false}, 3000);
        } else {
          gameState.heart1.setFrame(31);
          gameState.dead++;
          setTimeout(() => {gameState.iframes = false}, 3000);
        }
      }
    });

    this.physics.add.overlap(redSlimeProjectile, gameState.player, (obj1, obj2) => {
      if (!gameState.iframes) {
        gameState.hp--;
        gameState.iframes = true;
        gameState.player.setAlpha(0.50);
        gameState.player.y -= 1;
        if (gameState.player.x <= obj2.x) {
          gameState.velo = -400;
          gameState.player.setVelocity(-400, -400);
        } else {
          gameState.velo = 400;
          gameState.player.setVelocity(400, -400);
        }
        if (gameState.hp === 2) {
          gameState.heart3.setFrame(31);
          setTimeout(() => {gameState.player.setAlpha(1); gameState.iframes = false}, 3000);
        } else if (gameState.hp === 1) {
          gameState.heart2.setFrame(31);
          setTimeout(() => {gameState.player.setAlpha(1); gameState.iframes = false}, 3000);
        } else {
          gameState.heart1.setFrame(31);
          gameState.dead++;
          setTimeout(() => {gameState.iframes = false}, 3000);
        }
      }
    });

    this.physics.add.overlap(gameState.punch, slime, (obj1, obj2) => {
      obj2.setTint(0xbbbbbb);
      let slimeHP;
      gameState.slimes.forEach((v, i) => {if (v[0] === obj2) {slimeHP = i}});
      if (gameState.slimes[slimeHP][2] <= 70 && (gameState.slimes[slimeHP][1] != 3 && gameState.slimes[slimeHP][1] != 4)) {
        gameState.slimes[slimeHP][2] += 100;
        gameState.slimes[slimeHP][0].setFrame([16, 18, 20, 0, 0, 26][gameState.slimes[slimeHP][1]]);
      }
      obj2.y--;
      let speed = -150;
      if (gameState.slimes[slimeHP][1] === 3 || gameState.slimes[slimeHP][1] === 5) {speed = -400} else if (gameState.slimes[slimeHP][1] === 4) {speed = -500};
      gameState.player.x >= obj2.x ? obj2.setVelocity(speed, -200) : obj2.setVelocity(-1 * speed, -200);
      if (gameState.slimes[slimeHP][3] === 1) {
        setTimeout(() => {if (gameState.slimes[slimeHP][0].isTinted) {gameState.slimes[slimeHP][3] = 0}}, 250);
      } else if (gameState.slimes[slimeHP][3] <= 0) {
        if (gameState.slimes[slimeHP][1] === 5 && gameState.hp < 3) {
          gameState.hp++;
          gameState.hp === 2 ? gameState.heart2.setFrame(30) : gameState.heart3.setFrame(30);
        }
        obj2.destroy();
        gameState.slimes.splice(slimeHP, 1);
        gameState.slimesKilled++;
        gameState.scoreText.setText(gameState.slimesKilled);
        if (gameState.slimesKilled % 15 === 0) {gameState.slimeQueue.unshift(5)};
      }
    });

    this.physics.add.overlap(gameState.punch, redSlimeProjectile, (obj1, obj2) => {
      let proj;
      gameState.projectiles.forEach((v, i) => {if (v === obj2) {proj = i}});
      obj2.destroy();
      gameState.projectiles.splice(proj, 1);
    });

    gameState.addSlime = function(x, color) {
      let newSlime = slime.create(x, 0, "sheet1").setDepth(3);
      newSlime.setCollideWorldBounds(true);
      if (color === 0) {
        newSlime.setFrame(16);
        newSlime.body.setSize(48, 34).setOffset(8, 30);
        slimeCollider.add(newSlime);
        gameState.slimes.push([newSlime, 0, 300, 1]);
      } else if (color === 1) {
        newSlime.setFrame(18);
        newSlime.body.setSize(48, 34).setOffset(8, 30);
        slimeCollider.add(newSlime);
        gameState.slimes.push([newSlime, 1, 300, 1]);
      } else if (color === 2) {
        newSlime.setFrame(20);
        newSlime.body.setSize(48, 34).setOffset(8, 30);
        greySlimes.add(newSlime);
        gameState.slimes.push([newSlime, 2, 300, 1]);
      } else if (color === 3) {
        newSlime.setFrame(22);
        newSlime.body.setSize(48, 26).setOffset(8, 38).setBounceX(1);
        newSlime.setVelocityX([400, -400][Math.floor(Math.random() * 2)]);
        lightSlimes.add(newSlime);
        gameState.slimes.push([newSlime, 3, 0, 1]);
      } else if (color === 4) {
        newSlime.setFrame(23);
        newSlime.body.setSize(32, 28).setOffset(16, 36).setAllowGravity(false);
        gameState.slimes.push([newSlime, 4, 40, 1]);
      } else if (color === 5) {
        newSlime.setFrame(26);
        newSlime.body.setSize(32, 28).setOffset(16, 36);
        lightSlimes.add(newSlime);
        gameState.slimes.push([newSlime, 5, 300, 1]);
      } else {
        newSlime.destroy();
        gameState.slimes.splice(gameState.slimes.length - 1, 1);
      };
    };

    gameState.redSlimeProjectile = function(x, y) {
      let projectile = redSlimeProjectile.create(x, y, "sheet1").setDepth(3).setFrame(25);
      projectile.body.setCollideWorldBounds(true).setAllowGravity(false);
      projectile.body.setSize(20, 20).setOffset(22, 22);
      gameState.projectiles.push(projectile);
      gameState.sounds[2].play();
      let v = [gameState.player.x - x, gameState.player.y - y];
      if (v[1] === 0) {v[1] = 0.1};
      Math.abs(v[0]) > Math.abs(v[1]) ? v = [v[0] * Math.abs(350 / v[0]), v[1] * Math.abs(350 / v[0])] : v = [v[0] * Math.abs(350 / v[1]), v[1] * Math.abs(350 / v[1])];
      projectile.setVelocity(v[0], v[1]);
    }

    function oneWayPlatform(object) {
      object.body.checkCollision.right = false;
      object.body.checkCollision.left = false;
      object.body.checkCollision.down = false;
      object.body.checkCollision.up = true;
    }

    function adjustWeight(obj1, obj2, n) {
      if (obj2.x === gameState.rScaleHitbox.x && gameState.scale.indexOf([obj2, n, 1]) === -1) {
        gameState.scale.push([obj1, n, 1]);
      } else if (obj2.x === gameState.lScaleHitbox.x && gameState.scale.indexOf([obj2, n, 0]) === -1) {
        gameState.scale.push([obj1, n, 0]);
      }
    };

    let collider = this.physics.add.staticGroup();
    this.physics.add.collider(collider, gameState.player, (obj1, obj2) => {adjustWeight(obj1, obj2, 1)});
    this.physics.add.collider(collider, slimeCollider, (obj1, obj2) => {adjustWeight(obj1, obj2, 1)});
    this.physics.add.collider(collider, greySlimes, (obj1, obj2) => {adjustWeight(obj1, obj2, 3)});
    this.physics.add.collider(collider, lightSlimes, (obj1, obj2) => {adjustWeight(obj1, obj2, 0.5)});
    let platform = collider.create(641, 347, "sheet1").setAlpha(0).setFrame(0);
    platform.body.setSize(202, 10, 0.5, 0.5);
    oneWayPlatform(platform);
    platform = collider.create(641, 535, "sheet1").setAlpha(0).setFrame(0);
    platform.body.setSize(202, 10, 0.5, 0.5);
    oneWayPlatform(platform);
    gameState.lScaleHitbox = collider.create(205, 415, "sheet1").setAlpha(0).setFrame(0);
    gameState.lScaleHitbox.body.setSize(310, 10, 0.5, 0.5);
    oneWayPlatform(gameState.lScaleHitbox);
    gameState.rScaleHitbox = collider.create(1075, 415, "sheet1").setAlpha(0).setFrame(0);
    gameState.rScaleHitbox.body.setSize(310, 10, 0.5, 0.5);
    oneWayPlatform(gameState.rScaleHitbox);
    
    resetGameState();

    //Create player animations
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers("sheet1", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'carry',
      frames: this.anims.generateFrameNumbers("sheet1", { start: 6, end: 9 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'punch',
      frames: this.anims.generateFrameNumbers("sheet1", { start: 10, end: 11 }),
      frameRate: 4,
      repeat: 0
    });

    this.anims.create({
      key: 'punchFX',
      frames: this.anims.generateFrameNumbers("sheet1", { start: 12, end: 15 }),
      frameRate: 16,
      repeat: 0
    });

    //Create a rectangle and some text for the death screen
    gameState.rect = this.add.rectangle(640, 360, 1280, 720, 0x0a0e10).setAlpha(0).setDepth(5);
    gameState.deathText = this.add.text(640, -360, "You Died\nFinal Score: 0", {fontFamily: 'yatra', fontSize: '60px', fill: '#fcca46', align: 'center'}).setDepth(6).setOrigin(0.5, 0.5);
    gameState.returnToMenu = this.add.text(640, -360, "Press ESC or P to return to the main menu\nPunch (SHIFT, Z, C, J, or L) to play again", { fontFamily: 'yatra', fontSize: '30px', fill: '#6afbe5', align: "center", lineSpacing: -5 }).setDepth(7).setOrigin(0.5, 0.5);
  
    //Set all inputs to false initially
    gameState.a = false;
    gameState.d = false;
    gameState.z = false;
    gameState.x = false;
    gameState.s = false;
    gameState.down = false;

    //Create input keys
    gameState.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-W", function () {gameState.x = true});
    this.input.keyboard.on("keydown-UP", function () {gameState.x = true});
    this.input.keyboard.on("keydown-A", function () {gameState.a = true});
    this.input.keyboard.on("keydown-D", function () {gameState.d = true});
    this.input.keyboard.on("keydown-E", function () {gameState.z = true});
    this.input.keyboard.on("keydown-Z", function () {gameState.z = true});
    this.input.keyboard.on("keydown-X", function () {gameState.x = true});
    this.input.keyboard.on("keydown-C", function () {gameState.z = true});
    this.input.keyboard.on("keydown-SHIFT", function () {gameState.z = true});
    this.input.keyboard.on("keydown-SPACE", function () {gameState.x = true});
    this.input.keyboard.on("keydown-S", function () {gameState.s = true; gameState.player.body.checkCollision.down = false});
    this.input.keyboard.on("keydown-DOWN", function () {gameState.down = true; gameState.player.body.checkCollision.down = false});
    this.input.keyboard.on("keyup-W", function () {gameState.x = false});
    this.input.keyboard.on("keyup-UP", function () {gameState.x = false});
    this.input.keyboard.on("keyup-A", function () {gameState.a = false});
    this.input.keyboard.on("keyup-D", function () {gameState.d = false});
    this.input.keyboard.on("keyup-E", function () {gameState.z = false});
    this.input.keyboard.on("keyup-Z", function () {gameState.z = false});
    this.input.keyboard.on("keyup-X", function () {gameState.x = false});
    this.input.keyboard.on("keyup-C", function () {gameState.z = false});
    this.input.keyboard.on("keyup-SHIFT", function () {gameState.z = false});
    this.input.keyboard.on("keyup-SPACE", function () {gameState.x = false});
    this.input.keyboard.on("keyup-S", function () {gameState.s = false; if (!gameState.down) {gameState.player.body.checkCollision.down = true}});
    this.input.keyboard.on("keyup-DOWN", function () {gameState.down = false; if (!gameState.s) {gameState.player.body.checkCollision.down = true}});
    
    //If P or ESC is pressed, bring up the pause menu
    this.input.keyboard.on('keydown-P', function () {if (gameState.play && gameState.dead === 0) {gameState.pause = true} else if (gameState.dead > 0) {gameState.escape = true}});
    this.input.keyboard.on('keydown-ESC', function () {if (gameState.play && gameState.dead === 0) {gameState.pause = true} else if (gameState.dead > 0) {gameState.escape = true}});
  }
  update() {
    //If it's time to reset/pause/resume, do so
    if (gameState.reset) {
      gameState.emergencyCancel++;
      gameState.sounds[5].stop();
      this.scene.restart();
    } else if (gameState.pause && gameState.play) {
      document.body.querySelector(".pause").style.left = 0;
      gameState.sounds[5].pause();
      game.pause();
    };

    //Movement & death check
    if (gameState.dead > 0) {
      if (gameState.velo != 0) {
        gameState.velo > 0 ? gameState.velo -= 20 : gameState.velo += 20;
        gameState.player.setVelocityX(gameState.velo);
      }
      if (gameState.dead === 1) {
        gameState.player.anims.stop();
        gameState.slimes.forEach((v) => {v[0].setVelocity(0, 0)});
        if (gameState.slimesKilled > gameState.highScore) {
          gameState.highScore = gameState.slimesKilled;
          localStorage.setItem("highScore", gameState.highScore);
          document.body.querySelector(".highScore").innerHTML = "High Score: " + gameState.highScore;
        }
        gameState.dead++;
        if (gameState.death === 0) {
          gameState.deathText.setText("You Died\nFinal Score: " + gameState.slimesKilled);
        } else {
          gameState.deathText.setText("The Scale Became Unbalanced\nFinal Score: " + gameState.slimesKilled)
        }
        timeEvent(() => {gameState.rect.alpha += 0.01}, 20, true, 85);
        let cancel = gameState.emergencyCancel;
        setTimeout(() => {
          if (cancel === gameState.emergencyCancel) {
            gameState.deathText.y = 250;
            gameState.returnToMenu.y = 400;
            gameState.replay = true;
          }
        }, 1700);
      }
    } else if (gameState.play) {
      controls();
      slimes();
      tilt();
    }
    if (gameState.replay && gameState.z) {gameState.reset = true}

    //Go back to the title
    if (gameState.escape) {
      gameState.escape = false;
      gameState.reset = true;
      gameState.play = false;
      document.body.querySelectorAll(".screen").forEach((e) => {e.style.left = "0%"});
    };
  };
};
