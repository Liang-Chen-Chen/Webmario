// LevelSelectManager.ts
import GameData from "./GameData";
const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelSelectManager extends cc.Component {

    @property(cc.Button) level2Btn: cc.Button = null;
    static unlockedLevel: number = 0;

    start() {
        // 如果解鎖進度小於 2，Level 2 按鈕就不能點
        // 注意：這裡是用 GameData.unlockedLevel 屬性
        if (GameData.unlockedLevel < 1) {
            this.level2Btn.interactable = false; 
        } else {
            this.level2Btn.interactable = true;
        }
    }
    
    onSelectLevel1() {
        GameData.currentLevel = 0; // 強制設定為第 1 關 (陣列 index 0)
        cc.director.loadScene("GameStart"); 
    }

    onSelectLevel2() {
        // 只有按鈕 interactable 為 true 時，這個 function 才會被按鈕組件觸發
        GameData.currentLevel = 1; // 強制設定為第 2 關 (陣列 index 1)
        cc.director.loadScene("GameStart");
    }

    onBackToMenu() {
        cc.director.loadScene("Menu");
    }
}