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

    handleWin() {
        cc.log("通關！");

        // 如果目前是第一關 (0)，解鎖進度就變成 2
        if (GameData.currentLevel === 0) {
            GameData.unlockedLevel = 1;
        }

        // 直接跳回關卡選擇畫面，此時 LevelSelectManager 的 start 會偵測到 unlockedLevel 為 2
        cc.director.loadScene("LevelSelect");
    }
}