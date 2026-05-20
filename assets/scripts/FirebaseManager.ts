const { ccclass, property } = cc._decorator;

@ccclass
export default class FirebaseManager extends cc.Component {

    public static instance: FirebaseManager = null;

    // Firebase 物件（從 window 取得）
    private auth: any = null;
    private db: any = null;

    // 在 FirebaseManager.ts 裡面
    onLoad() {
        FirebaseManager.instance = this;

        // 使用 window 確保抓到全域變數
        const fb = (window as any).firebase;

        if (!fb) {
            cc.error("Firebase SDK 尚未準備好！請檢查預覽視窗的 Sources 是否有載入 SDK。");
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
        this.db = fb.firestore();
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

    // 儲存遊戲進度
    saveProgress(score: number, unlockedLevel: number) {
        let user = this.auth.currentUser;
        if (!user) {
            cc.warn("未登入，無法儲存進度");
            return;
        }

        this.db.collection("players").doc(user.uid).set({
            email: user.email,
            score: score,
            unlockedLevel: unlockedLevel,
            updatedAt: (window as any).firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            cc.log("進度儲存成功！");
        }).catch((err) => {
            cc.error("儲存失敗:", err);
        });
    }

    // 讀取遊戲進度
    loadProgress(callback: (data: any) => void) {
        let user = this.auth.currentUser;
        if (!user) {
            cc.warn("未登入，無法讀取進度");
            callback(null);
            return;
        }

        this.db.collection("players").doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    cc.log("讀取進度成功:", doc.data());
                    callback(doc.data());
                } else {
                    callback(null);
                }
            })
            .catch((err) => {
                cc.error("讀取失敗:", err);
                callback(null);
            });
    }

    // 取得排行榜（前10名）
    getLeaderboard(callback: (data: any[]) => void) {
        this.db.collection("players")
            .orderBy("score", "desc")
            .limit(10)
            .get()
            .then((querySnapshot) => {
                let results = [];
                querySnapshot.forEach((doc) => {
                    results.push(doc.data());
                });
                callback(results);
            })
            .catch((err) => {
                cc.error("排行榜讀取失敗:", err);
                callback([]);
            });
    }

    // 取得目前登入的使用者
    getCurrentUser() {
        return this.auth ? this.auth.currentUser : null;
    }
}