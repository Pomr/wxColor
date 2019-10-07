import Node from "../engine/node";
import util from "../engine/util";
import { DynamicData } from "../framework/dynamicData";
import GameBarItem from "./gameBarItem";
import { Tween } from "../libs/Tween";

export default class HGameBar extends Node {
    constructor(parent) {
        super(parent);

        this.width = canvas.width;
        this.height = this.getFitValue(120);
        this.addSprite('images/ui/home/homeBoxGames.png');

        this.nodeContainer = new Node(this);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.leftX = 0;
        this.rightX = 0;
        this.keepTime = 0;
    }

    show (parentName = '主界面') {
        this.parentName = parentName;

        let recommendGames = util.randArray(DynamicData.instance.getRecommendGameList());

        let startX = -canvas.width / 2 + this.getFitValue(60);
        for (let idx = 0; idx < recommendGames.length; idx++) {
            let game = recommendGames[idx];
            let node = new GameBarItem(this.nodeContainer);
            node.show(game);
            node.position = {x: startX + idx*this.getFitValue(120), y: 0};
        }

        this.leftX = -recommendGames.length * this.getFitValue(120) + canvas.width;
        this.leftX = this.leftX > 0 ? 0 : this.leftX;
        this.rightX = 0;

        this.direction = -1;
        this.startMoving();
    }

    startMoving () {
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }

        if (this.leftX === 0) {
            //不需要做动画了
            return;
        }

        let target = this.leftX;
        if (this.direction === 1) {
            target = this.rightX;
        }

        if (Math.abs((this.nodeContainer.position.x - target)) <= 0) {
            //直接换方向
            this.direction = -this.direction;
            this.startMoving();
            return;
        }

        this.tween = new Tween(this.nodeContainer.position).to({x: target}, Math.abs((this.nodeContainer.position.x - target) / 100)).onComplete(()=>{
            this.direction = -this.direction;
            this.startMoving();
        }).start();
    }

    stopMovingByTouch () {
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }

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

    onTouchStart (e) {
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        this.preTouchPos = {x: x, y: y};
        this.isTouchBar = false;

        if (this.contains(this.lastTouchPos)) {
            e.stopPropagation();
            this.isTouchBar = true;

            this.stopMovingByTouch();
        }
    }

    onTouchMove (e) {
        if (this.isTouchBar) {
            e.stopPropagation();

            this.keepTime = 2;
        }

        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

        let offsetX = this.lastTouchPos.x - this.preTouchPos.x;
        this.nodeContainer.position.x += offsetX;

        this.nodeContainer.position.x = this.nodeContainer.position.x < this.leftX ? this.leftX : this.nodeContainer.position.x;
        this.nodeContainer.position.x = this.nodeContainer.position.x > this.rightX ? this.rightX : this.nodeContainer.position.x;

        this.preTouchPos = {x: x, y: y};
    }

    onTouchEnd (e) {
        if (this.isTouchBar) {
            e.stopPropagation();
        }

        if (!this.startPos || !this.lastTouchPos) {
            return;
        }

        this.isTouchBar = false;

        if (Math.abs(this.startPos.x - this.lastTouchPos.x) < 10 && Math.abs(this.startPos.y - this.lastTouchPos.y) < 10) {
            //表示单击，检查下是否点到游戏了
            let arrGames = this.nodeContainer.children;
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

                                wx.aldSendEvent(`卖量版块-${this.parentName}-横向滚动条卖量`, {
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