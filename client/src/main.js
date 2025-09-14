import {initializeApp} from "firebase/app";
import {GoogleAuthProvider, signInWithPopup, getAuth} from "firebase/auth";



const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

const BACKEND_URL = "http://localhost:3000";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();
const provider = new GoogleAuthProvider();


const signInButton = document.getElementById("signInButton");

signInButton.addEventListener("click", function () {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log(result);
            // Get the correct ID toke

            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            console.log(credential.idToken)
            const  idToken = credential.idToken;
            const accessToken = credential.accessToken;
            sendTokenToBackend(idToken, accessToken);
            // The signed-in user info.
            const user = result.user;
            console.log(user)

        }).catch((error) => {
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(error)
    });
});

function sendTokenToBackend(idToken, accessToken) {
    fetch(`${BACKEND_URL}/auth/google`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken, accessToken })
    })
        .then(response => response.json())
        .then(data => console.log("Backend response:", data))
        .catch(error => console.error("Error sending token:", error));
}