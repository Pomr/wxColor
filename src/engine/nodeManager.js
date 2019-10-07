export default class NodeManager {
    static _instance = null;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new NodeManager();
        return this._instance;
    }

    constructor() {
        this.arrQueue = [];

        //启动计时器，每隔一段时间检查是否发起onEnable这个事件，为保证Node顺序一致
        setInterval(()=>{
            this.checkQueue();
        }, 10);
    }

    addNewNode (node) {
        this.arrQueue.push(node);
    }

    checkQueue () {
        while(this.arrQueue.length > 0) {
            let node = this.arrQueue.shift();
            if (node && node.visible) {
                node.onEnable();
            }
        }
    }
}