var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 1344,
    height: 640,
    
    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [
        MainMenuScene,
        {
            key: 'main',
            preload: preload,
            create: create,
            update: update
        },
        PauseScene,
        GameOverScene,
        WinScene
    ]
};

var game = new Phaser.Game(config);

var path;
var enemies;
var turrets;
var bosses;
var map;

var ENEMY_SPEED = 1/20000;
var BOSS_SPEED = 1/40000;

// 0 Livre / -1 Caminho / 2 Obstáculo
const LEVEL_LAYOUT = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2,-1, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 0, 0, 0, 0, 0, 0,-1, 2, 2, 0, 2, 2, 0, 0, 2, 2],
    [2, 2, 2,-1,-1,-1,-1,-1,-1,-1, 2, 2, 0, 2, 2, 0, 0, 2, 2],
    [2, 0, 0,-1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 2, 0, 2, 2, 0, 2],
    [0, 0, 0,-1, 0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2],
    [2, 2, 0,-1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 2],
    [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 2],
    [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,-1, 2, 2],
];

const PATH_POINTS = [
    [9, 16], [6, 16], [6, 3], [2, 3], [2, 9], [0, 9] //linha dps coluna
];

const waveConfig = [
    {enemyCount: 10, type: 'goblin'},
    {enemyCount: 15, type: 'goblin'},
    {enemyCount: 20, type: 'goblin'},
    {enemyCount: 25, type: 'goblin'},
    {enemyCount: 1, type: 'boss'}
];

const TURRET_DATA = {
    'arqueira': {
        sprite: 'arqueira_1.png',
        attackSprite: 'arqueira_2.png',
        bulletSprite: 'arqueira_tiro.png',
        range: 200,
        damage: 1,
        fireRate: 1000,
        cost: 50,
        sfxTiro: 'atk_a',
        sfxPlace: 'spawn_a' 
    },
    'mago': {
        sprite: 'mago_1.png',
        attackSprite: 'mago_2.png',
        bulletSprite: 'mago_tiro.png',
        range: 175,
        damage: 2,
        fireRate: 1200,
        cost: 100,
        sfxTiro: 'atk_m',
        sfxPlace: 'spawn_m'
    },
    'cavaleiro': {
        sprite: 'cavaleiro_1.png',
        attackSprite: 'cavaleiro_2.png',
        bulletSprite: 'cavaleiro_tiro.png',
        range: 100,
        damage: 3,
        fireRate: 1500,
        cost: 150,
        sfxTiro: 'atk_c',
        sfxPlace: 'spawn_c'
    }
};

var Enemy = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Enemy(scene){
        Phaser.GameObjects.Sprite.call(this, scene, 0,0, 'sprites', 'goblin_1.png');
        this.follower = {t:0, vec: new Phaser.Math.Vector2()};
        this.hp = 0;
        this.goldValue = 5;
    },

    startOnPath: function(){
        this.follower.t = 0; 
        this.hp = 3;
        path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y); 
        this.play('walk');
    },
    receiveDamage: function(damage){
        this.hp -= damage;

        if (this.hp <= 0){
            this.setActive(false);
            this.setVisible(false);
            this.scene.addGold(this.goldValue);
        }
    },
    update: function(time, delta){
        if (this.follower.t >= 1){
            this.setActive(false);
            this.setVisible(false);
            this.scene.loseLife(1);
            return;
        } 
         this.follower.t += ENEMY_SPEED*delta;
        path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);

        var nextPoint = path.getPoint(this.follower.t + 0.01);
        if (nextPoint) { 
            var angle = Phaser.Math.Angle.Between(this.x, this.y, nextPoint.x, nextPoint.y);
            this.setRotation(angle + Math.PI / 2);
        }
    }
});

