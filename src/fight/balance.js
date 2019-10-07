import Node from "../engine/node";
import DataBus from "../databus";
import { clientEvent } from "../engine/clientEvent";
import audioManager from "../engine/audioManager";
import CardList from "../recommend/cardList";
import { gameLogic } from "../framework/gameLogic";
import FightConstants from "./fightConstants";
import FullScreenRecommend from "../recommend/fullScreenRecommend";
import WxBanner from "../libs/wxBanner";
import { DynamicData } from "../framework/dynamicData";

export default class Balance extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.width = canvas.width;
        this.height = canvas.height;
        this.addColorLayer('#000000');
        this.opacity = 200;

        this.nodeTitle = new Node(this);
        this.nodeTitle.addLabel('本次探险收获', this.getFitValue(40));
        this.nodeTitle.position.y = this.getFitValue(-520);

        this.nodeScore = new Node(this);
        this.nodeScore.anchorPoint.x = 0;
        this.nodeScore.position = {x: -this.getFitValue(30), y: -this.getFitValue(445)};
        this.nodeScore.addLabel('99999', this.getFitValue(60), 'left');
        this.nodeScore.label.fontWeight = 'bold';
        this.nodeScore.color = '#fef555';

        this.nodeScoreIcon = new Node(this);
        this.nodeScoreIcon.addSprite('images/ui/fight/fightIconGold.png');
        this.nodeScoreIcon.position = {x: -this.getFitValue(70), y: -this.getFitValue(465)};


        this.nodeMaxScore = new Node(this);
        this.nodeMaxScore.addLabel('历史最高： 999', this.getFitValue(40));
        this.nodeMaxScore.position.y = -this.getFitValue(380);

        //为了解决异步问题
        this.cardList = new CardList(this);
        this.cardList.position.y = -this.getFitValue(50);

        this.menuY = canvas.height/2 - this.getFitValue(140);
        this.nodeMenu = new Node(this);
        this.nodeMenu.position.y = this.menuY;

        this.nodeBtnHome = new Node(this.nodeMenu);
        this.nodeBtnHome.addSprite('images/ui/balance/balanceIconHome.png');
        this.nodeBtnHome.position.x = -this.getFitValue(200);

        this.nodeBtnPlay = new Node(this.nodeMenu);
        this.nodeBtnPlay.addSprite('images/ui/balance/balanceIconPlay.png');
        // this.nodeBtnPlay.position.x = -this.getFitValue(150);

        this.nodeBtnShare = new Node(this.nodeMenu);
        this.nodeBtnShare.addSprite('images/ui/balance/balanceIconShare.png');
        this.nodeBtnShare.position.x = this.getFitValue(200);
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

    show (score) {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`界面曝光-结算界面`, {
                
            });
        }

        this.cardList.show(4, '结算界面');

        this.nodeScore.label.string = score;
        let maxScore = DataBus.instance.getMaxScore();
        if (score > maxScore) {
            maxScore = score;
            DataBus.instance.updateMaxScore(maxScore);
        }

        this.nodeMaxScore.label.string = `历史最高： ${maxScore}`;

        let fightUI = this.parent.fightUI;
        fightUI.hideBanner();

        this.nodeMenu.position.y = this.menuY;
        setTimeout(() => {
            if (WxBanner.instance.banners.length > 0 && !DynamicData.instance.isAuditor && this.visible) {
                 //刷新继续游戏 按钮位置，贴近banner
                this.nodeMenu.position.y = WxBanner.instance.bannerTop - canvas.height/2 - this.getFitValue(70);

                fightUI.checkBanner();
            }
        }, 1000);
    }

    // showWin(score) {
    //     //继续游戏按钮
    //     this.nodeBtnContinue = new Node(this);
    //     this.nodeBtnContinue.position.y = 0;
    //     this.nodeBtnContinue.addSprite('images/ui/common2/commonButton01.png');

    //     this.nodeBtnContinueTxt = new Node(this.nodeBtnContinue);
    //     this.nodeBtnContinueTxt.addLabel('下一关', 32*gameSpace.ratio);
    //     this.nodeBtnContinueTxt.color = '#000000';
    //     this.nodeBtnContinueTxt.position.y = this.getFitValue(8);

    //     audioManager.instance.playSound('win.mp3', false);
    // }

    // showFailed () {
    //     this.nodeBtnBack = new Node(this);
    //     this.nodeBtnBack.position.y = 0;
    //     this.nodeBtnBack.addSprite('images/ui/common2/commonButton01.png');

    //     this.nodeBtnBackTxt = new Node(this.nodeBtnBack);
    //     this.nodeBtnBackTxt.addLabel('返回首页', 32*gameSpace.ratio);
    //     this.nodeBtnBackTxt.color = '#000000';
    //     this.nodeBtnBackTxt.position.y = this.getFitValue(8);

    //     audioManager.instance.playSound('fail.mp3', false);
    // }

    onBtnHomeClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-结算界面-主页`, {
                
            });
        }

        //重置回去
        DataBus.instance.resetLevel();

        clientEvent.dispatchEvent('restart');

        this.destroy();
    }

    onBtnPlayClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-结算界面-继续`, {
                
            });
        }

        let fightUI = this.parent.fightUI;
        fightUI.hideBanner();

        //TODO 后续需要修改为弹出卖量窗口，在展示
        let node = new FullScreenRecommend(this.parent);
        node.show(()=>{
            fightUI.checkBanner();

            clientEvent.dispatchEvent('resetScore');

            DataBus.instance.resetLevel();

            clientEvent.dispatchEvent('nextLevel');
        });

        this.destroy();
    }

    onBtnShareClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-结算界面-分享`, {
                
            });
        }

        gameLogic.share(FightConstants.SHARE_FUNCTION.SHARE, {}, (err)=>{
            if (!err) {
                if (wx.aldSendEvent) {
                    wx.aldSendEvent(`按钮点击-结算界面-分享成功`, {
                        
                    });
                }
            }
        }, false);
    }

    onTouchStart (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        
        this.isTouchHome = this.nodeBtnHome.contains(this.lastTouchPos);
        this.isTouchHome ? this.nodeBtnHome.setScale(0.85) : this.nodeBtnHome.setScale(1);

        this.isTouchPlay = this.nodeBtnPlay.contains(this.lastTouchPos);
        this.isTouchPlay ? this.nodeBtnPlay.setScale(0.85) : this.nodeBtnPlay.setScale(1);

        this.isTouchShare = this.nodeBtnShare.contains(this.lastTouchPos);
        this.isTouchShare ? this.nodeBtnShare.setScale(0.85) : this.nodeBtnShare.setScale(1);
    }

    onTouchMove (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

    }

    onTouchEnd (e) {
        e.isStopPropagation = true;
        if (this.isTouchHome) {
            this.nodeBtnHome.setScale(1);
            if (this.nodeBtnHome.contains(this.lastTouchPos)) {
                this.onBtnHomeClick();
            }
        } else if (this.isTouchPlay) {
            this.nodeBtnPlay.setScale(1);
            if (this.nodeBtnPlay.contains(this.lastTouchPos)) {
                this.onBtnPlayClick();
            }
        } else if (this.isTouchShare) {
            this.nodeBtnShare.setScale(1);
            if (this.nodeBtnShare.contains(this.lastTouchPos)) {
                this.onBtnShareClick();
            }
        }
    }
}