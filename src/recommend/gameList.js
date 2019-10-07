import { DynamicData } from "../framework/dynamicData";
import GameItem from "./gameItem";
import Node from "../engine/node";
import util from "../engine/util";

export default class GameList extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.anchorPoint = {x: 0, y:0};

        this.scrollView = new Node(this);
        this.anchorPoint = {x: 0, y: 0};
        this.scrollView.width = canvas.width;
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

    show () {
        let arrGames = DynamicData.instance.getRecommendGameList();

        let len = arrGames.length > 10? 10: arrGames.length;

        for (let idx = 0; idx < len; idx++) {
            let node = this.scrollView.children[idx];
            if (idx >= this.scrollView.children.length) {
                node = new GameItem(this.scrollView);
            }

            node.show(arrGames[idx]);

            let row = Math.floor(idx / 2);
            let col = idx % 2;
            node.position = {x: 190*gameSpace.ratio + col * 340*gameSpace.ratio, y: 190 *gameSpace.ratio + row * 350 *gameSpace.ratio}
        }

        let rowCnt = Math.floor(len / 2);
        this.scrollView.height = rowCnt * 350*gameSpace.ratio + 20*gameSpace.ratio;
    }

    onTouchStart (e) {
        
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        
        this.isTouch = this.contains(this.lastTouchPos);
        if (this.isTouch) {
            e.stopPropagation();
        }


    }

    onTouchMove (e) {

        if (!this.isTouch) {
            return;
        }

        e.stopPropagation();
        
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        

        let offsetY = y - this.lastTouchPos.y;
        let posScrollView = this.scrollView.position;
        posScrollView.y += offsetY;
        posScrollView.y = posScrollView.y > 0 ? 0: posScrollView.y;
        posScrollView.y = posScrollView.y < this.height - this.scrollView.height ? this.height - this.scrollView.height: posScrollView.y;

        this.lastTouchPos = {x: x, y: y};
    }

    onTouchEnd (e) {
        if (!this.isTouch) {
            return;
        }

        e.stopPropagation();

        if (Math.abs(this.startPos.x - this.lastTouchPos.x) < 10 && Math.abs(this.startPos.y - this.lastTouchPos.y) < 10) {
            //表示单击，检测下，哪个游戏被点击到
            let arrGamesNode = this.scrollView.children; 
            for (let idx = 0; idx < arrGamesNode.length; idx++) {
                let gameNode = arrGamesNode[idx];
                if (gameNode.checkIsClick && gameNode.checkIsClick(this.lastTouchPos)) {
                    break;
                }
            }
        }
    }
}