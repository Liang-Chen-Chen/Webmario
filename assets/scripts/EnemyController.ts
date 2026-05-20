const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyController extends cc.Component {

    @property
    moveSpeed: number = 100;

    @property(cc.AudioClip)
    dieSound: cc.AudioClip = null;

    private rb: cc.RigidBody = null;
    private anim: cc.Animation = null;
    private dir: number = -1;

    // 用來偵測前方是否有牆或懸空
    private wallCheckTimer: number = 0;
    private readonly WALL_CHECK_INTERVAL = 0.5;

    onLoad() {
        this.rb = this.getComponent(cc.RigidBody);
        this.anim = this.getComponent(cc.Animation);
        if (this.rb) {
            this.rb.fixedRotation = true;
            this.rb.enabledContactListener = true;
        }
    }

    start() {
        if (this.anim) {
            this.anim.play('enemy_move');
        }
    }

    private turnCooldown: number = 0;

update(dt: number) {
    if (!this.rb) return;
    if (this.turnCooldown > 0) this.turnCooldown -= dt;

    let v = this.rb.linearVelocity;
    v.x = this.dir * this.moveSpeed;
    this.rb.linearVelocity = v;
    this.node.scaleX = this.dir > 0 ? 1 : -1;
}

onBeginContact(contact, selfCollider, otherCollider) {
    const otherNode = otherCollider.node;

    if (otherNode.name === 'Player') {
        let worldNormal = contact.getWorldManifold().normal;
        if (worldNormal.y > 0.5) {
            this.die();
            let playerRb = otherNode.getComponent(cc.RigidBody);
            if (playerRb) {
                playerRb.linearVelocity = cc.v2(playerRb.linearVelocity.x, 400);
            }
        } else {
            if (this.anim) {
                this.anim.play('enemy_attack');
                this.scheduleOnce(() => {
                    if (this.anim && this.node.activeInHierarchy) {
                        this.anim.play('enemy_move');
                    }
                }, 0.5);
            }
            let player = otherNode.getComponent('PlayerGenerator');
            if (player) (player as any).getHurt();
        }
        return;
    }

    // 碰牆轉向，加冷卻避免卡住
    if (this.turnCooldown <= 0) {
        let worldNormal = contact.getWorldManifold().normal;
        if (Math.abs(worldNormal.x) > 0.5) {
            this.dir *= -1;
            this.turnCooldown = 0.3;
        }
    }
}

    die() {
        // 避免重複觸發
        if (!this.node.activeInHierarchy) return;
        if (this.dieSound) {
            cc.audioEngine.playEffect(this.dieSound, false);
        }
        try {
            const GameManager = require('./GameManager').default;
            GameManager.instance.updateScore(100);
        } catch(e) {}
        
        this.node.destroy();
    }
}