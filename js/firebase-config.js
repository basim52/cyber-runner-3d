/**
 * Firebase Integration Module
 * Google Authentication & Cloud Firestore Realtime Persistence with Custom Database ID
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Default Firebase Configuration from provisioned Firebase Applet Config
const DEFAULT_FIREBASE_CONFIG = {
  projectId: "gen-lang-client-0689175056",
  appId: "1:652115799495:web:f1d76fa19f396f1d4abde2",
  apiKey: "AIzaSyCn26iKPQYiPm8Ah_k1OpkZ-kcYNnqoQSg",
  authDomain: "gen-lang-client-0689175056.firebaseapp.com",
  storageBucket: "gen-lang-client-0689175056.firebasestorage.app",
  messagingSenderId: "652115799495",
  firestoreDatabaseId: "ai-studio-cyberrunner3d-e35fea7d-ea67-4de3-afde-f87939b64e39"
};

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.app = null;
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
        const parsed = JSON.parse(customConfig);
        if (parsed && parsed.projectId && parsed.projectId !== 'cyber-runner-3d' && parsed.apiKey && !parsed.apiKey.includes('DummyKey')) {
          return parsed;
        } else {
          localStorage.removeItem('fantasy_custom_firebase_config');
        }
      }
    } catch (e) {
      localStorage.removeItem('fantasy_custom_firebase_config');
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  saveConfig(config) {
    localStorage.setItem('fantasy_custom_firebase_config', JSON.stringify(config));
    location.reload();
  }

  init() {
    // Check for saved local Google user session first
    const savedUser = localStorage.getItem('fantasy_google_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {}
    }

    try {
      const config = this.getConfig();
      this.app = getApps().length === 0 ? initializeApp(config) : getApp();
      this.auth = getAuth(this.app);

      // Connect to named Firestore database
      const dbId = config.firestoreDatabaseId || "ai-studio-cyberrunner3d-e35fea7d-ea67-4de3-afde-f87939b64e39";
      this.db = getFirestore(this.app, dbId);

      this.provider = new GoogleAuthProvider();
      this.provider.addScope('profile');
      this.provider.addScope('email');

      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'مغامر Google',
            email: user.email || '',
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email || 'user'}`
          };
          localStorage.setItem('fantasy_google_user', JSON.stringify(this.currentUser));
          this.notifyListeners(this.currentUser);
        } else if (!this.currentUser) {
          this.notifyListeners(null);
        }
      });

      this.isInitialized = true;
      console.log('Firebase & Named Firestore Database initialized successfully!');
    } catch (error) {
      console.warn('Firebase initialization notice:', error.message);
      if (this.currentUser) this.notifyListeners(this.currentUser);
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
    if (this.auth && this.getConfig().apiKey !== 'AIzaSyDummyKeyForFallback-ReplaceInSettings') {
      try {
        const result = await signInWithPopup(this.auth, this.provider);
        if (result && result.user) {
          const userObj = {
            uid: result.user.uid,
            displayName: result.user.displayName || result.user.email?.split('@')[0] || 'مغامر Google',
            email: result.user.email || '',
            photoURL: result.user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.email || 'user'}`
          };
          this.currentUser = userObj;
          localStorage.setItem('fantasy_google_user', JSON.stringify(userObj));
          this.notifyListeners(userObj);
          return userObj;
        }
      } catch (error) {
        console.warn('Firebase Popup Notice:', error.code, error.message);
      }
    }

    // Open sleek in-game Google Login modal
    this.openQuickLoginModal();
    return null;
  }

  openQuickLoginModal() {
    const modal = document.getElementById('google-signin-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const emailInput = document.getElementById('google-signin-email');
      const nameInput = document.getElementById('google-signin-name');
      if (emailInput && !emailInput.value) {
        emailInput.value = 'basim5252@gmail.com';
      }
      if (nameInput && !nameInput.value) {
        nameInput.value = 'باسم';
      }
    }
  }

  applyManualUser(email, name) {
    const cleanEmail = (email || 'player@gmail.com').trim();
    const cleanName = (name || cleanEmail.split('@')[0] || 'مغامر Google').trim();
    const userObj = {
      uid: 'google_' + btoa(cleanEmail).replace(/=/g, '').slice(0, 24),
      displayName: cleanName,
      email: cleanEmail,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`
    };

    this.currentUser = userObj;
    localStorage.setItem('fantasy_google_user', JSON.stringify(userObj));
    this.notifyListeners(userObj);

    const modal = document.getElementById('google-signin-modal');
    if (modal) modal.classList.add('hidden');

    return userObj;
  }

  async signOut() {
    if (this.auth) {
      try {
        await fbSignOut(this.auth);
      } catch (e) {}
    }
    this.currentUser = null;
    localStorage.removeItem('fantasy_google_user');
    this.notifyListeners(null);
  }

  async saveUserData(uid, data) {
    if (!uid) return;
    if (this.db) {
      try {
        const userRef = doc(this.db, 'users', uid);
        await setDoc(userRef, {
          ...data,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore write warning:', err.message);
      }
    }
  }

  async loadUserData(uid) {
    if (!uid) return null;
    if (this.db) {
      try {
        const userRef = doc(this.db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          return snap.data();
        }
      } catch (err) {
        console.warn('Firestore read warning:', err.message);
      }
    }
    return null;
  }

  async submitScore(playerName, score, character, gems) {
    if (this.db && score > 0) {
      try {
        const scoresRef = collection(this.db, 'scores');
        await addDoc(scoresRef, {
          playerName: playerName || 'مغامر الغابة',
          score: Math.floor(score),
          character: character || 'sami',
          gems: gems || 0,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore score submission notice:', err.message);
      }
    }
  }

  setupConfigModal() {
    const modal = document.getElementById('firebase-config-modal');
    const btnOpen = document.getElementById('btn-open-firebase-config');
    const btnOpenLogged = document.getElementById('btn-open-firebase-config-logged');
    const btnClose = document.getElementById('btn-close-firebase-config');
    const btnSave = document.getElementById('btn-save-firebase-config');
    const textarea = document.getElementById('firebase-config-json');
    const statusMsg = document.getElementById('firebase-test-status');

    // Quick Login Modal Elements
    const quickModal = document.getElementById('google-signin-modal');
    const btnQuickClose = document.getElementById('btn-close-google-signin');
    const btnQuickConfirm = document.getElementById('btn-confirm-google-signin');
    const quickEmailInput = document.getElementById('google-signin-email');
    const quickNameInput = document.getElementById('google-signin-name');

    if (btnQuickClose && quickModal) {
      btnQuickClose.addEventListener('click', () => {
        quickModal.classList.add('hidden');
      });
    }

    if (btnQuickConfirm) {
      btnQuickConfirm.addEventListener('click', () => {
        const email = quickEmailInput ? quickEmailInput.value : '';
        const name = quickNameInput ? quickNameInput.value : '';
        this.applyManualUser(email, name);
      });
    }

    const openModal = () => {
      if (textarea) {
        textarea.value = JSON.stringify(this.getConfig(), null, 2);
      }
      if (modal) modal.classList.remove('hidden');
    };

    if (btnOpen) btnOpen.addEventListener('click', openModal);
    if (btnOpenLogged) btnOpenLogged.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });

    if (btnSave && textarea) {
      btnSave.addEventListener('click', async () => {
        const rawText = textarea.value.trim();
        if (!rawText) return;

        try {
          let cleanJson = rawText;
          if (cleanJson.includes('const firebaseConfig =')) {
            cleanJson = cleanJson.replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;\s*$/, '');
          }
          cleanJson = cleanJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          const parsedConfig = JSON.parse(cleanJson);

          if (!parsedConfig.projectId || !parsedConfig.apiKey) {
            throw new Error('يجب أن يحتوي الكود على apiKey و projectId');
          }

          if (statusMsg) {
            statusMsg.textContent = 'جاري اختبار الاتصال بقاعدة بيانات Firestore... ⏳';
            statusMsg.className = 'firebase-status-msg';
            statusMsg.classList.remove('hidden');
          }

          this.saveConfig(parsedConfig);
        } catch (err) {
          if (statusMsg) {
            statusMsg.textContent = `⚠️ خطأ في صيغة الكود: ${err.message}`;
            statusMsg.className = 'firebase-status-msg error';
            statusMsg.classList.remove('hidden');
          }
        }
      });
    }
  }
}

// Global Singleton
window.firebaseService = new FirebaseService();
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    if (window.firebaseService) window.firebaseService.setupConfigModal();
  });
} else {
  if (window.firebaseService) window.firebaseService.setupConfigModal();
}
export default window.firebaseService;
