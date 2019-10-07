/**
 * 游戏主函数
 */


import Node from '../engine/node';
import { clientEvent } from '../engine/clientEvent';
import audioManager from '../engine/audioManager';
import Pool from '../engine/pool';
import { DynamicData } from '../framework/dynamicData';
import { Tween, Easing } from '../libs/Tween';
import Recommend from '../recommend/recommend';
import MiningArea from './miningArea';
import FightUI from './fightUI';
import Sprite from '../engine/sprite';
import DataBus from '../databus';
import Balance from './balance';
import StartUI from './startUI';
import FightWin from './fightWin';
import Revive from './revive';
import Pause from './pause';
import ScoreTips from './scoreTips';
import CountDownTips from './countDownTips';
import GameColor from './gameColor';

const PAUSE_TIME = 10;


export default class FightScene extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.position = {x: canvas.width / 2, y: canvas.height / 2}; //初始设为中心点
        this.width = canvas.width;
        this.height = canvas.height;

        this.addColorLayer('#e7ae5c');

        this.bgNode = new Node(this);
        this.bgNode.addSprite('images/ui/bg.jpg');
        this.bgNode.height = 2048;
        this.bgNode.width = 720;
        this.bgNode.anchorPoint.y = 0;
        this.bgNode.position.y = -canvas.height/2;

        // this.addSprite('images/fight/bg.jpg', Sprite.FILL_TYPE.CUSTOM);

        //返回按钮
        // this.nodeBack = new Node(this);
        // this.nodeBack.position = {x: -canvas.width / 2 + 100*gameSpace.ratio, y: -canvas.height/2 + 40*gameSpace.ratio};
        // this.nodeBack.addSprite('images/ui/recommend/back1.png');
        // this.nodeBack.visible = false; //等数据返回时再展示
        // this.checkBackBtn();

        this.init(); 

        // this.miningArea = new MiningArea(this.bgNode);
        // this.miningArea.show(this);
        // this.miningArea.position.y = this.getFitValue(1580);

        this.gameColor = new GameColor(this.bgNode);
        this.gameColor.show(this);
        this.gameColor.position.y = this.getFitValue(1580);
        
        //UI界面 
        this.fightUI = new FightUI(this); 
        this.fightUI.visible = false;
        this.fightUI.show();
        

        //开始界面
        this.startUI = new StartUI(this);
        this.startUI.show();

        this.isGameStart = false;
        this.isGameOver = false;
        this.isPause = false;

        this.score = 0;
        this.gold = 0;

        this.idleTime = 0;
        this.nodePause = null;
        // this.gameOver();

        // function get_filesize(url, callback) {
        //     var xhr = new XMLHttpRequest();
        //     xhr.open("HEAD", url, true); // Notice "HEAD" instead of "GET",
        //                                  //  to get only the header
        //     xhr.onreadystatechange = function() {
        //         if (this.readyState == this.DONE) {
        //             callback(parseInt(xhr.getResponseHeader("Content-Length")));
        //         }
        //     };
        //     xhr.send();
        // }

        // setTimeout(() => {
        //     get_filesize("https://ossconfigcdn.xxzsgame.com/eatFish/cydmxzx.png", function(size) {
        //         alert("The size of foo.exe is: " + size + " bytes.");
        //     });
        // }, 5000);

        // setTimeout(() => {
        //     this.startGame();
        // }, 1000);
    }

    init () {
        
        canvas.addEventListener('touchstart', this.onTouchStart);
        canvas.addEventListener('touchmove', this.onTouchMove);
        canvas.addEventListener('touchend', this.onTouchEnd);

        clientEvent.on('startGame', this.startGame, this);
        clientEvent.on('restart', this.restart, this);
        clientEvent.on('pauseGame', this.pauseGame, this);
        clientEvent.on('resumeGame', this.resumeGame, this);
        clientEvent.on('catch', this.onCatch, this);
        clientEvent.on('nextLevel', this.nextLevel, this);
        clientEvent.on('rewardScore', this.rewardScore, this);
        clientEvent.on('resetScore', this.resetScore, this);
        clientEvent.on('revive', this.revive, this);
        clientEvent.on('continue', this.continue, this);
        clientEvent.on('updatePauseTime', this.updatePauseTime, this);
    }

    pauseGame () {
        this.isPause = true;

        if (!this.isGameStart) {
            return;
        }

        // this.miningArea.miner.pause();
    }

    resumeGame () {
        this.isPause = false;

        if (!this.isGameStart) {
            return;
        }

        // this.miningArea.miner.resume();
    }

    restart () {
        this.isGameOver = false;
        this.isGameStart = false;

        if (this.bgTween) {
            this.bgTween.stop();
            this.bgTween = null;
        }

        this.bgNode.position.y = -canvas.height/2;
        this.fightUI.visible = false;
        this.startUI.visible = true;

        // this.miningArea.clearAllMines();
    }

    startGame () {
        //播放移动动画，播放完毕后开始游戏
        if (this.bgTween) {
            //已经开始移动
            return;
        }

        let offset = 0;
        if (gameSpace.menuTop > 20) {
            offset = gameSpace.menuTop - 20;
        }

        this.bgTween = new Tween(this.bgNode.position)
        .to({y: this.bgNode.position.y - this.getFitValue(900) + offset}, 0.8)
        .easing(Easing.Back.Out)
        .onComplete(()=>{
            this.bgTween.stop();
            this.bgTween = null;
            
            this.score = 0;
            this.gold = 0;
            this.bomb = 0;//todo 测试用，先做3颗
            DataBus.instance.level = 1; //重置为第1关

            this.fightUI.visible = true;
            
            this.nextLevel();
        }).start();

        
    }

    nextLevel () {
        if (this.isGameStart && !this.isGameOver) {
            return;
        }

        // if (DataBus.instance.isNewBee) {
        //     if (wx.aldSendEvent) {
        //         wx.aldSendEvent(`游戏事件-第${DataBus.instance.level}关开启`, {
                    
        //         });
        //     }
        // }

        //播放开始游戏音效
        audioManager.instance.stop('background.mp3');
        audioManager.instance.playMusic('background.mp3', true);

        this.costTime = 0;
        this.currentCostTime = 0;
        this.countDown = 60;
        this.idleTime = 0;

        this.isGameStart = true;
        this.isGameOver = false;

        // this.miningArea.startRunning();
        // this.fightUI.startRunning();

        clientEvent.dispatchEvent('updateScore', this.score);
        clientEvent.dispatchEvent('updateCountDown', this.countDown);
        clientEvent.dispatchEvent('updateBomb', this.bomb);
    }

    pauseByIdle () {
        this.pauseGame();
        this.idleTime = 0;

        this.fightUI.hideBanner();
        this.nodePause = new Pause(this);
        this.nodePause.show(()=>{
            this.fightUI.checkBanner();
        });
    }

    update (dt) {
        super.update(dt);

        if (this.isGameStart && !this.isGameOver && !this.isPause) {
            // if (this.miningArea && this.miningArea.miner && this.miningArea.miner.status === 1) {
                //处于idle状态下再记录时间
                this.idleTime += dt;
                if (this.idleTime > PAUSE_TIME) {
                    this.pauseByIdle();
                    return;
                // }
            }

            //倒计时
            this.costTime += dt;
            let time = Math.floor(this.costTime);
            if (time !== this.currentCostTime) {
                this.currentCostTime = time;
                let offset = this.countDown - time;
                offset = offset < 0 ? 0 : offset;
                if (offset <= 5 && offset > 0) {
                    audioManager.instance.playSound('countDown.mp3');

                    this.showCountDownTips(offset);
                }

                clientEvent.dispatchEvent('updateCountDown', offset);

                if (this.countDown <= time) {
                    //游戏结束
                    this.gameOver();
                }
            }
        }
    }

    gameOver () {
        this.isGameOver = true;
        audioManager.instance.stop('background.mp3');

        clientEvent.dispatchEvent('gameOver');

        let levelInfo = DataBus.instance.getCurrentLevel();
        let isWin = false;
        if (levelInfo.score <= this.score) {
            isWin = true;
        }

        if (isWin) {
            let fightWin = new FightWin(this);
            fightWin.show(DataBus.instance.level, this.score);
        } else {
            // if (this.miningArea.arrMines.length > 0) {
            //     let revive = new Revive(this);
            //     revive.show(DataBus.instance.level, this.score);
            // } else 
            {
                let balance = new Balance(this);
                balance.show(this.score);
            }
        }
        
        // setTimeout(() => {
        //     //跳出结算界面
        //     let nodeBalance = new Balance(this);
        //     nodeBalance.show(this.score, this.gold);
        // }, 1000);
    }

    revive () {
        this.countDown = 15;
        this.costTime = 0;
        this.idleTime = 0;
        clientEvent.dispatchEvent('updateCountDown', this.countDown);

        this.isGameOver = false;
        this.isGameStart = true;

        // this.miningArea.miner.startRunning();

        this.usePower();

        audioManager.instance.playMusic('background.mp3', true);
    }
  
    render(ctx) {
        super.render(ctx);
    }

    onTouchStart (e) {
        e.preventDefault();
    
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.startTouchPos = {x: x, y: y};
        this.lastTouchPos = {x: x, y: y};

        // this.isTouchBack = this.nodeBack.contains(this.lastTouchPos);
        // this.isTouchBack ? this.nodeBack.setScale(0.85) : this.nodeBack.setScale(1);
    }

    onTouchMove (e) {
        e.preventDefault();
        
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;


        this.lastTouchPos = {x: x, y: y};
    }

    onBtnRetryClick () {
        //重新开始
        // this.arrDigital = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // DataBus.instance.storage.gameboard = this.arrDigital;
        // DataBus.instance.saveData();

        // this.startGame();
    }


    onTouchEnd (e) {
        let offsetX = this.lastTouchPos.x - this.startTouchPos.x;
        let offsetY = this.lastTouchPos.y - this.startTouchPos.y;

        // if (this.isTouchBack) {
        //     if (this.nodeBack.contains(this.lastTouchPos)) {
        //         //显示互推界面
        //         console.log('互推');
        //         let node = new Recommend(this);
        //         clientEvent.dispatchEvent('pauseGame');
        //     }

        //     this.nodeBack.setScale(1);
        // }

        if (this.isGameStart && !this.isGameOver) {
            clientEvent.dispatchEvent('fire');

            this.updatePauseTime();
        }
    }

    // checkBackBtn () {
    //     if (DynamicData.instance.isConfigLoaded) {
    //         this.nodeBack.visible = true;
    //         return;
    //     }

    //     //每秒触发一次检查，直到获得到数据
    //     setTimeout(()=>{
    //         this.checkBackBtn();
    //     }, 1000);
    // }

    onCatch (mineInfo, hasClover) {
        switch (mineInfo.name) {
            case 'bomb':
                this.addBomb(2);
                break;
            case 'power':
                this.usePower();
                break;
            case 'clover':
                this.useClover();
                break;
        }


        //当抓到矿石的时候
        if (mineInfo.score > 0) {
            //加分
            let score = mineInfo.score;
            if (hasClover) {
                score = Math.floor(score * 1.5); //有四叶草时积分为1.5倍
            }

            this.score += score;
            
            //tips
            this.showScoreTips(score);

            clientEvent.dispatchEvent('updateScore', this.score);

            audioManager.instance.playSound('score.mp3', false);
        }

    }

    showScoreTips (score) {
        //随机个坐标
        let pos = {
            x: this.getFitValue(50) + Math.floor(Math.random() * this.getFitValue(50)), 
            y: this.getFitValue(-400) - Math.floor(Math.random() * this.getFitValue(100))
        };

        let tips = Pool.instance.getItemByClass('ScoreTips', ScoreTips, this);
        tips.parent = this;
        tips.show(`+${score}`, pos);
    }

    showCountDownTips (time) {
        let pos = {
            x: 0, 
            y: this.getFitValue(-150)
        };

        let tips = Pool.instance.getItemByClass('CountDownTips', CountDownTips, this);
        tips.parent = this;
        tips.show(`${time}`, pos);
    }

    /**
     * 增加炸弹
     */
    addBomb (num) {
        //是炸弹，获得炸弹
        this.bomb += num; //现在设置
        clientEvent.dispatchEvent('updateBomb', this.bomb);
    }

    /**
     * 使用炸弹
     */
    useBomb () {
        if (this.bomb <= 0) {
            return;
        }

        //检查当前炸弹是否可用
        // let isCanUse = this.miningArea.miner.checkIsCanUseBomb();
        if (isCanUse) {
            this.bomb --;
            clientEvent.dispatchEvent('updateBomb', this.bomb);

            // this.miningArea.miner.useBomb();
        }
    }

    /**
     * 使用能量
     */
    usePower () {
        // this.miningArea.miner.usePower();
        audioManager.instance.playSound('getEffect.mp3');
    }

    /**
     * 使用四叶草
     */
    useClover () {
        // this.miningArea.miner.useClover();
        audioManager.instance.playSound('getEffect.mp3');
    }

    rewardScore (score) {
        this.score += score;

        this.showScoreTips(score);

        clientEvent.dispatchEvent('updateScore', this.score);
    }

    resetScore () {
        this.score = 0;

        clientEvent.dispatchEvent('updateScore', this.score);
    }

    continue () {
        this.idleTime = 0;
        this.nodePause.destroy();
        this.nodePause = null;

        this.resumeGame();
    }

    updatePauseTime () {
        this.idleTime = 0;
    }
}