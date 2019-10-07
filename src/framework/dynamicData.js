import LZString from '../libs/lz-string.min.js';
import WxBanner from '../libs/wxBanner.js';

const GAME_NAME = 'qw_miner';
export class DynamicData {
    static _instance = null;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }
  
        this._instance = new DynamicData();
        return this._instance;
    }

    gameConfig = {};
    arrShareConfig = [];
    arrAdsConfig = [];
    gameList = [];
    arrRecommendGame = [];

    isAuditor = false;
    currentTask = 0;
    maxTask = 0;
    listener = null;
    arrGameJsonNavigate = [];
    isConfigLoaded = false;

    parseWXGameJsonConfig () {
        if (!window['wx']) {
          return;
        }
    
        let data = null;
        let file = wx.getFileSystemManager();
        let arrFiles = file.readdirSync('/');
        if (arrFiles.indexOf('app-config.json') !== -1) {
          data = file.readFileSync('app-config.json', 'utf-8');
        } else {
          data = file.readFileSync('game.json', 'utf-8');
        }
        
        let objInfo = JSON.parse(data.toString());
    
        if (objInfo && objInfo.navigateToMiniProgramAppIdList) {
          this.arrGameJsonNavigate = objInfo.navigateToMiniProgramAppIdList;
        }
      }
    
    parseData(data) {
        try {
        var content = window['LZString'].decompressFromEncodedURIComponent(data);
        } catch (err) {
        // this.showErrorPage();
        console.error('[Error]failed to decompress data. ');
        throw err;
        }
    
        try {
        var res = JSON.parse(content);
        return res;
        } catch (err) {
        // this.showErrorPage();
        console.error('[Error]failed to paser json. ');
        throw err;
        }
    }

    parseGameConfig(config) {
        if (!config.gameConfig) {
            return;
        }

        for (let key in config.gameConfig) {
            this.gameConfig[key] = config.gameConfig[key];
        }

        // if (!isNaN(Number(this.gameConfig.shareSuccessTime))) {
        //     cc.gameSpace.wxAdapter.shareSuccessTime = this.gameConfig.shareSuccessTime;
        // }
    }
    
    parseShareConfig(config) {
        if (!config.randomShareData) {
            return;
        }

        if (Array.isArray(config.randomShareData)) {
            //表示正常获得分享类型
            this.arrShareConfig = config.randomShareData.filter((item) => {
            return item.switch;
            });
        }

        // this.arrShareConfig = config.shareConfig;
    }
    
    parseAdsConfig(config) {
        if (!config.advertisementArr) {
            return;
        }

        if (Array.isArray(config.advertisementArr)) {
            //表示正常获得分享类型
            this.arrAdsConfig = config.advertisementArr;
        }

        const bannerIds = [];
        this.arrAdsConfig.forEach((item) => {
            if (item.advertisementType === '1') {
            bannerIds.push(item.value);
            } else {
            this.gameConfig.videoAdId = item.value;
            }
        });

        //banner条等流量主开通后开启
        WxBanner.instance.init({
            bannerIds: bannerIds,
            left:  this.gameConfig.bannerStyleLeft,
            top: this.gameConfig.bannerStyleTop ,
            refreshInterval:this.gameConfig.bannerRefreshInterval,
            bannerCTRUpperLimit: this.gameConfig.bannerCTRUpperLimit,
        });

        // todo在微信开发者工具上提前创建广告会卡顿，先暂时屏蔽，后续开启
        gameSpace.wxAdapter.createRewardedVideoAd();
    }
    
    request (url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                callback(null, xhr.responseText)
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    }
    
    reqConfig(callback) {
        //
        this.currentTask = 0;
        this.maxTask = 3;
        this.listener = callback;

        this.request(`https://ossconfigcdn.xxzsgame.com/0_qingGame/${GAME_NAME}/whiteList.json`, (err, res)=>{
            if (err) {
                console.error(err);
                this.checkIsFinish();
                return;
            }

            let json = this.parseData(res);

            //logo name appid path 
            this.gameList = json.whiteList;
            this.arrRecommendGame = [];
            this.parseWXGameJsonConfig();
            this.gameList.forEach(element => {
            if (element.is_get && (this.arrGameJsonNavigate.indexOf(element.appid) !== -1 || this.arrGameJsonNavigate.length <= 0)) {
                this.arrRecommendGame.push(element);
            }
            });

            this.arrRecommendGame.sort((itemA, itemB) => {
            return itemB.weigh - itemA.weigh;
            });

            this.arrRecommendGame.forEach((element)=>{
            let logo = element.logo;
            if (logo.startsWith('http') && !logo.startsWith('https')) {
                //强制转成https
                element.logo = 'https' + logo.slice(4);
            }
            });

            this.checkIsFinish();
        });

        this.request(`https://ossconfigcdn.xxzsgame.com/0_qingGame/${GAME_NAME}/allShare.json`, (err, res)=>{
            if (err) {
                console.error(err);
                this.checkIsFinish();
                return;
            }

            let json = this.parseData(res);
            //解析分享相关配置
            this.parseShareConfig(json);

            //解析游戏相关配置
            this.parseGameConfig(json);

            //解析游戏相关配置, 广告等接入完后再触发
            this.parseAdsConfig(json);

            this.checkIsFinish();
        });

        window['bondSDK'].shield.checkAuditor((err, res)=>{
            this.isAuditor = res.isAuditor;

            this.checkIsFinish();
        });
    }
    
    checkIsFinish () {
        this.currentTask++;
        if (this.currentTask >= this.maxTask) {
            this.isConfigLoaded = true;
            this.listener();
        }
    }
    
    //获得推荐游戏列表
    getRecommendGameList() {
        return this.arrRecommendGame;
    }
    
    /**
     * 根据分享类型选择分享结果
     */
    getRandShareInfo() {
        let ret = null;

        if (this.arrShareConfig && this.arrShareConfig.length > 0) {
            let rand = Math.floor(Math.random() * this.arrShareConfig.length);
            ret = this.arrShareConfig[rand];
        }

        if (!ret) {
            ret = {
                "randomDataId": 1,
                "shareDec": "4排吃鸡，就差你一个！",
                "imgUrl": "https://ossconfigcdn.xxzsgame.com/gun/share01.jpg",
            };
        }

        return ret;
    }
}