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

// GameData.ts
export default class GameData {
    public static score: number = 0;
    public static coinCount: number = 0;
    public static currentLevel: number = 0; // 0 是第一關，1 是第二關

    // 使用 getter 確保每次讀取都是最新的本地存檔
    public static get unlockedLevel(): number {
        let val = cc.sys.localStorage.getItem('unlockedLevel');
        // 如果沒存過，預設是 1 (代表只有第一關可玩)
        return val ? parseInt(val) : 1;
    }

    // 使用 setter 確保每次賦值都會寫入硬碟
    public static set unlockedLevel(value: number) {
        cc.sys.localStorage.setItem('unlockedLevel', value.toString());
    }
}