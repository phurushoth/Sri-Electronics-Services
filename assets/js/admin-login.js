import { auth } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const submitBtn = document.getElementById("loginSubmit");

// Optional aliases if you want to allow username based login.
// Map usernames to the actual Firebase email ID.
const usernameAliasMap = {
    "admin": "admin@srielectronics.com"
};

const toggleError = (message = "") => {
    if (!errorMessage) return;
    if (message) {
        errorMessage.textContent = message;
        errorMessage.classList.add("show");
    } else {
        errorMessage.classList.remove("show");
    }
};

onAuthStateChanged(auth, user => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        toggleError();

        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        if (!usernameInput || !passwordInput) return;

        const rawIdentifier = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!rawIdentifier || !password) {
            toggleError("Please enter both login ID and password.");
            return;
        }

        const resolvedEmail = rawIdentifier.includes("@")
            ? rawIdentifier
            : (usernameAliasMap[rawIdentifier.toLowerCase()] || rawIdentifier);

        submitBtn.disabled = true;
        submitBtn.textContent = "Signing in...";

        try {
            await signInWithEmailAndPassword(auth, resolvedEmail, password);
            toggleError();
        } catch (error) {
            console.error(error);
            const message = error.code === "auth/user-not-found"
                ? "Account not found. Please verify the email/username."
                : error.code === "auth/wrong-password"
                    ? "Incorrect password. Please try again."
                    : "Unable to sign in. Please try again.";
            toggleError(message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Login";
        }
    });
}

