// LevelSelectManager.ts
const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelSelectManager extends cc.Component {
    
    // 進入第一關
    onSelectLevel1() {
        cc.director.loadScene("Game"); 
    }

    // 回到主選單
    onBackToMenu() {
        cc.director.loadScene("Menu");
    }
}