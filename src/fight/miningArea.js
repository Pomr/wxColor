import Node from "../engine/node";
import Miner from "./miner";
import DataBus from "../databus";
import Intersection from "../engine/intersection";
import LocalConfig from "../framework/localConfig";

export default class MiningArea extends Node {
    constructor(parent) {
        super(parent);

        this.width = canvas.width;
        this.height = canvas.height;
        // this.addColorLayer('#000000');
        // this.opacity = 150;

        //矿工
        this.miner = new Miner(this);
        this.miner.position = {x: -130*gameSpace.ratio, y: this.getFitValue(-520)};

        //矿区
        this.area = new Node(this);
        // this.area.addColorLayer('#000000');
        // this.area.opacity = 150;
        this.area.width = canvas.width;
        this.area.height = canvas.height - this.getFitValue(420);
        this.area.anchorPoint.y = 0;
        this.area.position.y = this.getFitValue(-260);

        this.arrMines = [];
        
        this.minCheckDistance = this.getFitValue(200);
    }

    show(startScene) {
        this.startScene = startScene;
    }

    startRunning () {
        this.miningAreaList = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
        ];

        this.columnCnt = this.miningAreaList[0].length;
        this.rowCnt = this.miningAreaList.length;
        this.cellWidth = this.getFitValue(100);

        this.maxWidth = this.cellWidth * this.columnCnt;

        //随机生产矿石
        this.generateMine();

        this.miner.startRunning();
    }

    getFitPos (mineInfo, retryTimes = 0) {
        let minDeep = mineInfo.minDeep;
        let maxDeep = mineInfo.maxDeep;

        //获得适合坐标
        let randX = Math.floor(Math.random() * this.columnCnt);
        let randY = minDeep + Math.floor(Math.random() * (maxDeep - minDeep + 1));

        if (this.miningAreaList[randY][randX] === 1) {
            //如果已经被占用，则递归在查找
            retryTimes++;

            if (retryTimes > 10) {
                //从头遍历下是否有合适的格子给她
                let isFound = false;
                for (let idx = minDeep; idx < maxDeep + 1; idx++) {
                    for (let idxCol = 0; idxCol < this.columnCnt; idxCol++) {
                        if (this.miningAreaList[idx][idxCol] === 0) {
                            //有位置，直接把这个位置给它
                            randX = idxCol;
                            randY = idx;
                            isFound = true;
                        }
                    }
                }

                if (!isFound) {
                    return null;
                }
            } else {
                return this.getFitPos(mineInfo, retryTimes);
            }
        }

        this.miningAreaList[randY][randX] = 1;

        //加个偏移量
        let pos = {x: this.cellWidth * randX - this.maxWidth / 2 + this.cellWidth / 2, y: this.getFitValue(50) + this.cellWidth * randY};
        pos.x += Math.floor(Math.random() - 0.5) * this.getFitValue(20);
        pos.y += Math.floor(Math.random() - 0.5) * this.getFitValue(20);

        return pos;
    }

    clearAllMines () {
        for (let idx = 0; idx < this.arrMines.length; idx++) {
            this.arrMines[idx].destroy();
        }

        this.arrMines = [];
    }

    generateMine () {
        this.clearAllMines();

        let levelInfo = DataBus.instance.getCurrentLevel();
        let mineList = levelInfo.mines.split('|');
        let dictMines = {};
        mineList.forEach(element => {
            let arrElement = element.split('-');
            dictMines[arrElement[0]] = Number(arrElement[1]);
        });

        let order = ['diamond1', 'diamond2', 'gold3', 'gold2', 'gold1', 'bomb', 'power', 'clover', 'stone1', 'stone2', 'bone1', 'bone2'];

        order.forEach((key)=>{
            if (!dictMines.hasOwnProperty(key)) {
                return;
            }

            let generateNum = dictMines[key];
            let mineInfo = LocalConfig.instance.queryOne('goods', 'name', key);

            if (!mineInfo || !generateNum) {
                return;
            }

            for (let idx = 0; idx < generateNum; idx++) {
                let pos = this.getFitPos(mineInfo);
                if (!pos) {
                    continue;
                }

                let nodeMine = new Node(this.area);
                nodeMine.addSprite(`images/fight/mine/${key}.png`)
                nodeMine.rotation = Math.floor(Math.random()*180) - 90;
                nodeMine.mineInfo = mineInfo;
                nodeMine.position = pos;
                this.arrMines.push(nodeMine);
            }
        });
    } 

    checkIsCatch (posWorld, boundingPoints) {
        for (let idx = 0; idx < this.arrMines.length; idx++) {
            let element = this.arrMines[idx];
            let rect = element.getWorldRect();
            if (Math.abs(posWorld.x - rect.posWorld.x) > this.minCheckDistance || Math.abs(posWorld.y - rect.posWorld.y) > this.minCheckDistance) {
                continue;
            }

            let isIntersection = Intersection.polygonPolygon(element.getBoundingPoints(0.8), boundingPoints);
            if (isIntersection) {
                element.parent = null;
                this.arrMines.splice(idx, 1);
                return element;
            }
        }

        return null;
    }
}