import Node from "../engine/node";
import Sprite from "../engine/sprite";
import Pool from "../engine/pool";
import ScoreTips from "./scoreTips";
import { clientEvent } from "../engine/clientEvent";
import { DynamicData } from "../framework/dynamicData";

export default class CrazyClick extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.width = canvas.width;
        this.height = canvas.height;

        // this.addColorLayer('#000000');

        this.bgNode = new Node(this);
        this.bgNode.addSprite('images/ui/bg.jpg');
        this.bgNode.anchorPoint.y = 1;
        this.bgNode.position.y = canvas.height/2 + this.getFitValue(200);

        this.imgIdleSrc = 'images/fight/man/dig/dig01.png';
        this.imgDigSrc = 'images/fight/man/dig/dig02.png';

        this.mining = new Node(this.bgNode);
        this.mining.anchorPoint.y = 1;
        this.mining.addSprite('images/fight/man/dig/dig03.png');
        this.mining.position = {x: this.getFitValue(80), y: this.getFitValue(-850)};
        this.mining.setScale(1.67);
        
        this.miner = new Node(this.bgNode);
        this.miner.addSprite(this.imgIdleSrc);
        this.miner.position = {x: this.getFitValue(-100), y: this.getFitValue(-895)};
        this.miner.anchorPoint.y = 1;
        this.miner.setScale(1.67);

        this.nodeCrazy = new Node(this);
        this.nodeCrazy.width = this.width;
        this.nodeCrazy.height = this.height;

        let nodeCenter = new Node(this.nodeCrazy);
        nodeCenter.position.y = canvas.height / 2 - this.getFitValue(800);
        nodeCenter.addSprite('images/ui/fight/clickBg01.png');
        nodeCenter.setScale(2, 4);
        
        let height = this.getFitValue(300) * 4;
        let nodeTop = new Node(nodeCenter);
        nodeTop.addColorLayer('#000000');
        nodeTop.width = canvas.width;
        nodeTop.height = canvas.height - nodeCenter.getWorldPosition().y - height/2;
        nodeTop.anchorPoint.y = 1;
        nodeTop.position.y = - height/2;

        let nodeBottom = new Node(nodeCenter);
        nodeBottom.addColorLayer('#000000');
        nodeBottom.width = canvas.width;
        nodeBottom.height = Math.abs(nodeCenter.getWorldPosition().y - height/2);
        nodeBottom.anchorPoint.y = 0;
        nodeBottom.position.y = height/2;

        //底下矿石
        this.nodeBottom = new Node(this.nodeCrazy);
        this.nodeBottom.anchorPoint.y = 1;
        this.nodeBottom.addSprite('images/ui/home/homeBoxGames.png', Sprite.FILL_TYPE.CUSTOM);
        this.nodeBottom.width = canvas.width;
        this.nodeBottom.height = this.getFitValue(600);
        this.nodeBottom.position.y = canvas.height/2;

        //倒计时
        this.nodeCountdown = new Node(this.nodeCrazy);
        this.nodeCountdown.position.y = canvas.height/2 - this.getFitValue(550);
        this.nodeCountdown.addLabel('6', this.getFitValue(80));
        this.nodeCountdown.color = '#ffed85';

        this.tips = new Node(this.nodeBottom);
        this.tips.position.y = this.getFitValue(-450);
        this.tips.addLabel('快速点击收集矿石');

        this.nodeMinesContainer = new Node(this.nodeBottom);
        this.nodeMinesContainer.width = this.nodeBottom.width;
        this.nodeMinesContainer.height = this.nodeBottom.height;
        this.nodeMinesContainer.position.y = -this.nodeBottom.height/2;


        this.nodeBtnClose = new Node(this.nodeCrazy);
        this.nodeBtnClose.position = {x: -canvas.width/2 + this.getFitValue(50), y: -canvas.height/2 + gameSpace.menuTop + this.getFitValue(50)};
        this.nodeBtnClose.addSprite('images/ui/common/commonIconClose.png');

        this.nodeOver = new Node(this);
        this.nodeOver.width = canvas.width;
        this.nodeOver.height = canvas.height;
        this.nodeOver.visible = false;
        this.nodeOver.addColorLayer('#000000');
        this.nodeOver.opacity = 200;

        this.nodeTips = new Node(this.nodeOver);
        this.nodeTips.addLabel('额外获得', this.getFitValue(60));
        this.nodeTips.position.y = -this.getFitValue(380);

        this.nodeValue = new Node(this.nodeTips);
        this.nodeValue.addLabel('收集      +0', this.getFitValue(60), 'left');
        this.nodeValue.anchorPoint.x = 0;
        this.nodeValue.position = {x: -this.getFitValue(170), y: this.getFitValue(120)};
        this.nodeValue.color = '#ffec78';

        this.nodeMoneyIcon = new Node(this.nodeTips);
        this.nodeMoneyIcon.addSprite('images/ui/fight/fightIconGold.png');
        this.nodeMoneyIcon.position = {x: 0, y: this.getFitValue(105)};

        this.nodeBtnOK = new Node(this.nodeOver);
        this.nodeBtnOK.addSprite('images/ui/common/commonBtn01.png');
        this.nodeBtnOK.position = {x: 0, y: canvas.height/2 - this.getFitValue(350)};

        this.nodeOKTips = new Node(this.nodeBtnOK);
        this.nodeOKTips.addLabel('确定', this.getFitValue(48));
        this.nodeOKTips.position = {x: 0, y: this.getFitValue(10)};
        this.nodeOKTips.color = '#89350d';


        this.dropMines = ['gold1', 'diamond1', 'diamond2'];
    }

    show (cb) {
        this.closeCb = cb;
        this.pickNum = 0;
        this.score = 0;
        this.nodeCrazy.visible = true;
        this.nodeOver.visible = false;

        let fightUI = this.parent.fightUI;
        if (fightUI) {
            fightUI.hideBanner();
        }

        this.startPlay();
        
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

    startPlay () {
        this.countDown = 6;
        this.coolTime = 0;

        //5秒后，即只剩下1秒的时候展示banner广告
        if (Number(DynamicData.instance.gameConfig.crazySpotAwardBanner)) {
            this.showBannerTimer = setTimeout(() => {
                let fightUI = this.parent.fightUI;
                if (fightUI) {
                    fightUI.checkBanner();
                }
            }, 5000);
        }
    }

    gameOver () {
        this.nodeCrazy.visible = false;
        this.nodeOver.visible = true;

        this.nodeValue.label.string = `收集      +${this.score}`;
    }

    update (dt) {
        super.update(dt);

        if (this.countDown > 0) {
            this.countDown -= dt;

            if (this.countDown < 0) {
                this.countDown = 0;
                this.gameOver();
            }

            //更新时间
            let time = Math.ceil(this.countDown);
            this.nodeCountdown.label.string = time;

            if (this.countDown > 0) {
                this.coolTime+= dt;
                if (this.countDown > 3) {
                    if (this.coolTime >= 0.5) {
                        this.coolTime -= 0.5;

                        //随机生产一个全范围的矿石
                        this.generateMines(false);
                    }
                } else {
                    if (this.coolTime >= 0.1) {
                        this.coolTime -= 0.1;

                        //随机生成一个在底部的矿石
                        this.generateMines(true);
                    }
                }
            }

            this.checkMines();
        }
    }

    generateMines (isBottom) {
        let x = Math.floor(Math.random() * this.nodeMinesContainer.width * 0.8) - this.nodeMinesContainer.width * 0.4;
        let y = Math.floor(Math.random() * this.nodeMinesContainer.height * 0.75) - this.nodeMinesContainer.height * 0.25 - this.getFitValue(20); //四分三的范围刷

        if (isBottom) {
            y = Math.floor(Math.random() * this.nodeMinesContainer.height / 2) - this.getFitValue(20); //2分1下刷
        }

        let mine = this.dropMines[Math.floor(Math.random() * this.dropMines.length)];

        let nodeMine = new Node(this.nodeMinesContainer);
        nodeMine.position = {x: x, y: y};
        nodeMine.addSprite(`images/fight/mine/${mine}.png`);
        nodeMine.generateTime = Date.now() + 800;
    }

    checkMines () {
        //检查是否过时了
        let now = Date.now();

        let arrChild = [];
        
        this.nodeMinesContainer.children.forEach(element=>{
            arrChild.push(element);
        });

        arrChild.forEach(element=>{
            if (element.generateTime < now) {
                element.destroy();
            }
        });
    }

    playDigAni () {
        if (this.digTimer) {
            clearTimeout(this.digTimer);
            this.digTimer = null;
        }
        
        this.miner.sprite.init(this.imgIdleSrc);

        this.digTimer = setTimeout(() => {
            this.miner.sprite.init(this.imgDigSrc);

            this.digTimer = setTimeout(() => {
                this.miner.sprite.init(this.imgIdleSrc);
                this.digTimer = null;
            }, 100);
        }, 100);
    }

    pickMine () {
        for (let idx = 0; idx < this.nodeMinesContainer.children.length; idx++) {
            let item = this.nodeMinesContainer.children[idx];
            if (item.contains(this.lastTouchPos)) {
                item.destroy();
                this.pickNum++;

                //播放挖矿动画
                this.playDigAni();

                let score = 5 + (this.pickNum - 1) * 5;
                this.score += score;

                this.showScoreTips( score, this.lastTouchPos)
                break;
            }
        }
    }

    showScoreTips (score, pos) {
        //随机个坐标
        pos = {x: pos.x + this.getFitValue(50) - canvas.width/2, y: pos.y - this.getFitValue(50) - canvas.height/2};

        let tips = Pool.instance.getItemByClass('ScoreTips', ScoreTips, this);
        tips.parent = this;
        tips.show(`+${score}`, pos);
    }

    onTouchStart (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        
        if (this.nodeCrazy.visible) {
            this.isTouchClose = this.nodeBtnClose.contains(this.lastTouchPos);
            this.isTouchClose ? this.nodeBtnClose.setScale(0.85) : this.nodeBtnClose.setScale(1);
        } else if (this.nodeOver.visible) {
            this.isTouchOK = this.nodeBtnOK.contains(this.lastTouchPos);
            this.isTouchOK ? this.nodeBtnOK.setScale(0.85) : this.nodeBtnOK.setScale(1);
        }
    }

    onTouchMove (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

    }

    onTouchEnd (e) {
        e.isStopPropagation = true;

        if (this.isTouchClose) {
            this.isTouchClose = false;
            this.nodeBtnClose.setScale(1);
            if (this.nodeBtnClose.contains(this.lastTouchPos)) {
                this.onBtnCloseClick();
            }
        } else if (this.isTouchOK) {
            this.onBtnOKClick();
        } else if (this.nodeCrazy.visible) {
            this.pickMine();
        }
        
    }

    onBtnCloseClick () {
        this.closeCb && this.closeCb(0);

        if (this.showBannerTimer) {
            clearTimeout(this.showBannerTimer);
            this.showBannerTimer = null;
        }

        this.destroy();
    }

    onBtnOKClick () {
        clientEvent.dispatchEvent('rewardScore', this.score);

        this.onBtnCloseClick();
    }
}