import Node from "../engine/node";
import Sprite from "../engine/sprite";
import { Tween } from "../libs/Tween";

export default class SixGameItem extends Node {
    constructor(parent) {
        super(parent);

        this.width = this.getFitValue(192);
        this.height = this.getFitValue(242);

        this.addSprite('images/ui/recommend/imgSixGameFrame.png', Sprite.FILL_TYPE.CUSTOM);

        this.gameIconNode = new Node(this);
        this.gameIconNode.addSprite('');
        this.gameIconNode.width = this.getFitValue(175);
        this.gameIconNode.height = this.getFitValue(175);
        this.gameIconNode.position.y = this.getFitValue(-25);

        //游戏名称底
        this.gameNameBg = new Node(this);
        this.gameNameBg.addSprite('images/ui/recommend/imgBottomBar1.png');
        this.gameNameBg.position.y = this.getFitValue(96);

        //游戏名称
        this.gameName = new Node(this.gameNameBg);
        this.gameName.addLabel('', this.getFitValue(32));
        this.gameName.color = '#ffffff';
        this.gameName.position = {x: 0, y: this.getFitValue(12)};
        this.gameName.label.strokeColor = '#000000';
        this.gameName.label.lineWidth = 2;

        //红点
        this.redDot = new Node(this);
        this.redDot.addSprite('images/ui/recommend/redDot.png');
        this.redDot.position = {x: this.getFitValue(90), y: -this.getFitValue(115)};
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

        this.gameNameBg.sprite.init(`images/ui/recommend/imgBottomBar${idx+1}.png`)
    }

    hideRedDot () {
        this.redDot.visible = false;
    }
}