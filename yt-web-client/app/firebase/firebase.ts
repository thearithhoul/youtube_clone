// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2CDQXSUwlsw5xBM4Dkr9qThXAtLDynU4",
    authDomain: "yt-clone-519b1.firebaseapp.com",
    projectId: "yt-clone-519b1",
    appId: "1:898042933974:web:2b5ac6880076ff6f04cf77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


/**
 *  Signs the user in with a Google Popup
 * @returns A promise that resolves with the user's credentails.
 * 
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}


/**
 * Signs the user out
 * @returns A promise that resolves with the user is signed out.
 */
export function signOut() {
    return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes.
 * @returns A function to unsubscribe callback.
 */

export function onAUthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

