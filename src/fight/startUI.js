import Node from "../engine/node";
import { clientEvent } from "../engine/clientEvent";
// import Couplet from "../recommend/couplet";
import Recommend from "../recommend/recommend";
import { DynamicData } from "../framework/dynamicData";
// import HGameBar from "../recommend/hGameBar";
import audioManager from "../engine/audioManager";
import WxAdapter from "../framework/wxAdapter";
import WxBanner from "../libs/wxBanner";

export default class StartUI extends Node {
    constructor(parent) {
        super(parent);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.logo = new Node(this);
        this.logo.addLabel('Color',80);
        this.logo.label.fontWeight = 'bold';
        this.logo.color = '#FFFFFF';
        // this.logo.addSprite('images/ui/logo01.png');
        this.logo.position.y = this.getFitValue(-320);

        this.nodeVersion = new Node(this);
        this.nodeVersion.anchorPoint = {x: 0, y: 0};
        this.nodeVersion.position = {x: -canvas.width / 2, y: -canvas.height/2 + this.getFitValue(30)};
        this.nodeVersion.addLabel(`v ${gameSpace.version}`, this.getFitValue(28), 'left');


        this.nodeBtnStart = new Node(this);
        this.nodeBtnStart.position.y = this.getFitValue(140);
        this.nodeBtnStart.addSprite('images/ui/common/commonBtn01.png');

        this.nodeBtnStartTxt = new Node(this.nodeBtnStart);
        this.nodeBtnStartTxt.addLabel('开始游戏', this.getFitValue(48));
        this.nodeBtnStartTxt.label.fontWeight = 'bold';
        this.nodeBtnStartTxt.color = '#8e3811';
        this.nodeBtnStartTxt.position.y = this.getFitValue(8);

        // this.nodeBtnMore = new Node(this);
        // this.nodeBtnMore.position.y = this.getFitValue(-30);
        // this.nodeBtnMore.addSprite('images/ui/home/homeBtnGames.png');
        // this.nodeBtnMore.visible = false;

        // this.nodeBtnMoreTxt = new Node(this.nodeBtnMore);
        // this.nodeBtnMoreTxt.addLabel('更多好玩', this.getFitValue(64));
        // this.nodeBtnMoreTxt.color = '#b72361';
        // this.nodeBtnMoreTxt.label.fontWeight = 'bold';
        // this.nodeBtnMoreTxt.position.y = this.getFitValue(12);

        // this.couplet = new Couplet(this); 
        // this.couplet.position.y = -this.getFitValue(250);
        // this.checkRecommend();

        // this.hGameBar = new HGameBar(this);
        // this.hGameBar.position.y = canvas.height / 2 - this.getFitValue(330);
        // this.hGameBar.visible = false;
    }

    onEnable () {
        canvas.addEventListener('touchstart', this.onTouchStart);
        canvas.addEventListener('touchmove', this.onTouchMove);
        canvas.addEventListener('touchend', this.onTouchEnd);

        if (wx.aldSendEvent) {
            wx.aldSendEvent(`界面曝光-主界面`, {
                
            });
        }

        this.checkBanner();
    }

    onDisable () {
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);

        this.hideBanner();
    }

    hideBanner () {
        if (WxBanner.instance.banners) {
            WxBanner.instance.hideAdBanner();
        }

        this.isShowBanner = false;
        
        if (this.checkBannerTimer) {
            clearTimeout(this.checkBannerTimer);
            this.checkBannerTimer = null;
        }
    }

    checkBanner () {
        if (DynamicData.instance.isConfigLoaded && this.visible && WxBanner.instance.banners.length > 0) {
            //显示广告
            WxBanner.instance.showAdBanner('home');

            // this.hGameBar.position.y = WxBanner.instance.bannerTop - canvas.height/2 - this.getFitValue(70);
            //广告显示出来后需要调整整体高度
            // console.log(WxBanner.instance.bannerTop);
        } else {
            this.checkBannerTimer = setTimeout(() => {
                this.checkBanner();
            }, 1000);
        }
    }

    onTouchStart (e) {
        if (this.parent.isGameOver) {
            return;
        }
    
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};
        this.startPos = {x: x, y: y};
        
        this.isTouchStart = false;
        this.isTouchMore = false;
        if (this.nodeBtnStart.contains(this.lastTouchPos)) {
            this.isTouchStart = true;
            this.nodeBtnStart.setScale(0.85);
        } 
        // else if (this.nodeBtnMore.contains(this.lastTouchPos)) {
        //     this.isTouchMore = true;
        //     this.nodeBtnMore.setScale(0.85);
        // }
    }

    onTouchMove (e) {
       
        let x = e.touches[0].clientX* window.devicePixelRatio;
        let y = e.touches[0].clientY* window.devicePixelRatio;

        this.lastTouchPos = {x: x, y: y};

    }

    onTouchEnd (e) {
        this.nodeBtnStart.setScale(1);
        // this.nodeBtnMore.setScale(1);
        if (this.isTouchStart) {
            this.isTouchStart = false;
            if (this.nodeBtnStart.contains(this.lastTouchPos)) {
                this.onBtnStartClick();
            }
        }
        
        if (this.isTouchMore) {
            this.isTouchMore = false;
            // if (this.nodeBtnMore.contains(this.lastTouchPos)) {
            //     this.onBtnMoreClick();
            // }
        }
    }

    show () {

    }

    onBtnStartClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-主界面-开始游戏`, {
                
            });
        }

        //开始游戏
        clientEvent.dispatchEvent('startGame');
        this.visible = false;

        audioManager.instance.playSound('click.mp3');
    }

    onBtnMoreClick () {
        if (wx.aldSendEvent) {
            wx.aldSendEvent(`按钮点击-主界面-更多游戏`, {
                
            });
        }

        this.hideBanner();
        let node = new Recommend(this);
        node.show(()=>{
            this.checkBanner();
        });

        audioManager.instance.playSound('click.mp3');
    }

    checkRecommend () {
        if (DynamicData.instance.isConfigLoaded) {
            // this.nodeBtnMore.visible = true;
            // this.couplet.show(8, '主界面'); //首页展示8个推荐游戏
            // this.hGameBar.show();
            // this.hGameBar.visible = true;
            return;
        }

        //每秒触发一次检查，直到获得到数据
        setTimeout(()=>{
            this.checkRecommend();
        }, 1000);
    }
}