import Node from "../engine/node";
import Sprite from "../engine/sprite";

export default class FullScreenItem extends Node {
    constructor(parent) {
        super(parent);

        this.width = this.getFitValue(348);
        this.height = this.getFitValue(268);

        // this.addSprite('images/ui/recommend/itemBg.png', Sprite.FILL_TYPE.CUSTOM);

        this.gameIconNode = new Node(this);
        this.gameIconNode.addSprite('');
        this.gameIconNode.width = this.getFitValue(348);
        this.gameIconNode.height = this.getFitValue(268);

        //游戏名称
        // this.gameName = new Node(this);
        // this.gameName.addLabel('', this.getFitValue(24));
        // this.gameName.color = '#ffffff';
        // this.gameName.position = {x: 0, y: this.getFitValue(85)};

        //红点
        this.redDot = new Node(this);
        this.redDot.addSprite('images/ui/recommend/redDot.png');
        this.redDot.position = {x: this.width / 2 - this.getFitValue(20), y: -this.height / 2 + this.getFitValue(20)};
        this.redDot.visible = false;
    }

    onDisable() {
        super.onDisable();
    }

    show (gameInfo) {
        this.gameInfo = gameInfo;

        this.gameIconNode.sprite.init(gameInfo.logo2, Sprite.FILL_TYPE.CUSTOM);

        // this.gameName.label.string = gameInfo.name;

        //有50%的概率展示红点
        this.redDot.visible = Math.floor(Math.random() * 2) === 1;
    }

    hideRedDot () {
        this.redDot.visible = false;
    }
}