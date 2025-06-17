var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: window.innerWidth,
    height: window.innerHeight,
    
    scale: {
        mode: Phaser.Scale.RESIZE, 
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
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
    [0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
    [0,-1,-1,-1,-1,-1,-1,-1,-1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const PATH_POINTS = [
    [1, 18], [1, 1], [4, 1], [4, 8], [9, 8]
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
        cost: 50
    },
    'mago': {
        sprite: 'mago_1.png',
        attackSprite: 'mago_2.png',
        bulletSprite: 'mago_tiro.png',
        range: 175,
        damage: 2,
        fireRate: 1200,
        cost: 100
    },
    'cavaleiro': {
        sprite: 'cavaleiro_1.png',
        attackSprite: 'cavaleiro_2.png',
        bulletSprite: 'cavaleiro_tiro.png',
        range: 100,
        damage: 3,
        fireRate: 1500,
        cost: 150
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
    Extends: Phaser.GameObjects.Sprite, //mudar para sprite

    initialize: 

    function Turret(scene){
        Phaser.GameObjects.Sprite.call(this, scene, 0, 0, null);
        this.range = 0;
        this.damage = 0;
        this.nextTic = 0;
        this.fireRate = 0;
        this.idleSprite = '';
        this.attackSprite = '';
        this.bulletSprite = '';
    },

    configure: function(data){
        this.idleSprite = data.sprite;
        this.attackSprite = data.attackSprite;
        this.bulletSprite = data.bulletSprite;
        
        this.setTexture('sprites', data.sprite);
        this.damage = data.damage;
        this.range = data.range;
        this.fireRate = data.fireRate;
        // dilpaySize
    },
    place: function(i, j) {
        this.y = i * 64 + 32;
        this.x = j * 64 + 32;
        map[i][j] = 1;
    },

    getEnemyInRange: function(){
        var allEnemies = enemies.getChildren().concat(bosses.getChildren());
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
            this.setTexture('sprites', this.attackSprite);

            var bullet = bullets.get();
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
}

function create() {

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

    enemies = this.physics.add.group({
        classType: Enemy, runChildUpdate: true
    });
    bosses = this.physics.add.group({
        classType: Boss, runChildUpdate: true
    });
    turrets = this.add.group({
        classType: Turret, runChildUpdate: true
    });
    bullets = this.physics.add.group({
        classType: Bullet, runChildUpdate: true
    });

    this.physics.add.overlap(enemies, bullets, bulletHitEnemy);
    this.physics.add.overlap(bosses, bullets, bulletHitEnemy);

    this.playerLives = 20;
    this.playerGold = 100;
    this.isGameOver = false;

    this.livesText = this.add.text(16, 16, 'Vida: ' + this.playerLives, { fontSize: '20px', fill: '#FFF' }).setScrollFactor(0);
    this.goldText = this.add.text(16, 40, 'Ouro: ' + this.playerGold, { fontSize: '20px', fill: '#FFF' }).setScrollFactor(0);


    this.addGold = (amount) => {
        if (this.isGameOver) return;
        this.playerGold += amount;
        this.goldText.setText('Ouro: ' + this.playerGold);
    };

    this.loseLife = (amount) => {
        if (this.isGameOver) return;
        this.playerLives -= amount;
        this.livesText.setText('Vidas: ' + this.playerLives);
        if (this.playerLives <= 0){
            this.isGameOver = true;
            this.nextWaveButton.setText('Fim de Jogo').setVisible(true).disableInteractive();
        }
    };
    
    //Waves
    this.currentWaveIndex = -1;
    this.enemiesToSpawn = 0;
    this.isWaveRunning = false;
    this.nextEnemyTime = 0;

    this.nextWaveButton = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height /2, 'Iniciar Jogo',{
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: {x: 20, y: 10}
    }).setOrigin(0.5).setInteractive();

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

    var archerButton = this.add.sprite(G_WIDTH - 60, 100, 'sprites', 'arqueira_1.png').setInteractive().setScrollFactor(0);
    var mageButton = this.add.sprite(G_WIDTH - 60, 200, 'sprites', 'mago_1.png').setInteractive().setScrollFactor(0);
    var knightButton = this.add.sprite(G_WIDTH - 60, 300, 'sprites', 'cavaleiro_1.png').setInteractive().setScrollFactor(0);

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
}

function update(time,delta){

    if (this.isGameOver) return;
    
    if (this.isWaveRunning && this.enemiesToSpawn > 0 && time > this.nextEnemyTime) {
        const waveData = waveConfig[this.currentWaveIndex];
        var unit;

        if (waveData.type === 'boss'){
            unit = bosses.get();
        } else{
            unit = enemies.get();
        }
        if (unit) {
            unit.setActive(true);
            unit.setVisible(true);
            unit.startOnPath();
            this.enemiesToSpawn--;
            this.nextEnemyTime = time + 2000;
        }
    }

    if (this.isWaveRunning && this.enemiesToSpawn === 0 && enemies.countActive() === 0 && bosses.countActive() === 0) {
        this.isWaveRunning = false;

        if (this.currentWaveIndex + 1 >= waveConfig.length){
            this.nextWaveButton.setText('Você venceu!').setVisible(true);
            this.nextWaveButton.disableInteractive(); //desativa o ultimo botao
        } else{
            this.addGold(20);
            this.nextWaveButton.setText('Próxima Onda (' + (this.currentWaveIndex + 2) + ')');
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
            this.playerGold -= turretData.cost;
            this.goldText.setText('Ouro: ' + this.playerGold);
            var turret = turrets.get();
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