var Boss = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Boss(scene){
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'sprites', 'boss_1.png');
    this.follower = {t:0, vec: new Phaser.Math.Vector2()};
    this.hp = 0;
    this.goldValue = 100;
    },
    startOnPath: function(){
        this.follower.t = 0;
        this.hp = 20;
        path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
        this.setDisplaySize(128, 128);
        this.play('boss_walk');
    },
    receiveDamage: function(damage){
        this.hp -= damage;
        if (this.hp <= 0){
            this.setActive(false);
            this.setVisible(false);
            this.scene.addGold(this.goldValue);
        }
    },
    update: function(time, delta){
        if (!this.active){
            return;
        }
        if (this.follower.t >= 1){
            this.setActive(false);
            this.setVisible(false);
            this.scene.loseLife(10);
            return;
        }

        this.follower.t += BOSS_SPEED * delta;
        path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);

        var nextPoint = path.getPoint(this.follower.t + 0.01);
        if (nextPoint){
            var angle = Phaser.Math.Angle.Between(this.x, this.y, nextPoint.x, nextPoint.y);
            this.setRotation(angle + Math.PI / 2);
        }
    }
})

var Bullet = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,

    initialize:

    function Bullet(scene){
        Phaser.GameObjects.Image.call(this, scene, 0, 0, null);
        this.speed = 400;
        this.damage = 0;
        this.target = null;
        this.isNew = false;
    },
    fire: function(startX, startY, target, damage, texture){
        this.setPosition(startX, startY);
        this.setTexture('sprites', texture);
        this.target = target;
        this.damage = damage;
        this.setActive(true);
        this.setVisible(true);

        this.isNew = true;
        this.scene.time.delayedCall(50, () => {
            if (this.active) {
                this.isNew = false;
            }
        }, [], this);
        
        var angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.setRotation(angle - Math.PI / 2);

        this.scene.physics.moveToObject(this, this.target, this.speed);
    },
    update: function(time, delta){
        const width = this.scene.sys.game.config.width;
        const height = this.scene.sys.game.config.height;

        if (this.y < -50 || this.y > height + 50 || this.x < -50 || this.x > width + 50){
            this.setActive(false);
            this.setVisible(false);
        }
    }
});

var Turret = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,

    initialize: 
    function Turret(scene){
        Phaser.GameObjects.Sprite.call(this, scene, 0, 0, null);
        this.nextTic = 0;
        
        this.level = 1;
        this.damage = 0;
        this.range = 0;
        this.fireRate = 0;
        this.upgradeCost = 0;
        this.totalInvested = 0;

        this.idleSprite = '';
        this.attackSprite = '';
        this.bulletSprite = '';
    },

    configure: function(data){
        this.idleSprite = data.sprite;
        this.attackSprite = data.attackSprite;
        this.bulletSprite = data.bulletSprite;
        this.sfxTiro = data.sfxTiro;
        
        this.setTexture('sprites', data.sprite);
        this.damage = data.damage;
        this.range = data.range;
        this.fireRate = data.fireRate;
        
        this.upgradeCost = Math.floor(data.cost * 1.5); 
        this.totalInvested = data.cost;
    },
    
    place: function(i, j) {
        this.y = i * 64 + 32;
        this.x = j * 64 + 32;
        map[i][j] = 1;

        this.setInteractive({ useHandCursor: true, pixelPerfect: true });
    },

    upgrade: function() {
        this.level++;
        
        this.damage = Math.floor(this.damage * 1.2);
        this.range = Math.floor(this.range * 1.1);
        this.fireRate = Math.floor(this.fireRate * 0.9);

        this.totalInvested += this.upgradeCost;
        this.upgradeCost = Math.floor(this.upgradeCost * 1.75);
    },

    sell: function() {
        const refundAmount = Math.floor(this.totalInvested / 2);
        
        const i = Math.floor(this.y / 64);
        const j = Math.floor(this.x / 64);
        map[i][j] = 0;

        this.destroy();

        return refundAmount;
    },

    getEnemyInRange: function(){
        var allEnemies = this.scene.enemies.getChildren().concat(this.scene.bosses.getChildren());
        var closestEnemy = null;
        var closestDistance = this.range;
    
        allEnemies.forEach(enemy => {
            if (enemy.active){
                var distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (distance < closestDistance){
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }
        });
        return closestEnemy;
    },
    
    fire: function(time, enemy){
        var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
        this.setRotation(angle - Math.PI / 2);
        
        if (time > this.nextTic){
            this.scene.sound.play(this.sfxTiro, { volume: 0.3 });
            this.setTexture('sprites', this.attackSprite);

            var bullet = this.scene.bullets.get();
            if (bullet){
                bullet.fire(this.x, this.y, enemy, this.damage, this.bulletSprite);
            }

            this.scene.time.delayedCall(100, () => {
                if (this.active){
                    this.setTexture('sprites', this.idleSprite);
                }
            });
            this.nextTic = time + this.fireRate;
        }
    },
    
    update: function(time, delta) {
        if (!this.active){
            return;
        }
        var enemy = this.getEnemyInRange();
        if (enemy){
            this.fire(time, enemy);
        }
    }
});

