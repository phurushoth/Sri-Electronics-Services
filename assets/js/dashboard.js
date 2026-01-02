import { auth, db, storage } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
    collection,
    addDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js";

const logoutBtn = document.getElementById("logoutBtn");
const galleryForm = document.getElementById("galleryForm");
const productForm = document.getElementById("productForm");
const galleryPreview = document.getElementById("galleryPreview");
const productPreview = document.getElementById("productPreview");

const counts = {
    contacts: document.getElementById("totalContacts"),
    bookings: document.getElementById("totalBookings"),
    gallery: document.getElementById("totalGallery"),
    products: document.getElementById("totalProducts")
};

const tables = {
    contacts: document.getElementById("contactsTableBody"),
    bookings: document.getElementById("bookingsTableBody"),
    gallery: document.getElementById("galleryTableBody"),
    products: document.getElementById("productsTableBody")
};

const notificationQueue = [];
let notificationTimeout;

const formatDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleDateString();
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString();
};

const showNotification = (message, type = "success") => {
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 50);
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

const renderEmptyRow = (colspan, icon, text) => `
    <tr>
        <td colspan="${colspan}" class="empty-state">
            <i class="${icon}"></i>
            <p>${text}</p>
        </td>
    </tr>
`;

const renderContacts = (items) => {
    if (!tables.contacts) return;
    if (!items.length) {
        tables.contacts.innerHTML = renderEmptyRow(8, "fas fa-inbox", "No contact submissions yet");
        return;
    }

    tables.contacts.innerHTML = items.map(item => `
        <tr>
            <td>${formatDate(item.createdAt)}</td>
            <td>${item.name}</td>
            <td>${item.phone}</td>
            <td>${item.email}</td>
            <td>${item.service}</td>
            <td>${item.address}</td>
            <td>${item.message}</td>
            <td><span class="badge badge-new">${item.status || "New"}</span></td>
        </tr>
    `).join("");
};

const renderBookings = (items) => {
    if (!tables.bookings) return;
    if (!items.length) {
        tables.bookings.innerHTML = renderEmptyRow(6, "fas fa-calendar-times", "No service bookings yet");
        return;
    }

    tables.bookings.innerHTML = items.map(item => `
        <tr>
            <td>${formatDate(item.createdAt)}</td>
            <td>${item.name}</td>
            <td>${item.phone}</td>
            <td>${item.service}</td>
            <td>${item.address}</td>
            <td><span class="badge badge-new">${item.status || "New"}</span></td>
        </tr>
    `).join("");
};

