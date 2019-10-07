import Sprite from "./sprite";
import Label from "./label";
import ColorLayer from "./colorLayer";
import Animation from "./animation";
import ArtDigit from "./artDigit";
import NodeManager from "./nodeManager";

export default class Node {
    constructor (parent) {
        this._parent = null;
        this.parent = parent;
        this.children = [];
        this.components = []; //组件，一般是sprite

        
        this._visible = true;
        this.width = 0;
        this.height = 0;
        this.position = {x: 0, y: 0};
        this.anchorPoint = {x: 0.5, y: 0.5};
        this.scale = {x: 1, y: 1};
        this.rotation = 0;
        this._opacity = 1; //默认不透明
        this.color = '#ffffff';
        
        //下一帧触发展示，主要为了能够正常的调用onEnable
        NodeManager.instance.addNewNode(this);
    }

    set parent (value) {
        if (this._parent) {
            this._parent.removeChild(this);
        }

        this._parent = value;
        if (this._parent && this._parent.addChild) {
            this._parent.addChild(this);
        }
    }

    get parent () {
        return this._parent;
    }

    /**
     * 设置 0 ~ 255
     *
     * @memberof Node
     */
    set opacity (value) {
        if (value < 0 || value > 255) {
            console.error();
            return;
        }

        this._opacity = value / 255;
    }

    get opacity () {
        return this._opacity * 255;
    }

    set visible (value) {
        if (this._visible !== value) {
            if (this._visible) {
                this.onDisable();

                this.children.forEach((element)=>{
                    if (element.onEnable && element.visible) {
                        element.onDisable();
                    }
                });
            } else {
                this.onEnable();

                this.children.forEach((element)=>{
                    if (element.onEnable && element.visible) {
                        element.onEnable();
                    }
                });
            }
        }

        this._visible = value;
    }

    get visible () {
        return this._visible;
    }

    onEnable () {

    }

    onDisable () {

    }

    render (ctx) {
        if (!this.visible) {
            return;
        }

        //先渲染自己
        this.components.forEach(component=>{
            if (component.render) {
                component.render(ctx);
            }
        });

        this.children.forEach((element)=>{
            if (element.render && element.visible) {
                element.render(ctx);
            }
        });
    }

    update (dt) {
        this.components.forEach(component=>{
            if (component.update) {
                component.update(dt);
            }
        });

        this.children.forEach((element)=>{
            if (element.update) {
                element.update(dt);
            }
        })
    }

    addChild (object) {
        this.children.push(object);
    }

    removeChild (object) {
        let idx = this.children.indexOf(object);
        if (idx != -1) {
            this.children.splice(idx, 1);
        }
    }

    removeAllChildren () {
        //移除所有子节点
        let arrChild = [];
        for (let idx = 0; idx < this.children.length; idx++) {
            arrChild.push(this.children[idx]);
        }

        //不直接使用this.children 主要是因为
        arrChild.forEach((child)=>{
            child.destroy();
        });

        this.children = [];
    }

    addComponent (object) {
        this.components.push(object);
    }

    removeComponent (object) {
        let idx = this.components.indexOf(object);
        if (idx != -1) {
            this.components.splice(idx, 1);
        }
    }

    getComponent (name) {
        for (let idx = 0; idx < this.components.length; idx++) {
            let element = this.components[idx];

            if (element.name === name) {
                return element;
            }
        }
    }

    setScale (x, y) {
        if (typeof(y) === 'undefined') {
            y = x;
        }

        if (typeof(x) !== 'number' || typeof(y) !== 'number') {
            console.error('scale must be number');
            return;
        }

        this.scale = {x: x, y: y};
    }

    contains (point) {
        let rect = this.getWorldRect();
        return (rect.x <= point.x &&
            rect.x + rect.width >= point.x &&
            rect.y <= point.y &&
            rect.y + rect.height >= point.y);
    }

    destroy () {
        if (this.parent) {
            this.parent.removeChild(this);
        }

        this.parent = null;

        this.removeAllChildren();

        //移除所有组件
        let arrComponent = [];
        for (let idx = 0; idx < this.components.length; idx++) {
            arrComponent.push(this.components[idx]);
        }

        //不直接使用this.children 主要是因为
        arrComponent.forEach((component)=>{
            component.detach();
        });

        this.components = [];

        this.visible = false;
    }

    getParentSpacePosition (posWorld) {
        let pos = {};
        let posParent = this.parent.getWorldPosition();
        
        let posAddition = {x: posWorld.x - posParent.x, y: posWorld.y - posParent.y};

        
        let rotation = -this.parent.getWorldRotation();
        let raduis = rotation * Math.PI / 180;
        pos.x = (posAddition.x - posParent.x) * Math.cos(raduis) - (posAddition.y - posParent.y) * Math.sin(raduis) + posParent.x;
        pos.y = (posAddition.x - posParent.x) * Math.sin(raduis) + (posAddition.y - posParent.y) * Math.cos(raduis) + posParent.y;

        return pos;
    }

    setWorldPosition (posWorld) {
        this.position = this.getParentSpacePosition(posWorld);
    }

