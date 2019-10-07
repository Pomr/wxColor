import Node from "../engine/node";
import Sprite from "../engine/sprite";
import { Tween } from "../libs/Tween";

export default class CoupletItem extends Node {
    constructor(parent) {
        super(parent);

        this.width = this.getFitValue(120);
        this.height = this.getFitValue(120);

        this.addSprite('images/ui/recommend/itemBg.png', Sprite.FILL_TYPE.CUSTOM);

        this.gameIconNode = new Node(this);
        this.gameIconNode.addSprite('');
        this.gameIconNode.width = this.getFitValue(110);
        this.gameIconNode.height = this.getFitValue(110);

        //游戏名称
        this.gameName = new Node(this);
        this.gameName.addLabel('', this.getFitValue(24));
        this.gameName.color = '#ffffff';
        this.gameName.position = {x: 0, y: this.getFitValue(85)};

        //红点
        this.redDot = new Node(this);
        this.redDot.addSprite('images/ui/recommend/redDot.png');
        this.redDot.position = {x: this.getFitValue(50), y: -this.getFitValue(50)};
        this.redDot.visible = false;
    }

    onDisable() {
        super.onDisable();

        if (this.tween) {
            this.tween.stop();
            this.tween = null;
            this.rotation = 0;
        }
    }

    show (idx, gameInfo) {
        this.index = idx;
        this.gameInfo = gameInfo;

        this.gameIconNode.sprite.init(gameInfo.logo, Sprite.FILL_TYPE.CUSTOM);

        this.gameName.label.string = gameInfo.name;

        //有50%的概率展示红点
        this.redDot.visible = Math.floor(Math.random() * 2) === 1;
    }

    shake () {
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }

        if (this.index % 2 === 0) {
            this.shakeLeft();
        } else {
            this.shakeRight();
        }
    }

    shakeLeft () {
        this.rotation = 0;
        this.tween = new Tween(this).to({rotation: -20}, 0.1).onComplete(()=>{
            this.tween.stop();
            this.tween = new Tween(this).to({rotation: 20}, 0.2).onComplete(()=>{
                this.tween.stop();
                this.tween = new Tween(this).to({rotation: -10}, 0.15).onComplete(()=>{
                    this.tween.stop();
                    this.tween = new Tween(this).to({rotation: 10}, 0.1).onComplete(()=>{
                        this.tween.stop();
                        this.tween = new Tween(this).to({rotation: -5}, 0.1).onComplete(()=>{
                            this.tween.stop();
                            this.tween = new Tween(this).to({rotation: 5}, 0.1).onComplete(()=>{
                                this.tween.stop();
                                this.tween = new Tween(this).to({rotation: -2}, 0.05).onComplete(()=>{
                                    this.tween.stop();
                                    this.tween = new Tween(this).to({rotation: 2}, 0.05).onComplete(()=>{
                                        this.tween.stop();
                                        this.tween = new Tween(this).to({rotation: 0}, 0.02).onComplete(()=>{
                                            this.tween.stop();
                                            this.tween = null;
                                        }).start();
                                    }).start();
                                }).start();
                            }).start();
                        }).start();
                    }).start();
                }).start();
            }).start();
        }).start();
    }

    shakeRight () {
        this.rotation = 0;
        this.tween = new Tween(this).to({rotation: 20}, 0.1).onComplete(()=>{
            this.tween.stop();
            this.tween = new Tween(this).to({rotation: -20}, 0.2).onComplete(()=>{
                this.tween.stop();
                this.tween = new Tween(this).to({rotation: 10}, 0.15).onComplete(()=>{
                    this.tween.stop();
                    this.tween = new Tween(this).to({rotation: -10}, 0.1).onComplete(()=>{
                        this.tween.stop();
                        this.tween = new Tween(this).to({rotation: 5}, 0.1).onComplete(()=>{
                            this.tween.stop();
                            this.tween = new Tween(this).to({rotation: -5}, 0.1).onComplete(()=>{
                                this.tween.stop();
                                this.tween = new Tween(this).to({rotation: 2}, 0.05).onComplete(()=>{
                                    this.tween.stop();
                                    this.tween = new Tween(this).to({rotation: -2}, 0.05).onComplete(()=>{
                                        this.tween.stop();
                                        this.tween = new Tween(this).to({rotation: 0}, 0.02).onComplete(()=>{
                                            this.tween.stop();
                                            this.tween = null;
                                        }).start();
                                    }).start();
                                }).start();
                            }).start();
                        }).start();
                    }).start();
                }).start();
            }).start();
        }).start();
    }

    hideRedDot () {
        this.redDot.visible = false;
    }
}