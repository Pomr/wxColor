import Component from "./component";

/**
 * 游戏基础的精灵类
 */
export default class Label extends Component {

  constructor(node) {
      super(node);

      this.name = 'Label';
      this.lineWidth = 0;
      this.strokeColor = '#ffffff';
      this.fontWeight = 'normal';
  }
  
  init (txt, size, textAlign) {
    this.string = txt;

    if (typeof (size) === 'undefined') {
        size = Math.floor(40 * gameSpace.ratio);
    }

    if (typeof (textAlign) === 'undefined') {
        textAlign = 'center';
    }
    this.fontSize = size;
    this.textAlign = textAlign;
  }

  /**
   * 将精灵图绘制在canvas上
   */
  render(ctx) {
    if ( !this.node.visible )
      return;

    let pos = this.node.getWorldPosition();
    ctx.translate(pos.x, pos.y);
    let rotation = this.node.getWorldRotation();
    if (rotation) {
      ctx.rotate(rotation * Math.PI / 180);
    }
    
    if (this.node._opacity !== 1) {
      ctx.globalAlpha = this.node._opacity;
    }

    let scale = this.node.getWorldScale();
    ctx.font = `${this.fontWeight} ${Math.floor(this.fontSize * scale.x)}px Arial`;
    ctx.fillStyle = this.node.color;
    ctx.textAlign = this.textAlign;
    if (this.lineWidth > 0) {
      ctx.lineWidth = this.lineWidth;
      ctx.strokeStyle = this.strokeColor;
      ctx.strokeText(this.string, 0, 0);
    }

    ctx.fillText(
        this.string,
        0,
        0
    );

    ctx.lineWidth = 0;
    if (rotation) {
      ctx.rotate(-rotation * Math.PI / 180);
    }
    ctx.translate(-pos.x, -pos.y);
    if (this.node._opacity !== 1) {
      ctx.globalAlpha = 1;
    }
  }
}