    getWorldPosition () {
        //TODO 获取世界坐标，原先没有考虑说旋转的问题，需要修改
        // let pos = {x: this.position.x, y: this.position.y};
        // let parent = this.parent;
        // while (parent && parent.position) {
        //     pos.x += parent.position.x;
        //     pos.y += parent.position.y;

        //     parent = parent.parent;
        // }


        let pos = {x: this.position.x, y: this.position.y};
        let parent = this.parent;
        if (parent) {
            let posParent = parent.getWorldPosition();

            //基于posParent旋转指定角度
            let posAddition = {x: posParent.x + this.position.x, y: posParent.y + this.position.y};

            //旋转
            let rotation = parent.getWorldRotation();
            let raduis = rotation * Math.PI / 180;
            pos.x = (posAddition.x - posParent.x) * Math.cos(raduis) - (posAddition.y - posParent.y) * Math.sin(raduis) + posParent.x;
            pos.y = (posAddition.x - posParent.x) * Math.sin(raduis) + (posAddition.y - posParent.y) * Math.cos(raduis) + posParent.y;
        }

        return pos;
    }

    getWorldRotation () {
        let rotation = this.rotation;

        if (this.parent) {
            rotation += this.parent.getWorldRotation();
        }

        return rotation;
    }

    getWorldScale () {
        let scale = {x: this.scale.x, y: this.scale.y};
        let parent = this.parent;
        while (parent && parent.scale) {
            scale.x *= parent.scale.x;
            scale.y *= parent.scale.y;

            parent = parent.parent;
        }

        return scale;
    }

    /**
     * 获得矩形框，不考虑旋转
     */
    getWorldRect () {
        let posWorld = this.getWorldPosition();
        let scale = this.getWorldScale();
        return {
            x: posWorld.x - this.width * scale.x * this.anchorPoint.x, 
            y: posWorld.y - this.height * scale.y * this.anchorPoint.y, 
            width: this.width * scale.x, 
            height: this.height * scale.y,
            posWorld: posWorld    
        };
    }

    /**
     * 获得指定比例的包围盒，以中心点算比例
     * @param {number} ratio 
     */
    getBoundingPoints (ratio = 1) {
        let rect = this.getWorldRect();
        let rotation = this.getWorldRotation();

        //根据旋转角度指定，将矩形框转至对应的位置
        let minusWidth = (1 - ratio)/2 * rect.width;
        let minusHeight = (1 - ratio)/2 * rect.height;
        let lt = {x: rect.x + minusWidth, y: rect.y + minusHeight};
        let lb = {x: rect.x + minusWidth, y: rect.y + rect.height - minusHeight};
        let rt = {x: rect.x + rect.width - minusWidth, y: rect.y + minusHeight};
        let rb = {x: rect.x + rect.width - minusWidth, y: rect.y + rect.height - minusHeight};

        let centerPoint = {x: rect.x + rect.width * this.anchorPoint.x, y: rect.y + rect.height * this.anchorPoint.y};

        let raduis = rotation * Math.PI / 180;
        lt.x = (lt.x - centerPoint.x) * Math.cos(raduis) - (lt.y - centerPoint.y) * Math.sin(raduis) + centerPoint.x;
        lt.y = (lt.x - centerPoint.x) * Math.sin(raduis) + (lt.y - centerPoint.y) * Math.cos(raduis) + centerPoint.y;

        lb.x = (lb.x - centerPoint.x) * Math.cos(raduis) - (lb.y - centerPoint.y) * Math.sin(raduis) + centerPoint.x;
        lb.y = (lb.x - centerPoint.x) * Math.sin(raduis) + (lb.y - centerPoint.y) * Math.cos(raduis) + centerPoint.y;

        rt.x = (rt.x - centerPoint.x) * Math.cos(raduis) - (rt.y - centerPoint.y) * Math.sin(raduis) + centerPoint.x;
        rt.y = (rt.x - centerPoint.x) * Math.sin(raduis) + (rt.y - centerPoint.y) * Math.cos(raduis) + centerPoint.y;

        rb.x = (rb.x - centerPoint.x) * Math.cos(raduis) - (rb.y - centerPoint.y) * Math.sin(raduis) + centerPoint.x;
        rb.y = (rb.x - centerPoint.x) * Math.sin(raduis) + (rb.y - centerPoint.y) * Math.cos(raduis) + centerPoint.y;

        return [lt, lb, rt, rb];
    }

    addSprite (imgSrc, fillType) {
        this.sprite = new Sprite(this);
        this.sprite.init(imgSrc, fillType);
    }

    addLabel (text, fontSize, textAlign) {
        this.label = new Label(this);
        this.label.init(text, fontSize, textAlign);
    }

    addColorLayer (color) {
        this.colorLayer = new ColorLayer(this);
        this.colorLayer.init(color);
    }

    addAnimation (frames, duration) {
        this.animation = new Animation(this);
        this.animation.init(frames, duration);
    }

    addArtDigit (txt, imgSrc, strArt) {
        this.artDigit = new ArtDigit(this);
        this.artDigit.init(txt, imgSrc, strArt);
    }

    //获得适配值
    getFitValue (value) {
        return Math.floor(value * gameSpace.ratio);
    }
}