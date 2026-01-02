# Sri-Electronics-Services
Sri Electronics Service is a responsive service website built using HTML and CSS to showcase electronics repair services, contact details, and customer enquiry flow. The project focuses on clean layout structure, responsive design principles, and user-friendly presentation across desktop and mobile devices.

# Sri Electronics Service Website

Static marketing site plus a lightweight admin dashboard for Sri Electronics Service (Puducherry). The public pages highlight services, display a gallery, and list second-hand products sold at low cost. The admin dashboard lets you:

- View incoming contact/service booking submissions
- Upload gallery images
- Post second-hand products (not refurbished) that appear on the sales page

Both public data (gallery/products) and admin actions are backed by Firebase, while outbound emails are handled through EmailJS.

---

## Tech Stack
- **Frontend**: HTML, CSS, vanilla JS, Font Awesome
- **Auth/Data**: Firebase Auth, Firestore, Firebase Storage
- **Email**: EmailJS (free tier)

---

## Quick Start
1. Install dependencies (none) and serve the site with any static server (Firebase Hosting, Netlify, Vercel, etc.).
2. Update `/assets/js/firebase-config.js` with your Firebase project credentials.
3. Add your EmailJS Public Key + Service/Template IDs inside `contact.html` and `assets/js/contact.js`.
4. Create at least one admin user in Firebase Authentication (Email/Password).
5. Deploy.

---

## Firebase Configuration
1. **Create project** at [Firebase Console](https://console.firebase.google.com).
2. Enable:
   - Authentication → Sign-in method → Email/Password
   - Firestore Database
   - Storage
3. Copy the Firebase config object into `assets/js/firebase-config.js`.
4. **Security Rules** (example – tighten as needed):
   ```javascript
   // Firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read;
         allow write: if request.auth != null;
       }
     }
   }
   // Storage
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   Adjust reads if you need private data.

---

## EmailJS Setup
1. Create a free account at [EmailJS](https://www.emailjs.com/).
2. Generate a **Public Key**, **Service ID**, and **Template ID**.
3. Replace `YOUR_EMAILJS_PUBLIC_KEY`, `YOUR_EMAILJS_SERVICE_ID`, and `YOUR_EMAILJS_TEMPLATE_ID` in:
   - `contact.html`
   - `assets/js/contact.js`
4. Template variables should include: `name`, `phone`, `email`, `service`, `address`, `message`.

---

## Admin Dashboard Workflow
1. Visit `admin-login.html` and sign in with Firebase credentials.
2. Dashboard pages:
   - **Overview** – summary cards
   - **Contact Submissions** / **Service Bookings** – auto-filled from contact form
   - **Gallery Management** – upload service images (stored in Firebase Storage)
   - **Products Management** – add second-hand products (NOT refurbished)
3. All gallery/products are instantly available to public pages via Firestore.

---

## Sales Page Notes
- Only second-hand appliances are sold.
- Admin adds product name, category, price, original price, specs, and image from the dashboard.
- Public users see up-to-date listings plus WhatsApp contact buttons; “buy now” opens WhatsApp with pre-filled intent.

---

## Contact Form Flow
1. Visitor submits the contact form.
2. Form validates required fields.
3. Firestore collections `contactSubmissions` and `serviceBookings` receive the data.
4. EmailJS sends an email to the admin inbox.

---

## Local Development
Use any local static server (because ES modules require proper origins). Two quick options:
```bash
# Python 3
python -m http.server 5500
# Node (serve)
npx serve .
```
Open `http://localhost:5500` (or whichever port) to test.

---

## Deployment Tips
- Host via Firebase Hosting for easiest integration.
- Always use HTTPS to avoid blocked module imports.
- Keep Firebase credentials in `.env`/hosting secrets if you integrate with build tools.
- Regularly prune gallery/product Storage files from the dashboard to save quota.

---

Questions or improvements? Update the README and redeploy. This document lives at the project root so future contributors understand the Firebase + EmailJS requirements and the focus on selling **second-hand** products only.