function preload(){ //carregar sprites
    this.load.atlas('sprites', 'assets/game_assets.png', 'assets/game_assets.json');
    this.load.atlas('upgrades', 'assets/levelup_assets.png', 'assets/levelup_assets.json');

    this.load.image('mapa', 'assets/bubu.png');
    this.load.image('icon_cavaleiro', 'assets/cavaleiro.png');
    this.load.image('icon_arqueira', 'assets/arqueira.png');
    this.load.image('icon_mago', 'assets/mago.png');

    this.load.image('vida', 'assets/coracao.png');
    this.load.image('ouro', 'assets/ouro.png');

    this.load.audio('atk_c', 'assets/cavaleiro_ataque.mp3');
    this.load.audio('atk_m', 'assets/mago_ataque.mp3');
    this.load.audio('atk_a', 'assets/arqueira_ataque.mp3');
    this.load.audio('boss_spawn', 'assets/boss_t.mp3');
    this.load.audio('boss_death', 'assets/boss_d.mp3');
    this.load.audio('spawn_a', 'assets/arqueira_spawn.mp3');
    this.load.audio('spawn_m', 'assets/mago_spawn.mp3');
    this.load.audio('spawn_c', 'assets/cavaleiro_spawn.mp3');
    this.load.audio('music', 'assets/musica_tema.mp3');
    
}

