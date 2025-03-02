// Game Audio Manager
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.isInitialized = false;
        this.audioAvailable = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadSound = this.loadSound.bind(this);
        this.playSound = this.playSound.bind(this);
        this.playMusic = this.playMusic.bind(this);
        this.stopMusic = this.stopMusic.bind(this);
        this.setMusicVolume = this.setMusicVolume.bind(this);
        this.setSfxVolume = this.setSfxVolume.bind(this);
        this.mute = this.mute.bind(this);
        this.unmute = this.unmute.bind(this);
        this.toggleMute = this.toggleMute.bind(this);
    }
    
    init() {
        try {
            // Check if audio is available in this browser
            this.audioAvailable = (typeof Audio !== 'undefined');
            
            if (!this.audioAvailable) {
                console.warn('Audio is not available in this browser');
                this.isInitialized = true;
                return;
            }
            
            // Load all game sounds
            this.loadSound('engine', 'static/sounds/engine.mp3', true);
            this.loadSound('crash', 'static/sounds/crash.mp3');
            this.loadSound('collision', 'static/sounds/collision.mp3');
            this.loadSound('skid', 'static/sounds/skid.mp3');
            this.loadSound('checkpoint', 'static/sounds/checkpoint.mp3');
            this.loadSound('lapComplete', 'static/sounds/lap_complete.mp3');
            this.loadSound('countdown', 'static/sounds/countdown.mp3');
            this.loadSound('start', 'static/sounds/start.mp3');
            this.loadSound('offTrack', 'static/sounds/off_track.mp3');
            this.loadSound('gameOver', 'static/sounds/game_over.mp3');
            this.loadSound('victory', 'static/sounds/victory.mp3');
            
            // Load background music
            try {
                this.music = new Audio('static/sounds/background_music.mp3');
                this.music.loop = true;
                this.music.volume = this.musicVolume;
            } catch (error) {
                console.warn('Error loading background music:', error);
                this.music = null;
            }
            
            this.isInitialized = true;
            console.log('Audio Manager initialized');
        } catch (error) {
            console.error('Error initializing AudioManager:', error);
            this.isInitialized = true;
            this.audioAvailable = false;
        }
    }
    
    loadSound(name, path, loop = false) {
        if (!this.audioAvailable) return;
        
        try {
            const sound = new Audio(path);
            sound.loop = loop;
            
            // Add error handler
            sound.onerror = (error) => {
                console.warn(`Error loading sound '${name}' from '${path}':`, error);
                delete this.sounds[name]; // Remove from sounds object if loading fails
            };
            
            this.sounds[name] = sound;
        } catch (error) {
            console.warn(`Error loading sound '${name}' from '${path}':`, error);
        }
    }
    
    playSound(name, volume = this.sfxVolume) {
        if (!this.audioAvailable || this.isMuted) return;
        
        try {
            const sound = this.sounds[name];
            if (sound) {
                // Create a clone to allow overlapping sounds
                const soundClone = sound.cloneNode();
                soundClone.volume = volume;
                
                // Add error handler for play failures
                const playPromise = soundClone.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn(`Error playing sound '${name}':`, error);
                    });
                }
            } else {
                console.warn(`Sound '${name}' not found or not loaded`);
            }
        } catch (error) {
            console.warn(`Error playing sound '${name}':`, error);
        }
    }
    
    playMusic() {
        if (!this.audioAvailable || this.isMuted || !this.music) return;
        
        try {
            this.music.currentTime = 0;
            
            // Add error handler for play failures
            const playPromise = this.music.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Error playing background music:', error);
                });
            }
        } catch (error) {
            console.warn('Error playing background music:', error);
        }
    }
    
    stopMusic() {
        if (!this.audioAvailable || !this.music) return;
        
        try {
            this.music.pause();
            this.music.currentTime = 0;
        } catch (error) {
            console.warn('Error stopping background music:', error);
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.audioAvailable && this.music) {
            try {
                this.music.volume = this.musicVolume;
            } catch (error) {
                console.warn('Error setting music volume:', error);
            }
        }
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    mute() {
        this.isMuted = true;
        
        if (this.audioAvailable && this.music) {
            try {
                this.music.pause();
            } catch (error) {
                console.warn('Error pausing music during mute:', error);
            }
        }
    }
    
    unmute() {
        this.isMuted = false;
        
        if (this.audioAvailable && this.music) {
            try {
                const playPromise = this.music.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('Error playing background music after unmute:', error);
                    });
                }
            } catch (error) {
                console.warn('Error playing background music after unmute:', error);
            }
        }
    }
    
    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }
} 