// MenuManager.ts
const { ccclass, property } = cc._decorator;

@ccclass
export default class MenuManager extends cc.Component {
    // 點擊「開始遊戲」按鈕時呼叫
    onStartGame() {
        cc.director.loadScene("LevelSelect"); // 切換到關卡選擇
    }
}