function create() {

    const background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'mapa');
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.sound.play('music', { loop: true, volume: 0.1 });

    const G_WIDTH = this.sys.game.config.width;
    const G_HEIGHT = this.sys.game.config.height;
    const ROWS = Math.floor(G_HEIGHT / 64);
    const COLS = Math.floor(G_WIDTH / 64);

    map = [];
    for (let i = 0; i < ROWS; i++) {
        map.push(new Array(COLS).fill(0));
    }

    for (let i = 0; i < LEVEL_LAYOUT.length; i++) {
        if (map[i]) {
            for (let j = 0; j < LEVEL_LAYOUT[i].length; j++) {
                if (map[i][j] !== undefined) {
                    map[i][j] = LEVEL_LAYOUT[i][j];
                }
            }
        }
    }

    var graphics = this.add.graphics();
    drawGrid(graphics);

    const startPoint = gridToPixels(PATH_POINTS[0][0], PATH_POINTS[0][1]);
    path = this.add.path(startPoint.x, startPoint.y);

    for (let i = 1; i < PATH_POINTS.length; i++) {
        const nextPoint = gridToPixels(PATH_POINTS[i][0], PATH_POINTS[i][1]);
        path.lineTo(nextPoint.x, nextPoint.y);
    }

    this.enemies = this.physics.add.group({
        classType: Enemy, runChildUpdate: true
    });
    this.bosses = this.physics.add.group({
        classType: Boss, runChildUpdate: true
    });
    this.turrets = this.add.group({
        classType: Turret, runChildUpdate: true
    });
    this.bullets = this.physics.add.group({
        classType: Bullet, runChildUpdate: true
    });

    this.physics.add.overlap(this.enemies, this.bullets, bulletHitEnemy, null, this);
    this.physics.add.overlap(this.bosses, this.bullets, bulletHitEnemy, null, this);

    this.playerLives = 20;
    this.playerGold = 100;
    this.isGameOver = false;

    const uiX = 30;
    const uiY_lives = 30;
    const uiY_gold = 70;

    this.add.image(uiX, uiY_lives, 'vida')
    .setOrigin(0.5)
    .setScale(0.5) 
    .setScrollFactor(0);

    this.livesText = this.add.text(uiX + 35, uiY_lives, this.playerLives, { 
    fontSize: '20px',
    fill: '#FFF',
    stroke: '#000000',   
    strokeThickness: 3
}).setOrigin(0.5).setScrollFactor(0);


    this.add.image(uiX, uiY_gold, 'ouro')
    .setOrigin(0.5)
    .setScale(0.5) 
    .setScrollFactor(0);

    this.goldText = this.add.text(uiX + 35, uiY_gold, this.playerGold, { 
    fontSize: '20px', 
    fill: '#FFF',
    stroke: '#000000',   
    strokeThickness: 3
}).setOrigin(0.5).setScrollFactor(0);

    this.addGold = (amount) => {
        if (this.isGameOver) return;
        this.playerGold += amount;
        this.goldText.setText(this.playerGold);
    };

    this.loseLife = (amount) => {
        if (this.isGameOver) return;
        this.playerLives -= amount;
        this.livesText.setText(this.playerLives);
        if (this.playerLives <= 0){
            this.isGameOver = true;
            this.sound.stopAll();
            this.scene.start('GameOverScene');
        }
    };
    
    //Waves
    this.currentWaveIndex = -1;
    this.enemiesToSpawn = 0;
    this.isWaveRunning = false;
    this.nextEnemyTime = 0;

    const buttonX = this.sys.game.config.width - 20;
    const buttonY = this.sys.game.config.height - 20;

    this.nextWaveButton = this.add.text(buttonX, buttonY, '▶',{
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: {x: 20, y: 10}
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

    this.nextWaveButton.on('pointerdown', () =>{
        this.isWaveRunning = true;
        this.currentWaveIndex++;
        this.enemiesToSpawn = waveConfig[this.currentWaveIndex].enemyCount;
        this.nextWaveButton.setVisible(false);
    });
    //Posicionamento de torres
    this.selectedTurretType = null;
    this.placementPreview = this.add.sprite(0,0, null).setAlpha(0.5).setVisible(false);
    this.placementRangeCircle = this.add.graphics().setVisible(false);

    var archerButton = this.add.image(G_WIDTH - 60, 100, 'icon_arqueira', 'arqueira.png').setScale(0.1).setInteractive().setScrollFactor(0);
    var mageButton = this.add.image(G_WIDTH - 60, 300, 'icon_mago', 'mago.png').setScale(0.1).setInteractive().setScrollFactor(0);
    var knightButton = this.add.image(G_WIDTH - 60, 500, 'icon_cavaleiro', 'cavaleiro.png').setScale(0.1).setInteractive().setScrollFactor(0);

    archerButton.on('pointerdown', () => selectTurret.call(this, 'arqueira'));
    mageButton.on('pointerdown', () => selectTurret.call(this, 'mago'));
    knightButton.on('pointerdown', () => selectTurret.call(this, 'cavaleiro'));

    this.input.on('pointerdown', placeTurret, this);
    this.input.on('pointermove', movePlacementPreview, this);
    // Animações
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('sprites', {
            prefix: 'goblin_',
            suffix: '.png',
            start: 1,
            end: 3
        }),
        frameRate: 8,
        repeat: -1
    });
    this.anims.create({
        key: 'boss_walk',
        frames: this.anims.generateFrameNames('sprites', {
            prefix: 'goblin_grande_',
            suffix: '.png',
            start: 1,
            end: 3
        }),
        frameRate: 6,
        repeat: -1
    });

    this.selectedTurret = null; 
    this.selectedTurretType = null;
    this.placementPreview = this.add.sprite(0,0, null).setAlpha(0.5).setVisible(false).setDepth(1);
    this.placementRangeCircle = this.add.graphics().setVisible(false).setDepth(1);

    createUpgradeUI.call(this);
    this.input.on('pointermove', movePlacementPreview, this);

    this.input.on('gameobjectdown', (pointer, gameObject) => {
        if (gameObject instanceof Turret) {
            selectTurretForUI.call(this, gameObject);
        }
    });

    this.input.on('pointerdown', (pointer) => {
        if (pointer.x > this.sys.game.config.width - 128) {
            return;
        }

        if (this.upgradeUI.visible && this.upgradeUI.getBounds().contains(pointer.x, pointer.y)) {
            return;
        }
        
        if (this.selectedTurretType) {
            const i = Math.floor(pointer.y / 64);
            const j = Math.floor(pointer.x / 64);
            const turretData = TURRET_DATA[this.selectedTurretType];

            if (canPlaceTurret(i, j) && this.playerGold >= turretData.cost) {
                this.playerGold -= turretData.cost;
                this.goldText.setText('Ouro: ' + this.playerGold);
                const turret = this.turrets.get();
                if (turret) {
                    turret.setActive(true).setVisible(true).configure(turretData);
                    turret.place(i, j);
                }
                this.selectedTurretType = null;
                this.placementPreview.setVisible(false);
                this.placementRangeCircle.setVisible(false);
            }
        } else {
            hideUpgradeUI.call(this);
        }
    });

        this.input.keyboard.on('keydown-ESC', () => {
            this.sound.pauseAll();
            this.scene.pause(); 
            this.scene.launch('PauseScene'); 
        }, this);

        this.events.on('resume', () => {
        this.sound.resumeAll(); 
    });
}

