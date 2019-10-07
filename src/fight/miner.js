import Node from "../engine/node";
import Sprite from "../engine/sprite";
import { Tween, Easing } from "../libs/Tween";
import { clientEvent } from "../engine/clientEvent";
import audioManager from "../engine/audioManager";
import util from "../engine/util";

const MINER_STATUS = {
    STOP: 0,
    IDLE: 1,
    DOWN: 2,
    BACK: 3
}


export default class Miner extends Node {
    constructor(parent) {
        super(parent);

        this.width = this.getFitValue(156);
        this.height = this.getFitValue(180);

        this.nodeMiner = new Node(this);
        this.nodeMiner.addSprite('images/fight/man/idle/idle01.png');
        this.nodeMiner.setScale(1.67);
        this.nodeMiner.anchorPoint.y = 1;
        this.nodeMiner.position.y = this.getFitValue(90);
        this.loadMinerAnimation();
        this.nodeMiner.addAnimation(this.minerIdle, this.idleDuration);

        //抓子台
        this.nodePulley = new Node(this);
        this.nodePulley.addSprite('images/fight/minerPulley02.png');
        this.nodePulley.position = {x: this.getFitValue(72), y: this.getFitValue(68)};

        //用来做抓子的根节点，可做晃动动画
        this.nodeCatcherParent = new Node(this);
        this.nodeCatcherParent.position = {x: this.getFitValue(130), y: this.getFitValue(30)};

        //齿轮
        this.nodeGear = new Node(this);
        this.nodeGear.addSprite('images/fight/gear.png');
        this.nodeGear.position = {x: this.getFitValue(100), y: this.getFitValue(22)};

        //绳子
        this.nodeRope = new Node(this.nodeCatcherParent);
        this.nodeRope.addSprite('images/fight/rope.png', Sprite.FILL_TYPE.TILED);
        this.nodeRope.width = this.getFitValue(4);
        this.nodeRope.height = this.getFitValue(70);
        this.nodeRope.anchorPoint.y = 0;

        //抓子特效
        this.nodeCatcherEffect = new Node(this.nodeCatcherParent);
        this.nodeCatcherEffect.addSprite('');
        this.nodeCatcherEffect.position = {x: 0, y: 0};
        this.nodeCatcherEffect.visible = false;

        this.effectFrames = [
            'images/effect/pliers/effectPliers01.png',
            'images/effect/pliers/effectPliers02.png',
            'images/effect/pliers/effectPliers03.png',
        ];

        //抓子
        this.nodeCatcher = new Node(this.nodeCatcherParent);
        this.nodeCatcher.addSprite('images/fight/catcher/minerPliers01.png');
        this.nodeCatcher.anchorPoint.y = 0;
        this.nodeCatcher.position.y = this.getFitValue(70);

        let frames = [
            'images/fight/catcher/minerPliers01.png',
            'images/fight/catcher/minerPliers02.png',
            'images/fight/catcher/minerPliers03.png'
        ]
        this.nodeCatcher.addAnimation(frames, 0.3);

        this.topY = this.nodeCatcher.position.y;
        this.bottomY = this.getFitValue(750); //最大长度

        this.speed = this.getFitValue(300);

        this.powerTime = 0;
     
        this.isClockwise = true;

        this._status = MINER_STATUS.STOP;
    }

    get status () {
        return this._status;
    }

    set status (value) {
        let oldStatus = this._status;
        this._status = value;

        if (value !== MINER_STATUS.IDLE) {
            if (value === MINER_STATUS.DOWN && oldStatus === MINER_STATUS.IDLE) {
                //发起抓取
                this.nodeCatcher.animation.play(false);
                if (this.powerTime <= 0 && this.cloverTime <= 0) {
                    this.changeMinerAnimation('pull');
                }
            }

            if (value === MINER_STATUS.BACK && oldStatus === MINER_STATUS.DOWN) {
                //属于收回来的状态，将钩子重置回来
                this.nodeCatcher.animation.stop();
                this.nodeCatcher.animation.reset2FirstFrame();
            }

             //暂停摇摆
            if (this.swingTween) {
                this.swingTween.stop();
                this.swingTween = null;
            }
        } else {
            if (oldStatus !== MINER_STATUS.IDLE) {
                if (this.powerTime <= 0 && this.cloverTime <= 0) {
                    this.changeMinerAnimation('idle');
                }
            }

            // audioManager.instance.stop('catcher.mp3');
            if (!this.swingTween) {
                this.swingCatcher();
            }
        }
       
    }

