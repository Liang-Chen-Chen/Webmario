const {ccclass, property} = cc._decorator;

@ccclass
export default class Mushroom extends cc.Component {

    speed: number = 80;

    dir: number = 1;

    rb: cc.RigidBody = null;

    justSpawned: boolean = false;

    onLoad() {

        this.rb = this.getComponent(cc.RigidBody);
    }

    update() {

        if (!this.rb) return;

        this.rb.linearVelocity = cc.v2(
            this.dir * this.speed,
            this.rb.linearVelocity.y
        );
    }

    onBeginContact(contact, self, other) {
        if (other.node.group === 'wall' || other.node.group === 'default') {
            let worldNormal = contact.getWorldManifold().normal;
            if (Math.abs(worldNormal.x) > 0.5) {
                this.dir *= -1;
            }
        }

        if (other.node.name === 'Player') {
            let player = other.node.getComponent("PlayerGenerator");
            if (player) (player as any).becomeBig();
            this.node.destroy();
        }
    }
}