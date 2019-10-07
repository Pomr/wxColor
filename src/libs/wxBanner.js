/**
 * Created by super on 2019/5/31.
 */

export default class WxBanner {
    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new WxBanner();
        return this._instance;
    }

    style = {
        left: -720,
        top: -200,
    };

    defaultTopValue = 50;

    // 广告位，只需要两个
    bannerIds = {};
    // 点击率上限
    CTRUpperLimit = 0.15;
    // 刷新间隔
    refreshInterval = 600000;

    //按钮位置
    bannerTop = canvas.height - Math.floor(260 * gameSpace.ratio);
    /**
     * 进行数据的初始化
     * @param {Object} 平台控制对象
     */
    init(param) {
        if (!window.wx) {
            return;
        }
        console.log('[banner init]');
        this.CTRUpperLimit = param.bannerCTRUpperLimit;
        this.bannerIds = param.bannerIds;
        this.refreshInterval = param.refreshInterval;
        this.style.left = param.left;
        this.style.top = param.top;
        // 广告点击次数
        this.AdClicks = 0;
        // 广告曝光次数
        this.AdViews = 0;
        this.banners = [];
        this.bannerIsShow = false;
        this.systemInfo = window.wx.getSystemInfoSync();
        this.adWidth = this.systemInfo.windowWidth;
        this.rate = 720 / this.systemInfo.windowWidth;

        this.start();
    }

    /**
     * 正式加载banner
     */
    start() {
        if (this.bannerIds.length < 2) {
            console.error('[banners length must >= 2]');
            return;
        }
        this.bannerIndex = Math.random() > 0.5 ? 1 : 0;
        this.createBanner(this.bannerIds[this.bannerIndex]);
        // 定时器
        this.intervalTimmer = setInterval(() => {
            if (this.bannerIsShow) {
                return;
            }
            // console.log('logic banner interval');
            const nCTR = (this.AdClicks / this.AdViews) || 0;
            // console.log(`nCTR: ${nCTR} AdClicks: ${this.AdClicks} AdViews:${this.AdViews} bannerIndex: ${this.bannerIndex} CTRUpperLimit:${this.CTRUpperLimit}`);
            if (nCTR > this.CTRUpperLimit) {
                if (this.banners[this.bannerIndex]) {
                    this.banners[this.bannerIndex].destroy();
                    this.banners[this.bannerIndex] = null;
                }
                // 当点击率大于预设值时需要拉高曝光,降低点击率
                this.createBanner(this.bannerIds[this.bannerIndex]);
                return;
            }
            if (!this.banners[this.bannerIndex]) { // 如果当前banner没有,就需要创建一个
                this.createBanner(this.bannerIds[this.bannerIndex]);
            }
        }, this.refreshInterval * 1000);
    }

    /**
     * 获取一个banner并进行显示
     */
    createBanner(bannerId) {
        if (!bannerId) {
            console.warn('[banner getBanner] 不存在的bannerid');
            return;
        }
        this.getBanner(bannerId, (bn) => {
            this.banners[this.bannerIndex] = bn;
            this.AdViewsEvent();
            this.showAdBanner();
        }, () => {
            this.banners[this.bannerIndex] = null;
        });
    }

    /**
     * 创建banner
     */
    getBanner(bannerId, success, fail) {
        if (!bannerId) {
            console.error('[banner getBanner] 不存在的bannerid');
            return;
        }
        const bn = window.wx.createBannerAd({
            adUnitId: bannerId,
            style: {
                left: this.style.left,
                top: this.style.top,
                width: this.adWidth,
            },
            useId: true, // 风领sdk中需要的参数
        });
        bn.onError((err) => {
            console.error(`[createBanner]失败${JSON.stringify(err)}`);
            this.report(false, err, bannerId);
            if (fail && typeof fail === 'function') {
                fail();
            }
        });
        bn.onLoad((res) => {
            this.report(true, res, bannerId);
            console.warn(`[createBanner]成功${res}`);
            this.nowAdBanner = bn;
            if (success && typeof success === 'function') {
                success(this.nowAdBanner);
            }
        });
    }

    /**
     * 广告被曝光一次
     */
    AdViewsEvent() {
        this.AdViews++;
    }

    /**
     * 广告被点击一次
     */
    AdClicksEvent() {
        this.AdClicks++;
        this.clickReport(this.bannerIds[this.bannerIndex]);
        if (this.banners[this.bannerIndex]) {
            this.banners[this.bannerIndex].hide();
            this.banners[this.bannerIndex].destroy();
            this.bannerIndex = this.bannerIndex === 1 ? 0 : 1;
            this.createBanner(this.bannerIds[this.bannerIndex]);
        }
    }

    /**
     * 显示广告
     */
    showAdBanner(adPlaceName) {
        const bn = this.banners[this.bannerIndex];
        if (!window.wx || !bn) {
            return;
        }
        let top = 0;
        if (adPlaceName) {
            this.bannerIsShow = true;
            // 离底边的距离
            top = this.systemInfo.windowHeight - bn.style.realHeight - this.defaultTopValue / this.rate;

            this.bannerTop = top * window.devicePixelRatio;
            // if (adPlaceName === 'gameOverPanel') {
            //     // 真实坐标
            //     const posY = -480;
            //     top = (this.systemInfo.windowHeight / 2) - (bn.style.realHeight / 2) + (-posY / this.rate);
            // } else {
            //     // 离底边的距离
            //     const posY = 50; // 中心点开始算起的y值
            //     top = this.systemInfo.windowHeight - bn.style.realHeight - posY / this.rate;
            // }
            // 贴底
            // this.systemInfo.windowHeight - bn.style.realHeight - posY / this.rate;
            // (this.systemInfo.windowHeight / 2) - (bn.style.realHeight / 2) + (-posY / this.rate);
        } else {
            this.bannerIsShow = false;
        }

        // console.log(`########realHeight=${bn.style.realHeight}`);
        // console.log(`########realWidth=${bn.style.realWidth}`);
        // console.log(`########width=${bn.style.width}`);

        if (this.bannerIsShow) {
            bn.style.left = 0;
            bn.style.width = this.systemInfo.windowWidth;
            bn.style.top = top;
        } else {
            bn.style.left = this.style.left / this.rate;
            bn.style.width = this.systemInfo.windowWidth;
            bn.style.top = this.style.top / this.rate;
        }
        bn.show();
    }

    /**
     * 隐藏广告
     */
    hideAdBanner() {
        if (!window.wx) {
            return;
        }
        this.bannerIsShow = false;
        // 关闭界面将banner移动到角落
        const bn = this.banners[this.bannerIndex];
        if (bn) {
            bn.style.left = this.style.left / this.rate;
            bn.style.width = this.systemInfo.windowWidth;
            bn.style.top = this.style.top / this.rate;
        }

        //特殊处理,如果存在另一个banner实例则将其设置到左上角
        let anotherBnIdx = this.bannerIndex === 1 ? 0 : 1;
        let anotherBn = this.banners[anotherBnIdx];
        if (anotherBn) {
            console.log('存在另一个banner', anotherBn);
            anotherBn.style.left = this.style.left / this.rate;
            anotherBn.style.width = this.systemInfo.windowWidth;
            anotherBn.style.top = this.style.top / this.rate;
        }
    }

    /**
     * 广告打点
     * @param {Boolean} succ true 成功 false 失败
     * @param {Object} res 结果值
     * @param {String} bannerId
     */
    report(succ, res, bannerId) {
        const nDate = new Date();
        const time = `${nDate.getDate}-${nDate.getHours}`;
        if (succ) {
            // this.platform.sendEvent('拉取成功', {
            //     time,
            //     bannerId,
            // });
        } else {
            // this.platform.sendEvent('拉取失败', {
            //     time,
            //     errCode: res.errCode,
            //     bannerId,
            // });
        }
    }

    clickReport(bannerId) {
        const nDate = new Date();
        const time = `${nDate.getDate}-${nDate.getHours}`;
        // this.platform.sendEvent('点击banner', {
        //     time,
        //     bannerId,
        // });
    }

    /**
     * 处理hide事件
     */
    handlerHide(res) {
        if (!res || !res.mode || !res.targetPagePath) {
            return;
        }

        if (res.mode === 'launchMiniProgram') {
            if (res.targetPagePath.indexOf('weixinadinfo') !== -1
                && res.targetPagePath.indexOf('gdt_vid') !== -1) {
                // 这里是真正的banner点击跳转
                this.AdClicksEvent();
            }
        } else if (res.mode === 'hide') {
            if (res.targetPagePath.indexOf('SnsAdNativeLandingPagesPreviewUI') !== -1) {
                this.AdClicksEvent();
            }
            if (res.targetAction === 10) {
                this.AdClicksEvent();
            }
            if (res.targetAction === -1) {
                this.AdClicksEvent(); // ios 上跳转appStore
            }
        } else if (res.mode === 'back') {
            if (res.targetPagePath.indexOf('weixinadinfo') !== -1
                && res.targetPagePath.indexOf('gdt_vid') !== -1) {
                this.AdClicksEvent(); // ios 上点击banner跳转卖量
            }
        }
    }

    /**
     * 获取banner点位置
     */
    getBannerHeightCenter() {
        let y;
        let bnHeight;
        if (window.wx) {
            bnHeight = 0.35 * this.systemInfo.windowWidth; // 预估的banner高度
            y = this.systemInfo.windowHeight / 2 - bnHeight / 2 - this.defaultTopValue / this.rate;
            y *= this.rate; // 转换到项目中的坐标
        } else {
            bnHeight = cc.winSize.width * 0.35;
            y = cc.winSize.height / 2 - bnHeight / 2 - this.defaultTopValue;
        }
        return cc.v2(0, -y);
    }
};