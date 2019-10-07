import Node from "../engine/node";
import util from "../engine/util";
import { clientEvent } from "../engine/clientEvent";
import DataBus from "../databus";
import { gameLogic } from "../framework/gameLogic";
import FightConstants from "./fightConstants";
import { DynamicData } from "../framework/dynamicData";
import { Tween } from "../libs/Tween";
import WxBanner from "../libs/wxBanner";

export default class FightUI extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.nodeCountdownBg = new Node(this);
        this.nodeCountdownBg.position = {x: -canvas.width/2 + this.getFitValue(70), y: -canvas.height/2 + this.getFitValue(83)};
        this.nodeCountdownBg.addSprite('images/ui/fight/fightBoxTime.png');

        //倒计时
        this.nodeCountdown = new Node(this.nodeCountdownBg);
        // this.nodeCountdown.addSprite('images/ui/fight/fightImg05.png');
        // this.nodeCountdown.anchorPoint.x = 1;
        this.nodeCountdown.position = {x: 0, y: this.getFitValue(25)};
        this.nodeCountdown.addArtDigit('30', 'images/ui/font/font01.png', '0123456789');
        // this.nodeCountdown.visible = false;

        // this.nodeCountdownTxt = new Node(this.nodeCountdown);
        // this.nodeCountdownTxt.addLabel('', 32*gameSpace.ratio);
        // this.nodeCountdownTxt.position = {x: -95*gameSpace.ratio, y: 10*gameSpace.ratio};

        let offset = 0;
        if (gameSpace.menuTop > 20) {
            offset = gameSpace.menuTop - 20;
        }

        //分数版
        this.nodeBoard = new Node(this);
        this.nodeBoard.addSprite('images/ui/fight/fightBoxScore.png');
        this.nodeBoard.position = {x: canvas.width/2 - this.getFitValue(140), y: -canvas.height/2 + this.getFitValue(180) + offset};

        //分数
        this.nodeScore = new Node(this.nodeBoard);
        this.nodeScore.position = {x: 0, y: this.getFitValue(60)};

        // this.nodeScoreIcon = new Node(this.nodeScore);
        // this.nodeScoreIcon.addSprite('images/ui/fight/fightIconGold.png');
        // this.nodeScoreIcon.position.x = this.getFitValue(-50);
        // this.nodeScoreIcon.setScale(0.7);

        this.nodeScoreTxt = new Node(this.nodeScore);
        this.nodeScoreTxt.color = '#e60012';//018d3b
        this.nodeScoreTxt.anchorPoint.x = 0;
        this.nodeScoreTxt.addLabel('0', this.getFitValue(32), 'left');
        this.nodeScoreTxt.position = {x: -this.getFitValue(25), y:this.getFitValue(12)};

        //目标分数
        this.nodeTarget = new Node(this.nodeBoard);
        this.nodeTarget.position = {x: 0, y: this.getFitValue(-20)};

        // this.nodeTargetIcon = new Node(this.nodeTarget);
        // this.nodeTargetIcon.addSprite('images/ui/fight/fightIconGold.png');
        // this.nodeTargetIcon.position.x = this.getFitValue(-50);
        // this.nodeTargetIcon.setScale(0.7);

        this.nodeTargetTxt = new Node(this.nodeTarget);
        this.nodeTargetTxt.color = '#b04e0d';
        this.nodeTargetTxt.anchorPoint.x = 0;
        this.nodeTargetTxt.addLabel('0', this.getFitValue(32), 'left');
        this.nodeTargetTxt.position = {x: -this.getFitValue(25), y: this.getFitValue(12)};

        //炸弹
        // this.nodeBombFrame = new Node(this);
        // this.nodeBombFrame.addSprite('images/ui/fight/fightBoxTool.png');
        // this.nodeBombFrame.position = {x: -this.getFitValue(80), y: this.getFitValue(370) + offset};

        // this.nodeBomb = new Node(this.nodeBombFrame);
        // this.nodeBomb.addSprite('images/fight/mine/bomb.png');

        // this.nodeBombTxt = new Node(this.nodeBombFrame);
        // this.nodeBombTxt.addLabel('0', this.getFitValue(28), 'right');
        // this.nodeBombTxt.position = {x: this.getFitValue(45), y: this.getFitValue(40)};

        // this.nodeBombShare = new Node(this.nodeBombFrame);
        // this.nodeBombShare.addSprite();
        // this.nodeBombShare.position = {x: this.getFitValue(30), y: this.getFitValue(35)};
        // this.nodeBombShare.visible = false;
        

        //能量
        // this.nodePowerFrame = new Node(this);
        // this.nodePowerFrame.addSprite('images/ui/fight/fightBoxTool.png');
        // this.nodePowerFrame.position = {x: this.getFitValue(80), y: this.getFitValue(370) + offset};

        // this.nodePower = new Node(this.nodePowerFrame);
        // this.nodePower.addSprite('images/fight/mine/power.png');

        // this.nodePowerTxt = new Node(this.nodePowerFrame);
        // this.nodePowerTxt.addLabel('0', this.getFitValue(32), 'right');
        // this.nodePowerTxt.position = {x: this.getFitValue(45), y: this.getFitValue(40)};

        // this.nodePowerShare = new Node(this.nodePowerFrame);
        // this.nodePowerShare.addSprite();
        // this.nodePowerShare.position = {x: this.getFitValue(30), y: this.getFitValue(35)};

        // this.nodeLevel = new Node(this);
        // this.nodeLevel.addLabel('');
        // this.nodeLevel.position.y = -canvas.height / 2 + gameSpace.menuTop + this.getFitValue(30);

        this.isShowBanner = false;
    }

    checkBanner () {
        if (DynamicData.instance.isConfigLoaded && this.visible && WxBanner.instance.banners.length > 0) {
            if (this.isShowBanner) {
                return;
            }

            if (DynamicData.instance.isAuditor) {
                //审核人员不展示
                return;
            }

            this.isShowBanner = true;

            //显示广告
            WxBanner.instance.showAdBanner('fight');

            //刷新界面,调整，避免广告遮挡
            // this.nodeBombFrame.position.y = WxBanner.instance.bannerTop - canvas.height / 2 - this.getFitValue(60);
            // this.nodePowerFrame.position.y = WxBanner.instance.bannerTop - canvas.height / 2 - this.getFitValue(60);
        } else {
            this.checkBannerTimer = setTimeout(() => {
                this.checkBanner();
            }, 1000);
        }
    }

    hideBanner () {
        if (WxBanner.instance.banners) {
            WxBanner.instance.hideAdBanner();
        }

        this.isShowBanner = false;
        
        if (this.checkBannerTimer) {
            clearTimeout(this.checkBannerTimer);
            this.checkBannerTimer = null;
        }
    }

    onEnable () {
        canvas.addEventListener('touchstart', this.onTouchStart);
        canvas.addEventListener('touchmove', this.onTouchMove);
        canvas.addEventListener('touchend', this.onTouchEnd);
        
        clientEvent.on('updateScore', this.updateScore, this);
        clientEvent.on('updateCountDown', this.updateCountDown, this);
        clientEvent.on('updateBomb', this.updateBomb, this);

        if (wx.aldSendEvent) {
            wx.aldSendEvent(`界面曝光-游戏界面`, {
                
            });
        }

        // this.checkBanner();
    }

    onDisable () {
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);
        
        clientEvent.off('updateScore', this.updateScore, this);
        clientEvent.off('updateCountDown', this.updateCountDown, this);
        clientEvent.off('updateBomb', this.updateBomb, this);

        this.hideBanner();
    }

    startRunning () {
        // this.levelInfo = DataBus.instance.getCurrentLevel();

        // gameLogic.updateRewardIcon(FightConstants.SHARE_FUNCTION.BOMB, this.nodeBombShare);
        // gameLogic.updateRewardIcon(FightConstants.SHARE_FUNCTION.POWER, this.nodePowerShare);

        // this.nodeLevel.label.string = `第 ${DataBus.instance.level} 关`
    }

    update (dt) {
        super.update(dt);
    }

    updateCountDown (countDown) {
        // this.nodeCountdownTxt.label.string = util.formatTimeForSecond(countDown);
        this.nodeCountdown.artDigit.string = countDown;
    }

    updateScore (score) {
        let levelScore = 0;
        // if (this.levelInfo) {
            // levelScore = this.levelInfo.score;
        // }
        levelScore = 6;

        let oldScore = Number(this.nodeScoreTxt.label.string);

        if (score > oldScore) {
            // this.nodeScoreTxt.setScale(1);
            if (this.scoreTween) {
                this.scoreTween.stop();
                this.scoreTween = null;
            }

            this.scoreTween = new Tween(this.nodeScoreTxt.scale).to({x: 1.5, y: 1.5}, 0.1).onComplete(()=>{
                if (this.scoreTween) {
                    this.scoreTween.stop();
                    this.scoreTween = null;
                }

                this.scoreTween = new Tween(this.nodeScoreTxt.scale).to({x: 1, y: 1}, 0.3).onComplete(()=>{
                    if (this.scoreTween) {
                        this.scoreTween.stop();
                        this.scoreTween = null;
                    }
                }).start();
            }).start();
        }

        this.nodeScoreTxt.getComponent('Label').string = score;
        this.nodeTargetTxt.label.string = levelScore;

        if (score >= levelScore) {
            this.nodeScoreTxt.color = '#018d3b';
        } else {
            this.nodeScoreTxt.color = '#e60012';
        }
    }

    updateBomb (bomb) {
        // this.nodeBombTxt.label.string = bomb;

        this.bomb = bomb;

        // this.nodeBombShare.visible = bomb <= 0;
    }

    show () {

    }

    onTouchStart (e) {
        if (this.parent.isGameOver) {
            return;
        }
    
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        
        this.isTouchBomb = false;
        this.isTouchPower = false;
        // if (this.nodeBombFrame.contains(this.lastTouchPos)) {
        //     this.isTouchBomb = true;
        //     e.isStopPropagation = true;
        // } else 
        // if (this.nodePowerFrame.contains(this.lastTouchPos)) {
        //     this.isTouchPower = true;
        //     e.isStopPropagation = true;
        // }

        clientEvent.dispatchEvent('updatePauseTime');
    }

    onTouchMove (e) {
       
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

        clientEvent.dispatchEvent('updatePauseTime');
    }

    onTouchEnd (e) {
        if (this.isTouchBomb) {
            e.isStopPropagation = true;
            // if (this.nodeBombFrame.contains(this.lastTouchPos)) {
            //     this.onBombClick();
            // }

            this.isTouchBomb = false;
        } else if (this.isTouchPower) {
            e.isStopPropagation = true;
            // if (this.nodePowerFrame.contains(this.lastTouchPos)) {
            //     this.onPowerClick();
            // }

            this.isTouchPower = false;
        }
    }

    onBombClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-游戏界面-炸弹`, {
                
            });
        }

        if (this.bomb > 0) {
            this.parent.useBomb();
        } else {
            if (DynamicData.instance.isAuditor) {
                return;//审核人员无效
            }

            clientEvent.dispatchEvent('pauseGame');
            gameLogic.openReward(FightConstants.SHARE_FUNCTION.BOMB, (err)=>{
                clientEvent.dispatchEvent('resumeGame');
                if (!err) {
                    if (wx.aldSendEvent) {
                        wx.aldSendEvent(`按钮点击-游戏界面-炸弹视频成功`, {
                            
                        });
                    }

                    //表示看广告结束
                    this.parent.addBomb(3);
                }
            });
        }
        
    }

    onPowerClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-游戏界面-力量`, {
                
            });
        }

        if (DynamicData.instance.isAuditor) {
            return;//审核人员无效
        }

        clientEvent.dispatchEvent('pauseGame');
        gameLogic.openReward(FightConstants.SHARE_FUNCTION.POWER, (err)=>{
            clientEvent.dispatchEvent('resumeGame');
            if (!err) {
                if (wx.aldSendEvent) {
                    wx.aldSendEvent(`按钮点击-游戏界面-力量视频成功`, {
                        
                    });
                }

                //表示看广告结束
                this.parent.usePower();
            }
        });
    }


}