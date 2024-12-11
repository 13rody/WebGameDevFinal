class Scene1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Scene1' });
    }

    preload() {
        this.load.image('player', 'assets/images/player.png');
        this.load.image('enemy1', 'assets/images/enemy1.png');
        this.load.image('enemy2', 'assets/images/enemy2.png');
        this.load.image('bullet', 'assets/images/bullet.png');
    }

    create() {
        // Player setup
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);

        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Enemy group
        this.enemies = this.physics.add.group();

        // Bullet group
        this.bullets = this.physics.add.group();

        // Spawn enemies periodically
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Collision detection
        this.physics.add.overlap(this.bullets, this.enemies, this.destroyEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);

        // Score display
        this.score = 0;
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });

        // Health
        this.health = 3;
        this.healthText = this.add.text(10, 40, 'Health: 3', { fontSize: '20px', fill: '#fff' });
    }

    update() {
        const speed = 200;

        // Reset player velocity
        this.player.setVelocity(0);

        // Movement controls
        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        if (this.cursors.right.isDown) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        // Shooting
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) this.shootBullet();
    }

    shootBullet() {
        const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
        bullet.setVelocityY(-300);
        bullet.setCollideWorldBounds(true);
        bullet.on('worldbounds', () => bullet.destroy());
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(0, 800);
        const y = -50; // Spawn above the screen
        const enemyType = Phaser.Math.Between(1, 2) === 1 ? 'enemy1' : 'enemy2';
        const enemy = this.enemies.create(x, y, enemyType);
        enemy.setVelocityY(100);
    }

    destroyEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    gameOver(player, enemy) {
        this.physics.pause();
        this.add.text(300, 250, 'Game Over', { fontSize: '40px', fill: '#fff' });
        player.setTint(0xff0000);
    }
}

