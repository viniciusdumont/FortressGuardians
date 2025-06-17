let musicMuted = false;
  let sfxMuted = false;

  function pauseGame() {
    document.getElementById('pauseScreen').classList.remove('hidden');
  }

  function resumeGame() {
    document.getElementById('pauseScreen').classList.add('hidden');
  }

  function exitToMenu() {
    alert('Voltando para o menu...');
    // window.location.href = 'menu.html'; // Descomente se tiver um menu
  }

  function toggleMusic() {
    musicMuted = !musicMuted;
    document.getElementById('musicStatus').innerText = musicMuted ? 'Mutada' : 'Ativa';
    const music = document.getElementById('bgm');
    if (music) music.muted = musicMuted;
  }

  function toggleSfx() {
    sfxMuted = !sfxMuted;
    document.getElementById('sfxStatus').innerText = sfxMuted ? 'Mutados' : 'Ativos';
    const sfx = document.querySelectorAll('.sfx');
    sfx.forEach(effect => effect.muted = sfxMuted);
  }