import Pool from './engine/pool';
import util from './engine/util';
import FightConstants from './fight/fightConstants';
import LocalConfig from './framework/localConfig';

let instance;

const CONFIG_KEY = 'PlayConfig';

/**
 * 全局状态管理器
 */
export default class DataBus {
  static _instance = null;

  static get instance () {
      if (this._instance) {
          return this._instance;
      }

      this._instance = new DataBus();
      return this._instance;
  }

  constructor() {
    this.pool = new Pool();

    this.isNewBee = false;

    let config = localStorage.getItem(CONFIG_KEY);
    if (config) {
      this.storage = JSON.parse(config);
    } else {
      this.storage = {};

      this.isNewBee = true;
    }

    this.reset();
  }

  reset() {
    this.frame      = 0;
    this.score      = 0;
    this.animations = [];

    this.level = 1;
    this.fightTimes = 0;
  }

  saveData () {
    let str = JSON.stringify(this.storage);
    localStorage.setItem(CONFIG_KEY, str);
  }

  getMaxScore () {
    if (this.storage && this.storage.maxScore) {
      return this.storage.maxScore;
    }

    return 0;
  }

  updateMaxScore (score) {
    let maxScore = this.getMaxScore();
    if (score > maxScore) {
      this.storage.maxScore = score;
      this.saveData();
    }
  }

  addGold (gold) {
    if (!this.storage.gold) {
      this.storage.gold = 0;
    }

    this.storage.gold += gold;

    this.saveData();
  }

  getGold () {
    if (!this.storage.gold) {
      this.storage.gold = 0;
    }

    return this.storage.gold;
  }

  passLevel () {
    this.level ++;
  }

  resetLevel () {
    this.level = 1;
  }

  getCurrentLevel () {
    if (this.level > FightConstants.MAX_LEVEL) {
      //已经超过最大关卡了，直接以该关卡为基础配置，进行下一关
      let levelInfo = LocalConfig.instance.queryByID('level',  FightConstants.MAX_LEVEL);
      levelInfo = util.clone(levelInfo);

      let level = this.level;
      if (level > 45) {
        level = 45;
      }

      levelInfo.score+= Math.floor(1750 * (0.2+ (Math.floor(level/5) * 0.1))); //分数篡改下即可

      return levelInfo;
    }
    return LocalConfig.instance.queryByID('level', this.level);
  }
  
}
