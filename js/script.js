"use strict";
// =================================================================
// 1. ELEMEN DOM (Document Object Model) - PENGAMBILAN VARIABEL
// =================================================================

// --- A. Elemen Navigasi & Toggle ---
const navbarNav = document.querySelector(".navbar-nav");
const navbar = document.querySelector(".navbar");
const coffeeMenu = document.querySelector("#coffee-menu");

// --- B. Elemen Keranjang Belanja, Tombol Add to Cart, badge icon & empty cart ---
const ShopCart = document.querySelector(".shopping-cart");
const shoppingCartButton = document.querySelector("#shopping-cart-button");
const cartItemBadge = document.querySelector("#cart-item-count");
const emptyCartMsg = document.querySelector("#empty-cart");

// Cart items Cache -> untuk optimasi performa
const cartItemsRefs = new Map();
let cartItems = {};
// PERUBAHAN: localStorage dihapus karena tidak didukung di claude.ai artifacts

// =================================================================
// 2. UTILITY FUNCTIONS
// =================================================================
// format number to rupiah
function formatRupiah(number) {
  return number.toLocaleString("id-ID");
}

// =================================================================
// 3. EVENT HANDLER TOGGLE (Membuka/Menutup)
// =================================================================
function closeAllOverlay(except = null) {
  if (except !== "nav") {
    navbarNav.classList.remove("active");
    navbar.classList.remove("menu-open");
  }
  if (except !== "search") {
    const searchForm = document.querySelector(".search-form");
    searchForm.classList.remove("active");
  }
  if (except !== "cart") {
    ShopCart.classList.remove("active");
  }
}

// Toggle Navbar Menu (Hamburger)
if (coffeeMenu) {
  coffeeMenu.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation(); // PERUBAHAN: Mencegah event bubbling ke document click handler
    closeAllOverlay("nav");
    navbarNav.classList.toggle("active");
    navbar.classList.toggle("menu-open");
  });
}

// Toggle Shopping Cart
if (shoppingCartButton) {
  shoppingCartButton.addEventListener("click", (e) => { // PERUBAHAN: Dari onclick menjadi addEventListener
    e.preventDefault();
    e.stopPropagation(); // PERUBAHAN: Mencegah event bubbling
    closeAllOverlay("cart");
    ShopCart.classList.toggle("active");
  });
}

// Toggle Search Form
const searchButton = document.querySelector("#search-button");
const searchForm = document.querySelector(".search-form");
const searchBox = document.querySelector("#search-box");

if (searchButton) {
  searchButton.addEventListener("click", (e) => { // PERUBAHAN: Dari onclick menjadi addEventListener
    e.preventDefault();
    e.stopPropagation(); // PERUBAHAN: Mencegah event bubbling
    closeAllOverlay("search");
    searchForm.classList.toggle("active");
    if (searchForm.classList.contains("active")) {
      searchBox.focus();
    }
  });
}

// =================================================================
// 4. LOGIKA MODAL DETAIL PRODUK (DINAMIS)
// =================================================================
const itemDetailModal = document.querySelector("#item-detail-modal");
const itemDetailButtons = document.querySelectorAll(".item-detail-button");
const modalName = document.querySelector("#modal-name");
const modalDesc = document.querySelector("#modal-desc");
const modalPrice = document.querySelector("#modal-price");
const modalImg = document.querySelector("#modal-img");
const modalAddToCartButton = document.querySelector(".modal .cart-button");

// Logika Membuka Modal dan Mengisi Data Spesifik
itemDetailButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => { // PERUBAHAN: Dari onclick menjadi addEventListener
    e.preventDefault();

    const name = btn.getAttribute("data-name");
    const priceString = btn.getAttribute("data-price");
    const desc = btn.getAttribute("data-desc");
    const imgSrc = btn.getAttribute("data-img");
    const price = parseInt(priceString);

    modalName.innerText = name;
    modalPrice.innerText = "IDR " + formatRupiah(price);
    modalDesc.innerText = desc;
    modalImg.src = imgSrc;
    modalImg.alt = name;

    modalAddToCartButton.setAttribute("data-name", name);
    modalAddToCartButton.setAttribute("data-price", price);
    modalAddToCartButton.setAttribute("data-img", imgSrc);

    itemDetailModal.classList.add("active");
    document.body.classList.add("modal-open");
  });
});

