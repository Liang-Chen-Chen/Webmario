const { ccclass, property } = cc._decorator;

@ccclass
export default class FirebaseManager extends cc.Component {

    public static instance: FirebaseManager = null;

    private auth: any = null;
    private db: any = null;

    onLoad() {
        // 單例模式：確保全遊戲只有一個 FirebaseManager
        if (FirebaseManager.instance && FirebaseManager.instance !== this) {
            cc.log("發現重複的 FirebaseManager，正在刪除...");
            this.node.destroy();
            return;
        }

        FirebaseManager.instance = this;
        cc.game.addPersistRootNode(this.node); // 跨場景不銷毀，這非常重要

        this.initFirebase();
    }

    initFirebase() {
        const fb = (window as any).firebase;
        if (!fb) {
            cc.error("Firebase SDK 未載入，請檢查 index.html");
            return;
        }

        const firebaseConfig = {
            apiKey: "AIzaSyC7OZ7nKcBt-o3pFrtdEbR6Izvyedbb9DQ",
            authDomain: "webmario-112034071.firebaseapp.com",
            databaseURL: "https://webmario-112034071-default-rtdb.firebaseio.com",
            projectId: "webmario-112034071",
            storageBucket: "webmario-112034071.firebasestorage.app",
            messagingSenderId: "707683618961",
            appId: "1:707683618961:web:478316e6fba49e1ec8af30",
            measurementId: "G-D123Y3RCMG"
        };

        if (!fb.apps.length) {
            fb.initializeApp(firebaseConfig);
            cc.log("Firebase 初始化完成！");
        }

        this.auth = fb.auth();
        this.db = fb.database();
    }

    // 安全取得 db 的方法：如果 db 是 null 則嘗試修復
    private getSafeDb() {
        if (this.db) return this.db;
        const fb = (window as any).firebase;
        if (fb && fb.database) {
            this.db = fb.database();
            return this.db;
        }
        return null;
    }

    saveProgress(score: number, unlockedLevel: number) {
        let user = this.auth ? this.auth.currentUser : null;
        if (!user) {
            cc.warn("未登入，無法儲存");
            return;
        }

        let db = this.getSafeDb();
        if (!db) {
            cc.error("無法取得 Database 物件");
            return;
        }

        cc.log("正在存檔至 RTDB...", user.uid);
        db.ref('players/' + user.uid).set({
            email: user.email,
            score: score,
            unlockedLevel: unlockedLevel,
            updatedAt: (window as any).firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            cc.log("RTDB 儲存成功！");
        }).catch((err) => {
            cc.error("RTDB 儲存失敗:", err);
        });
    }

    loadProgress(callback: (data: any) => void) {
        let user = this.auth ? this.auth.currentUser : null;
        let db = this.getSafeDb();
        
        if (!user || !db) {
            callback(null);
            return;
        }

        db.ref('players/' + user.uid).once('value')
            .then((snapshot) => {
                callback(snapshot.exists() ? snapshot.val() : null);
            })
            .catch((err) => {
                cc.error("讀取失敗:", err);
                callback(null);
            });
    }

    getLeaderboard(callback: (data: any[]) => void) {
        let db = this.getSafeDb();
        if (!db) return callback([]);

        db.ref('players')
            .orderByChild('score')
            .limitToLast(10)
            .once('value')
            .then((snapshot) => {
                let results = [];
                snapshot.forEach((child) => {
                    results.push(child.val());
                });
                callback(results.reverse());
            })
            .catch((err) => {
                cc.error("排行榜讀取失敗:", err);
                callback([]);
            });
    }

    // 註冊
    signUp(email: string, password: string, callback: (success: boolean, msg: string) => void) {
        this.auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                cc.log("註冊成功:", userCredential.user.email);
                callback(true, "註冊成功！");
            })
            .catch((error) => {
                cc.error("註冊失敗:", error.message);
                callback(false, error.message);
            });
    }

    // 登入
    signIn(email: string, password: string, callback: (success: boolean, msg: string) => void) {
        this.auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                cc.log("登入成功:", userCredential.user.email);
                callback(true, "登入成功！");
            })
            .catch((error) => {
                cc.error("登入失敗:", error.message);
                callback(false, error.message);
            });
    }

    // 登出
    signOut() {
        this.auth.signOut().then(() => {
            cc.log("已登出");
        });
    }

    // // 儲存遊戲進度
    // saveProgress(score: number, unlockedLevel: number) {
    //     let user = this.auth.currentUser;
    //     if (!user) return;
    //     cc.log("user:", this.auth.currentUser);
    //     this.db.ref('players/' + user.uid).set({
    //         email: user.email,
    //         score: score,
    //         unlockedLevel: unlockedLevel,
    //         updatedAt: (window as any).firebase.database.ServerValue.TIMESTAMP
    //     }).then(() => {
    //         cc.log("RTDB 儲存成功！");
    //     }).catch((err) => {
    //         cc.error("RTDB 儲存失敗:", err);
    //     });
    // }

    // // 讀取進度 (RTDB 版) - 修正原本會卡住的地方
    // loadProgress(callback: (data: any) => void) {
    //     let user = this.auth.currentUser;
    //     if (!user || !this.db) {
    //         cc.warn("未登入或資料庫未準備好");
    //         callback(null);
    //         return;
    //     }

    //     // 修改：使用 .ref().once('value') 取代 .collection().get()
    //     this.db.ref('players/' + user.uid).once('value')
    //         .then((snapshot) => {
    //             if (snapshot.exists()) {
    //                 cc.log("讀取進度成功:", snapshot.val());
    //                 callback(snapshot.val());
    //             } else {
    //                 cc.log("無存檔資料");
    //                 callback(null);
    //             }
    //         })
    //         .catch((err) => {
    //             cc.error("讀取失敗:", err);
    //             callback(null);
    //         });
    // }

    // // 取得排行榜 (RTDB 版)
    // getLeaderboard(callback: (data: any[]) => void) {
    //     if (!this.db) {
    //         cc.error("Database 物件不存在");
    //         return callback([]);
    //     }

    //     this.db.ref('players')
    //         .orderByChild('score')
    //         .limitToLast(10)
    //         .once('value')
    //         .then((snapshot) => {
    //             let results = [];
    //             snapshot.forEach((child) => {
    //                 results.push(child.val());
    //             });
    //             // 轉為降序並回傳
    //             callback(results.reverse());
    //         })
    //         .catch((err) => {
    //             cc.error("排行榜讀取失敗:", err);
    //             callback([]);
    //         });
    // }

    // 取得目前登入的使用者
    getCurrentUser() {
        return this.auth ? this.auth.currentUser : null;
    }
}