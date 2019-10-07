import Component from "./component";
import ImgManager from "./imgManager";

/**
 * 游戏基础的精灵类
 */
export default class Sprite extends Component {
  static FILL_TYPE = {
    RAW: 1,
    CUSTOM: 2,
    TILED: 3      //填充
  }

  constructor(node) {
    super(node);

    this.name = 'Sprite';
  }

  init (imgSrc = '', fillType) {
    if (typeof (fillType) === 'undefined') {
      fillType = Sprite.FILL_TYPE.RAW;  
    }

    this.fillType = fillType;

    this.img = ImgManager.instance.getImg(imgSrc, ()=>{
      //当加载完成后，看图片覆盖方式，
      if (this.fillType === Sprite.FILL_TYPE.RAW && this.img && this.node) {
        //根据图片大小做缩放
        this.node.width = this.img.width * gameSpace.ratio;
        this.node.height = this.img.height * gameSpace.ratio;
      }
    }); 
  }

  /**
   * 将精灵图绘制在canvas上
   */
  render(ctx) {
    if ( !this.node.visible )
      return;

    if (!this.img.isload) {
      return;
    }

    let scale = this.node.getWorldScale();
    let size = {width: this.node.width * scale.x, height: this.node.height * scale.y};
    // let offset = {x: this.node.position.x + this.node.width / 2, y: this.node.position.y + this.node.height / 2};
    let pos = this.node.getWorldPosition();
    ctx.translate(pos.x, pos.y);
    let rotation = this.node.getWorldRotation();
    if (rotation) {
      ctx.rotate(rotation * Math.PI / 180);
    }
    
    if (this.node._opacity !== 1) {
      ctx.globalAlpha = this.node._opacity;
    }

    if (this.fillType !== Sprite.FILL_TYPE.TILED) {
      ctx.drawImage(
        this.img,
        -size.width * this.node.anchorPoint.x,
        -size.height * this.node.anchorPoint.y,
        size.width,
        size.height
      );
    } else {
      let pat = ctx.createPattern(this.img, 'repeat');
      ctx.fillStyle = pat;

      ctx.fillRect(
        -size.width * this.node.anchorPoint.x,
        -size.height * this.node.anchorPoint.y,
        size.width,
        size.height
      );

      ctx.fillStyle = '';
    }

    if (rotation) {
      ctx.rotate(-rotation * Math.PI / 180);
    }

    ctx.translate(-pos.x, -pos.y);
    if (this.node._opacity !== 1) {
      ctx.globalAlpha = 1;
    }
  }

  /**
   * 简单的碰撞检测定义：
   * 另一个精灵的中心点处于本精灵所在的矩形内即可
   * @param{Sprite} sp: Sptite的实例
   */
  // isCollideWith(sp) {
  //   if ( !this.visible || !sp.visible )
  //     return false;

  //   var maxax = this.x + this.width,
  //       maxay = this.y + this.height,
  //       maxbx = sp.x + sp.width,
  //       maxby = sp.y + sp.height;
  //   return !(maxax < sp.x || maxbx < this.x || maxay < sp.y || maxby < this.y);

  //   let spX = sp.x + sp.width / 2;
  //   let spY = sp.y + sp.height / 2;

  //   return !!( spX >= this.x && spX <= this.x + this.width && spY >= this.y && spY <= this.y + this.height );
  // }
}
