import Node from "../engine/node";
import CardList from "../recommend/cardList";
import HGameBar from "../recommend/hGameBar";
import { clientEvent } from "../engine/clientEvent";

export default class Pause extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.width = canvas.width;
        this.height = canvas.height;
        this.addColorLayer('#000000');
        this.opacity = 200;

        this.cardList = new CardList(this);
        this.cardList.show(4, '暂停界面');
        this.cardList.position.y = this.getFitValue(-200);

        this.hGameBar = new HGameBar(this);
        this.hGameBar.show('暂停界面');
        this.hGameBar.position.y = canvas.height / 2 - this.getFitValue(100);

        this.lbTips = new Node(this);
        this.lbTips.addLabel('点击屏幕继续游戏', this.getFitValue(52));
        this.lbTips.position.y = this.getFitValue(370);
        
    }

    onEnable () {
        canvas.addEventListener('touchstart', this.onTouchStart);
        canvas.addEventListener('touchmove', this.onTouchMove);
        canvas.addEventListener('touchend', this.onTouchEnd);

        if (wx.aldSendEvent) {
            wx.aldSendEvent(`界面曝光-暂停界面`, {
                
            });
        }
    }

    onDisable () {
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);
    }

    onTouchStart (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
    }

    onTouchMove (e) {
        e.isStopPropagation = true;
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

    }

    onTouchEnd (e) {
        e.isStopPropagation = true;
        
        clientEvent.dispatchEvent('continue');

        this.closeCb && this.closeCb();
    }

    show (closeCb) {
        this.closeCb = closeCb;
    }

}