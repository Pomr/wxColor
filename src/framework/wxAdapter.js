import { DynamicData } from "./dynamicData";
import WxBanner from "../libs/wxBanner";

export default class WxAdapter {
    constructor () {
        this.shareSuccessTime = 3;
        this.data = {
            launchOption: {}, //微信启动参数
            videoAdCanBePlay: false //判断视频是否能够被播放
        }
    }

    start () {
        this.updateShareTicket();
        this.checkUpdate();

        
        wx.onShow((launchOption) => {
            this.onAppShow(launchOption);
        });

        
        wx.onHide((res) => {
            this.onAppHide();
            WxBanner.instance.handlerHide(res);
        });
    }

    onAppShow(launchOption) {
        if (Object.keys(launchOption.query).length > 0) {

        }

        let showTime = Date.now();

        if (this.shareCallback) {
            //表示是由分享触发的 hide=>show
            let offset = showTime - this.lastHideTime;
            if (offset > this.shareSuccessTime * 1000) {
                this.shareCallback(null);

                this.shareCallback = null;
            } else {
                if (this.shareObj.isShowConfirmAfterFailed) {
                    this.showShareFailed(this.shareObj.ald_desc, this.shareObj.title, this.shareObj.imageUrl, this.shareObj.query, this.shareCallback, this.shareObj.isShowConfirmAfterFailed);
                } else {
                    this.shareCallback('failed!');

                    this.shareCallback = null;
                }
            }
        }

    }

    onAppHide() {
        this.lastHideTime = Date.now();
    }

    updateShareTicket () {
        if (!window.wx) {
            return;
        }

        wx.updateShareMenu({
            withShareTicket: true
        })
    }

    checkUpdate() {
        if (!window.wx) return;
        
         //检查是否有更新
        //微信小程序强制更新逻辑
        if (wx.getUpdateManager) {
            var updateManager = wx.getUpdateManager();
            //新的版本已经下载好
            updateManager.onUpdateReady(function () {
                //调用 applyUpdate 应用新版本并重启
                wx.showModal({
                    title: '温馨提示',
                    content: '新版本已经准备好，需重启应用',
                    confirmText: '重启更新',
                    success: function (res) {
                        if (res.confirm) {
                            updateManager.applyUpdate();
                        }
                    }
                });
            });
        }
    }

    shareGame (title, imageUrl) {
        if (!window.wx) {
            return;
        }
    
        wx.showShareMenu({
            withShareTicket: true,
            complete: ()=>{
    
            }
        });
    
        // let query = 'action=share&source=' + playerData.userId;
        if (wx.aldOnShareAppMessage) {
            wx.aldOnShareAppMessage(function () {
                // 用户点击了“转发”按钮
                return {
                    title: title,
                    imageUrl: imageUrl,
                    
                };
            });
        } else {
            wx.onShareAppMessage(function () {
                // 用户点击了“转发”按钮
                return {
                    title: title,
                    imageUrl: imageUrl,
                    
                };
            });
        }
        
    }

    createRewardedVideoAd() {
        if (!window['wx']) {
            return;
        }
        console.log('############加载激励视频');
        const channelVideoAdId = DynamicData.instance.gameConfig.videoAdId;
        if (!channelVideoAdId) {
            this.data.videoAdCanBePlay = false;
            console.error('没有视频广告id');
            return;
        }

        this.rewardedVideoAd = window['wx'].createRewardedVideoAd({
            adUnitId: channelVideoAdId, // 激励广告id
            useId: true, // 强制使用传入的广告id创建广告
        });

        this.rewardedVideoAd.onLoad(() => {
            this.data.videoAdCanBePlay = true;
            console.log('****激励视频广告加载成功****');
        });

        this.rewardedVideoAd.onError((res) => {
            this.data.videoAdCanBePlay = false;
            console.log('****激励视频广告加载失败****', res);
            if (res.errCode === 1005 // 广告组件审核中
                ||
                res.errCode === 1006 // 广告组件被驳回
                ||
                res.errCode === 1007) { // 广告组件被封禁
                this.reportFlowMainError(res.errCode);
            }
            if (this.rewardedVideoAdFailCb && typeof this.rewardedVideoAdFailCb === 'function') {
                this.rewardedVideoAdFailCb();
            }
        });

        this.rewardedVideoAd.onClose((res) => {
            console.log('****激励视频广告关闭****', res);
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                if (this.rewardedVideoAdSuccessCb && typeof this.rewardedVideoAdSuccessCb === 'function') {
                    this.rewardedVideoAdSuccessCb();
                }
            } else if (this.rewardedVideoAdFailCb && typeof this.rewardedVideoAdFailCb === 'function') {
                this.rewardedVideoAdFailCb();
            }
        });



