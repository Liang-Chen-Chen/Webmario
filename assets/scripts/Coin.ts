import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator; 
@ccclass 
export default class Coin extends cc.Component 
{ 
    onLoad() { 
        if (GameManager.instance) {
            GameManager.instance.addCoin(1);
        } else {
            cc.warn("找不到 GameManager 實例！");
        }
        let anim = this.getComponent(cc.Animation); 
        if (anim) { 
            anim.play('coin_spin'); 
        } 
        cc.tween(this.node) .by(0.6, { y: 40 }) .to(0.1, { opacity: 0 }) .call(() => this.node.destroy()) .start(); 
    }
 }