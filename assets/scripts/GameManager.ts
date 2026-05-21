import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    public static instance: GameManager = null;

    @property(cc.Label) scoreLabel: cc.Label = null;
    @property(cc.Label) lifeLabel: cc.Label = null;
    @property(cc.Label) timerLabel: cc.Label = null;
    @property(cc.AudioClip) bgm: cc.AudioClip = null;
    @property(cc.Label) coinLabel: cc.Label = null;
    @property(cc.AudioClip) coinSound: cc.AudioClip = null;

    public score: number = 0;
    private life: number = 3;
    private timeLeft: number = 300; // 5分鐘
    private bgmAudioID: number = -1;
    private coinCount: number = 0;

    onLoad() {
        if (GameManager.instance) {
            this.node.destroy();
            return;
        }
        GameManager.instance = this;
        cc.game.addPersistRootNode(this.node);
        //GameManager.instance = this;
        this.updateScore(0);
        this.updateLife(0);

        if (this.bgm) {
            this.bgmAudioID = cc.audioEngine.playMusic(this.bgm, true);
        }
    }

    update(dt: number) {
        // 計時器邏輯
        if (this.timeLeft > 0) {
            this.timeLeft -= dt;
            this.updateTimerUI();
        }
    }

    updateScore(pts: number) {
        this.score += pts;
        this.scoreLabel.string = "Score: " + this.score;
    }

    updateLife(change: number) {
        this.life += change;
        if (this.life < 0) this.life = 0;
        this.lifeLabel.string = "Life: x" + this.life;
        
        if (this.life <= 0) {
            // Game Over 邏輯可寫這
            cc.log("Game Over");
            this.gameOver();
        }
    }

    updateTimerUI() {
        if(this.timerLabel && this.timerLabel.node && this.timerLabel.node.isValid) {
            let min = Math.floor(this.timeLeft / 60);
            let sec = Math.floor(this.timeLeft % 60);
            this.timerLabel.string = `Time: ${min}:${sec < 10 ? '0' + sec : sec}`;
        }else {}
    }

    getLife() { return this.life; }

    addCoin(amount: number = 1) {
        this.coinCount += amount;
        this.coinLabel.string = "x " + this.coinCount.toString().padStart(3, '0');

        // 2. 呼叫播放音效的方法
        this.playCoinSound();
        this.updateScore(100);
    }

    // 3. 實作播放音效
    playCoinSound() {
        if (this.coinSound) {
            // 使用 playEffect 播放短音效（不會蓋掉 BGM）
            cc.audioEngine.playEffect(this.coinSound, false);
        }
    }

    gameOver() {
        cc.log("Game Over! 準備切換場景");

        // 1. 在換場景前，把最後的成績存在全域變數裡
        GameData.score = this.score;
        GameData.coinCount = this.coinCount;

        // 2. 停止背景音樂
        cc.audioEngine.stopMusic();

        // 3. 直接切換到你的 Game Over 場景（名字要跟你的 Scene 檔案一模一樣）
        cc.director.loadScene("GameOver"); 
    }
}