        // this.rewardedVideoAd.show().then(() => {
        //     console.log('激励视频 广告显示');
        // });
    }

    /**
     * 显示视频广告
     * @param {Function} successCb 成功回调
     * @param {Function} failCb 失败回调
     */
    showRewardedVideoAd(successCb, failCb) {
        if (!this.rewardedVideoAd) {
            failCb();
            return;
        }
        this.rewardedVideoAdSuccessCb = successCb;
        this.rewardedVideoAdFailCb = failCb;
        this.rewardedVideoAd.show()
            .then(() => {
                cc.log('视频广告显示成功');
            })
            .catch((err) => {
                this.rewardedVideoAd.load()
                    .then(() => {
                        this.rewardedVideoAd.show()
                            .catch(() => {
                                failCb();
                            });
                    });
            });
    }

    /**
     * 广告组件预警
     * @param {*} code
     */
    reportFlowMainError(code) {
        if (!window['wx']) return;
        if (this.alreadyReportFlowMainErrorSelf) return;
        const url = 'https://1923914575990624.cn-hangzhou.fc.aliyuncs.com/2016-08-15/proxy/sdkServer/reportAdError/';
        cc.log(`reportFlowMainError:${url}`);
        window['wx'].request({
            url,
            data: {
                gameName: gameSpace.name,
                errCode: code,
                timestamp: Date.now(),
            },
            header: {
                'content-type': 'application/json',
            },
            method: 'GET',
            success(res) {
                cc.log(`reportFlowMainError result=${JSON.stringify(res)}`);
                this.alreadyReportFlowMainErrorSelf = true;
            },
            fail(res) {
                cc.log('reportFlowMainError fail');
            },
        });
    }

    /**
     * 检查广告是否可用
     */
    checkVideoAd() {
        return this.data.videoAdCanBePlay;  
    }

    /**
     * 发起分享
     * @param {String} funStr 来源于哪个功能的分享
     * @param {String} title 
     * @param {String} imgUrl 
     * @param {String} query 
     * @param {Boolean} isShowConfirmAfterFailed 如果失败，是否跳出弹窗让其重试
     * @param {Function} callback 分享回调
     */
    share(funStr, title, imgUrl, query, callback, isShowConfirmAfterFailed) {
        if (!window['wx']) {
            if (callback) {
                callback(null, null);
            }
            return;
        }

        if (wx.aldShareAppMessage) {
            this.shareObj = {
                title: title,
                imageUrl: imgUrl,
                query: query,
                ald_desc: funStr,
                isShowConfirmAfterFailed: isShowConfirmAfterFailed
            };

            wx.aldShareAppMessage(this.shareObj);

            this.shareCallback = callback;

        } else {
            this.shareCallback = callback;
            wx.shareAppMessage({
                title: title,
                imageUrl: imgUrl,
                query: query
            });
        }
    }

    showShareFailed(funStr, title, imgUrl, query, callback, isShowConfirmAfterFailed) {
        //@ts-ignore
        wx.showModal({
            title: '提示',
            content: '奖励获取失败，发给其他好友试试。',
            confirmText: '再试一下',
            success: (res) => {
                if (res.confirm) {
                    this.share(funStr, title, imgUrl, query, callback, isShowConfirmAfterFailed);
                } else if (res.cancel) {
                    if (callback) {
                        callback('fail');
                        this.shareCallback = null;
                    }
                }
            },
            fail: () => {
                if (callback) {
                    callback('fail');
                    this.shareCallback = null;
                }
            }
        });
    }
}
