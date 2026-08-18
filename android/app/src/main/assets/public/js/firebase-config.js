/**
 * Firebase Integration Module (firebase.google.com)
 * Google Authentication & Cloud Firestore Realtime Persistence
 */

// Default Firebase Configuration (Customizable via UI or settings)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDummyKeyForFallback-ReplaceInSettings",
  authDomain: "cyber-runner-3d.firebaseapp.com",
  projectId: "cyber-runner-3d",
  storageBucket: "cyber-runner-3d.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.auth = null;
    this.db = null;
    this.currentUser = null;
    this.provider = null;
    this.listeners = [];

    this.init();
  }

  getConfig() {
    try {
      const customConfig = localStorage.getItem('fantasy_custom_firebase_config');
      if (customConfig) {
        return JSON.parse(customConfig);
      }
    } catch (e) {}
    return DEFAULT_FIREBASE_CONFIG;
  }

  saveConfig(config) {
    localStorage.setItem('fantasy_custom_firebase_config', JSON.stringify(config));
    location.reload();
  }

  init() {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded, running in offline mode.');
      return;
    }

    try {
      const config = this.getConfig();
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      this.auth = firebase.auth();
      this.db = firebase.firestore ? firebase.firestore() : null;
      this.provider = new firebase.auth.GoogleAuthProvider();
      this.provider.addScope('profile');
      this.provider.addScope('email');

      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.notifyListeners(user);
      });

      this.isInitialized = true;
      console.log('Firebase initialized successfully!');
    } catch (error) {
      console.warn('Firebase initialization notice:', error.message);
    }
  }

  onAuthChange(callback) {
    this.listeners.push(callback);
    if (this.currentUser) {
      callback(this.currentUser);
    }
  }

  notifyListeners(user) {
    this.listeners.forEach(cb => {
      try { cb(user); } catch (e) {}
    });
  }

  async signInWithGoogle() {
    if (!this.auth) {
      return this.fallbackManualLogin();
    }

    try {
      // 1. Try standard Google Popup
      const result = await this.auth.signInWithPopup(this.provider);
      return result.user;
    } catch (error) {
      console.warn('Firebase Popup Notice:', error.code, error.message);

      // If domain is not authorized or popup blocked, try redirect or fallback
      if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/popup-blocked' || error.code === 'auth/invalid-api-key') {
        const choice = confirm(
          'تنبيه: لتفعيل الدخول المباشر بنافذة Google يرجى ربط مفاتيح Firebase الخاصة بمشروعك في firebase.google.com.\n\nهل ترغب بالدخول السريع بحسابك الآن وحفظ أرقامك؟'
        );
        if (choice) {
          return this.fallbackManualLogin();
        }
      }
      throw error;
    }
  }

  async signOut() {
    if (this.auth) {
      await this.auth.signOut();
    }
    this.currentUser = null;
    this.notifyListeners(null);
  }

  fallbackManualLogin() {
    const email = prompt('ادخل بريد Google الخاص بك (مثال: basim@gmail.com):', 'basim@gmail.com');
    if (email && email.trim()) {
      const cleanEmail = email.trim();
      const defaultName = cleanEmail.split('@')[0] || 'مغامر Google';
      const name = prompt('ادخل اسمك في اللعبة:', defaultName) || defaultName;
      const fakeUser = {
        uid: 'user_' + btoa(cleanEmail).replace(/=/g, ''),
        displayName: name,
        email: cleanEmail,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`
      };
      this.currentUser = fakeUser;
      this.notifyListeners(fakeUser);
      return fakeUser;
    }
    return null;
  }

  async saveUserData(uid, data) {
    if (this.db && uid && !uid.startsWith('user_')) {
      try {
        await this.db.collection('users').doc(uid).set({
          ...data,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore write warning:', err.message);
      }
    }
  }

  async loadUserData(uid) {
    if (this.db && uid && !uid.startsWith('user_')) {
      try {
        const doc = await this.db.collection('users').doc(uid).get();
        if (doc.exists) {
          return doc.data();
        }
      } catch (err) {
        console.warn('Firestore read warning:', err.message);
      }
    }
    return null;
  }
}

// Global Singleton
window.firebaseService = new FirebaseService();
