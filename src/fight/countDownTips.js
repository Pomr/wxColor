import Pool from "../engine/pool";
import Node from "../engine/node";
import { Tween } from "../libs/Tween";

export default class CountDownTips extends Node {
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

        this.tweenScale = new Tween(this.scale).to({x: 4.4, y: 4.4}, 0.5).onComplete(()=>{
            this.tweenScale = new Tween(this.scale).to({x: 3, y: 3}, 0.4).onComplete(()=>{
                this.stopAni();

                this.parent = null;
                Pool.instance.recover('CountDownTips', this);
            });

            this.tweenOpacity = new Tween(this).to({opacity: 0}, 0.3).start();
            
        }).start();
        
       
    }

    update (dt) {
        super.update(dt);
    }
}