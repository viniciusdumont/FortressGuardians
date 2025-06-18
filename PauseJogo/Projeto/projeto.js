let musicMuted = false;
let sfxMuted = false;
let musicVolume = 1;
let sfxVolume = 1;

// Música
function toggleMusic() {
  musicMuted = !musicMuted;
  document.getElementById('musicStatus').innerText = musicMuted ? 'Mutado' : 'Ativo';
  const music = document.getElementById('bgm');
  if (music) music.muted = musicMuted;
}

// Efeitos
function toggleSfx() {
  sfxMuted = !sfxMuted;
  document.getElementById('sfxStatus').innerText = sfxMuted ? 'Mutado' : 'Ativo';
  const sfx = document.querySelectorAll('.sfx');
  sfx.forEach(effect => effect.muted = sfxMuted);
}

// Controle de volume
function changeVolume(type, delta) {
  if (type === 'music') {
    const music = document.getElementById('bgm');
    if (!music) return;

    musicVolume = Math.min(1, Math.max(0, music.volume + delta));
    music.volume = musicVolume;

    document.getElementById('musicVolumeLabel').innerText = Math.round(musicVolume * 100) + '%';

    if (musicVolume === 0) {
      musicMuted = true;
      music.muted = true;
      document.getElementById('musicStatus').innerText = 'Mutado';
    } else {
      musicMuted = false;
      music.muted = false;
      document.getElementById('musicStatus').innerText = 'Ativo';
    }
  }

  if (type === 'sfx') {
    const sfxs = document.querySelectorAll('.sfx');
    if (sfxs.length === 0) return;

    sfxVolume = Math.min(1, Math.max(0, sfxs[0].volume + delta));
    sfxs.forEach(sfx => sfx.volume = sfxVolume);

    document.getElementById('sfxVolumeLabel').innerText = Math.round(sfxVolume * 100) + '%';

    if (sfxVolume === 0) {
      sfxMuted = true;
      sfxs.forEach(sfx => sfx.muted = true);
      document.getElementById('sfxStatus').innerText = 'Mutado';
    } else {
      sfxMuted = false;
      sfxs.forEach(sfx => sfx.muted = false);
      document.getElementById('sfxStatus').innerText = 'Ativo';
    }
  }
}

// Função para tocar efeitos sonoros
function playSfx(src) {
  const sfx = new Audio(src);
  sfx.volume = sfxVolume;
  sfx.muted = sfxMuted;
  sfx.play();
}

// Tela de pause
function pauseGame() {
  document.getElementById('pauseScreen').classList.remove('hidden');
}

function resumeGame() {
  document.getElementById('pauseScreen').classList.add('hidden');
}

function exitToMenu() {
  alert('Voltando para o menu...');
  // window.location.href = 'menu.html';
}

// Inicialização dos volumes
window.onload = () => {
  const music = document.getElementById('bgm');
  if (music) {
    musicVolume = music.volume;
    document.getElementById('musicVolumeLabel').innerText = Math.round(musicVolume * 100) + '%';
  }
  const sfxs = document.querySelectorAll('.sfx');
  if (sfxs.length > 0) {
    sfxVolume = sfxs[0].volume;
    document.getElementById('sfxVolumeLabel').innerText = Math.round(sfxVolume * 100) + '%';
  }
};
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const pauseScreen = document.getElementById('pauseScreen');
    if (pauseScreen.classList.contains('hidden')) {
      pauseGame();
    } else {
      resumeGame();
    }
  }
});