    get powerTime () {
        return this._powerTime;
    }

    set powerTime (value) {
        if (value <= 0) {
            value = 0;

            if (this._powerTime > 0) {
                //TODO 可以在这边做状态判定（即buff消失瞬间）
                if (this.cloverTime > 0) {
                    this.changeMinerAnimation('buff');
                } else if (this.status === MINER_STATUS.DOWN || this.status === MINER_STATUS.BACK) {
                    this.changeMinerAnimation('pull');
                } else {
                    this.changeMinerAnimation('idle');
                }

                //将抓子上的特效也隐藏
                if (this.nodeCatcherEffect.animation) {
                    this.nodeCatcherEffect.animation.stop();
                }
                
            }

            this.nodeCatcherEffect.visible = false;
        }

        this._powerTime = value;
    }

    get cloverTime () {
        return this._cloverTime;
    }

    set cloverTime (value) {
        if (value <= 0) {
            value = 0;

            if (this._cloverTime > 0) {
                //TODO 可以在这边做状态判定（即buff消失瞬间）
            }
        }

        this._cloverTime = value;
    }

    onEnable () {
        clientEvent.on('fire', this.fire, this);
        clientEvent.on('gameOver', this.gameOver, this);
    }

    onDisable () {
        clientEvent.off('fire', this.fire, this);
        clientEvent.off('gameOver', this.gameOver, this);
    }

    pause () {
        if (this.swingTween) {
            this.swingTween.stop();
            this.swingTween = null;
        }
    }

    resume () {
        this.swingCatcher();
    }

    getRandomRotation () {
        return Math.floor(Math.random() * 2) === 1 ? -50 : 50;
    }

    startRunning () {
        this.powerTime = 0;
        this.cloverTime = 0;

        //进入摇摆状态，后续改成开始游戏后，再摇摆
        this.resetCatcher();

        this.status = MINER_STATUS.IDLE;

        if (this.nodeCatcher.animation) {
            this.nodeCatcher.animation.reset2FirstFrame();
        }
    }

    resetCatcher () {
        this.nodeCatcher.position.y = this.getFitValue(70);
        this.nodeRope.height = this.getFitValue(70);

        this.nodeCatcher.removeAllChildren();

        // this.resetCatcherRotation();
    }

    resetCatcherRotation () {
        this.nodeCatcherParent.rotation = Math.floor(Math.random() * 2) === 1 ? -50 : 50;

        if (this.nodeCatcherParent.rotation === 50) {
            this.isClockwise = true;
        }
    }

    swingCatcher () {
        if (this.status === MINER_STATUS.DOWN || this.status === MINER_STATUS.BACK) {
            //如果正在抓取，则不能摇摆
            return;
        }

        if (this.swingTween) {
            this.swingTween.stop();
            this.swingTween = null;
        }

        let targetRotation = 50; //晃动夹角，现在设置为90度
        if (!this.isClockwise) {
            targetRotation = -50;
        }

        let curRotation = this.nodeCatcherParent.rotation;
        let offset = Math.abs(targetRotation - curRotation);

        this.swingTween = new Tween(this.nodeCatcherParent).to({rotation: targetRotation}, offset/50).easing(Easing.Quadratic.InOut).onComplete(()=>{
            this.isClockwise = !this.isClockwise;
            this.swingCatcher();
        }).start();
    }

    fire () {
        if (this.status !== MINER_STATUS.IDLE) {
            return;
        }

        this.status = MINER_STATUS.DOWN;

        // audioManager.instance.playSound('catcher.mp3', true);
    }

