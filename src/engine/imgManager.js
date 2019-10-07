export default class ImgManager {
    static _instance = null;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new ImgManager();
        return this._instance;
    }

    constructor() {
        this.dictImg = {};
        this.dictLoading = {};
    }

    getImg (src, loadCallback) {
        if (loadCallback) {
            if (!this.dictLoading.hasOwnProperty(src)) {
                this.dictLoading[src] = [];
            }  
    
            this.dictLoading[src].push(loadCallback);
        }
        

        if (this.dictImg.hasOwnProperty(src)) {
            let img = this.dictImg[src];
            if (img.isload) {
                //下一帧执行回调,表示加载成功
                setTimeout(() => {
                    this.onImgLoaded(src);
                }, 0);
            }
            
            return img;
        }

        let img = new Image();
        img.src = src;
        img.onload = ()=>{
            img.isload = true;
            this.onImgLoaded(src);
        }
        this.dictImg[src] = img;

        return img;
    }

    onImgLoaded (src) {
        if (this.dictLoading.hasOwnProperty(src)) {
            let arrCallback = this.dictLoading[src];

            arrCallback.forEach(element => {
                element && element(this.dictImg[src]);
            });
        }
    }

    colorRgb (strColor) {
        let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        let sColor = strColor.toLowerCase();
        if(sColor && reg.test(sColor)){
            if(sColor.length === 4){
                let sColorNew = "#";
                for(let i=1; i<4; i+=1){
                    sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));	
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            let sColorChange = [];
            for(let i=1; i<7; i+=2){
                sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));	
            }
            return {r: sColorChange[0], g: sColorChange[1], b: sColorChange[2]};
        }else{
            return sColor;	
        }
    };

    getStrokeImg (src, option, loadCallback) {
        let color = option.color;
        let lineWidth = option.lineWidth;
        let strokeSrc = src + '_stroke_' + color + '_' + lineWidth;

        if (loadCallback) {
            if (!this.dictLoading.hasOwnProperty(strokeSrc)) {
                this.dictLoading[strokeSrc] = [];
            }  
    
            this.dictLoading[strokeSrc].push(loadCallback);
        }

        if (this.dictImg.hasOwnProperty(strokeSrc)) {
            let img = this.dictImg[strokeSrc];
            if (img.isload) {
                //下一帧执行回调,表示加载成功
                setTimeout(() => {
                    this.onImgLoaded(strokeSrc);
                }, 0);
            }
            return this.dictImg[strokeSrc];
        }

        let image = new Image();
        this.dictImg[strokeSrc] = image;

        this.getImg(src, (img)=>{
            if (!this.canvas) {
                this.canvas = wx.createCanvas();
            }

            let objColor = this.colorRgb(color);

            let canvas = this.canvas;
            canvas.width = img.width;
            canvas.height = img.height;
    
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let imageData_length = imageData.data.length / 4;
            // 解析之后进行算法运算
            for (var i = 0; i < imageData_length; i++) {
                if (imageData.data[i * 4 + 3] !== 0) {
                    //即有颜色的地方，
                    imageData.data[i * 4] = objColor.r;
                    imageData.data[i * 4 + 1] = objColor.g;
                    imageData.data[i * 4 + 2] = objColor.b;
                }
            }
            ctx.putImageData(imageData, 0, 0);

            //再将原有的图片缩小填充进去
            ctx.drawImage(img, lineWidth, lineWidth, canvas.width - lineWidth*2, canvas.height - lineWidth*2 );

            image.src = canvas.toDataURL('image/png');
            image.onload = ()=>{
                image.isload = true;
                this.onImgLoaded(strokeSrc);
            }
        });

        return image;
    }
}