import { db } from "./firebase-config.js";
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("contactSubmit");

const showNotification = (message, type = "success") => {
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();

    const el = document.createElement("div");
    el.className = `notification ${type}`;
    el.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i> ${message}`;
    document.body.appendChild(el);

    setTimeout(() => el.classList.add("show"), 50);
    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.remove(), 300);
    }, 4000);
};

const sendEmail = async (payload) => {
    if (!window.emailjs) return;
    const serviceId = "YOUR_EMAILJS_SERVICE_ID";
    const templateId = "YOUR_EMAILJS_TEMPLATE_ID";

    return emailjs.send(serviceId, templateId, payload);
};

if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const submission = {
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email") || "N/A",
            service: formData.get("service"),
            address: formData.get("address"),
            message: formData.get("message") || "N/A",
            createdAt: serverTimestamp(),
            status: "New"
        };

        if (!submission.name || !submission.phone || !submission.service || !submission.address) {
            showNotification("Please fill all required fields.", "error");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending...";
        }

        try {
            await addDoc(collection(db, "contactSubmissions"), submission);
            await addDoc(collection(db, "serviceBookings"), submission);

            await sendEmail({
                name: submission.name,
                phone: submission.phone,
                email: submission.email,
                service: submission.service,
                address: submission.address,
                message: submission.message
            });

            showNotification("Thank you! Your request has been sent.");
            contactForm.reset();
        } catch (error) {
            console.error(error);
            showNotification("Unable to send your message right now.", "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Send Message";
            }
        }
    });
}

