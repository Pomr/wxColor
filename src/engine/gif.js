/**
 * 游戏基础的gif类，负责gif解析以及播放
 */

const gifParser = require('./../libs/gifParser');
const util = require('./../libs/util');

export default class Gif {
    constructor(gifSrc = '', width=  0, height = 0, x = 0, y = 0) {
        this.src = gifSrc;
        this.width  = Math.floor(width);
        this.height = Math.floor(height);
        this.imgWidth = width;
        this.imgHeight = height;

        this.x = x;
        this.y = y;

        this.visible = true;
        this.hdr = null;
        this.frame = null;
        this.frames = [];
        this.loadGif();

        this.index = 0;
        this.delayFrameCnt = 0;
        this.delay = 0;
    }

    loadGif () {
        if (this.src.startsWith('http')) {
            //远程地址，去发起请求
            wx.downloadFile({
                url: this.src,
                success: (res)=>{
                    if (res.statusCode === 200) {
                        this.loadFile(res.tempFilePath);
                    } else {
                        console.error('download file error!code:', res.statusCode);
                    }
                },
                fail: (err)=>{
                    console.error(err);
                }
            });
        } else {
            this.loadFile(this.src);
        }
    }

    loadFile (path) {
        //本地地址，采取fileSystem去load
        let file = wx.getFileSystemManager();
        file.readFile({
            filePath: path,
            encoding: 'latin1',
            success: (res)=>{
                //加载成功
                this.doParse(res.data);
            }, 
            fail: (err)=>{
                console.error(err);
            }
        });
    }

    doParse (gifFileData) {
        //1. 读取文件内容
        let stream = new gifParser.Stream(gifFileData.toString());
        console.log(stream);

        //2. 创建离屏Canvas
        this.tmpCanvas = wx.createCanvas();
        this.scaleCanvas = wx.createCanvas();

        //3. 启动解析
        try {
            gifParser.parseGIF(stream, {
                hdr: (_hdr)=>{
                    this.doHdr(_hdr);
                },
                gce: (gce)=>{
                    this.doGCE(gce);
                },
                com: ()=>{

                },
                app: {
                    NETSCAPE: ()=>{

                    }
                },
                img: (img)=>{
                    this.doImg(img);
                },
                eof: (block)=>{
                    this.pushFrame();
                    //加载完成

                    //释放两个画布
                    this.tmpCanvas = null;
                    this.scaleCanvas = null;
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    clear () {
        this.transparency = null;
        this.delay = null;
        this.lastDisposalMethod = this.disposalMethod;
        this.disposalMethod = null;
        this.frame = null;
    }

    doHdr (_hdr) {
        this.hdr = _hdr;
    
        this.imgWidth = this.hdr.width;
        this.imgHeight = this.hdr.height;
        this.tmpCanvas.width = this.hdr.width;
        this.tmpCanvas.height = this.hdr.height;
        
        if (this.width === 0) {
            this.width = this.imgWidth;
            this.height = this.imgHeight;
        }

        this.scaleCanvas.width = this.width;
        this.scaleCanvas.height = this.height;
    }

    doGCE (gce) {
        this.pushFrame();
        this.clear();
        this.transparency = gce.transparencyGiven ? gce.transparencyIndex : null;
        this.delay = gce.delayTime;
        this.disposalMethod = gce.disposalMethod;
    }

    pushFrame () {
        if (!this.frame) return;

        //此处是用于做缩放
        let ctx = this.scaleCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.drawImage(this.tmpCanvas, 0, 0, this.width, this.height);

        this.frames.push({delay: this.delay, 
            data: ctx.getImageData(0, 0, this.width, this.height)});
    }

    doImg (img) {
        if (!this.frame) this.frame = this.tmpCanvas.getContext('2d');
        var ct = img.lctFlag ? img.lct : this.hdr.gct; // TODO: What if neither exists?
  
        var cData = this.frame.getImageData(img.leftPos, img.topPos, img.width, img.height);
  
        img.pixels.forEach(function(pixel, i) {
          // cData.data === [R,G,B,A,...]
          if (this.transparency !== pixel) { // This includes null, if no transparency was defined.
            cData.data[i * 4 + 0] = ct[pixel][0];
            cData.data[i * 4 + 1] = ct[pixel][1];
            cData.data[i * 4 + 2] = ct[pixel][2];
            cData.data[i * 4 + 3] = 255; // Opaque.
          } else {
            // TODO: Handle disposal method properly.
            // XXX: When I get to an Internet connection, check which disposal method is which.
            if (this.lastDisposalMethod === 2 || this.lastDisposalMethod === 3) {
              cData.data[i * 4 + 3] = 0; // Transparent.
              // XXX: This is very very wrong.
            } else {
                // cData.data[i * 4 + 3] = 0;
              // lastDisposalMethod should be null (no GCE), 0, or 1; leave the pixel as it is.
              // assert(lastDispsalMethod === null || lastDispsalMethod === 0 || lastDispsalMethod === 1);
              // XXX: If this is the first frame (and we *do* have a GCE),
              // lastDispsalMethod will be null, but we want to set undefined
              // pixels to the background color.
            }
          }
        }, this);
        this.frame.putImageData(cData, img.leftPos, img.topPos);

        // this.frame.scale(gameSpace.ratio, gameSpace.ratio);
    }

    render (ctx) {
        let frame = this.frames[this.index];
        if (!frame) {
            return;
        }
        
        ctx.putImageData(this.frames[this.index].data, this.x, this.y);
        // ctx.drawImage(frame.img, this.x, this.y, this.width, this.height);

        if (this.delayFrameCnt > frame.delay) {
            this.delayFrameCnt = 0;
            this.index++;

            if (this.index >= this.frames.length) {
                this.index = 0;
            }
        }

        this.delayFrameCnt+=2;
        // this.index++;
    }
}