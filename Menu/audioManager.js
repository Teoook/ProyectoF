// audioManager.js - Solo música de fondo
class AudioManager {
    constructor() {
        this.audio = null;
        this.currentVolume = 70;
        this.init();
    }

    init() {
        // Cargar volumen guardado
        const savedConfig = localStorage.getItem('zombieAudioConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            this.currentVolume = parseInt(config.music) || 70;
        }

        // Crear audio
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.volume = this.currentVolume / 100;
        
        // ⚠️ CAMBIA "tu-musica.mp3" por el nombre de tu archivo ⚠️
        this.audio.src = '/Audios/PP.mp3';
        
        this.audio.load();
        
        // Reproducir cuando el usuario haga clic
        document.addEventListener('click', () => {
            this.play();
        }, { once: true });
        
        // Intentar reproducir automaticamente
        this.audio.play().catch(() => {
            console.log('Esperando clic del usuario');
        });
    }

    play() {
        if (this.audio) {
            this.audio.play().catch(e => console.log('Error:', e));
        }
    }

    setVolume(volume) {
        this.currentVolume = Math.min(100, Math.max(0, volume));
        if (this.audio) {
            this.audio.volume = this.currentVolume / 100;
        }
        
        // Guardar en localStorage
        const savedConfig = localStorage.getItem('zombieAudioConfig');
        let config = savedConfig ? JSON.parse(savedConfig) : { music: 70, sfx: 80 };
        config.music = this.currentVolume;
        localStorage.setItem('zombieAudioConfig', JSON.stringify(config));
    }

    getVolume() {
        return this.currentVolume;
    }
}

window.audioManager = new AudioManager();