const { ccclass, property } = cc._decorator;

@ccclass
export default class BackgroundParallax extends cc.Component {

    @property(cc.Node)
    playerNode: cc.Node = null;

    @property()
    scrollSpeedFactor: number = 0.5; // 背景移動速度的係數

    private playerStartX: number = 0;

    start() {
        if (this.playerNode) {
            this.playerStartX = this.playerNode.x;
        }

        // 🌟 核心操作：確保背景是在相機座標系下
        // 建議在編輯器手動將 Background 拖入 Main Camera，或者用代碼強制執行：
        let camera = cc.find("Canvas/Main Camera");
        if (camera && this.node.parent !== camera) {
            this.node.parent = camera;
            this.node.setPosition(0, 0); // 歸位到鏡頭中心
        }
    }

    update(dt: number) {
        if (!this.playerNode) return;

        // 計算玩家相對於出生點跑了多遠
        let movedDist = this.playerNode.x - this.playerStartX;

        // 🌟 空間轉換計算：
        // 既然相機座標不動(0,0)，我們就讓背景在相機內部往「反方向」滑動。
        // 如果玩家往右跑，背景就往左滑，這樣視覺上背景就像是在往右捲動。
        // 補償公式：- (玩家移動距離 * 速度係數)
        this.node.x = -(movedDist * this.scrollSpeedFactor);
    }
}