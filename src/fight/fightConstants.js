export default class FightConstants {
    static MINE_TYPE = {
        PROP: 1,        //道具
        OBSTACLE: 2,    //障碍物
        GOLD: 3,        //黄金钻石
    }

    static SHARE_FUNCTION = {
        BALANCE: 'balance',             //结算分享 
        RELIVE: 'relive',              //复活
        RANK: 'rank',                   //排行榜
        TRIAL: 'trial',             //试用
        CLICK_BOX: 'clickBox',          //点开宝箱
        ONLINE: 'online',                   //在线奖励
        MAIN: 'main',                    //主界面分享

        BOMB: 'bomb',               //道具-炸弹
        POWER: 'power',             //道具-能量
        NEXT_LEVEL: 'nextLevel',    //下一关
        SHARE: 'share',

        
    }

    //打开奖励的方式
    static OPEN_REWARD_TYPE = {
        AD: 0,
        SHARE: 1,
        NULL: 2
    }  

    static MAX_LEVEL = 20; //最大关卡
}