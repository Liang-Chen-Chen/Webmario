const { ccclass, property } = cc._decorator;

@ccclass
export default class QuestionBlock extends cc.Component {

    @property(cc.Prefab)
    coinPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    mushroomPrefab: cc.Prefab = null;

    @property(cc.SpriteFrame)
    usedSprite: cc.SpriteFrame = null;

    @property
    blockType: string = "coin";

    private used: boolean = false;

    start() {
        let anim = this.getComponent(cc.Animation);
        if (anim && anim.defaultClip) {
            anim.play(anim.defaultClip.name); // 播放預設動畫
        }
    }

    onBeginContact(contact, self, other) {

        if (this.used) return;

        if (other.node.name !== 'Player') return;

        let normal = contact.getWorldManifold().normal;

        // 從下頂
        if (normal.y < -0.5) {

            this.used = true;

            let anim = this.getComponent(cc.Animation);
            if (anim) {
                anim.stop(); // ⭐ 關鍵
            }

            this.bump();

            this.changeUsedSprite();

            if (this.blockType === "coin") {
                this.spawnCoin();
            }
            else {
                this.spawnMushroom();
            }
        }
    }

    bump() {

        cc.tween(this.node)
            .by(0.08, { y: 10 })
            .by(0.08, { y: -10 })
            .start();
    }

    changeUsedSprite() {

        let sprite = this.getComponent(cc.Sprite);

        if (sprite && this.usedSprite) {
            sprite.spriteFrame = this.usedSprite;
        }
    }

    spawnCoin() {

        let coin = cc.instantiate(this.coinPrefab);

        coin.parent = this.node.parent;

        coin.setPosition(
            this.node.x,
            this.node.y + 32
        );
    }

    spawnMushroom() {
        if (!this.mushroomPrefab) return;
        
        let mushroom = cc.instantiate(this.mushroomPrefab);
        mushroom.parent = this.node.parent;
        // 生成在磚塊正上方
        mushroom.setPosition(this.node.x, this.node.y + 16);
        
        let rb = mushroom.getComponent(cc.RigidBody);
        if (rb) {
            rb.linearVelocity = cc.v2(0, 150);
        }
        
        // 讓蘑菇腳本知道剛生成，0.5秒內不偵測玩家碰撞
        let mushroomScript = mushroom.getComponent('Mushroom') as any;
        if (mushroomScript) {
            mushroomScript.justSpawned = true;
            mushroom.scheduleOnce(() => {
                mushroomScript.justSpawned = false;
            }, 0.5);
        }
    }
}