function update(time,delta){

    if (this.isGameOver) return;
    
    if (this.isWaveRunning && this.enemiesToSpawn > 0 && time > this.nextEnemyTime) {
        const waveData = waveConfig[this.currentWaveIndex];
        var unit;

        if (waveData.type === 'boss'){
            unit = this.bosses.get();
        } else{
            unit = this.enemies.get();
        }
        if (unit) {
            unit.setActive(true);
            unit.setVisible(true);
            unit.startOnPath();
            this.enemiesToSpawn--;
            this.nextEnemyTime = time + 2000;
        }
    }

    if (this.isWaveRunning && this.enemiesToSpawn === 0 && this.enemies.countActive() === 0 && this.bosses.countActive() === 0) {
        this.isWaveRunning = false;

        if (this.currentWaveIndex + 1 >= waveConfig.length){
            this.sound.stopAll(); 
            this.scene.start('WinScene'); 
        } else{
            this.addGold(20);
            this.nextWaveButton.setText('▶');
            this.nextWaveButton.setVisible(true);
        }
    }

}

function bulletHitEnemy(enemy, bullet){
        if (enemy.active && bullet.active && !bullet.isNew){
            bullet.setActive(false);
            bullet.setVisible(false);
            enemy.receiveDamage(bullet.damage);
        }
    }

function gridToPixels(i, j) {
    return {
        x: j * 64 + 32, 
        y: i * 64 + 32  
    };
}

function drawGrid(graphics) {
    const rows = map.length;
    const cols = map[0].length;
    graphics.lineStyle(1, 0x000000, 0.1); 
    for (var i = 0; i < rows; i++) {
        graphics.moveTo(0, i * 64);
        graphics.lineTo(cols * 64, i * 64);
    }
    for (var j = 0; j < cols; j++) {
        graphics.moveTo(j * 64, 0);
        graphics.lineTo(j * 64, rows * 64);
    }
    graphics.strokePath();
}

function canPlaceTurret(i, j) {
    return i >= 0 && i < map.length && j >= 0 && j < map[0].length && map[i][j] === 0;
}