const renderGallery = (items) => {
    if (!tables.gallery) return;
    if (!items.length) {
        tables.gallery.innerHTML = renderEmptyRow(5, "fas fa-images", "No images uploaded yet");
        return;
    }

    tables.gallery.innerHTML = items.map(item => `
        <tr>
            <td><img src="${item.image}" alt="${item.title}" style="width:80px;height:80px;object-fit:cover;border-radius:4px;"></td>
            <td>${item.title}</td>
            <td>${item.category}</td>
            <td>${formatDate(item.createdAt)}</td>
            <td>
                <button class="btn btn-danger" data-delete-gallery="${item.id}" data-storage="${item.storagePath || ""}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join("");
};

const renderProducts = (items) => {
    if (!tables.products) return;
    if (!items.length) {
        tables.products.innerHTML = renderEmptyRow(7, "fas fa-box-open", "No products added yet");
        return;
    }

    tables.products.innerHTML = items.map(item => `
        <tr>
            <td><img src="${item.image}" alt="${item.name}" style="width:80px;height:80px;object-fit:cover;border-radius:4px;"></td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>₹${Number(item.price).toLocaleString()}</td>
            <td>₹${Number(item.originalPrice).toLocaleString()}</td>
            <td>${formatDate(item.createdAt)}</td>
            <td>
                <button class="btn btn-danger" data-delete-product="${item.id}" data-storage="${item.storagePath || ""}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join("");
};

const fetchCollection = async (name) => {
    const snapshot = await getDocs(query(collection(db, name), orderBy("createdAt", "desc")));
    return snapshot.docs.map(docItem => ({
        id: docItem.id,
        ...docItem.data()
    }));
};

const refreshData = async () => {
    try {
        const [contacts, bookings, gallery, products] = await Promise.all([
            fetchCollection("contactSubmissions"),
            fetchCollection("serviceBookings"),
            fetchCollection("galleryImages"),
            fetchCollection("products")
        ]);

        if (counts.contacts) counts.contacts.textContent = contacts.length;
        if (counts.bookings) counts.bookings.textContent = bookings.length;
        if (counts.gallery) counts.gallery.textContent = gallery.length;
        if (counts.products) counts.products.textContent = products.length;

        renderContacts(contacts);
        renderBookings(bookings);
        renderGallery(gallery);
        renderProducts(products);
    } catch (error) {
        console.error(error);
        showNotification("Unable to load dashboard data.", "error");
    }
};

const uploadFile = async (file, folder) => {
    const storagePath = `${folder}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, storagePath };
};

const deleteFile = async (path) => {
    if (!path) return;
    try {
        const fileRef = ref(storage, path);
        await deleteObject(fileRef);
    } catch (error) {
        console.warn("Unable to delete storage file", error);
    }
};

const handleGallerySubmit = () => {
    if (!galleryForm) return;

    galleryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const fileInput = document.getElementById("galleryImage");
        if (!fileInput || !fileInput.files.length) {
            showNotification("Please choose an image.", "error");
            return;
        }

        const submitBtn = galleryForm.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading...`;

        try {
            const { url, storagePath } = await uploadFile(fileInput.files[0], "gallery");
            await addDoc(collection(db, "galleryImages"), {
                title: document.getElementById("galleryTitle").value,
                category: document.getElementById("galleryCategory").value,
                description: document.getElementById("galleryDescription").value,
                image: url,
                storagePath,
                createdAt: serverTimestamp()
            });

            galleryForm.reset();
            if (galleryPreview) galleryPreview.classList.remove("show");
            showNotification("Image uploaded successfully!");
            refreshData();
        } catch (error) {
            console.error(error);
            showNotification("Unable to upload image.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fas fa-upload"></i> Upload Image`;
        }
    });

    document.getElementById("galleryImage")?.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file || !galleryPreview) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            galleryPreview.src = e.target.result;
            galleryPreview.classList.add("show");
        };
        reader.readAsDataURL(file);
    });
};

const handleProductSubmit = () => {
    if (!productForm) return;

    productForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fileInput = document.getElementById("productImage");
        if (!fileInput || !fileInput.files.length) {
            showNotification("Please choose a product image.", "error");
            return;
        }

        const submitBtn = productForm.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;

        try {
            const { url, storagePath } = await uploadFile(fileInput.files[0], "products");
            const specsRaw = document.getElementById("productSpecs").value
                .split("\n")
                .map(item => item.trim())
                .filter(Boolean);

            await addDoc(collection(db, "products"), {
                name: document.getElementById("productName").value,
                category: document.getElementById("productCategory").value,
                price: document.getElementById("productPrice").value,
                originalPrice: document.getElementById("productOriginalPrice").value,
                specs: specsRaw,
                image: url,
                storagePath,
                createdAt: serverTimestamp()
            });

            productForm.reset();
            if (productPreview) productPreview.classList.remove("show");
            showNotification("Product added successfully!");
            refreshData();
        } catch (error) {
            console.error(error);
            showNotification("Unable to save product.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fas fa-plus"></i> Add Product`;
        }
    });

    document.getElementById("productImage")?.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file || !productPreview) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            productPreview.src = e.target.result;
            productPreview.classList.add("show");
        };
        reader.readAsDataURL(file);
    });
};

const handleDeletions = () => {
    document.addEventListener("click", async (event) => {
        const galleryBtn = event.target.closest("[data-delete-gallery]");
        const productBtn = event.target.closest("[data-delete-product]");

        if (galleryBtn) {
            const id = galleryBtn.getAttribute("data-delete-gallery");
            const storagePath = galleryBtn.getAttribute("data-storage");
            if (confirm("Delete this gallery image?")) {
                try {
                    await deleteDoc(doc(db, "galleryImages", id));
                    await deleteFile(storagePath);
                    showNotification("Gallery image deleted.");
                    refreshData();
                } catch (error) {
                    console.error(error);
                    showNotification("Unable to delete gallery image.", "error");
                }
            }
        }

        if (productBtn) {
            const id = productBtn.getAttribute("data-delete-product");
            const storagePath = productBtn.getAttribute("data-storage");
            if (confirm("Delete this product?")) {
                try {
                    await deleteDoc(doc(db, "products", id));
                    await deleteFile(storagePath);
                    showNotification("Product deleted.");
                    refreshData();
                } catch (error) {
                    console.error(error);
                    showNotification("Unable to delete product.", "error");
                }
            }
        }
    });
};

const initNavigation = () => {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(nav => nav.classList.remove("active"));
            document.querySelectorAll(".content-section").forEach(section => section.classList.remove("active"));

            item.classList.add("active");
            const sectionId = item.getAttribute("data-section");
            document.getElementById(sectionId)?.classList.add("active");
        });
    });
};

const initDashboard = () => {
    initNavigation();
    handleGallerySubmit();
    handleProductSubmit();
    handleDeletions();
    refreshData();
};

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to logout?")) return;
        await signOut(auth);
        window.location.href = "admin-login.html";
    });
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }
    initDashboard();
});