// Logika Menutup Modal
const closeModalBtn = document.querySelector(".modal .close-icon");
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", (e) => { // PERUBAHAN: Dari onclick menjadi addEventListener
    e.preventDefault();
    itemDetailModal.classList.remove("active");
    document.body.classList.remove("modal-open");
  });
}

// Tutup Modal saat klik area gelap
itemDetailModal.addEventListener("click", function (e) {
  if (e.target === itemDetailModal) {
    itemDetailModal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }
});

// Tutup modal saat tekan ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    itemDetailModal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }
});

// =================================================================
// 5. LOGIKA CONFIRMATION POPUP
// =================================================================
const confirmPopup = document.querySelector("#confirm-popup");
const confirmYesBtn = document.querySelector("#confirm-yes");
const confirmNoBtn = document.querySelector("#confirm-no");
let itemToDelete = null;

function showConfirmPopup(itemName) {
  itemToDelete = itemName;
  confirmPopup.classList.add("active");
}

function hideConfirmPopup() {
  confirmPopup.classList.remove("active");
  itemToDelete = null;
}

if (confirmYesBtn) {
  confirmYesBtn.addEventListener("click", () => { // PERUBAHAN: Dari onclick menjadi addEventListener
    if (itemToDelete) {
      removeItemFromCart(itemToDelete);
    }
    hideConfirmPopup();
  });
}

if (confirmNoBtn) {
  confirmNoBtn.addEventListener("click", () => { // PERUBAHAN: Dari onclick menjadi addEventListener
    hideConfirmPopup();
  });
}

confirmPopup.addEventListener("click", (e) => { // PERUBAHAN: Dari onclick menjadi addEventListener
  if (e.target === confirmPopup) {
    hideConfirmPopup();
  }
});

// =================================================================
// 6. LOGIKA SHOPPING CART (DINAMIS)
// =================================================================
const cartItemsContainer = document.querySelector(".cart-items");
const subtotalDisplay = document.querySelector(".subtotal-display");

function updateBadgeCount(itemCount) {
  if (itemCount > 0) {
    cartItemBadge.textContent = itemCount;
    cartItemBadge.style.display = "flex";
  } else {
    cartItemBadge.textContent = "0";
    cartItemBadge.style.display = "none";
  }
}

function updateSubtotalAndBadge() {
  let subtotal = 0;
  let totalItems = 0;

  for (const key in cartItems) {
    const item = cartItems[key];
    subtotal += item.price * item.quantity;
    totalItems += item.quantity;
  }
  
  if (emptyCartMsg) {
    emptyCartMsg.style.display = totalItems > 0 ? "none" : "flex";
  }

  if (subtotalDisplay) {
    const itemText = totalItems === 1 ? "item" : "items";
    subtotalDisplay.innerText = `Subtotal (${totalItems} ${itemText}): IDR ${formatRupiah(subtotal)}`;
  }
  
  updateBadgeCount(totalItems);
  updateCheckoutButton(totalItems);

  requestAnimationFrame(() => {
    feather.replace();
  });
}

function addToCart(name, price, imgSrc) {
  price = parseInt(price);

  if (cartItems[name]) {
    cartItems[name].quantity += 1;
    updateSingleCartItem(name);
  } else {
    cartItems[name] = {
      price,
      quantity: 1,
      imgSrc,
    };
    renderNewCartItem(name);
  }
  
  updateSubtotalAndBadge();

  // PERUBAHAN: Menggunakan alert native sebagai fallback (SweetAlert2 dihapus karena mungkin tidak tersedia)
  alert(`${name} added to cart`);
  ShopCart.classList.add("active");
}

function decreaseQuantity(name) {
  if (!cartItems[name]) return;

  if (cartItems[name].quantity > 1) {
    cartItems[name].quantity -= 1;
    updateSingleCartItem(name);
    updateSubtotalAndBadge();
  } else {
    showConfirmPopup(name);
  }
}

function increaseQuantity(name) {
  if (!cartItems[name]) return;
  cartItems[name].quantity += 1;
  updateSingleCartItem(name);
  updateSubtotalAndBadge();
}

