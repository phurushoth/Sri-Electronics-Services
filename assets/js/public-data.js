import { db } from "./firebase-config.js";
import {
    collection,
    getDocs,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

const galleryGrid = document.getElementById("galleryGrid");
const productsGrid = document.getElementById("productsGrid");
const priceRange = document.getElementById("price-range");
const priceValue = document.getElementById("price-value");

const defaultGallery = [
    { image: "https://images.unsplash.com/photo-1581822262427-28868a1f69d3?auto=format&fit=crop&w=600&q=80", title: "AC Installation", category: "ac", description: "Professional split AC installation" },
    { image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80", title: "AC Maintenance", category: "ac", description: "Regular AC cleaning and servicing" },
    { image: "https://images.unsplash.com/photo-1633389495487-0c285e1e9ddc?auto=format&fit=crop&w=600&q=80", title: "Refrigerator Repair", category: "refrigerator", description: "Compressor replacement service" },
    { image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80", title: "Washing Machine Repair", category: "washing-machine", description: "Motor and drum repair service" },
    { image: "https://images.unsplash.com/photo-1608581029753-70151ef4c349?auto=format&fit=crop&w=600&q=80", title: "Machine Service", category: "washing-machine", description: "Complete maintenance service" },
    { image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80", title: "TV Repair", category: "tv", description: "LED TV panel replacement" },
    { image: "https://images.unsplash.com/photo-1611391800015-18675d7b9aa6?auto=format&fit=crop&w=600&q=80", title: "Water Heater Service", category: "water-heater", description: "Geyser installation and repair" }
];

const defaultProducts = [
    { id: "1", name: "Samsung Fully Automatic 6.5kg", category: "washing-machine", price: 12000, originalPrice: 18500, image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80", specs: ["Capacity: 6.5 kg", "Fully Automatic", "6 Months Warranty", "Digital Display"] },
    { id: "2", name: "LG Semi-Automatic 7kg", category: "washing-machine", price: 9500, originalPrice: 14000, image: "https://images.unsplash.com/photo-1608581029753-70151ef4c349?auto=format&fit=crop&w=600&q=80", specs: ["Capacity: 7 kg", "Semi-Automatic", "6 Months Warranty", "Rust Free Body"] },
    { id: "3", name: "Voltas 1.5 Ton Split AC", category: "air-conditioner", price: 22000, originalPrice: 32000, image: "https://images.unsplash.com/photo-1581822262427-28868a1f69d3?auto=format&fit=crop&w=600&q=80", specs: ["Capacity: 1.5 Ton", "3-Star Rating", "6 Months Warranty", "Copper Condenser"] },
    { id: "4", name: "Daikin 2 Ton Inverter AC", category: "air-conditioner", price: 28000, originalPrice: 42000, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80", specs: ["Capacity: 2 Ton", "5-Star Rating", "6 Months Warranty", "Inverter Technology"] },
    { id: "5", name: "Bajaj 25L Storage Geyser", category: "water-heater", price: 4500, originalPrice: 7200, image: "https://images.unsplash.com/photo-1611391800015-18675d7b9aa6?auto=format&fit=crop&w=600&q=80", specs: ["Capacity: 25 Liters", "Storage Type", "6 Months Warranty", "PUF Insulation"] },
    { id: "6", name: "Sony 43\" Smart LED TV", category: "tv", price: 15000, originalPrice: 24000, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80", specs: ["Screen: 43 inch", "Smart TV", "6 Months Warranty", "4K Resolution"] }
];

const fetchCollection = async (name) => {
    const snapshot = await getDocs(query(collection(db, name), orderBy("createdAt", "desc")));
    return snapshot.docs.map(docItem => ({
        id: docItem.id,
        ...docItem.data()
    }));
};

const renderGallery = (items) => {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = items.map(item => `
        <div class="gallery-item" data-category="${item.category}">
            <img src="${item.image}" alt="${item.title}" class="gallery-img">
            <div class="gallery-overlay">
                <h3>${item.title}</h3>
                <p>${item.description || "Professional service"}</p>
            </div>
        </div>
    `).join("");
    initGalleryFilters();
};

const renderProducts = (items) => {
    if (!productsGrid) return;
    productsGrid.innerHTML = items.map(product => `
        <div class="product-card" data-category="${product.category}" data-price="${product.price}" data-id="${product.id}">
            <div class="product-badge">Refurbished</div>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">₹${Number(product.price).toLocaleString()}</div>
                <div class="product-original-price">₹${Number(product.originalPrice).toLocaleString()}</div>
                <ul class="product-specs">
                    ${(product.specs || []).map(spec => `<li><i class="fas fa-check"></i> ${spec}</li>`).join("")}
                </ul>
                <div class="product-actions">
                    <button class="btn btn-sale view-details" data-id="${product.id}">View Details</button>
                    <button class="btn btn-secondary buy-now" data-name="${product.name}" data-price="${product.price}">Buy Now</button>
                </div>
            </div>
        </div>
    `).join("");
    initProductInteractions(items);
};

const initGalleryFilters = () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    if (!filterButtons.length || !galleryGrid) return;

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");
            galleryGrid.querySelectorAll(".gallery-item").forEach(item => {
                const category = item.getAttribute("data-category");
                item.style.display = filterValue === "all" || category === filterValue ? "block" : "none";
            });
        });
    });
};

const initProductFilters = () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    if (!filterButtons.length || !productsGrid || !priceRange || !priceValue) return;

    const applyFilter = () => {
        const activeFilter = document.querySelector(".filter-btn.active")?.getAttribute("data-filter") || "all";
        const maxPrice = parseInt(priceRange.value, 10);
        priceValue.textContent = `Up to ₹${maxPrice.toLocaleString()}`;

        productsGrid.querySelectorAll(".product-card").forEach(card => {
            const category = card.getAttribute("data-category");
            const price = parseInt(card.getAttribute("data-price"), 10);
            const matchesCategory = activeFilter === "all" || category === activeFilter;
            card.style.display = matchesCategory && price <= maxPrice ? "block" : "none";
        });
    };

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            applyFilter();
        });
    });

    priceRange.addEventListener("input", applyFilter);
    applyFilter();
};