    gameOver () {
        this.status = MINER_STATUS.STOP;

        this.powerTime = 0;
        this.cloverTime = 0;

        // audioManager.instance.stop('catcher.mp3');

        this.nodeMiner.animation.stop();
        this.nodeMiner.animation.reset2FirstFrame();
    }

    update (dt) {
        super.update(dt);

        if (this.parent.startScene && this.parent.startScene.isPause) {
            return;
        }

        if (this.status === MINER_STATUS.DOWN) {
            //正在往下挖
            let speed = this.speed;
            if (this.powerTime > 0) {
                speed *= 2; //有能量状态翻2倍
            }
            this.nodeCatcher.position.y += dt * speed;

            this.nodeGear.rotation += dt * speed;

            if (this.nodeCatcher.position.y > this.bottomY) {
                this.nodeCatcher.position.y = this.bottomY;
                this.status = MINER_STATUS.BACK;  //返回
            }

            let posCatcherWorld = this.nodeCatcher.getWorldPosition();
            if (posCatcherWorld.x > canvas.width + this.getFitValue(30) || posCatcherWorld.x < - this.getFitValue(30)) {
                this.nodeCatcher.position.y = this.bottomY;
                this.status = MINER_STATUS.BACK;  //返回
            }

            let offset = this.nodeCatcher.position.y;
            this.nodeRope.height = offset;

            //TODO 检查是否有碰到矿石
            let nodeGoods = this.parent.checkIsCatch(posCatcherWorld, this.nodeCatcher.getBoundingPoints());
            if (nodeGoods) {
                nodeGoods.parent = this.nodeCatcher;
                nodeGoods.position = {x: 0, y: this.getFitValue(55)};
                nodeGoods.rotation = 0;
                this.status = MINER_STATUS.BACK;
                this.isBombing = false;
                this.currentGood = nodeGoods;
            }
        } else if (this.status === MINER_STATUS.BACK) {
            let speed = this.speed;
            if (this.powerTime > 0) {
                speed *= 2; //有能量状态翻2倍
            }

            if (this.currentGood) {
                //已经抓到东西，以抓到的东西速度为准
                speed /= this.currentGood.mineInfo.speed;
            }

            if (this.isBombing) {
                speed = this.getFitValue(2000);
            }

            this.nodeCatcher.position.y -= dt * speed;

            this.nodeGear.rotation -= dt * speed;

            if (this.nodeCatcher.position.y < this.topY) {
                this.nodeCatcher.position.y = this.topY;
                this.isBombing = false;
                // this.resetCatcherRotation();
                this.status = MINER_STATUS.IDLE;  //返回

                if (this.currentGood) {
                    //有抓到东西，加分，并且销毁该对象
                    clientEvent.dispatchEvent('catch', this.currentGood.mineInfo, this.cloverTime > 0);

                    this.currentGood.destroy();
                    this.currentGood = null;
                }
            }

            let offset = this.nodeCatcher.position.y;
            this.nodeRope.height = offset;
        }

        if (this.powerTime > 0) {
            this.powerTime -= dt;
        }

        if (this.cloverTime > 0) {
            this.cloverTime -= dt;
        }

        if (this.nodeCatcherEffect.visible) {
            this.nodeCatcherEffect.position = {x: this.nodeCatcher.position.x, y: this.nodeCatcher.position.y + this.getFitValue(30)};
        }
    }

    checkIsCanUseBomb () {
        return this.status === MINER_STATUS.BACK && this.currentGood; //当前已经拉到东西才可使用炸弹
    }

