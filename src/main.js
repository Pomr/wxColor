import StartScene from './fight/startScene';
import TWEEN from './libs/Tween';
import { DynamicData } from './framework/dynamicData';
import WxAdapter from './framework/wxAdapter';
import DataBus from './databus';
import LocalConfig from './framework/localConfig';
import audioManager from './engine/audioManager';
import WxBanner from './libs/wxBanner';

// let canvas = wx.createCanvas();
// GameGlobal.game.canvas = canvas;
canvas.width = canvas.width * window.devicePixelRatio;
canvas.height = canvas.height * window.devicePixelRatio;
let ctx   = canvas.getContext('2d');
//游戏适配比率
window.gameSpace = {};
window.gameSpace.name = 'qw_miner';
window.gameSpace.version = '1.1.2';
window.gameSpace.appId = 'wx0eaf235f7eefe09f';
window.gameSpace.ratio = canvas.width / 720;
window.gameSpace.winSize = {width: canvas.width, height: canvas.height};
window.gameSpace.wxAdapter = new WxAdapter();
window.gameSpace.wxAdapter.start();
window.gameSpace.menuTop = wx.getMenuButtonBoundingClientRect().top * window.devicePixelRatio;

if (gameSpace.menuTop <= 0 ) {
  //iphoneX取不到菜单值，我们赋值一个给他
  let sys = wx.getSystemInfoSync();

  if (sys.safeArea && sys.safeArea.top) {
    gameSpace.menuTop = sys.safeArea.top * window.devicePixelRatio;
  } else if (canvas.width / canvas.height > 2.1) {
    gameSpace.menuTop = 44 * window.devicePixelRatio;
  }
}

if (canvas.height / canvas.width < 2.1) { //不属于长屏手机，高度不需要那么高
  WxBanner.instance.defaultTopValue = 0;
}

window['bondSDK'].init({
  gameId: gameSpace.name,
  version: gameSpace.version, 
  appId: gameSpace.appId, 
  company: '0_qingGame',
  blocks: '1025,1047,1048,1049',
  success: ()=>{

  },
  fail: ()=>{

  }
});

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {

    this.loop = this.loop.bind(this);

    this.arrRender = [];

    this.startScene = new StartScene();
    this.arrRender.push(this.startScene);

    requestAnimationFrame(
      this.loop
    );

    this.lastTime = Date.now();

    //请求动态数据
    DynamicData.instance.reqConfig(()=>{
      let shareInfo = DynamicData.instance.getRandShareInfo();
      gameSpace.wxAdapter.shareGame(shareInfo.shareDec, shareInfo.imgUrl);
    });

    LocalConfig.instance.loadConfig(()=>{
      console.log('config load finished!');
    });

    // audioManager.instance.playMusic('background.mp3', true);

    wx.onShow(()=>{
      // this.lastTime = Date.now();
      this.isShowing = true;
    });

  }

  restart() {
    DataBus.instance.reset();

    
  }

  //游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
    e.preventDefault();

    let x = e.touches[0].clientX;
    let y = e.touches[0].clientY;

  }

  removeChild (node) {

    for (let idx = 0; idx < this.arrRender.length; idx++) {
      if (this.arrRender[idx] === node) {
        this.arrRender.splice(idx, 1);
        break;
      }
    }
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.arrRender.forEach((element) => {
      element.render(ctx);
    });

  }

  // 游戏逻辑更新主函数
  update(dt) {
    this.arrRender.forEach((element) => {
      if (element.update)
        element.update(dt);
    });
  }

  // 实现游戏帧循环
  loop(time) {
    if (this.isShowing) {
      this.isShowing = false;
      this.lastTime = time;
    }

    
    DataBus.instance.frame++;
    
    this.update((time - this.lastTime) / 1000);
    TWEEN.update();
    this.render();

    requestAnimationFrame(
      this.loop
    );

    this.lastTime = time;
  }

}
