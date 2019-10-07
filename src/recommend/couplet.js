import Node from "../engine/node";
import { DynamicData } from "../framework/dynamicData";
import util from "../engine/util";
import CoupletItem from "./coupletItem";

export default class Couplet extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);


        this.width = canvas.width;
        this.height = this.getFitValue(500);
    }

    onEnable () {
        canvas.addEventListener('touchstart', this.onTouchStart);
        canvas.addEventListener('touchmove', this.onTouchMove);
        canvas.addEventListener('touchend', this.onTouchEnd);

        if (this.children.length > 0) {
            this.startScheduleSwing();
        }
    }

    onDisable () {
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);

        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    show (count = 8, parentName = '主界面') {
        this.parentName = parentName;
        this.initGameList(count);

        this.startScheduleSwing();
    }

    initGameList (count) {
        let recommendGames = util.randArray(DynamicData.instance.getRecommendGameList());

        this.removeAllChildren();

        let len = recommendGames.length > count ? count : recommendGames.length;
        let half = Math.floor(len / 2);

        //left
        for (let idx = 0; idx < half; idx++) {
            let game = recommendGames[idx];
            let node = new CoupletItem(this);
            node.show(idx, game);
            node.position = {x: -this.getFitValue(290), y: -this.getFitValue(200) + idx * this.getFitValue(160)};
        }

        //right
        for (let idx = half; idx < len; idx++) {
            let game = recommendGames[idx];
            let node = new CoupletItem(this);
            node.show(idx, game);
            node.position = {x: this.getFitValue(290), y: -this.getFitValue(200) + (idx - half) * this.getFitValue(160)};
        }
    }

    onTouchStart (e) {
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
    }

    onTouchMove (e) {
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
    }

    onTouchEnd (e) {
        if (Math.abs(this.startPos.x - this.lastTouchPos.x) < 10 && Math.abs(this.startPos.y - this.lastTouchPos.y) < 10) {
            //表示单击，检查下是否点到游戏了
            let arrGames = this.children;
            for (let idx = 0; idx < arrGames.length; idx++) {
                let gameNode = arrGames[idx];
                if (gameNode.contains(this.lastTouchPos)) {
                    e.stopPropagation();
                    gameNode.hideRedDot();
                    //点到游戏
                    wx.navigateToMiniProgram({ 
                        appId: gameNode.gameInfo.appid,
                        path: gameNode.gameInfo.path,
        
                        success: ()=>{
                            if (wx.aldSendEvent) {
                                wx.aldSendEvent(`产品卖量-${gameNode.gameInfo.name}`, {
                                    
                                });

                                wx.aldSendEvent(`卖量版块-${this.parentName}-对联卖量`, {
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

    startScheduleSwing () {
        this.children.forEach(element=>{
            element.shake();
        });

        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(()=>{
            this.scheduleSwing();
        }, 4000);
    }

    scheduleSwing () {
        //随机抖动
        this.children.forEach(element=>{
            let isShake = Math.floor(Math.random() * 2) === 1;
            if (isShake) {
                element.shake();
            }
        });
    }
}