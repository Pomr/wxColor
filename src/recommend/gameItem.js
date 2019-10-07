import Sprite from "../engine/sprite";
import Node from "../engine/node";

export default class GameItem extends Node {
    constructor(parent) {
        super(parent);
        
        this.addSprite('images/ui/recommend/itemBg.png', Sprite.FILL_TYPE.CUSTOM);
        this.width = 330*gameSpace.ratio;
        this.height = 340*gameSpace.ratio;

        //图标
        this.gameIconNode = new Node(this);
        this.gameIconNode.addSprite('');
        this.gameIconNode.position = {x: 0, y: -20*gameSpace.ratio};

        //游戏名称
        this.gameName = new Node(this);
        this.gameName.addLabel('', 30*gameSpace.ratio);
        this.gameName.color = '#000000';
        this.gameName.position = {x: -80*gameSpace.ratio, y: 150*gameSpace.ratio};
        
        this.gamePlay = new Node(this);
        this.gamePlay.addLabel('', 30*gameSpace.ratio);
        this.gamePlay.color = '#ff0000';
        this.gamePlay.position = {x: 80*gameSpace.ratio, y: 150*gameSpace.ratio};
    }

    show (gameInfo) {
        this.gameInfo = gameInfo;
        this.gameIconNode.getComponent('Sprite').init(gameInfo.logo, Sprite.FILL_TYPE.CUSTOM);
        this.gameIconNode.width = 256*gameSpace.ratio;
        this.gameIconNode.height = 256*gameSpace.ratio;

        this.gameName.getComponent('Label').string = gameInfo.name;

        this.gamePlay.getComponent('Label').string = gameInfo.people_play;
    }

    checkIsClick (pos) {
        if (this.contains(pos)) {
            //触发卖量
            //被点击到
            wx.navigateToMiniProgram({ 
                appId: this.gameInfo.appid,
                path: this.gameInfo.path,

                success: ()=>{
                    if (wx.aldSendEvent) {
                        wx.aldSendEvent(`产品卖量-${this.gameInfo.name}`, {
                            
                        });

                        wx.aldSendEvent(`卖量版块-盒子-游戏列表`, {
                            name: this.gameInfo.name
                        });
                    }
                },
                fail: ()=>{
                    if (wx.aldSendEvent) {
                        // wx.aldSendEvent(`ICON点击 取消跳转-${DataBus.instance.wxScene}-${this.gameInfo.name}`, {
                            
                        // });
                    }
                }
            });

            return true;
        }

        return false;
    }
}