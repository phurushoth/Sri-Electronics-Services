import { db } from "./firebase-config.js";
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("contactSubmit");

/* ---------- Notification ---------- */
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

/* ---------- EmailJS ---------- */
const sendEmail = async (payload) => {
    if (!window.emailjs) {
        console.error("❌ EmailJS not loaded");
        throw new Error("EmailJS not loaded");
    }

    const serviceId = "service_2a4ptaq";
    const templateId = "template_8e9vtwx";

    try {
        const result = await emailjs.send(serviceId, templateId, payload);
        console.log("✅ Email sent successfully:", result);
        return result;
    } catch (error) {
        console.error("❌ EmailJS failed:", error);
        throw error;
    }
};
const sendWhatsApp = async (payload) => {
    const res = await fetch("send-whatsapp.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.status) throw new Error("WhatsApp failed");
};



/* ---------- Form Submit ---------- */
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

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        try {
            /* Firebase */
            await addDoc(collection(db, "contactSubmissions"), submission);
            await addDoc(collection(db, "serviceBookings"), submission);

            /* Email */
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
            showNotification("Unable to send your message right now.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
        }
        /* WhatsApp */
await sendWhatsApp({
    name: submission.name,
    phone: submission.phone,
    email: submission.email,
    service: submission.service,
    address: submission.address,
    message: submission.message
});

    });
}
