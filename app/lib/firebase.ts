// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvgFMIkZi-qm5qf6NFxCZi3IRAi0ruVBI",
  authDomain: "slept-ia-video-editor.firebaseapp.com",
  projectId: "slept-ia-video-editor",
  storageBucket: "slept-ia-video-editor.firebasestorage.app",
  messagingSenderId: "272707300080",
  appId: "1:272707300080:web:cc23f8fe03b8819f2f7035",
  measurementId: "G-V7YPZ2L4EP"
};

// Initialize Firebase (evita múltiples instancias en Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar servicios y exportarlos correctamente
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics solo funciona en el cliente (navegador)
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
export { analytics };