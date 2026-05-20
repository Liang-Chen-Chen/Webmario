const { ccclass, property } = cc._decorator;

// =============================================
// 關卡地圖定義
// 每個字元代表一格 (32x32px)：
//   '0' = 空氣
//   '1' = 地板
//   '2' = 磚塊
//   '3' = 問號磚塊
// 每一行字串 = 地圖的一列（row）
// 第一行 = 最頂端，最後一行 = 最底端
// 每行 60 個字元 = 螢幕寬度 x2（可向右捲動）
// =============================================
const LEVELS: string[][] = [
    // ===== Level 1 =====
    [
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', // row 0 天空
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000000002220000000000022300000000000000',
        '0000000000000000022000000000000000000000220000000000000000000000000000000000000000000000000000000000', // 高平台
        '0000000000000000000000000000000000000000000000000000000000000000000000000222200000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000',
        '0000000000002200300000000000000022002700000000000000000000000000000000000000000000000000000000000000', // 中平台
        '0000000000000000000000220000000000000000220000000000000000000000000000000000000022000000000000000000', 
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000300000000002220000000000000000000000000000000000000000022002700000000000000000000000', 
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        // 這裡示範放置牆壁：5是長牆，4是短牆
        '500000000000006004050000000000000000405000000000600000050000000000000000000004000000000600054000000',
        '1111111111111111111111110000111111111111111111111111111111111111111000011111111111111111111111111111', 
        '1111111111111111111111110000111111111111111111111111111111111111111000011111111111111111111111111111',
    ],

    // ===== Level 2 =====
    [
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000002222000000000000000000000000000000002222000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000022230000000000000002223000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000',
        '111111111111111100001111111111111111111100001111111111111111',
        '111111111111111100001111111111111111111100001111111111111111',
    ],
];

@ccclass
export default class MapGenerator extends cc.Component {
    @property(cc.Prefab) enemyPrefab: cc.Prefab = null;
    @property(cc.Prefab) shortWallPrefab: cc.Prefab = null;
    @property(cc.Prefab) tallWallPrefab: cc.Prefab = null;
    @property(cc.Prefab) questionBlockPrefab: cc.Prefab = null;
    
    @property() enemyProbability: number = 0.1;
    @property(cc.SpriteFrame) groundSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) brickSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) questionSpriteFrame: cc.SpriteFrame = null;
    @property(cc.Node) world: cc.Node = null;
    @property currentLevel: number = 0;

    readonly TILE_SIZE = 32;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        
        this.loadLevel(this.currentLevel);
        cc.director.getPhysicsManager().gravity = cc.v2(0, -800);
    }

    loadLevel(levelIndex: number) {
        this.world.removeAllChildren();
        const map = LEVELS[levelIndex];
        if (!map) return;

        const rows = map.length;
        const cols = map[0].length;
        
        // 根據地圖長度自動調整位置，讓地圖從左邊開始
        this.world.setPosition(-480, -265);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const char = map[row][col];
                const x = col * this.TILE_SIZE;
                const y = (rows - 1 - row) * this.TILE_SIZE;
                if (char === '3') {
                    this.spawnQuestionBlock(x, y, "coin");
                } else if (char === '4') {
                    this.spawnPrefab(this.shortWallPrefab, x, y);
                } else if (char === '5') {
                    this.spawnPrefab(this.tallWallPrefab, x, y);
                } else if (char === '6') {
                    this.spawnEnemy(x, y);
                } else if (char === '7') {
                    this.spawnQuestionBlock(x, y, "mushroom");
                } else if (char !== '0') {
                    this.createTile(parseInt(char), x, y, char !== '1');
                }
            }
        }
        this.buildGroundColliders(map, rows, cols);
    }

    spawnQuestionBlock(x: number, y: number, type: string) {

        let block = cc.instantiate(this.questionBlockPrefab);

        block.parent = this.world;

        block.setPosition(
            x + this.TILE_SIZE / 2,
            y + this.TILE_SIZE / 2
        );

        let script = block.getComponent("QuestionBlock");

        if (script) {
            script.blockType = type;
        }
    }

    spawnPrefab(prefab: cc.Prefab, x: number, y: number) {
        if (!prefab) return;
        let node = cc.instantiate(prefab);
        node.parent = this.world;
        node.setPosition(x + this.TILE_SIZE/2, y + this.TILE_SIZE/2);

        node.group = 'wall'; // 設定牆壁群組，讓敵人能識別
    }

    spawnEnemy(x, y) {
        if (!this.enemyPrefab) return;
        let enemy = cc.instantiate(this.enemyPrefab);
        enemy.parent = this.world;
        enemy.setPosition(x + this.TILE_SIZE / 2, y + 10);

        enemy.group = 'enemy'; // 設定敵人群組，讓玩家能識別
    }

    createTile(type: number, x: number, y: number, addCollider: boolean) {
        const node = new cc.Node();
        node.anchorX = 0.5; node.anchorY = 0.5;
        node.setPosition(x + this.TILE_SIZE/2, y + this.TILE_SIZE/2);
        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        node.setContentSize(this.TILE_SIZE, this.TILE_SIZE);

        switch (type) {
            case 1: sprite.spriteFrame = this.groundSpriteFrame; break;
            case 2: sprite.spriteFrame = this.brickSpriteFrame; break;
        }

        if (addCollider) {
            const body = node.addComponent(cc.RigidBody);
            body.type = cc.RigidBodyType.Static;
            body.enabledContactListener = true;
            const collider = node.addComponent(cc.PhysicsBoxCollider);
            collider.size = cc.size(this.TILE_SIZE, this.TILE_SIZE);
        }
        node.parent = this.world;
    }

    // 切換到下一關（供 GameManager 呼叫）
    nextLevel() {
        const next = this.currentLevel + 1;
        if (next < LEVELS.length) {
            this.currentLevel = next;
            this.loadLevel(this.currentLevel);
        } else {
            cc.log('所有關卡完成！');
        }
    }

    buildGroundColliders(map: string[], rows: number, cols: number) {
        for (let row = 0; row < rows; row++) {
            let startCol = -1;
            for (let col = 0; col <= cols; col++) {
                const isGround = col < cols && parseInt(map[row][col]) === 1;
                if (isGround && startCol === -1) {
                    startCol = col;
                } else if (!isGround && startCol !== -1) {
                    // 建立從 startCol 到 col-1 的合併碰撞盒
                    const width = (col - startCol) * this.TILE_SIZE;
                    const x = startCol * this.TILE_SIZE;
                    const y = (rows - 1 - row) * this.TILE_SIZE;

                    const node = new cc.Node('ground_collider');
                    node.anchorX = 0;
                    node.anchorY = 0;
                    node.setPosition(x, y);
                    node.setContentSize(width, this.TILE_SIZE);

                    const body = node.addComponent(cc.RigidBody);
                    body.type = cc.RigidBodyType.Static;
                    body.enabledContactListener = true;

                    const collider = node.addComponent(cc.PhysicsBoxCollider);
                    collider.size = cc.size(width, this.TILE_SIZE);
                    collider.offset = cc.v2(width / 2, this.TILE_SIZE / 2);

                    node.parent = this.world;
                    startCol = -1;
                }
            }
        }
    }
}

