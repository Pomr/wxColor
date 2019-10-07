import Component from "./component";
import ImgManager from "./imgManager";

/**
 * 游戏基础的精灵类
 */
export default class ArtDigit extends Component {

  constructor(node) {
      super(node);

      this.name = 'ArtDigit';
      this.dictDigit = {};

      this.sCellWidth = 0;
      this.sCellHeight = 0;

      this.cellWidth = 0;
      this.cellHeight = 0;

      this._string = '';

    //   this.textAlign = 'center';
  }

  set string (value) {
      this._string = value.toString();
  }

  get string () {
      return this._string;
  }
  
  init (txt, imgSrc, strArt) {
    this.string = txt.toString();

    this.img = ImgManager.instance.getImg(imgSrc, (img)=>{
        this.sCellWidth = img.width / strArt.length;
        this.sCellHeight = img.height;

        this.cellWidth = Math.floor(this.sCellWidth * gameSpace.ratio);
        this.cellHeight = Math.floor(this.sCellHeight * gameSpace.ratio);

        for (let idx = 0; idx < strArt.length; idx++) {
            this.dictDigit[strArt[idx]] = {
                x: idx * this.sCellWidth,
                y: 0,
                width: this.sCellWidth,
                height: this.sCellHeight 
            }
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

    if (!this.string || this.string === '') {
        return;
    }

    let scale = this.node.getWorldScale();
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

    let size = {width: this.string.length * this.cellWidth * scale.x, height: this.cellHeight * scale.y};

    let startX = -size.width * this.node.anchorPoint.x;
    let startY = -size.height * this.node.anchorPoint.y;

    for (let idx = 0; idx < this.string.length; idx++) {
        let char = this.string[idx];
        if (!this.dictDigit.hasOwnProperty(char)) {
            if (Object.keys(this.dictDigit).length > 0) {
              console.error("can't found art digit:", char);
            }
            break;
        } 

        let element = this.dictDigit[char];

        ctx.drawImage(
            this.img,
            element.x,
            element.y,
            element.width,
            element.height,
            startX + idx * this.cellWidth * scale.x,
            startY,
            this.cellWidth * scale.x,
            this.cellHeight * scale.y
        );
    }

    

    if (rotation) {
      ctx.rotate(-rotation * Math.PI / 180);
    }

    ctx.translate(-pos.x, -pos.y);
    if (this.node._opacity !== 1) {
      ctx.globalAlpha = 1;
    }
  }
}
