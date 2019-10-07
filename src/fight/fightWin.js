import Node from "../engine/node";
import CardList from "../recommend/cardList";
import DataBus from "../databus";
import { clientEvent } from "../engine/clientEvent";
import { gameLogic } from "../framework/gameLogic";
import FightConstants from "./fightConstants";
import audioManager from "../engine/audioManager";
import FullScreenRecommend from "../recommend/fullScreenRecommend";
import WxBanner from "../libs/wxBanner";
import { DynamicData } from "../framework/dynamicData";
import CrazyClick from "./crazyClick";

export default class FightWin extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.width = canvas.width;
        this.height = canvas.height;
        this.addColorLayer('#000000');
        this.opacity = 200;

        this.btnContinueY = canvas.height/2 - this.getFitValue(50);
        this.normalY = canvas.height/2 - this.getFitValue(180);

        this.nodeBtnContinue = new Node(this);
        this.nodeBtnContinue.position.y = this.btnContinueY;
        this.nodeBtnContinue.width = this.getFitValue(120);
        this.nodeBtnContinue.height = this.getFitValue(32);
        this.nodeBtnContinue.addLabel('继续游戏', this.getFitValue(32));
        this.nodeBtnContinue.color = '#ffffff';

        this.nodeLevel = new Node(this);
        this.nodeLevel.position.y = -this.getFitValue(470);
        this.nodeLevel.addLabel('第1关', this.getFitValue(32));

        this.nodeScore = new Node(this);
        this.nodeScore.position = {x: this.getFitValue(-30), y: -this.getFitValue(400)};
        this.nodeScore.anchorPoint.x = 0;
        this.nodeScore.addLabel('99999', this.getFitValue(48), 'left');
        this.nodeScore.color = '#fef054';
        
        this.nodeScoreIcon = new Node(this);
        this.nodeScoreIcon.addSprite('images/ui/fight/fightIconGold.png');
        this.nodeScoreIcon.position = {x: this.getFitValue(-60), y: this.getFitValue(-415)}

        this.nodeNormal = new Node(this);
        this.nodeNormal.addSprite('images/ui/fight/fightImgScore.png');
        this.nodeNormal.position.y = this.normalY;

        this.nodeNormalIcon = new Node(this.nodeNormal);
        this.nodeNormalIcon.addSprite('images/ui/fight/fightIconGold.png');
        this.nodeNormalIcon.position = {x: -180*gameSpace.ratio, y: 0};

        this.nodeNormalMoney = new Node(this.nodeNormal);
        this.nodeNormalMoney.addLabel('+9999', this.getFitValue(48), 'left');
        this.nodeNormalMoney.color = '#fcf049';
        this.nodeNormalMoney.anchorPoint.x = 0;
        this.nodeNormalMoney.position = {x: -140*gameSpace.ratio, y:12*gameSpace.ratio};

        this.nodeNormalGet = new Node(this.nodeNormal);
        this.nodeNormalGet.addSprite('images/ui/common/commonBtn01.png');
        this.nodeNormalGet.position = {x: this.getFitValue(125), y: this.getFitValue(5)};
        this.nodeNormalGet.setScale(0.7);

        this.nodeNormalGetIcon = new Node(this.nodeNormalGet);
        this.nodeNormalGetIcon.addSprite('');
        this.nodeNormalGetIcon.position = {x: -this.getFitValue(65), y: -10*gameSpace.ratio};
        this.nodeNormalGetIcon.setScale(1.4);

        this.nodeNormalTxt = new Node(this.nodeNormalGet);
        this.nodeNormalTxt.addLabel('点击领取', 45*gameSpace.ratio);
        this.nodeNormalTxt.color = '#8f3513';
        this.nodeNormalTxt.position = {x: this.getFitValue(25), y: 0*gameSpace.ratio};

        this.cardList = new CardList(this);
        this.cardList.position.y = -this.getFitValue(100);
       
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
            wx.aldSendEvent(`界面曝光-过关界面`, {
                
            });
        }

        if (DataBus.instance.isNewBee) {
            if (wx.aldSendEvent) {
                wx.aldSendEvent(`游戏事件-第${DataBus.instance.level}关结束`, {
                    
                });
            }
        }

        this.nodeBtnContinue.position.y = this.btnContinueY;
        this.nodeNormal.position.y = this.normalY;

        let fightUI = this.parent.fightUI;
        fightUI.hideBanner();

        setTimeout(() => {
            //刷新继续游戏 按钮位置，贴近banner
            if (WxBanner.instance.banners.length > 0 && !DynamicData.instance.isAuditor && this.visible) {
                this.nodeBtnContinue.position.y = WxBanner.instance.bannerTop - canvas.height/2 - this.getFitValue(20);
                this.nodeNormal.position.y = WxBanner.instance.bannerTop - canvas.height/2 - this.getFitValue(150);

                fightUI.checkBanner();
            }
        }, 1000);

        audioManager.instance.stop('background.mp3');

        this.cardList.show(4, '关卡结算界面');

        this.videoReward = 500; //TODO 后续改成公式

        this.nodeLevel.label.string = `第 ${level} 关`;
        this.nodeScore.label.string = score;

        this.nodeNormalMoney.label.string = '+' + this.videoReward;

        gameLogic.updateRewardIcon(FightConstants.SHARE_FUNCTION.NEXT_LEVEL, this.nodeNormalGetIcon);

        audioManager.instance.playSound('win.mp3', false);

        DataBus.instance.fightTimes++;
    }

    onTouchStart (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        
        if (this.nodeBtnContinue) {
            this.isTouchContinue = this.nodeBtnContinue.contains(this.lastTouchPos);
            this.isTouchContinue ? this.nodeBtnContinue.setScale(0.85) : this.nodeBtnContinue.setScale(1);
        }

        this.isTouchGet = this.nodeNormalGet.contains(this.lastTouchPos);
        this.isTouchGet ? this.nodeNormalGet.setScale(0.6) : this.nodeNormalGet.setScale(0.7);
    }

    onTouchMove (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

    }

    onTouchEnd (e) {
        e.isStopPropagation = true;
        if (this.isTouchContinue) {
            this.nodeBtnContinue.setScale(1);
            if (this.nodeBtnContinue.contains(this.lastTouchPos)) {
                this.onBtnContinueClick();
            }
        } else if (this.isTouchGet) {
            this.nodeNormalGet.setScale(0.7);
            if (this.nodeNormalGet.contains(this.lastTouchPos)) {
                this.onBtnGetRewardClick();
            }
        }
    }

    onBtnContinueClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-过关界面-继续游戏`, {
                
            });
        }

        let fightUI = this.parent.fightUI;
        fightUI.hideBanner();

        if (DataBus.instance.fightTimes % 2 === 0 && !DynamicData.instance.isAuditor && Number(DynamicData.instance.gameConfig.showCrazySpotPanel)) {
            //显示疯狂点击界面
            let crazy = new CrazyClick(this.parent);
            crazy.show(()=>{
                this.showFullScreen(fightUI);
            })
        } else {
            this.showFullScreen(fightUI);
        }

        this.destroy();
    }

    showFullScreen (fightUI) {
        if (fightUI) {
            fightUI.hideBanner();
        }

        let node = new FullScreenRecommend(fightUI.parent);
        node.show(()=>{
            if (fightUI) {
                fightUI.checkBanner(); //检查是否展示banner
            }

            DataBus.instance.passLevel();

            clientEvent.dispatchEvent('nextLevel');
        });
    }

    onBtnGetRewardClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-过关界面-奖励`, {
                
            });
        }

        gameLogic.openReward(FightConstants.SHARE_FUNCTION.NEXT_LEVEL, (err)=>{
            if (!err) {
                if (wx.aldSendEvent) {
                    wx.aldSendEvent(`按钮点击-过关界面-奖励成功`, {
                        
                    });
                }

                //奖励对应金币
                clientEvent.dispatchEvent('rewardScore', this.videoReward);

                this.onBtnContinueClick();
            }
        })
    }
}