import util from "./util";

export default class audioManager {
    static _instance = null;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new audioManager();
        this._instance.init();
        return this._instance;
    }

    musicVolume = 0.8;
    soundVolume = 1;
    audios = {};
    arrSound = [];
    
    init () {
        //暂时不获取
        // this.musicVolume = this.getConfiguration(true) ? 0.8: 0;
        // this.soundVolume = this.getConfiguration(false) ? 1 : 0;

        if (window['wx']) {
            wx.onShow(()=>{
                this.onAppShow();
            });

            wx.onHide(()=>{
                this.onAppHide();
            });
        }
    }

    onAppHide () {
        for (let name in this.audios) {
            let audio = this.audios[name];
            if (audio.loop && audio.isPlaying) {
                //属于无限循环的，则需要在wx环境下自己开启播放
                // console.log(`audio: ${name} pause!`);
                audio.pause();
            }
        }
    }

    onAppShow () {
        for (let name in this.audios) {
            let audio = this.audios[name];
            if (audio.loop && audio.isPlaying) {
                //属于无限循环的，则需要在wx环境下自己开启播放
                audio.play();
            }
        }
    }

    /**
     * 播放音乐
     * @param {String} name 音乐名称可通过constants.AUDIO_MUSIC 获取
     * @param {Boolean} loop 是否循环播放
     */
    playMusic (name, loop) {
        if (!this.musicVolume) {
            return;
        }

        let audio = wx.createInnerAudioContext();
        audio.src = `audios/music/${name}`
        audio.loop = loop;
        audio.isPlaying = true;
        audio.volume = this.musicVolume;
        audio.play();
        audio.isMusic = true;
        this.audios[name] = audio;
    }

    /**
     * 播放音效
     * @param {String} name 音效名称可通过constants.AUDIO_SOUND 获取
     * @param {Boolean} loop 是否循环播放
     */
    playSound (name, loop) {
        // return;

        if (!this.soundVolume) {
            return;
        }

        let audio = wx.createInnerAudioContext();
        audio.src = `audios/sound/${name}`
        audio.loop = loop;
        audio.volume = this.soundVolume;
        audio.play();
        audio.isMusic = false;
        audio.isPlaying = true;
        audio.onEnded(()=>{
            util.remove(this.arrSound, (obj)=>{
                return obj === audio;
            });

            audio.destroy();
            
        });

        this.arrSound.push(audio);
        if (loop) {
            this.audios[name] = audio;
        }
    }

    stop (name) {
        if (this.audios.hasOwnProperty(name)) {
            let audio = this.audios[name];
            audio.stop();
            audio.isPlaying = false;
        }
    }

    //看广告时先将音乐暂停
    pauseAll () {
        console.log("pause all music!!!");

        for (let item in this.audios) {
            if (this.audios.hasOwnProperty(item)) {
                let audio = this.audios[item];
                audio.pause();
            }
        }
    }

    resumeAll () {
        for (let item in this.audios) {
            if (this.audios.hasOwnProperty(item)) {
                let audio = this.audios[item];
                audio.play();
            }
        }
    }

}