    useBomb () {
        //先创建爆炸特效，预加载
        let frames = [
            'images/effect/boom/boom01.png',
            'images/effect/boom/boom02.png',
            'images/effect/boom/boom03.png',
            'images/effect/boom/boom04.png',
            'images/effect/boom/boom05.png',
            'images/effect/boom/boom06.png',
            'images/effect/boom/boom07.png',
            'images/effect/boom/boom08.png',
        ];

        let boomEffect = new Node(this);
        boomEffect.addAnimation(frames, 0.4);
        boomEffect.addSprite('images/effect/boom/boom01.png');
        boomEffect.visible = false;
        boomEffect.setScale(2);

        let bomb = new Node(this);
        bomb.addSprite('images/fight/mine/bomb.png');
        let targetPos = bomb.getParentSpacePosition(this.nodeCatcher.getWorldPosition());

        let dis = util.pDistance(targetPos, bomb.position);
        bomb.tween = new Tween(bomb.position).to(targetPos, dis/2000).onComplete(()=>{
            bomb.tween.stop();
            bomb.tween = null;

            bomb.destroy();

            audioManager.instance.playSound('boom.mp3');
            boomEffect.position = targetPos;
            boomEffect.visible = true;
            boomEffect.animation.play();
            boomEffect.animation.onEnded(()=>{
                this.isBombing = true;
                boomEffect.destroy();
            });

            if (this.currentGood) {
                this.currentGood.destroy();
                this.currentGood = null;
            }

        }).start();
    }

    /**
     * 获得能量，拉取直接使用
     */
    usePower () {
        this.powerTime = 30; //10秒拉取速度提升2倍

        this.changeMinerAnimation('crazy');

        this.nodeCatcherEffect.visible = true;
        if (!this.nodeCatcherEffect.animation) {
            this.nodeCatcherEffect.addAnimation(this.effectFrames, 0.25);
        }

        this.nodeCatcherEffect.animation.play(true);
    }

    useClover () {
        this.cloverTime = 30; //10秒内积分 1.5倍

        if (this.powerTime <= 0) {
            this.changeMinerAnimation('buff');
        }
    }

    loadMinerAnimation () {
        this.minerIdle = [
            'images/fight/man/idle/idle01.png',
            'images/fight/man/idle/idle02.png',
            'images/fight/man/idle/idle03.png',
            'images/fight/man/idle/idle04.png',
            'images/fight/man/idle/idle05.png',
            'images/fight/man/idle/idle06.png',
            'images/fight/man/idle/idle07.png',
        ];

        this.idleDuration = 1;

        this.minerPull = [
            'images/fight/man/pull/pull01.png',
            'images/fight/man/pull/pull02.png',
            'images/fight/man/pull/pull03.png',
            'images/fight/man/pull/pull04.png',
            'images/fight/man/pull/pull05.png',
            'images/fight/man/pull/pull06.png',
            'images/fight/man/pull/pull07.png',
            'images/fight/man/pull/pull08.png',
            'images/fight/man/pull/pull09.png',
        ];

        this.pullDuration = 1.2;

        this.minerCrazy = [
            'images/fight/man/crazy/crazy01.png',
            'images/fight/man/crazy/crazy02.png',
            'images/fight/man/crazy/crazy03.png',
            'images/fight/man/crazy/crazy04.png',
            'images/fight/man/crazy/crazy05.png',
            'images/fight/man/crazy/crazy06.png',
        ];

        this.crazyDuration = 0.5;

        this.minerBuff = [
            'images/fight/man/buff/buff01.png',
            'images/fight/man/buff/buff02.png',
            'images/fight/man/buff/buff03.png',
            'images/fight/man/buff/buff04.png',
            'images/fight/man/buff/buff05.png',
            'images/fight/man/buff/buff06.png',
            'images/fight/man/buff/buff07.png',
            'images/fight/man/buff/buff08.png',
        ]

        this.buffDuration = 0.8;
    }

    changeMinerAnimation (ani) {
        this.nodeMiner.animation.stop();

        let frames = this.minerIdle;
        let duration = this.idleDuration;

        this.nodeMiner.position.y = this.getFitValue(90);
        switch(ani) {
            case 'crazy':
                frames = this.minerCrazy;
                duration = this.crazyDuration;
                this.nodeMiner.position.y = this.getFitValue(110); //由于特效原因导致人物整体变大，需要往下调整
                break;
            case 'buff':
                frames = this.minerBuff;
                duration = this.buffDuration;
                break;
            case 'pull':
                frames = this.minerPull;
                duration = this.pullDuration;
                break;
        }

        this.nodeMiner.animation.init(frames, duration);

        this.nodeMiner.animation.play(true);
    }
}