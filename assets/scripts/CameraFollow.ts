const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraFollow extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;

    @property
    offsetX: number = 0;

    private minX: number = 0;

    start() {
        this.minX = this.node.x;
    }

    update(dt: number) {

        if (!this.target) return;

        let targetX = this.target.x + this.offsetX;

        if (targetX < this.minX) {
            targetX = this.minX;
        } else {
            this.minX = targetX;
        }

        this.node.x = targetX;
    }

    resetCamera(x: number) {
        this.minX = x;
        this.node.x = x;
    }
}