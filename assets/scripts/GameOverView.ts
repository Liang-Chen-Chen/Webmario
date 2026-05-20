// GameOverView.ts (掛在 GameOverScene 的指令碼)
import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameOverView extends cc.Component {

    @property(cc.Label) finalScoreLabel: cc.Label = null;
    @property(cc.Label) finalCoinLabel: cc.Label = null;

    start() {
        // 從全域資料庫把剛才 GameManager 存進來的資料拿出來顯示
        if (this.finalScoreLabel) {
            this.finalScoreLabel.string = "FINAL SCORE: " + GameData.score;
        }
        if (this.finalCoinLabel) {
            this.finalCoinLabel.string = "TOTAL COINS: X" + GameData.coinCount.toString().padStart(3, '0');
        }
    }

    // 「重新開始」按鈕點擊事件
    onRestartBtnClick() {
        // 重新載入遊戲場景（它會自動觸發新的 GameManager 重新計算）
        cc.director.loadScene("Game"); 
    }

    // 「回到主選單」按鈕點擊事件
    onBackToMenuBtnClick() {
        cc.director.loadScene("Menu"); 
    }
}