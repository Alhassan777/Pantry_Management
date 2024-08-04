import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyCKs5X0p0dRu2mkNmFSLkyHhzmZh3JfVdY",
    authDomain: "pantry-management-bfdd7.firebaseapp.com",
    projectId: "pantry-management-bfdd7",
    storageBucket: "pantry-management-bfdd7.appspot.com",
    messagingSenderId: "318903686691",
    appId: "1:318903686691:web:8ecc505532329018768396",
    measurementId: "G-D5KECWCSJD"
 };
 const app = initializeApp(firebaseConfig);
 const firestore = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

const logOut = () => {
  return signOut(auth);
};

export { firestore, auth, signInWithGoogle, logOut };
