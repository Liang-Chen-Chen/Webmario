const { ccclass, property } = cc._decorator;
import FirebaseManager from "./FirebaseManager";

@ccclass
export default class LeaderboardManager extends cc.Component {

    @property(cc.Prefab) rankItemPrefab: cc.Prefab = null;
    @property(cc.Node) content: cc.Node = null;
    @property(cc.Label) statusLabel: cc.Label = null; // 用來顯示 "Loading..."

    // 當 Panel 被設為 active = true 時，這個 function 會自動執行
    onEnable() {
        this.loadRanking();
    }

    onOpen() {
        this.node.active = true; // 顯示排行榜面板
        // 因為面板打開了，onEnable() 會自動被觸發去抓資料
    }

    loadRanking() {
        this.content.removeAllChildren();

        if (!FirebaseManager.instance || !(FirebaseManager.instance as any).db) {
            this.statusLabel.string = "資料庫連接中，請稍後...";
            // 延遲 1 秒後重試
            this.scheduleOnce(() => { this.loadRanking(); }, 1.0);
            return;
        }
        
        if (!FirebaseManager.instance) {
            this.statusLabel.string = "Firebase 未初始化";
            cc.error("FirebaseManager.instance 是 null！");
            return;
        }
        
        this.statusLabel.string = "Loading...";

        FirebaseManager.instance.getLeaderboard((dataArray) => {
            if (!this.node || !this.node.activeInHierarchy) return;
            
            this.statusLabel.string = "";

            if (dataArray.length === 0) {
                this.statusLabel.string = "No data yet.";
                return;
            }

            dataArray.forEach((data, index) => {
                let item = cc.instantiate(this.rankItemPrefab);
                item.parent = this.content;

                

                let rank = item.getChildByName("RankLabel").getComponent(cc.Label);
                let name = item.getChildByName("NameLabel").getComponent(cc.Label);
                let score = item.getChildByName("ScoreLabel").getComponent(cc.Label);

                rank.string = (index + 1).toString();
                let originalName = data.email ? data.email.split('@')[0] : "Unknown";
                const MAX_LENGTH = 5; // 設定你想要的字數上限

                if (originalName.length > MAX_LENGTH) {
                    name.string = originalName.substring(0, MAX_LENGTH) + "...";
                } else {
                    name.string = originalName;
                }
                score.string = data.score !== undefined ? data.score.toString() : "0";
            });
        });
    }
    onClose() {
        this.node.active = false;
    }
}