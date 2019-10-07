import Node from "../engine/node";

export default class VestScene extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.width = canvas.width;
        this.height = canvas.height;

        this.addColorLayer('000000');

        //
    }

    render(ctx) {
        super.render(ctx);
    }

    onTouchStart (e) {
        e.preventDefault();
    
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.startTouchPos = {x: x, y: y};
        this.lastTouchPos = {x: x, y: y};

        // this.isTouchBack = this.nodeBack.contains(this.lastTouchPos);
        // this.isTouchBack ? this.nodeBack.setScale(0.85) : this.nodeBack.setScale(1);
    }

    onTouchMove (e) {
        e.preventDefault();
        
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;


        this.lastTouchPos = {x: x, y: y};
    }

    onTouchEnd (e) {
        let offsetX = this.lastTouchPos.x - this.startTouchPos.x;
        let offsetY = this.lastTouchPos.y - this.startTouchPos.y;

        // if (this.isTouchBack) {
        //     if (this.nodeBack.contains(this.lastTouchPos)) {
        //         //显示互推界面
        //         console.log('互推');
        //         let node = new Recommend(this);
        //         clientEvent.dispatchEvent('pauseGame');
        //     }

        //     this.nodeBack.setScale(1);
        // }
    }

    startGame () {
        this.countDown = 30;
    }
}