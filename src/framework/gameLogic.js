import { DynamicData } from "./dynamicData";
import FightConstants from "../fight/fightConstants";

export class gameLogic {
    /**
     * 根据功能获得对应的打开奖励类型 广告 分享 或者没有？
     * @param {String} funStr
     * @param {Function} callback
     * @param {Number} index 广告位
     */
    static getOpenRewardType (funStr, callback, index) {
        let type = DynamicData.instance.isAuditor ? FightConstants.OPEN_REWARD_TYPE.NULL : FightConstants.OPEN_REWARD_TYPE.SHARE;
        if (!this.checkIsByVideoAds(funStr)) { // 不通过激励视频获得奖励
            callback(null, type);
            return;
        }

        // 是否可通过激励视频获得
        if (gameSpace.wxAdapter.checkVideoAd()) {
            // this.customEventStatistics(constants.ANALYTICS_TYPE.WATCH_AD_BTN_SHOW_TIMES, {type: funStr});
            callback(null, FightConstants.OPEN_REWARD_TYPE.AD);
        } else {
            callback(null, type);
        }
        
    }

    /**
     * 检查是否通过广告
     */
    static checkIsByVideoAds (funStr) {
        return funStr === FightConstants.SHARE_FUNCTION.NEXT_LEVEL || funStr === FightConstants.SHARE_FUNCTION.BALANCE || funStr === FightConstants.SHARE_FUNCTION.RELIVE || funStr === FightConstants.SHARE_FUNCTION.BOMB || funStr === FightConstants.SHARE_FUNCTION.POWER;
    }

    /**
     * 根据功能设置图标对应展示
     *
     * @static
     * @param {string} funStr
     * 
     */
    static updateRewardIcon (funStr, nodeSprite) {
        this.getOpenRewardType(funStr, (err, type)=>{
            nodeSprite.visible = true;
            switch (type) {
                case FightConstants.OPEN_REWARD_TYPE.AD:
                    nodeSprite.sprite.init('images/ui/common/commonIconVideo.png');
                    break;
                case FightConstants.OPEN_REWARD_TYPE.SHARE:
                    nodeSprite.sprite.init('images/ui/common/commonIconShare.png');
                    break;
                case FightConstants.OPEN_REWARD_TYPE.NULL:
                    nodeSprite.visible = false;
                    break;
            } 
        });
    }

    static openReward (funStr, callback) {
        this.getOpenRewardType(funStr, (err, type)=>{
            if (type === FightConstants.OPEN_REWARD_TYPE.SHARE) {
                this.share(funStr, {}, (err)=>{
                    callback(err);
                }, true);
            } else if (type === FightConstants.OPEN_REWARD_TYPE.AD) {
                this.watchAd(funStr, (err, isWatchOver)=>{
                    if (!err && !isWatchOver) {
                        err = 'not over!';
                    }
                    callback(err, isWatchOver);
                });
            } else {
                //无需任何操作，直接回调
                callback && callback();
            }
        });
    }

    /**
     * 发起分享
     * @param {string} funStr 来源于哪个功能的分享
     * @param {Object} objQuery 查询字符串
     * @param {Function} callback 回调函数 
     * @param {boolean} isShowConfirmAfterFailed 如果失败，是否跳出弹窗让其重试 微信专用
     */
    static share(funStr, objQuery, callback, isShowConfirmAfterFailed) {
        let shareInfo = DynamicData.instance.getRandShareInfo();

        let shareImgFileName = shareInfo.imgUrl.substr(shareInfo.imgUrl.lastIndexOf('/') + 1);
        objQuery.source = 'source';
        objQuery.shareImg = shareImgFileName;
        let query = '';
        for (let key in objQuery) {
            if (query !== '') {
                query += '&';
            }
            if (objQuery.hasOwnProperty(key)) {
                query += key + '=' + objQuery[key];
            }
        }


        //微信回调有对应的回调机制
        if (typeof(isShowConfirmAfterFailed) === 'undefined' && callback) {
            isShowConfirmAfterFailed = true;
        }

        // let _this = this;
        gameSpace.wxAdapter.share(funStr, shareInfo.shareDec, shareInfo.imgUrl, query, function() {
            // _this.finishTask(constants.DAILY_TASK_TYPE.SHARE, 1);
            let arrArgs = [];
            for (let idx = 0; idx < arguments.length; idx++) {
                arrArgs.push(arguments[idx]);
            }

            //没有则正常回调
            callback.apply(null, arrArgs);
        }, isShowConfirmAfterFailed);
    }

    /**
     * 观看激励视频广告
     * @param {string} funStr 功能
     * @param {number} maxTimes 
     * @param {number} placeId 标记广告播放所在界面对应索引
     * @param {function} callback 
     */
    static watchAd(funStr, callback) {
        gameSpace.wxAdapter.showRewardedVideoAd(() => {
            callback(null, true);
        }, () => {
            callback('error', false);
        });
    }
}