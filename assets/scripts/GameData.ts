// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
// GameData.ts
// 這是一個全域的資料夾，任何場景都可以隨時存取它

export default class GameData {
    public static score: number = 0;
    public static coinCount: number = 0;
    public static currentLevel: number = 1;
}