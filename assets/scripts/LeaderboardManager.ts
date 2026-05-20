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
        // 先清空舊的資料
        this.content.removeAllChildren();
        this.statusLabel.string = "Loading...";

        FirebaseManager.instance.getLeaderboard((dataArray) => {
            this.statusLabel.string = ""; // 抓到資料後隱藏 Loading

            if (dataArray.length === 0) {
                this.statusLabel.string = "No data available.";
                return;
            }

            dataArray.forEach((data, index) => {
                // 生成每一行排名
                let item = cc.instantiate(this.rankItemPrefab);
                item.parent = this.content;

                // 設定文字 (透過節點名稱尋找)
                let rank = item.getChildByName("RankLabel").getComponent(cc.Label);
                let name = item.getChildByName("NameLabel").getComponent(cc.Label);
                let score = item.getChildByName("ScoreLabel").getComponent(cc.Label);

                rank.string = (index + 1).toString();
                // 隱藏 Email 後半段，保護個資 (player@gmail.com -> player)
                name.string = data.email ? data.email.split('@')[0] : "Unknown";
                score.string = data.score.toString();
            });
        });
    }

    onClose() {
        this.node.active = false;
    }
}