function updateSingleCartItem(name) {
  const item = cartItems[name];
  const cartItem = cartItemsRefs.get(name);

  if (!cartItem) {
    console.warn(`Cart item for ${name} not found in cache.`);
    return;
  }

  const nameEl = cartItem.querySelector("h3");
  const quantityEl = cartItem.querySelector(".cart-item-quantity span");
  const priceEl = cartItem.querySelector(".item-price");

  if (nameEl) nameEl.innerText = name;
  if (quantityEl) quantityEl.innerText = item.quantity;
  if (priceEl) priceEl.innerText = `IDR ${formatRupiah(item.price * item.quantity)}`;
}

function renderNewCartItem(name) {
  const item = cartItems[name];
  
  cartItemsContainer.insertAdjacentHTML(
    "beforeend",
    `
    <div class="cart-item" data-name="${name}">
        <img src="${item.imgSrc}" alt="${name}">
        <div class="detail-item">
            <h3>${name}</h3>
            <div class="item-price">IDR ${formatRupiah(item.price * item.quantity)}</div>
            <div class="cart-item-quantity">
              <button class="decrease-qty" data-name="${name}">
                <i data-feather="minus-square"></i>
              </button>
              <span>${item.quantity}</span>
              <button class="increase-qty" data-name="${name}">
                <i data-feather="plus-square"></i>
              </button>
            </div>
        </div>
        <i data-feather="trash-2" class="remove-item"></i>
    </div>
    `
  );
  
  requestAnimationFrame(() => {
    const newItem = document.querySelector(`.cart-item[data-name="${name}"]`);
    if (newItem) {
      cartItemsRefs.set(name, newItem);
      newItem.classList.add("show");
    }
    feather.replace();
  });
}

function removeItemFromCart(name) {
  const cartItemEl = cartItemsRefs.get(name);
  if (!cartItemEl) {
    console.warn(`Cart item for ${name} not found in cache.`);
    return;
  }
  
  cartItemEl.classList.add("removing");
  
  setTimeout(() => {
    delete cartItems[name];
    cartItemEl.remove();
    cartItemsRefs.delete(name);
    updateSubtotalAndBadge();
  }, 300);
}

// =================================================================
// 7. EVENT DELEGATION UNTUK CART ITEMS
// =================================================================
cartItemsContainer.addEventListener("click", function (e) {
  e.stopPropagation();
  
  const trashBtn = e.target.closest(".remove-item");
  if (trashBtn) {
    e.preventDefault();
    const cartItem = trashBtn.closest(".cart-item");
    if (cartItem) {
      const itemName = cartItem.dataset.name;
      showConfirmPopup(itemName);
    }
    return;
  }

  const decreaseBtn = e.target.closest(".decrease-qty");
  if (decreaseBtn) {
    e.preventDefault();
    const itemName = decreaseBtn.getAttribute("data-name");
    decreaseQuantity(itemName);
    return;
  }

  const increaseBtn = e.target.closest(".increase-qty");
  if (increaseBtn) {
    e.preventDefault();
    const itemName = increaseBtn.getAttribute("data-name");
    increaseQuantity(itemName);
    return;
  }
});

// =================================================================
// 8. ADD TO CART HANDLER
// =================================================================
function getProductData(element) {
  const name = element.getAttribute("data-name");
  const price = parseInt(element.getAttribute("data-price"));
  const imgSrc = element.getAttribute("data-img");

  if (!name || !price || !imgSrc) {
    console.error("Product data incomplete", element);
    return null;
  }
  return { name, price, imgSrc };
}

function handleAddToCartClick(e) {
  e.preventDefault();
  e.stopPropagation(); // PERUBAHAN: Mencegah event bubbling

  const btn = e.target.closest("[data-name]");
  const productData = getProductData(btn);

  if (!productData) return;
  addToCart(productData.name, productData.price, productData.imgSrc);
}

const productAddToCartButtons = document.querySelectorAll(".add-to-cart-btn");
productAddToCartButtons.forEach((button) => {
  button.addEventListener("click", handleAddToCartClick);
});

if (modalAddToCartButton) {
  modalAddToCartButton.addEventListener("click", handleAddToCartClick);
}

