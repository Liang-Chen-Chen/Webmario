import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerGenerator extends cc.Component {

    moveSpeed: number = 250;
    jumpForce: number = 650;

    @property(cc.Node)
    mainCamera: cc.Node = null;

    @property(cc.SpriteFrame)
    transformEffect: cc.SpriteFrame = null;

    @property(cc.AudioClip)
    jumpSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    dieSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    mushroomSound: cc.AudioClip = null;

    private isBig: boolean = false;
    private leftDown: boolean = false;
    private rightDown: boolean = false;
    private isGrounded: boolean = false;
    private groundContactCount: number = 0;
    private groundedCooldown: number = 0;

    private rb: cc.RigidBody = null;
    private anim: cc.Animation = null;
    private currentAnim: string = "";
    private startPos: cc.Vec2 = cc.v2(0, 0);
    private isInvincible: boolean = false;

    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.startPos = this.node.getPosition(); // 紀錄初始位置
    }

    start() {
        this.rb = this.getComponent(cc.RigidBody);
        this.anim = this.getComponent(cc.Animation);

        if (this.rb) {
            this.rb.bullet = true;
            this.rb.enabledContactListener = true;
        } else {
            cc.error("找不到 RigidBody！");
        }

        if (this.anim) {
            this.anim.play("player_idle");
        }
    }

    update(dt: number) {
        if (!this.rb) return;

        if (this.node.y < -600) { 
            this.getHurt();
        }

        if (this.groundedCooldown > 0) {
            this.groundedCooldown -= dt;
            if (this.groundedCooldown <= 0) {
                if (this.groundContactCount <= 0) {
                    this.isGrounded = false;
                }
            }
        }

        let velocity = this.rb.linearVelocity;

        if (this.leftDown) {
            velocity.x = -this.moveSpeed;
            this.node.scaleX = -1;
        } else if (this.rightDown) {
            velocity.x = this.moveSpeed;
            this.node.scaleX = 1;
        } else {
            velocity.x = 0;
        }

        this.rb.linearVelocity = velocity;
        this.updateAnimation(velocity);
    }

    becomeBig() {
        if (this.isBig) return;
        this.isBig = true;
        
        if (this.mushroomSound) {
            cc.audioEngine.playEffect(this.mushroomSound, false);
        }
        // 播特效
        this.playTransformEffect();
        
        cc.tween(this.node)
            .to(0.2, { scale: 1.5 })
            .start();

        // 15秒後變小
        this.scheduleOnce(() => {
            if (this.isBig) {
                this.becomeSmall();
            }
        }, 15);
    }

    getHurt() {
        if (this.isInvincible) return;
        this.isInvincible = true;

        this.leftDown = false;
        this.rightDown = false;

        if (this.isBig) {
            // 變大狀態被打 → 先變小，不扣命
            this.becomeSmall();
            // 給一段無敵時間
            this.scheduleOnce(() => {
                this.isInvincible = false;
            }, 2.0);
            return;
        }

        if (this.dieSound) {
            cc.audioEngine.playEffect(this.dieSound, false);
        }

        // 小狀態被打 → 扣命 + reborn
        GameManager.instance.updateLife(-1);

        let rb = this.getComponent(cc.RigidBody);
        if (rb) rb.linearVelocity = cc.v2(0, 0);

        cc.tween(this.node)
            .repeat(5,
                cc.tween().to(0.1, { opacity: 0 }).to(0.1, { opacity: 255 })
            )
            .call(() => {
                this.reborn();
            })
            .start();
    }

    becomeSmall() {
        this.isBig = false;
        // 播特效
        this.playTransformEffect();
        // 縮回原本大小
        cc.tween(this.node)
            .to(0.2, { scale: 1 })
            .start();
    }

    reborn() {

        cc.Tween.stopAllByTarget(this.node);

        let rb = this.getComponent(cc.RigidBody);

        if (rb) {
            rb.linearVelocity = cc.v2(0, 0);
        }

        this.node.setPosition(this.startPos);

        let mainCam = this.mainCamera || cc.find("Canvas/Main Camera");

        if (mainCam) {

            let follow = mainCam.getComponent("CameraFollow");

            if (follow) {
                follow.resetCamera(this.node.x);
            }
        }

        this.node.opacity = 255;

        this.isInvincible = false;
        this.isGrounded = false;
        this.groundContactCount = 0;
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.leftDown = true;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.rightDown = true;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
            case cc.macro.KEY.space:
                if (this.isGrounded) {
                    this.rb.linearVelocity = cc.v2(this.rb.linearVelocity.x, this.jumpForce);
                    this.isGrounded = false;
                    this.groundContactCount = 0;  // ← 確認有這行
                    this.groundedCooldown = 0;    // ← 加這行
                    if (this.jumpSound) {
                        cc.audioEngine.playEffect(this.jumpSound, false);
                    }
                }
                break;
        }
    }

    onKeyUp(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.leftDown = false;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.rightDown = false;
                break;
        }
    }

    updateAnimation(velocity: cc.Vec2) {
        let animState = "player_idle";

        if (!this.isGrounded) {
            animState = "player_jump";
        } else if (velocity.x !== 0) {
            animState = "player_walk";
        } else {
            animState = "player_idle";
        }

        if (this.currentAnim !== animState) {
            this.currentAnim = animState;
            if (this.anim) {
                this.anim.play(animState);
            }
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        let worldManifold = contact.getWorldManifold();
        let normal = worldManifold.normal;
        if (normal.y < -0.5) {
            this.groundContactCount++;
            this.isGrounded = true;
            this.groundedCooldown = 0;
        }
    }

    onEndContact(contact, selfCollider, otherCollider) {
        let worldManifold = contact.getWorldManifold();
        let normal = worldManifold.normal;
        if (normal.y < -0.5) {
            this.groundContactCount--;
            this.groundedCooldown = 0.1;
        }
    }

    playTransformEffect() {
        if (!this.transformEffect) return;
        
        let effectNode = new cc.Node('effect');
        effectNode.parent = this.node.parent;
        effectNode.setPosition(this.node.x, this.node.y);
        
        let sprite = effectNode.addComponent(cc.Sprite);
        sprite.spriteFrame = this.transformEffect;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        effectNode.setContentSize(80, 80); // ← 調這個數字控制大小
        
        // 閃爍後消失
        cc.tween(effectNode)
            .repeat(3,
                cc.tween().to(0.1, { opacity: 0 }).to(0.1, { opacity: 255 })
            )
            .call(() => effectNode.destroy())
            .start();
    }
}