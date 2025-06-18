class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'JOGO PAUSADO', {
            fontSize: '48px',
            fill: '#FFF',
            fontFamily: '"Press Start 2P"' 
        }).setOrigin(0.5);

        const resumeButton = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Continuar', {
            fontSize: '32px',
            fill: '#FFF',
            backgroundColor: '#d9975a',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        resumeButton.on('pointerdown', () => {
            this.scene.stop(); 
            this.scene.resume('main'); 
        });

        const exitButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 80, 'Sair para o Menu', {
            fontSize: '24px',
            fill: '#FFF',
            backgroundColor: '#a96e3a',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        exitButton.on('pointerdown', () => {
            this.scene.stop('main'); 
            this.scene.start('MainMenuScene'); 
        });
    }
}