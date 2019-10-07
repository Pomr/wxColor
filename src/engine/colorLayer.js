import Component from "./component";

/**
 * 游戏基础的精灵类
 */
export default class ColorLayer extends Component {
    constructor(node) {
        super(node);
    
        this.name = 'ColorLayer';
    }

    init (color) {
        this.color = color;
    }
    
    /**
     * 将精灵图绘制在canvas上
     */
    render(ctx) {
        if ( !this.node.visible )
            return;

        let scale = this.node.getWorldScale();
        let size = {width: this.node.width * scale.x, height: this.node.height * scale.y};
        // let offset = {x: this.node.position.x + this.node.width / 2, y: this.node.position.y + this.node.height / 2};
        let pos = this.node.getWorldPosition();
        let rotation = this.node.getWorldRotation();
        ctx.translate(pos.x, pos.y);
        if (rotation) {
            ctx.rotate(rotation * Math.PI / 180);
        }
        
        ctx.globalAlpha = this.node._opacity;
    
        ctx.fillStyle = this.color;
        ctx.fillRect(
            -size.width * this.node.anchorPoint.x,
            -size.height * this.node.anchorPoint.y,
            size.width,
            size.height
        );
    
        if (rotation) {
            ctx.rotate(-rotation * Math.PI / 180);
        }
        ctx.translate(-pos.x, -pos.y);
        ctx.globalAlpha = 1;
    }
}