// =================================================================
// 9. GLOBAL CLICK HANDLER
// =================================================================
document.addEventListener("click", function (e) {
  // PERUBAHAN: Menambahkan check untuk tombol toggle agar tidak langsung tertutup
  const isToggle = 
    e.target.closest("#coffee-menu") ||
    e.target.closest("#search-button") ||
    e.target.closest("#shopping-cart-button");
    
  if (isToggle) return; // PERUBAHAN: Return early jika yang diklik adalah toggle button

  if (
    !navbar.contains(e.target) &&
    !searchForm.contains(e.target) &&
    !ShopCart.contains(e.target) &&
    !itemDetailModal.contains(e.target) &&
    !confirmPopup.contains(e.target)
  ) {
    closeAllOverlay();
  }
});

// Close Cart Button
const closeCartBtn = document.querySelector(".close-cart");
if (closeCartBtn) {
  closeCartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    ShopCart.classList.remove("active");
  });
}

// =================================================================
// 10. LOGIKA CHECKOUT (WHATSAPP)
// =================================================================
const checkoutForm = document.querySelector("#checkoutForm");
const checkoutButton = document.querySelector("#checkout-btn");

function updateCheckoutButton(itemCount) {
  if (!checkoutButton) return;
  if (itemCount > 0) {
    checkoutButton.style.display = "block";
  } else {
    checkoutButton.style.display = "none";
  }
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const itemCount = Object.keys(cartItems).length;
    if (itemCount === 0) {
      alert("Your cart is empty! Please add items before checking out."); // PERUBAHAN: Menggunakan alert native
      return;
    }
    
    const formData = new FormData(checkoutForm);
    const customerName = formData.get("name");
    const customerEmail = formData.get("email");
    const customerAddress = formData.get("address");
    
    let message = "Hello, I would like to place an order:\n";
    message += "\nCustomer Details:\n";
    message += `Name: ${customerName}\n`;
    message += `Email: ${customerEmail}\n`;
    message += `Address: ${customerAddress}\n`;
    message += "\nOrder Details:\n";

    let totalAmount = 0;
    for (const key in cartItems) {
      const item = cartItems[key];
      message += `- ${key} (${item.quantity}x): IDR ${formatRupiah(item.price * item.quantity)}\n`;
      totalAmount += item.price * item.quantity;
    }
    message += `\nSubtotal: IDR ${formatRupiah(totalAmount)}\n`;
    message += "\nThank you!";

    const waNumber = "6282198044200";
    window.open(
      `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    setTimeout(() => {
      for (const key in cartItems) {
        delete cartItems[key];
      }
      cartItemsRefs.clear();

      if (cartItemsContainer) cartItemsContainer.innerHTML = "";
      updateSubtotalAndBadge();

      if (ShopCart) ShopCart.classList.remove("active");
      alert("Order initiated! You will be redirected to WhatsApp."); // PERUBAHAN: Menggunakan alert native
    }, 1000);
  });
}

// =================================================================
// 11. SCROLL REVEAL
// =================================================================
// PERUBAHAN: Menambahkan pengecekan apakah ScrollReveal tersedia sebelum digunakan
if (typeof ScrollReveal !== 'undefined') {
  ScrollReveal({
    reset: false,
    distance: "60px",
    duration: 1200,
    delay: 100,
  });

  ScrollReveal().reveal(".hero .content h1, .hero .content p", { origin: "left" });
  ScrollReveal().reveal(".hero .content .cta", { origin: "bottom", delay: 300 });
  ScrollReveal().reveal(".about .row .about-img", { origin: "left" });
  ScrollReveal().reveal(".about .row .content", { origin: "right", delay: 200 });
  ScrollReveal().reveal(".menu-card", { origin: "top", interval: 100 });
  ScrollReveal().reveal(".products .product-card", { origin: "bottom", interval: 150 });
  ScrollReveal().reveal(".contact .row .map", { origin: "left" });
  ScrollReveal().reveal(".contact .row form", { origin: "right", delay: 200 });
}

// =================================================================
// DOM Content Loaded
// =================================================================
document.addEventListener("DOMContentLoaded", () => {
  for (const name in cartItems) {
    renderNewCartItem(name);
  }
  updateSubtotalAndBadge();
  
  // PERUBAHAN: Menambahkan pengecekan apakah feather tersedia sebelum replace
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
});