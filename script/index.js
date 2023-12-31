import { Angler1, Angler2, LuckyFish, Drone } from "./Enemy.js";
import { SmokeExplosion, FireExplosion } from "./Explosion.js";
import Particle from "./Particle.js";
import Player from "./Player.js";
import InputHandler from "./InputHandler.js";
import Shield from "./Shield.js";
import SoundController from "./SoundController.js";
import UI from "./UI.js";
import Background from "./Background.js";
// import Projectile from "./Projectile.js";
// import Layer from "./Layer.js";

window.addEventListener("load", function () {
  // canvas setup
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 700;
  canvas.height = 500;

  // moved the classese to separed files keaping parent class and child class together

  class Game {
    constructor(width, height) {
      // Initialize game properties
      this.width = width;
      this.height = height;
      this.background = new Background(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.sound = new SoundController();
      this.shield = new Shield(this);
      this.keys = [];
      this.enemies = [];
      this.particles = [];
      this.explosions = [];
      this.enemyTimer = 0;
      this.enemyInterval = 2000;
      this.ammo = 20;
      this.maxAmmo = 50;
      this.ammoTimer = 0;
      this.ammoInterval = 350;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 60;
      this.gameTime = 0;
      this.timeLimit = 30000;
      this.speed = 1;
      this.debug = false;
  }

    update(deltaTime) {
      // Update game logic
      if (!this.input.paused) {
        if (!this.gameOver) this.gameTime += deltaTime;
        if (this.gameTime > this.timeLimit) this.gameOver = true;
        this.background.update();
        this.background.layer4.update();
        this.player.update(deltaTime);
        if (this.ammoTimer > this.ammoInterval) {
          if (this.ammo < this.maxAmmo) this.ammo++;
          this.ammoTimer = 0;
        } else {
          this.ammoTimer += deltaTime;
        }
        this.shield.update(deltaTime);
        this.particles.forEach((particle) => particle.update());
        this.particles = this.particles.filter(
          (particle) => !particle.markedForDeletion
        );
        this.explosions.forEach((explosion) => explosion.update(deltaTime));
        this.explosions = this.explosions.filter(
          (explosion) => !explosion.markedForDeletion
        );
        this.enemies.forEach((enemy) => {
          enemy.update();
          if (this.checkCollision(this.player, enemy)) {
            enemy.markedForDeletion = true;
            this.addExplosion(enemy);
            this.sound.hit();
            this.shield.reset();
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            );
            if (enemy.type === "lucky") this.player.enterPowerUp();
            else if (!this.gameOver) this.score--;
          }
          this.player.projectiles.forEach((projectile) => {
            if (this.checkCollision(projectile, enemy)) {
              enemy.lives--;
              projectile.markedForDeletion = true;
              this.particles.push(
                new Particle(
                  this,
                  enemy.x + enemy.width * 0.5,
                  enemy.y + enemy.height * 0.5
                )
              );
              if (enemy.lives <= 0) {
                this.particles.push(
                  new Particle(
                    this,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5
                  )
                );
                enemy.markedForDeletion = true;
                this.addExplosion(enemy);
                this.sound.explosion();
                if (enemy.type === "moon") this.player.enterPowerUp();
                if (enemy.type === "hive") {
                  for (let i = 0; i < 5; i++) {
                    this.enemies.push(
                      new Drone(
                        this,
                        enemy.x + Math.random() * enemy.width,
                        enemy.y + Math.random() * enemy.height * 0.5
                      )
                    );
                  }
                }
                if (!this.gameOver) this.score += enemy.score;
                /* if (this.score > this.winningScore) this.gameOver = true; */
              }
            }
          });
        });
        this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
        if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
          this.addEnemy();
          this.enemyTimer = 0;
        } else {
          this.enemyTimer += deltaTime;
        }
      }
    }
    draw(context) {
      // Draw game elements
      this.background.draw(context);
      this.ui.draw(context);
      this.player.draw(context);
      this.shield.draw(context);
      this.particles.forEach((particle) => particle.draw(context));
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.explosions.forEach((explosion) => {
        explosion.draw(context);
      });
      this.background.layer4.draw(context);
    }
    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.3) this.enemies.push(new Angler1(this));
      else if (randomize < 0.6) this.enemies.push(new Angler2(this));
      else if (randomize < 0.9) this.enemies.push(new Drone(this));
      else this.enemies.push(new LuckyFish(this));
    }
    addExplosion(enemy) {
      const randomize = Math.random();
      if (randomize < 0.5) {
        this.explosions.push(
          new SmokeExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
      } else {
        this.explosions.push(
          new FireExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
      }
    }
    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
      );
    }
  }

  // Create a new instance of the Game class
  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;
  // Animation loop
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx);
    game.update(deltaTime);
    requestAnimationFrame(animate);
  }
  // Start the animation loop
  animate(0);
});
