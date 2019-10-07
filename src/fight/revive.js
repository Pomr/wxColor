import Node from "../engine/node";
import Balance from "./balance";
import SixGame from "../recommend/sixGame";
import { gameLogic } from "../framework/gameLogic";
import FightConstants from "./fightConstants";
import { clientEvent } from "../engine/clientEvent";
import DataBus from "../databus";
import audioManager from "../engine/audioManager";
import WxBanner from "../libs/wxBanner";
import { DynamicData } from "../framework/dynamicData";

export default class Revive extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.width = canvas.width;
        this.height = canvas.height;
        this.addColorLayer('#000000');
        this.opacity = 200;

        this.nodeTop = new Node(this);
        this.nodeTop.anchorPoint.y = 0;
        this.nodeTop.position.y = this.getFitValue(-540);

        this.nodeTargetTitle = new Node(this.nodeTop);
        this.nodeTargetTitle.position = {x: this.getFitValue(20), y: this.getFitValue(0)};
        this.nodeTargetTitle.addLabel('本关目标');

        this.nodeTargetValue = new Node(this.nodeTop);
        this.nodeTargetValue.position = { x: -this.getFitValue(0), y: this.getFitValue(65)};
        this.nodeTargetValue.anchorPoint.x = 0;
        this.nodeTargetValue.addLabel('9999', this.getFitValue(44), 'left');
        this.nodeTargetValue.color = '#f6ac4d';

        this.nodeTargetIcon = new Node(this.nodeTop);
        this.nodeTargetIcon.addSprite('images/ui/fight/fightIconGold.png');
        this.nodeTargetIcon.position = {x: this.getFitValue(-30), y: this.getFitValue(50)}

        this.nodeCurrentTitle = new Node(this.nodeTop);
        this.nodeCurrentTitle.position = {x: this.getFitValue(20), y: this.getFitValue(120)};
        this.nodeCurrentTitle.addLabel('当前收获');

        this.nodeCurrentValue = new Node(this.nodeTop);
        this.nodeCurrentValue.position = {x: -this.getFitValue(0),y: this.getFitValue(185)};
        this.nodeCurrentValue.addLabel('9999', this.getFitValue(44), 'left');
        this.nodeCurrentValue.anchorPoint.x = 0;
        this.nodeCurrentValue.color = '#e60012';

        this.nodeCurrentIcon = new Node(this.nodeTop);
        this.nodeCurrentIcon.addSprite('images/ui/fight/fightIconGold.png');
        this.nodeCurrentIcon.position = {x: this.getFitValue(-30), y: this.getFitValue(170)}

        //挑战失败图标
        this.nodeChallangeFailed = new Node(this.nodeTop);
        this.nodeChallangeFailed.addSprite('images/ui/fight/fightImgLose.png');
        this.nodeChallangeFailed.position = {x: this.getFitValue(-200), y: this.getFitValue(80)};

        this.btnReviveY = canvas.height/2 - this.getFitValue(160);
        this.btnRestartY = canvas.height/2 - this.getFitValue(50);

        this.nodeBtnRevive = new Node(this);
        this.nodeBtnRevive.position.y = this.btnReviveY;
        this.nodeBtnRevive.addSprite('images/ui/common/commonBtn01.png');

        this.nodeBtnPowerTxt = new Node(this.nodeBtnRevive);
        this.nodeBtnPowerTxt.addLabel('力量翻倍', this.getFitValue(32));
        // this.nodeBtnPowerTxt.label.fontWeight = 'bold';
        this.nodeBtnPowerTxt.color = '#8e3811';
        this.nodeBtnPowerTxt.position = {x: this.getFitValue(35), y: this.getFitValue(-20)};

        this.nodeBtnReviveTxt = new Node(this.nodeBtnRevive);
        this.nodeBtnReviveTxt.addLabel('复活', this.getFitValue(32));
        // this.nodeBtnReviveTxt.label.fontWeight = 'bold';
        this.nodeBtnReviveTxt.color = '#8e3811';
        this.nodeBtnReviveTxt.position = {x: this.getFitValue(35), y: this.getFitValue(20)};

        this.nodeReviveIcon = new Node(this.nodeBtnRevive);
        this.nodeReviveIcon.addSprite('');
        this.nodeReviveIcon.position = {x: this.getFitValue(-90), y: this.getFitValue(-10)};

        this.nodeBtnRestart = new Node(this);
        this.nodeBtnRestart.position.y = this.btnRestartY;
        this.nodeBtnRestart.width = this.getFitValue(120);
        this.nodeBtnRestart.height = this.getFitValue(32);
        this.nodeBtnRestart.addLabel('重新开始', this.getFitValue(32));
        this.nodeBtnRestart.color = '#ffffff';

        this.sixGame = new SixGame(this);
        this.sixGame.show(6, '复活界面');
        this.sixGame.position.y = this.getFitValue(-60);
    }

    onEnable () {
        canvas.addEventListener('touchstart', this.onTouchStart);
        canvas.addEventListener('touchmove', this.onTouchMove);
        canvas.addEventListener('touchend', this.onTouchEnd);
    }

    onDisable () {
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);
    }

    show (level, score) {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`界面曝光-复活界面`, {
                
            });
        }

        let levelInfo = DataBus.instance.getCurrentLevel();
        this.nodeTargetValue.label.string = levelInfo.score;

        this.nodeCurrentValue.label.string = score;

        this.score = score;

        gameLogic.updateRewardIcon(FightConstants.SHARE_FUNCTION.RELIVE, this.nodeReviveIcon);

        audioManager.instance.playSound('fail.mp3', false);

        this.nodeBtnRestart.position.y = this.btnRestartY;
        this.nodeBtnRevive.position.y = this.btnReviveY;

        let fightUI = this.parent.fightUI;
        fightUI.hideBanner();

        setTimeout(() => {
            //刷新 重新开始 按钮位置，贴近banner
            if (WxBanner.instance.banners.length > 0 && !DynamicData.instance.isAuditor && this.visible) {
                this.nodeBtnRestart.position.y = WxBanner.instance.bannerTop - canvas.height/2 - this.getFitValue(20);

                this.nodeBtnRevive.position.y = WxBanner.instance.bannerTop - canvas.height/2 - this.getFitValue(120);

                fightUI.checkBanner();
            }
        }, 1000);
        

    }

    onTouchStart (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        
        if (this.nodeBtnRestart) {
            this.isTouchRestart = this.nodeBtnRestart.contains(this.lastTouchPos);
            this.isTouchRestart ? this.nodeBtnRestart.setScale(0.85) : this.nodeBtnRestart.setScale(1);
        }

        this.isTouchRevive = this.nodeBtnRevive.contains(this.lastTouchPos);
        this.isTouchRevive ? this.nodeBtnRevive.setScale(0.85) : this.nodeBtnRevive.setScale(1);
    }

    onTouchMove (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

    }

    onTouchEnd (e) {
        e.isStopPropagation = true;
        if (this.isTouchRestart) {
            this.nodeBtnRestart.setScale(1);
            if (this.nodeBtnRestart.contains(this.lastTouchPos)) {
                this.onBtnRestartClick();
            }
        }

        if (this.isTouchRevive) {
            this.nodeBtnRevive.setScale(1);
            if (this.nodeBtnRevive.contains(this.lastTouchPos)) {
                this.onBtnReviveClick();
            }
        }

    }

    onBtnRestartClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-复活界面-重新开始`, {
                
            });
        }

        if (DataBus.instance.isNewBee) {
            if (wx.aldSendEvent) {
                wx.aldSendEvent(`游戏事件-第${DataBus.instance.level}关结束`, {
                    
                });
            }
        }

        //出现结算界面
        //展示结算界面
        let parent = this.parent;
        this.destroy();

        let balance = new Balance(parent);
        balance.show(this.score);
    }

    onBtnReviveClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-复活界面-复活`, {
                
            });
        }

        gameLogic.openReward(FightConstants.SHARE_FUNCTION.RELIVE, (err)=>{
            if (!err) {
                if (wx.aldSendEvent) {
                    wx.aldSendEvent(`按钮点击-复活界面-复活成功`, {
                        
                    });
                }

                //复活成功
                clientEvent.dispatchEvent('revive');

                this.destroy();
            }
        });
    }
}