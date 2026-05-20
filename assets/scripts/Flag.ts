// Flag.ts
import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Flag extends cc.Component {

    onBeginContact(contact, self, other) {
        if (other.node.name === "Player") {
            this.handleWin();
        }
    }

    // Flag.ts
    handleWin() {
        cc.log("第一關通關！更新解鎖進度...");

        // 如果目前玩的是第一關(0)，且進度還是1
        if (GameData.currentLevel === 0 && GameData.unlockedLevel < 2) {
            GameData.unlockedLevel = 2; // 這裡會自動觸發 GameData 的 setter 存入 localStorage
        }

        cc.director.loadScene("LevelSelect");
    }
}