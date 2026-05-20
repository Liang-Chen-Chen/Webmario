const { ccclass, property } = cc._decorator;
import FirebaseManager from "./FirebaseManager";

@ccclass
export default class AuthManager extends cc.Component {

    @property(cc.EditBox) emailInput: cc.EditBox = null;
    @property(cc.EditBox) passwordInput: cc.EditBox = null;
    @property(cc.Label) statusLabel: cc.Label = null;
    @property(cc.Node) loginPanel: cc.Node = null;
    @property(cc.Node) loggedInPanel: cc.Node = null;
    @property(cc.Label) welcomeLabel: cc.Label = null;

    onLoad() {
        // Initial state: Show login, hide logged in panel
        if (this.loginPanel) this.loginPanel.active = true;
        if (this.loggedInPanel) this.loggedInPanel.active = false;

        // Check login status after a short delay
        this.scheduleOnce(() => {
            if (!FirebaseManager.instance) return;
            let user = FirebaseManager.instance.getCurrentUser();
            if (user) {
                this.showLoggedIn(user.email);
            }
        }, 0.5);
    }

    onSignUp() {
        let email = this.emailInput.string.trim();
        let password = this.passwordInput.string.trim();

        if (!email || !password) {
            this.statusLabel.string = "Please enter email and password.";
            return;
        }

        this.statusLabel.string = "Registering...";
        FirebaseManager.instance.signUp(email, password, (success, msg) => {
            if (success) {
                this.statusLabel.string = "Registration Successful!";
                this.showLoggedIn(email);
            } else {
                this.statusLabel.string = "Sign Up Failed: " + msg;
            }
        });
    }

    onSignIn() {
        let email = this.emailInput.string.trim();
        let password = this.passwordInput.string.trim();

        if (!email || !password) {
            this.statusLabel.string = "Please enter email and password.";
            return;
        }

        this.statusLabel.string = "Signing in...";
        FirebaseManager.instance.signIn(email, password, (success, msg) => {
            if (success) {
                this.statusLabel.string = "Login Successful!";
                this.showLoggedIn(email);
                
                // Sync cloud progress
                FirebaseManager.instance.loadProgress((data) => {
                    if (data && data.unlockedLevel) {
                        cc.sys.localStorage.setItem('unlockedLevel', data.unlockedLevel.toString());
                        cc.log("Cloud data synced.");
                    }
                });
            } else {
                this.statusLabel.string = "Login Failed: " + msg;
            }
        });
    }

    onSignOut() {
        FirebaseManager.instance.signOut();
        if (this.loginPanel) this.loginPanel.active = true;
        if (this.loggedInPanel) this.loggedInPanel.active = false;
        this.statusLabel.string = "Signed out.";
        
        // Clear input fields
        this.emailInput.string = "";
        this.passwordInput.string = "";
    }

    showLoggedIn(email: string) {
        if (this.loginPanel) this.loginPanel.active = false;
        if (this.loggedInPanel) this.loggedInPanel.active = true;
        if (this.welcomeLabel) this.welcomeLabel.string = "WELCOME";
        this.statusLabel.string = ""; 
    }

    onEnterLevelSelect() {
        cc.director.loadScene("LevelSelect"); 
    }
}