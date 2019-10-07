import Component from "./component";
import ImgManager from "./imgManager";
import Sprite from "./sprite";

/**
 * 游戏基础的精灵类
 */
export default class Animation extends Component {

  constructor(node) {
    super(node);

    // 帧图片集合
    // this.imgList = [];

    this.frames = [];
    this.duration = 0;

    // 当前动画是否播放中
    this.isPlaying = false;

    // 动画是否需要循环播放
    this.loop = false;

    // 当前播放的帧
    this.index = -1;

    // 总帧数
    this.count = 0;

    this.currentTime = 0;
    this.intervalTime = 0;
  }
  
  /**
   * 
   * @param {Array} frames 
   * @param {Number} duration 
   */
  init (frames, duration) {
    this.frames = [];
    
    frames.forEach(element => {
        let img = ImgManager.instance.getImg(element, ()=>{
          this.count++;
        });

        this.frames.push(img);
    });

    this.intervalTime = duration / frames.length;
  }

  play (isLoop = false, index = 0) {
    this.sprite = this.node.getComponent('Sprite');
    if (!this.sprite) {
        console.error('请先添加Sprite组件！');
        return;
    }

    if (index >= this.frames.length) {
        console.error('index数据有误!');
        return;
    }

    this.index = index;
    this.loop = isLoop;
    this.isPlaying = true;
    this.currentTime = 0;

    this.sprite.img = this.frames[index];

    //根据图片大小做缩放
    if (this.sprite.type === Sprite.FILL_TYPE.RAW) {
      this.node.width = Math.floor(this.sprite.img.width * gameSpace.ratio);
      this.node.height = Math.floor(this.sprite.img.height * gameSpace.ratio);
    }
    
  }

  reset2FirstFrame () {
    this.index = 0;
    if (this.sprite && this.frames.length > 0) {
      this.sprite.img = this.frames[this.index];
    }
  }

  stop () {
      this.isPlaying = false;

  }

  //监听结束回调
  onEnded (callback) {
    this.endCallback = callback;
  }

  update (dt) {
    if (!this.isPlaying) {
        return;
    }

    if (this.count < this.frames.length) {
        return;
    }

    this.currentTime += dt;
    if (this.currentTime >= this.intervalTime) {
        this.currentTime -= this.intervalTime;

        //执行下一帧
        this.index++;

        if (this.index >= this.frames.length) {
            if (this.loop) {
                this.index = 0;
            } else {
                this.index = this.frames.length - 1;
                this.stop();

                this.endCallback && this.endCallback();
                return;
            }
        }

        this.sprite.img = this.frames[this.index];
        this.node.width = this.sprite.img.width * gameSpace.ratio;
        this.node.height = this.sprite.img.height * gameSpace.ratio;
    }
  }
}