function selectTurret(type) {
    this.selectedTurretType = type;
    const turretData = TURRET_DATA[type];
    this.placementPreview.setTexture('sprites', turretData.sprite).setVisible(true);
    this.placementRangeCircle.clear().lineStyle(2, 0xffffff, 0.5).strokeCircle(0, 0, turretData.range).setVisible(true);
}

function movePlacementPreview(pointer){
    if (this.selectedTurretType){
        const i = Math.floor(pointer.y / 64);
        const j = Math.floor(pointer.x / 64);
        const x = j * 64 + 32;
        const y = i * 64 + 32;

        this.placementPreview.setPosition(x, y);
        this.placementRangeCircle.setPosition(x, y);

        if (!canPlaceTurret(i, j)){
            this.placementPreview.setTint(0xff0000);
        }else{
            this.placementPreview.clearTint();
        }
    }
}

function placeTurret(pointer) {

    if (pointer.x > this.sys.game.config.width - 128)
        return;
    

    if (this.selectedTurretType) {
        const i = Math.floor(pointer.y / 64);
        const j = Math.floor(pointer.x / 64);
        const turretData = TURRET_DATA[this.selectedTurretType];

        if (canPlaceTurret(i, j) && this.playerGold >= turretData.cost) {
            this.sound.play(turretData.sfxPlace, { volume: 0.3 });
            this.playerGold -= turretData.cost;
            this.goldText.setText('Ouro: ' + this.playerGold);
            var turret = this.turrets.get();
            if (turret) {
                turret.setActive(true);
                turret.setVisible(true);
                turret.configure(turretData);
                turret.place(i, j);
            }
            this.selectedTurretType = null;
            this.placementPreview.setVisible(false);
            this.placementRangeCircle.setVisible(false);
        }
    }
}

function createUpgradeUI() {
   
    const upgradeText = this.add.text(0, -15, 'Upgrade', {
        fontSize: '14px', 
        color: '#fff', 
        backgroundColor: '#333', 
        padding: {x:5, y:5}
    }).setOrigin(0.5).setInteractive();
    
    const sellText = this.add.text(0, 15, 'Vender', {
        fontSize: '14px', 
        color: '#fff', 
        backgroundColor: '#333', 
        padding: {x:5, y:5}
    }).setOrigin(0.5).setInteractive();
    
    this.upgradeUI = this.add.container(0, 0, [upgradeText, sellText]);
    this.upgradeUI.setVisible(false).setDepth(1); 

    upgradeText.on('pointerdown', () => {
        if (this.selectedTurret && this.playerGold >= this.selectedTurret.upgradeCost) {
            this.playerGold -= this.selectedTurret.upgradeCost;
            this.goldText.setText('Ouro: ' + this.playerGold);
            this.selectedTurret.upgrade();
            hideUpgradeUI.call(this); 
        }
    });

    sellText.on('pointerdown', () => {
        if (this.selectedTurret) {
            const refund = this.selectedTurret.sell();
            this.playerGold += refund;
            this.goldText.setText('Ouro: ' + this.playerGold);
            this.selectedTurret = null;
            hideUpgradeUI.call(this);
        }
    });
}

function selectTurretForUI(turret) {
    if (this.selectedTurret === turret) {
        hideUpgradeUI.call(this);
        return;
    }

    this.selectedTurret = turret;
    
    const upgradeButtonText = this.upgradeUI.getAt(0); 
    upgradeButtonText.setText(`Up: Lvl ${turret.level + 1} (${turret.upgradeCost}G)`);

    const sellButtonText = this.upgradeUI.getAt(1);
    const refundAmount = Math.floor(turret.totalInvested / 2);
    sellButtonText.setText(`Vender (${refundAmount}G)`);

    this.upgradeUI.setPosition(turret.x, turret.y - 45);
    this.upgradeUI.setVisible(true);
}

function hideUpgradeUI() {
    if (this.upgradeUI) {
        this.upgradeUI.setVisible(false);
    }
    this.selectedTurret = null;
}


