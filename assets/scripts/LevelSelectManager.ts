// LevelSelectManager.ts
import GameData from "./GameData";
const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelSelectManager extends cc.Component {
    @property(cc.Button) level2Btn: cc.Button = null;

    onLoad() {
        // 偵錯用：看看現在存檔到底是多少
        cc.log("目前存檔解鎖等級: " + GameData.unlockedLevel);

        if (this.level2Btn) {
            // 修正點：小於 2 (即只有 1) 時，不能點第二關
            if (GameData.unlockedLevel < 2) {
                this.level2Btn.interactable = false;
            } else {
                this.level2Btn.interactable = true;
            }
        }
    }
    
    onSelectLevel1() {
        GameData.currentLevel = 0; 
        cc.director.loadScene("GameStart"); 
    }

    onSelectLevel2() {
        GameData.currentLevel = 1; 
        cc.director.loadScene("GameStart");
    }
}