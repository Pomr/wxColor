import Node from "../engine/node";
import FullScreenItem from "./fullScreenItem";
import util from "../engine/util";
import { DynamicData } from "../framework/dynamicData";
import { Tween } from "../libs/Tween";

export default class FullScreenRecommend extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.addColorLayer('#ffffff');
        this.opacity = 255;
        this.width = canvas.width;
        this.height = canvas.height;

        this.nodeGameContainer = new Node(this);
        this.nodeGameContainer.anchorPoint.y = 0;
        this.nodeGameContainer.position.y = -canvas.height/2;

        //底部遮罩
        this.nodeBottomMask = new Node(this);
        this.nodeBottomMask.anchorPoint.y = 1;
        this.nodeBottomMask.position.y = canvas.height/2;
        this.nodeBottomMask.width = canvas.width;
        this.nodeBottomMask.height = this.getFitValue(100);
        this.nodeBottomMask.addColorLayer('#ffffff');
        this.nodeBottomMask.visible = false;

        //继续游戏按钮
        this.nodeBtnContinue = new Node(this.nodeBottomMask);
        this.nodeBtnContinue.position = {x:this.getFitValue(0), y:this.getFitValue(-50)};
        this.nodeBtnContinue.addSprite('images/ui/recommend/button01.png');

        this.nodeBtnContinueTxt = new Node(this.nodeBtnContinue);
        this.nodeBtnContinueTxt.addLabel('继续游戏');
        this.nodeBtnContinueTxt.color = '#000000';
        this.nodeBtnContinueTxt.position = {x:this.getFitValue(0), y: this.getFitValue(15)};

        //返回首页
        // this.nodeBtnHome = new Node(this.nodeBottomMask);
        // this.nodeBtnHome.position = {x:this.getFitValue(150), y:this.getFitValue(-50)};
        // this.nodeBtnHome.addSprite('images/ui/recommend/button02.png');

        // this.nodeBtnHomeTxt = new Node(this.nodeBtnHome);
        // this.nodeBtnHomeTxt.addLabel('返回首页');
        // this.nodeBtnHomeTxt.color = '#000000';
        // this.nodeBtnHomeTxt.position = {x:this.getFitValue(0), y: this.getFitValue(15)};

        this.top = 0;
        this.bottom = 0;
        this.keepTime = 0;
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

    //点击继续游戏时回调
    show (continueCb) {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`界面曝光-全屏卖量界面`, {
                
            });
        }

        if (DynamicData.instance.gameConfig.hasOwnProperty('btnShowInterval')) {
            this.delayShowTime = Number(DynamicData.instance.gameConfig['btnShowInterval']);
        } else {
            this.delayShowTime = 3;
        }

        this.continueCb = continueCb;
        // this.homeCb = homeCb;

        setTimeout(() => {
            this.nodeBottomMask.visible = true;
        }, this.delayShowTime * 1000);

        this.initGameList();

        this.direction = -1;
        this.startMoving();
    }

    initGameList () {
        let recommendGames = util.randArray(DynamicData.instance.getRecommendGameList());

        this.nodeGameContainer.removeAllChildren();

        let len = recommendGames.length;

        for (let idx = 0; idx < len; idx++) {
            let game = recommendGames[idx];
            let node = new FullScreenItem(this.nodeGameContainer);
            node.show(game);
            // node.setScale(0.8);

            let row = Math.floor(idx / 2);
            let col = Math.floor(idx % 2);

            let x = this.getFitValue(180);
            if (col === 0) {
                x = -x;
            }
            node.position = {x: x, y: row * this.getFitValue(270) + this.getFitValue(135)};
        }

        this.top = -canvas.height/2 - Math.ceil(len / 2) * this.getFitValue(270) - this.getFitValue(100) + canvas.height;
        this.top = this.top > 0 ? 0 : this.top;
        this.bottom = -canvas.height/2;
    }

    stopAnimation () {
        if (this.waitTimer) {
            clearTimeout(this.waitTimer);
        }

        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }

    startMoving () {
        this.stopAnimation();

        if (this.top === 0) {
            //不需要做动画了
            return;
        }

        let target = this.top;
        if (this.direction === 1) {
            target = this.bottom;
        }

        if (Math.abs((this.nodeGameContainer.position.y - target)) <= 0) {
            //直接换方向
            this.direction = -this.direction;
            this.startMoving();
            return;
        }

        this.tween = new Tween(this.nodeGameContainer.position).to({y: target}, Math.abs((this.nodeGameContainer.position.y - target) / 300)).onComplete(()=>{
            this.waitTimer = setTimeout(() => {
                this.direction = -this.direction;
                this.startMoving();
            }, 1000);
        }).start();
    }

    stopMovingByTouch () {
        this.stopAnimation();

        this.keepTime = 2;
    }

    update (dt) {
        super.update(dt);

        if (this.keepTime > 0) {
            this.keepTime -= dt;

            if (this.keepTime <= 0) {
                this.keepTime = 0;

                //触发移动
                this.startMoving();
            }
        }
    }

    onTouchStart (e) {
        e.stopPropagation();

        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;
        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        this.preTouchPos = {x: x, y: y};
        this.isTouchBar = false;

        
        this.isTouchBack = this.nodeBtnContinue.contains(this.lastTouchPos);
        this.isTouchBack ? this.nodeBtnContinue.setScale(0.85) : this.nodeBtnContinue.setScale(1);

        // this.isTouchHome = this.nodeBtnHome.contains(this.lastTouchPos);
        // this.isTouchHome ? this.nodeBtnHome.setScale(0.85) : this.nodeBtnHome.setScale(1);

        if (!this.isTouchBack && !this.isTouchHome) {
            if (this.contains(this.lastTouchPos)) {
                this.isTouchBar = true;
    
                this.stopMovingByTouch();
            }
        }
    }

    onTouchMove (e) {
        e.stopPropagation();
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

        if (this.isTouchBar) {
            this.keepTime = 2;
        }

        
        let offsetY = this.lastTouchPos.y - this.preTouchPos.y;
        this.nodeGameContainer.position.y += offsetY;

        this.nodeGameContainer.position.y = this.nodeGameContainer.position.y < this.top ? this.top : this.nodeGameContainer.position.y;
        this.nodeGameContainer.position.y = this.nodeGameContainer.position.y > this.bottom ? this.bottom : this.nodeGameContainer.position.y;

        this.preTouchPos = {x: x, y: y};
    }

    onTouchEnd (e) {
        e.stopPropagation();
        this.isTouchBar = false;
        if (this.isTouchBack) {
            this.nodeBtnContinue.setScale(1);

            if (this.nodeBtnContinue.contains(this.lastTouchPos)) {

                this.onBtnContinueClick();
            }
        } else if (this.isTouchHome) {
            // this.nodeBtnHome.setScale(1);

            // if (this.nodeBtnHome.contains(this.lastTouchPos)) {

            //     this.onBtnHomeClick();
            // }
        } else {
            if (this.startPos && this.lastTouchPos && Math.abs(this.startPos.x - this.lastTouchPos.x) < 10 && Math.abs(this.startPos.y - this.lastTouchPos.y) < 10) {
                //表示单击，检查下是否点到游戏了
                let arrGames = this.nodeGameContainer.children;
                for (let idx = 0; idx < arrGames.length; idx++) {
                    let gameNode = arrGames[idx];
                    if (gameNode.contains(this.lastTouchPos)) {
                        //点到游戏
                        wx.navigateToMiniProgram({ 
                            appId: gameNode.gameInfo.appid,
                            path: gameNode.gameInfo.path,
            
                            success: ()=>{
                                if (wx.aldSendEvent) {
                                    wx.aldSendEvent(`产品卖量-${gameNode.gameInfo.name}`, {
                                        
                                    });
    
                                    wx.aldSendEvent(`卖量版块-全屏卖量界面`, {
                                        name: gameNode.gameInfo.name
                                    });
                                }
                            },
                            fail: ()=>{
                            }
                        });
    
                        break;
                    }
                }
            }
        }
    }

    onBtnContinueClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-全屏卖量界面-重新开始`, {
                
            });
        }

        this.destroy();

        this.continueCb && this.continueCb();
    }

    onBtnHomeClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-全屏卖量界面-返回首页`, {
                
            });
        }

        this.destroy();

        // this.homeCb && this.homeCb();
    }
}