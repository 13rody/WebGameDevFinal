class Scene1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Scene1' });
    }

    preload() {
        this.load.image('player', ' /assets/images/player.png');
        this.load.image('enemy1', ' /assets/images/enemy1.png');
        this.load.image('enemy2', ' /assets/images/enemy2.png');
        this.load.image('bullet', ' /assets/images/bullet.png');
        this.load.once('complete', function () {
            console.log('All assets loaded');
        });
    }

    async create() {
        // Fetch weather data and update the background
        const weather = await this.fetchWeather();
        this.updateBackground(weather);

        // Player setup
        this.player = this.physics.add.sprite(400, 300, 'player').setScale(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(this.player.width * 0.3, this.player.height * 0.3);
        this.player.setOffset((this.player.width - this.player.displayWidth) / 2, (this.player.height - this.player.displayHeight) / 2);

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

        // Movement controls
        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        if (this.cursors.right.isDown) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        // Shooting
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) this.shootBullet();
    }

    shootBullet() {
        const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet').setScale(0.1);
        bullet.setVelocityY(-300);
        bullet.setCollideWorldBounds(true);
        bullet.on('worldbounds', () => bullet.destroy()); // Properly destroy bullet when it goes out of bounds
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(0, 800);
        const y = -50; // Spawn above the screen
        const enemyType = Phaser.Math.Between(1, 2) === 1 ? 'enemy1' : 'enemy2';
        const enemy = this.enemies.create(x, y, enemyType).setScale(0.1);
        enemy.setSize(enemy.width * 0.3, enemy.height * 0.3);
        enemy.setOffset((enemy.width - enemy.displayWidth) / 2, (enemy.height - enemy.displayHeight) / 2);
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

    // Fetch weather data using the Fetch API
    async fetchWeather() {
        try {
            const apiKey = 'your_api_key'; // Replace with your actual API key
            const city = 'London'; // You can use geolocation to fetch the user's city dynamically
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
            const data = await response.json();
            return data.weather[0].main.toLowerCase(); // Get the weather condition (e.g., "clear", "rain", "clouds")
        } catch (error) {
            console.error('Error fetching weather:', error);
            return 'clear'; // Default to clear if there's an error
        }
    }

    // Update the background color based on the weather condition
    updateBackground(weather) {
        switch (weather) {
            case 'clear':
                this.cameras.main.setBackgroundColor(0x87CEEB); // Light blue for sunny weather
                break;
            case 'rain':
                this.cameras.main.setBackgroundColor(0xA9A9A9); // Gray for rainy weather
                break;
            case 'clouds':
                this.cameras.main.setBackgroundColor(0xB0C4DE); // Light gray for cloudy weather
                break;
            default:
                this.cameras.main.setBackgroundColor(0xFFFFFF); // White as a fallback
                break;
        }
    }
}
