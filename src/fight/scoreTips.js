import Pool from "../engine/pool";
import Node from "../engine/node";
import { Tween } from "../libs/Tween";

export default class ScoreTips extends Node {
    constructor(parent) {
        super(parent);

        this.addArtDigit('0', 'images/ui/fight/fightImgNumber02.png', '+0123456789');
    }

    show (txt, pos) {
        this.artDigit.string = txt;

        this.position = pos;

        this.playAni();
        // setTimeout(()=>{
        //     this.parent = null;
        //     Pool.instance.recover('fightTips', this);
        // }, 1000);
    }

    stopAni () {
        if (this.tweenMove) {
            this.tweenMove.stop();
            this.tweenMove = null;
        }

        if (this.tweenScale) {
            this.tweenScale.stop();
            this.tweenScale = null;
        }

        if (this.tweenOpacity) {
            this.tweenOpacity.stop();
            this.tweenOpacity = null;
        }
    }

    playAni () {
        this.stopAni();

        this.scale = {x: 0, y: 0};
        this.opacity = 255;

        this.tweenScale = new Tween(this.scale).to({x: 1.2, y: 1.2}, 0.4).to({x:1, y:1}, 0.1).start();
        this.tweenMove = new Tween(this.position).to({x: this.position.x, y: this.position.y - 50*gameSpace.ratio}, 1).onComplete(()=>{
            this.stopAni();

            this.parent = null;
            Pool.instance.recover('ScoreTips', this);
            
        }).start();
        this.tweenOpacity = new Tween(this).to({opacity: 0}, 0.5).delay(0.5).start();

        
    }
}