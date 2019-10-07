import Node from "../engine/node";
import { clientEvent } from "../engine/clientEvent";
import { DynamicData } from "../framework/dynamicData";
import util from "../engine/util";
import Sprite from "../engine/sprite";
import GameList from "./gameList";

export default class Recommend extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.addColorLayer('#34a0f4');
        this.width = canvas.width;
        this.height = canvas.height;

        this.gameList = new GameList(this);
        this.gameList.show();
        this.gameList.position = {x: -canvas.width/2, y: -canvas.height/2 + 480*gameSpace.ratio};
        this.gameList.width = canvas.width;
        this.gameList.height = canvas.height / 2 - this.gameList.position.y - 100*gameSpace.ratio;

        //顶部遮挡
        this.nodeTopMask = new Node(this);
        this.nodeTopMask.anchorPoint = {x: 0.5, y: 0};
        this.nodeTopMask.position = {x: 0, y: -canvas.height/2};
        this.nodeTopMask.addColorLayer('#34a0f4');
        this.nodeTopMask.width = canvas.width;
        this.nodeTopMask.height = 480*gameSpace.ratio;

        //返回按钮
        this.nodeBack = new Node(this);
        this.nodeBack.position = {x: -canvas.width / 2 + 100*gameSpace.ratio, y: -canvas.height/2 + 80*gameSpace.ratio};
        this.nodeBack.addSprite('images/ui/recommend/back1.png');

        //好友在玩
        this.nodeFriendTitle = new Node(this);
        this.nodeFriendTitle.position = {x: -canvas.width/2 + 130*gameSpace.ratio, y: -canvas.height/2 + 200*gameSpace.ratio};
        this.nodeFriendTitle.addLabel('好友在玩');

        this.nodeFriendGames = new Node(this);
        this.nodeFriendGames.position = {x: 0, y: -canvas.height/2 + 300*gameSpace.ratio}
        this.nodeFriendGames.addSprite('images/ui/recommend/gameBar.png');
        this.initGameBar();

        //热门推荐
        this.nodeRecommendTitle = new Node(this);
        this.nodeRecommendTitle.position = {x: -canvas.width/2 + 130*gameSpace.ratio, y: -canvas.height/2 + 450*gameSpace.ratio};
        this.nodeRecommendTitle.addLabel('热门推荐');

        //底部遮罩
        this.nodeBottomMask = new Node(this);
        this.nodeBottomMask.anchorPoint.y = 1;
        this.nodeBottomMask.position.y = canvas.height/2;
        this.nodeBottomMask.width = canvas.width;
        this.nodeBottomMask.height = 100*gameSpace.ratio;
        this.nodeBottomMask.addColorLayer('#34a0f4');

        //继续游戏按钮
        this.nodeBtnContinue = new Node(this.nodeBottomMask);
        this.nodeBtnContinue.position.y = -50*gameSpace.ratio;
        this.nodeBtnContinue.addSprite('images/ui/recommend/imgPlay.png');
        // this.nodeBtnContinue.setScale(0.8);

        // this.nodeBtnContinueTxt = new Node(this.nodeBtnContinue);
        // this.nodeBtnContinueTxt.addLabel('继续游戏', 32*gameSpace.ratio);
        // this.nodeBtnContinueTxt.color = '#000000';
        // this.nodeBtnContinueTxt.position.y = 8*gameSpace.ratio;
    }

    onEnable () {
        canvas.addEventListener('touchstart', this.onTouchStart);
        canvas.addEventListener('touchmove', this.onTouchMove);
        canvas.addEventListener('touchend', this.onTouchEnd);

        if (wx.aldSendEvent) {
            wx.aldSendEvent(`界面曝光-盒子界面`, {
                
            });
        }
    }

    onDisable () {
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);
    }

    initGameBar () {
        let recommendGames = util.randArray(DynamicData.instance.getRecommendGameList());

        let len = recommendGames.length > 5 ? 5 : recommendGames.length;
        for (let idx = 0; idx < len; idx++) {
            let game = recommendGames[idx];
            let node = new Node(this.nodeFriendGames);
            node.addSprite(game.logo, Sprite.FILL_TYPE.CUSTOM);
            node.width = 110*gameSpace.ratio;
            node.height = 110*gameSpace.ratio;
            node.position = {x: -270*gameSpace.ratio + idx*135*gameSpace.ratio, y: 0};
            node.gameInfo = game;
        }
    }

    onTouchStart (e) {
        e.stopPropagation();

        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        this.isTouchBack = this.nodeBack.contains(this.lastTouchPos);
        this.isTouchBack ? this.nodeBack.setScale(0.85) : this.nodeBack.setScale(1);

        this.isTouchContinue = this.nodeBtnContinue.contains(this.lastTouchPos);
        this.isTouchContinue ? this.nodeBtnContinue.setScale(0.85) : this.nodeBtnContinue.setScale(1);
        // this.isTouchContinue ? this.nodeBtnContinueTxt.setScale(0.8) : this.nodeBtnContinueTxt.setScale(1);
    }

    onTouchMove (e) {
        e.stopPropagation();
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
    }

    show (closeCb) {
        this.closeCb = closeCb;
    }

    onBtnCloseClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-盒子界面-返回`, {
                
            });
        }

        //返回界面
        this.destroy();

        this.closeCb && this.closeCb();

        // clientEvent.dispatchEvent('resumeGame');
    }

    onTouchEnd (e) {
        e.stopPropagation();
        if (this.isTouchBack) {
            this.nodeBack.setScale(1);

            if (this.nodeBack.contains(this.lastTouchPos)) {
                this.onBtnCloseClick();
            }
        } else if (this.isTouchContinue) {
            this.nodeBtnContinue.setScale(0.8);

            if (this.nodeBtnContinue.contains(this.lastTouchPos)) {
                if (wx.aldSendEvent) {
                    wx.aldSendEvent(`按钮点击-盒子界面-继续游戏`, {
                        
                    });
                }

                this.onBtnCloseClick();
            }
        }

        if (Math.abs(this.startPos.x - this.lastTouchPos.x) < 10 && Math.abs(this.startPos.y - this.lastTouchPos.y) < 10) {
            //表示单击，检查下是否点到游戏了
            let arrGames = this.nodeFriendGames.children;
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

                                wx.aldSendEvent(`卖量版块-盒子-横向滚动条`, {
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