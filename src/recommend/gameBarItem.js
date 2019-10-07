import Node from "../engine/node";
import Sprite from "../engine/sprite";

export default class GameBarItem extends Node {
    constructor(parent) {
        super(parent);

        this.width = this.getFitValue(120);
        this.height = this.getFitValue(120);

        this.gameIconNode = new Node(this);
        this.gameIconNode.addSprite('');
        this.gameIconNode.width = this.getFitValue(110);
        this.gameIconNode.height = this.getFitValue(110);
    }

    show (gameInfo) {
        this.gameInfo = gameInfo;

        this.gameIconNode.sprite.init(gameInfo.logo, Sprite.FILL_TYPE.CUSTOM);
    }
}