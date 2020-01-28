import * as firebase from "firebase/app";
import * as firebaseui from "firebaseui";

// import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyB8vAn16SJlQLN-QbdPOaJiyn5QMr7ZHis",
  authDomain: "wedlock-316f8.firebaseapp.com",
  databaseURL: "https://wedlock-316f8.firebaseio.com",
  projectId: "wedlock-316f8",
  storageBucket: "wedlock-316f8.appspot.com",
  messagingSenderId: "638603296304",
  appId: "1:638603296304:web:37612623e13c9371b777f5",
  measurementId: "G-VQ5QM7E78Z"
});

// firebase.analytics();
export const ui = new firebaseui.auth.AuthUI(firebase.auth());
