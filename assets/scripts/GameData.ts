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
    
    // 目前選中的關卡 (0 = Level 1, 1 = Level 2)
    public static currentLevel: number = 0; 

    // 使用存檔功能紀錄最高解鎖關卡 (預設為 1)
    public static get unlockedLevel(): number {
        let val = cc.sys.localStorage.getItem('unlockedLevel');
        return val ? parseInt(val) : 0;
    }

    public static set unlockedLevel(value: number) {
        cc.sys.localStorage.setItem('unlockedLevel', value.toString());
    }
}