const initProductInteractions = (items) => {
    initProductFilters();
    const viewButtons = document.querySelectorAll(".view-details");
    const buyButtons = document.querySelectorAll(".buy-now");
    const modal = document.getElementById("productModal");
    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalPrice = document.getElementById("modalPrice");
    const modalOriginal = document.getElementById("modalOriginalPrice");
    const modalSpecs = document.getElementById("modalSpecs");
    const modalClose = document.querySelector(".close-modal");
    const callBtn = document.getElementById("modalCallBtn");
    const whatsappBtn = document.getElementById("modalWhatsappBtn");

    viewButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const product = items.find(item => item.id === btn.dataset.id);
            if (!product || !modal) return;
            modalImage.src = product.image;
            modalTitle.textContent = product.name;
            modalPrice.textContent = `₹${Number(product.price).toLocaleString()}`;
            modalOriginal.textContent = `₹${Number(product.originalPrice).toLocaleString()}`;
            modalSpecs.innerHTML = (product.specs || []).map(spec => `<li><i class="fas fa-check"></i> ${spec}</li>`).join("");
            callBtn.href = "tel:9789967161";
            whatsappBtn.href = `https://wa.me/919789967161?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} priced at ₹${product.price}.`)}`;
            modal.style.display = "block";
        });
    });

    modalClose?.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    buyButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.getAttribute("data-name");
            const price = btn.getAttribute("data-price");
            const text = `Hi, I would like to purchase ${name} for ₹${Number(price).toLocaleString()}. Please confirm availability.`;
            window.open(`https://wa.me/919789967161?text=${encodeURIComponent(text)}`, "_blank");
        });
    });
};

const loadGallery = async () => {
    if (!galleryGrid) return;
    try {
        const data = await fetchCollection("galleryImages");
        renderGallery(data.length ? data : defaultGallery);
    } catch (error) {
        console.error(error);
        renderGallery(defaultGallery);
    }
};

const loadProducts = async () => {
    if (!productsGrid) return;
    try {
        const data = await fetchCollection("products");
        renderProducts(data.length ? data : defaultProducts);
    } catch (error) {
        console.error(error);
        renderProducts(defaultProducts);
    }
};

loadGallery();
loadProducts();

const videoCallBtn = document.getElementById("requestVideoCall");
if (videoCallBtn) {
    videoCallBtn.addEventListener("click", () => {
        const message = "Hi, I would like to schedule a video call to see the product before purchasing.";
        window.open(`https://wa.me/919789967161?text=${encodeURIComponent(message)}`, "_blank");
    });
}

