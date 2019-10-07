
/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 */

var ConfigManager = require("./configManager");

export default class LocalConfig  {
    static _instance = null;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new LocalConfig();
        return this._instance;
    }

    constructor() {
        this._callback = null;
    }

    loadConfig (cb) {
        this._callback = cb;
        this.loadCSV();
    }

    loadCSV () {
        this._skills = {};

        this.currentLoad = 0;
    
        //新增数据表 请往该数组中添加....
        var arrTables = ['goods', 'level'];
        this.cntLoad = arrTables.length;

        //客户端加载
        let fs = wx.getFileSystemManager()
        arrTables.forEach((tableName, index, array) => {
            let content = fs.readFileSync(`datas/${tableName}.csv`, 'utf-8');

            ConfigManager.addTable(tableName, content);
            this.tryToCallbackOnFinished();
        });
    }

    queryOne (tableName, key, value) {
        return ConfigManager.queryOne(tableName, key, value);
    }

    queryByID (tableName, ID) {
        return ConfigManager.queryByID(tableName, ID);
    }

    getTable (tableName) {
        return ConfigManager.getTable(tableName);
    }

    getTableArr (tableName) {
        return ConfigManager.getTableArr(tableName);
    }

    // 选出指定表里面所有有 key=>value 键值对的数据
    queryAll (tableName, key, value) {
        return ConfigManager.queryAll(tableName, key, value);
    }

    // 选出指定表里所有 key 的值在 values 数组中的数据，返回 Object，key 为 ID
    queryIn (tableName, key, values) {
        return ConfigManager.queryIn(tableName, key, values);
    }

    // 选出符合条件的数据。condition key 为表格的key，value 为值的数组。返回的object，key 为数据在表格的ID，value为具体数据
    queryByCondition (tableName, condition) {
        return ConfigManager.queryByCondition(tableName, condition);
    }

    tryToCallbackOnFinished () {
        if (this._callback) {
            this.currentLoad++;
            if (this.currentLoad >= this.cntLoad) {
                this._callback();
            }
        }
    }
};
