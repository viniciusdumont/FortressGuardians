class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload(){
        this.load.image('MenuIMG', 'assets/menu_inicial.png');
        this.load.image('Botao', 'assets/botao_menu.png');
        this.load.audio('MenuMusic', 'assets/musica_menu.mp3');
        this.load.image('SomOn', 'assets/som_on.png');
        this.load.image('SomOff', 'assets/som_off.png');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        const background = this.add.image(0, 0, 'MenuIMG').setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        if (!this.sound.get('MenuMusic') || !this.sound.get('MenuMusic').isPlaying) {
        this.sound.play('MenuMusic', { loop: true, volume: 0.5 });
        }

        const playButton = this.add.image(627, 540, 'Botao')
        .setOrigin(0.5)
        .setScale(0.89);

        playButton.setInteractive({ useHandCursor: true });

        playButton.on('pointerover', () => {
        playButton.setTint(0xcccccc); 
    });

        playButton.on('pointerout', () => {
        playButton.clearTint(); 
    });

        playButton.on('pointerdown', () => {
        playButton.setTint(0x999999);
        this.sound.stopByKey('MenuMusic');
        this.scene.start('main');
        });

        const muteButtonX = screenWidth - 20;
        const muteButtonY = 20;

        const initialTexture = this.sound.mute ? 'SomOn' : 'SomOff';

        const muteButton = this.add.image(muteButtonX, muteButtonY, initialTexture)
        .setOrigin(1, 0) // Origem no canto superior direito para facilitar o alinhamento
        .setScale(0.8)   // Ajuste o tamanho do ícone se necessário
        .setInteractive({ useHandCursor: true });

        muteButton.on('pointerdown', () => {
        this.sound.mute = !this.sound.mute;
        
        if (this.sound.mute) {
            muteButton.setTexture('SomOn');
        }else {
            muteButton.setTexture('SomOff');
        }
    });
}

}
