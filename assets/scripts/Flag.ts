// Flag.ts
import GameData from "./GameData";
import FirebaseManager from "./FirebaseManager";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Flag extends cc.Component {

    onBeginContact(contact, self, other) {
        if (other.node.name === "Player") {
            this.handleWin();
        }
    }

    // Flag.ts
    // Flag.ts
    handleWin() {
        cc.log("通關流程開始");

        // 1. 本地逻辑
        if (GameData.currentLevel === 0 && GameData.unlockedLevel < 2) {
            GameData.unlockedLevel = 2;
        }

        // 2. 執行跳轉（先跳轉，Firebase 在背景慢慢傳）
        cc.director.loadScene("LevelSelect");

        // 3. 背景執行存檔
        if (FirebaseManager.instance) {
            try {
                FirebaseManager.instance.saveProgress(GameManager.instance.score, GameData.unlockedLevel);
            } catch (e) {
                cc.error("Firebase 背景存檔失敗:", e);
            }
        }
    }
}