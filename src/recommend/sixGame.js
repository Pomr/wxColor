import Node from "../engine/node";
import CardItem from "./cardItem";
import util from "../engine/util";
import { DynamicData } from "../framework/dynamicData";
import SixGameItem from "./sixGameItem";

const MAX_COLUMN = 3; //最多几列

export default class SixGame extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);


        this.width = canvas.width;
        this.height = this.getFitValue(400);
        // this.addColorLayer('#ff0000');
        // this.opacity = 200;
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

    show (count = 6, parentName='复活界面') {
        this.parentName = parentName;
        this.initGameList(count);
    }

    initGameList (count) {
        let recommendGames = util.randArray(DynamicData.instance.getRecommendGameList());

        this.removeAllChildren();

        let len = recommendGames.length > count ? count : recommendGames.length;

        for (let idx = 0; idx < len; idx++) {
            let game = recommendGames[idx];
            let node = new SixGameItem(this);
            node.show(idx, game);
            // node.setScale(0.8);

            let row = Math.floor(idx / MAX_COLUMN);
            let col = Math.floor(idx % MAX_COLUMN);

            
            node.position = {x: (col - 1) * this.getFitValue(220), y: row * this.getFitValue(260) - this.getFitValue(130)};
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

                                wx.aldSendEvent(`卖量版块-${this.parentName}-6个卡片卖量`, {
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