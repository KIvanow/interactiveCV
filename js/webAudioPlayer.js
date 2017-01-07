var WebAudioPlayer = function() {
    this.audioContext = null;
    this.mainBuffer = null;
    this.loaded = false;
    this.muted = false;
    this.mainVolumeNode = null;
    this.sounds = {};
    this.onReady = function(){};
};

WebAudioPlayer.isSupported = function() {
    return typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined";
};

window.extend(WebAudioPlayer.prototype, {
    createAudioContext: function() {
        if (typeof AudioContext !== "undefined") {
            this.audioContext = new AudioContext();
        } else if (typeof webkitAudioContext !== "undefined") {
            this.audioContext = new webkitAudioContext();
        }
    },

    loadGameAudio: function() {
        this.loadFromAjax();        
    },

    loadFromBase64: function() {
        var data = Base64Binary.decodeArrayBuffer(gameAudio);

        this.audioContext.decodeAudioData(data,
            function(buffer){
                this.mainBuffer = buffer;
                this.loaded = true;
                this.onReady();
            }.bind(this));
    },

    loadFromAjax: function() {
        var webAudioPlayer = this;

        var request = new XMLHttpRequest();
        request.open('GET', this.getResourceName(), true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            webAudioPlayer.audioContext.decodeAudioData(request.response,
                function(buffer){
                    webAudioPlayer.mainBuffer = buffer;
                    webAudioPlayer.loaded = true;
                    webAudioPlayer.onReady();
                });
        };

        request.send();
    },

    getResourceName: function() {
        return config.sound.resources[1];
        
    },

    createGain: function() {
        if (this.audioContext.createGain) {
            return this.audioContext.createGain();
        } else if (this.audioContext.createGainNode) {
            return this.audioContext.createGainNode();
        } else {
            
        }
    },

    load: function(){
        this.createAudioContext();

        this.mainVolumeNode = this.createGain();

        this.mainVolumeNode.connect(this.audioContext.destination);

        // Fix for iOS minimising
        var previousEventTime = null;
        var focusOutCheck = function() {
            if(!this.muted) {
                if(previousEventTime !== null) {
                    this.mainVolumeNode.gain.setValueAtTime(1, previousEventTime );
                }
                previousEventTime = this.audioContext.currentTime + 1;
                this.mainVolumeNode.gain.setValueAtTime(0, previousEventTime );
            } else {
                this.mainVolumeNode.gain.setValueAtTime( 0, 0 );
            }
            setTimeout(focusOutCheck, 500);
        }.bind(this);

        focusOutCheck();

        this.loadGameAudio();
    },

    getSoundSource: function() {
        var source = this.audioContext.createBufferSource();

        source.buffer = this.mainBuffer;
        var gainNode = this.createGain();

        source.connect(gainNode);
        gainNode.connect(this.mainVolumeNode);
        return { sourceNode: source, gainNode: gainNode };
    },

    setFadeIn: function(gainNode, fadeIn, volume) {
        var time = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume, time + fadeIn);
    },

    setFadeOut: function(sound, fadeOut) {
        var time = this.audioContext.currentTime;
        sound.gainNode.gain.setValueAtTime(sound.gainNode.gain.value, time);
        sound.gainNode.gain.linearRampToValueAtTime(0, time + fadeOut);
    },

    play: function(name, callback, settings) {
        if (!this.loaded) return;

        // ignore multiple identical sounds playing close to each other
        if (this.sounds[name] && this.audioContext.currentTime - this.sounds[name].startTime <= 0.1) {
            return;
        }

        settings = window.extend(config.sound.spritemap[name], settings || {});

        var sound = this.getSoundSource(),
            duration = settings.end - settings.start,
            volume = 1;

        if(settings.effects && settings.effects.volume) {
            volume = settings.effects.volume;
        }

        sound.gainNode.gain.value = volume;

        if(settings.effects && settings.effects.fadeIn) {
            this.setFadeIn(sound.gainNode, settings.effects.fadeIn, volume);
        }

        if(settings.loop) {
            sound.sourceNode.loopStart = settings.start;
            sound.sourceNode.loopEnd = settings.end;
            sound.sourceNode.loop = true;
        }

        sound.startTime = this.audioContext.currentTime;

        if (sound.sourceNode.start) {
            if (settings.loop) {
                sound.sourceNode.start(0, settings.start, 86400);
            } else {
                sound.sourceNode.start(0, settings.start, duration);                    
            }
        } else {
            if (settings.loop) {
                sound.sourceNode.noteGrainOn(this.audioContext.currentTime, settings.start, 86400);
            } else {
                sound.sourceNode.noteGrainOn(this.audioContext.currentTime, settings.start, duration);                    
            }
        }

        this.sounds[name] = sound;
    },

    isMute: function() {
        return this.muted;
    },

    setMute: function() {
        this.muted = true;
        this.mainVolumeNode.gain.setValueAtTime(0, 0);
    },

    unMute: function() {
        this.muted = false;
        this.mainVolumeNode.gain.setValueAtTime(1, 0);
    },

    setVolume: function(volume) {
        if (volume > 0) {
            this.muted = false;
        }
        this.mainVolumeNode.gain.setValueAtTime(volume, 0);
    },

    stopSound: function(sound, delay) {
        delay = delay || 0;

        if (sound.stopped) return;
        sound.stopped = true;

        if (sound.sourceNode.stop) {
            // it throws an exception when trying to stop the sound after it's fully played
            try { sound.sourceNode.stop(this.audioContext.currentTime + delay); } catch(e){}
        } else {
            sound.sourceNode.noteOff(this.audioContext.currentTime + delay);
        }
    },

    stop: function(name) {
        var sound = this.sounds[name];

        if (!sound) return;

        if (config.sound.spritemap[name].effects && config.sound.spritemap[name].effects.fadeOut){
            this.setFadeOut(sound, config.sound.spritemap[name].effects.fadeOut);
        } else {
            this.stopSound(sound);
        }
    },

    pause: function(name, fadeOutTime) {
        var sound = this.sounds[name];

        if (!sound) return;

        if (typeof fadeOutTime == "undefined") {
            fadeOutTime = 0.5;
        }

        sound.pausedTime = this.audioContext.currentTime + fadeOutTime;

        this.setFadeOut(sound, fadeOutTime);
        this.stopSound(sound, fadeOutTime);
    },

    resume: function(name, fadeInTime) {
        var sound = this.sounds[name];

        if(!sound) return;

        if (typeof fadeInTime == "undefined") {
            fadeInTime = 0.5;
        }

        this.play(name, {start: sound.pausedTime, effects: { fadeIn: fadeInTime } });
    }
});