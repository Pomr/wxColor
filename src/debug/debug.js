import Node from "../engine/node";
import DataBus from "../databus";
import { clientEvent } from "../engine/clientEvent";


export default class Debug extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.width = canvas.width;
        this.height = canvas.height;
        this.addColorLayer('#000000');
        this.opacity = 200;

        this.nodeAddMoney = new Node(this);
        this.nodeAddMoney.addSprite('images/ui/common2/commonButton01.png');
        this.nodeAddMoney.position.y = -300*gameSpace.ratio;

        this.lbAddMoney = new Node(this.nodeAddMoney);
        this.lbAddMoney.addLabel('加钱');
        this.lbAddMoney.color = '#005e1f';
        this.lbAddMoney.position.y = 10*gameSpace.ratio;

        this.nodeClose = new Node(this);
        this.nodeClose.addSprite('images/ui/common2/commonButtonClose01.png');
        this.nodeClose.position = {x: -300*gameSpace.ratio, y: -500*gameSpace.ratio};
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
        
        e.stopPropagation();
    }

    onTouchMove (e) {
       
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

        e.stopPropagation();
    }

    onTouchEnd (e) {
        e.stopPropagation();

        if (this.nodeAddMoney.contains(this.lastTouchPos)) {
            DataBus.instance.addGold(50000);
            clientEvent.dispatchEvent('updateGold');
        } else if (this.nodeClose.contains(this.lastTouchPos)) {
            this.destroy();
        }
    }
}