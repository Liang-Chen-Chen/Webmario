// StartGameController.ts
const { ccclass, property } = cc._decorator;

@ccclass
export default class StartGameController extends cc.Component {
    start() {
        // 停留 2 秒後進入 Game 場景
        this.scheduleOnce(() => {
            cc.director.loadScene("Game");
        }, 2.0);
    }
}