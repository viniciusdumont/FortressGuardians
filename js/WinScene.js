class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    preload() {
        this.load.image('vitoria', 'assets/tela_vitoria.png');
        this.load.image('botaom', 'assets/botao_return.png');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        const background = this.add.image(screenWidth / 2, screenHeight / 2, 'vitoria');
        background.setDisplaySize(screenWidth, screenHeight);

        this.add.text(screenWidth / 2, screenHeight / 3, 'Você Venceu!', {
            fontSize: '48px',
            fill: '#FFD700', 
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        const menuButton = this.add.image(screenWidth / 2, screenHeight / 2 + 225, 'botaom')
            .setScale(0.6)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

            menuButton.on('pointerover', () => menuButton.setTint(0xcccccc));
            menuButton.on('pointerout', () => menuButton.clearTint());
            menuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene'); 
        });
    }
}