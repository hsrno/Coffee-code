// =================================================================
// 1. ELEMEN DOM (Document Object Model) - PENGAMBILAN VARIABEL
// =================================================================

// --- A. Elemen Navigasi & Toggle ---
const navbarNav = document.querySelector(".navbar-nav");
const navbar = document.querySelector(".navbar");
const coffeeMenu = document.querySelector("#coffee-menu");

// --- B. Elemen Keranjang Belanja & Tombol Add to Cart ---
const ShopCart = document.querySelector(".shopping-cart");
const shoppingCartButton = document.querySelector("#shopping-cart-button");
// Badge Icon
const cartItemBadge = document.querySelector("#cart-item-count");

// Tombol 'Add to Cart' di Product Card
const productAddToCartButtons = document.querySelectorAll(".add-to-cart-btn");

// format rupiah
function formatRupiah(number) {
  return number.toLocaleString("id-ID");
}

// Tombol 'Add to Cart' di Modal
const modalAddToCartButton = document.querySelector(".modal .cart-button");
// Tempat item keranjang ditampilkan
const cartItemsContainer = document.querySelector(".cart-items");
const subtotalDisplay = document.querySelector(".subtotal-display");
const cartItems = {}; // Objek untuk menyimpan item di keranjang {nama_produk: {harga, kuantitas}}

// --- C. Elemen Pencarian ---
const searchForm = document.querySelector(".search-form");
const searchBox = document.querySelector("#search-box");
const searchButton = document.querySelector("#search-button");

// --- D. Elemen Modal Detail Produk (Dinamic) ---
const itemDetailModal = document.querySelector("#item-detail-modal");
const itemDetailButtons = document.querySelectorAll(".item-detail-button"); // Tombol 'Mata'
const modalName = document.querySelector("#modal-name");
const modalDesc = document.querySelector("#modal-desc");
const modalPrice = document.querySelector("#modal-price");
const modalImg = document.querySelector("#modal-img");

// =================================================================
// 2. EVENT HANDLER TOGGLE (Membuka/Menutup)
// =================================================================

// Toggle Navbar Menu (Hamburger)
coffeeMenu.onclick = (e) => {
  e.preventDefault();
  closeAllOverlay("nav");
  navbarNav.classList.toggle("active");
  navbar.classList.toggle("menu-open");
};

// Toggle Shopping Cart
shoppingCartButton.onclick = (e) => {
  e.preventDefault();
  closeAllOverlay("cart");
  ShopCart.classList.toggle("active");
};

// Toggle Search Form
searchButton.onclick = (e) => {
  searchForm.classList.toggle("active");
  searchBox.focus();
  e.preventDefault();
  closeAllOverlay("search");
};

// Reset Function
function closeAllOverlay(except = null) {
  if (except !== "nav") {
    navbarNav.classList.remove("active");
    navbar.classList.remove("menu-open");
  }

  if (except !== "search") {
    searchForm.classList.remove("active");
  }

  if (except !== "cart") {
    ShopCart.classList.remove("active");
  }
}

// =================================================================
// 3. LOGIKA MODAL DETAIL PRODUK (DINAMIS)
// =================================================================

// Logika Membuka Modal dan Mengisi Data Spesifik
itemDetailButtons.forEach((btn) => {
  btn.onclick = (e) => {
    e.preventDefault();

    // 1. Ambil data dari atribut data-* tombol yang diklik
    const name = btn.getAttribute("data-name");
    const priceString = btn.getAttribute("data-price");
    const desc = btn.getAttribute("data-desc");
    const imgSrc = btn.getAttribute("data-img");

    // Membersihkan price agar menjadi angka (misalnya '45K' menjadi 45000)
    const price = parseInt(priceString.replace("K", "000"));

    // 2. Masukkan data ke dalam elemen modal
    modalName.innerText = name;
    modalPrice.innerText = "IDR " + priceString + " (Diskon)";
    modalDesc.innerText = desc;
    modalImg.src = imgSrc;
    modalImg.alt = name;

    // Simpan data produk di tombol modal untuk fungsi Add to Cart
    modalAddToCartButton.setAttribute("data-name", name);
    modalAddToCartButton.setAttribute("data-price", price);
    modalAddToCartButton.setAttribute("data-img", imgSrc);

    // 3. Tampilkan modal
    itemDetailModal.style.display = "flex";
  };
});

// Logika Menutup Modal saat mengklik ikon 'x'
document.querySelector(".modal .close-icon").onclick = (e) => {
  itemDetailModal.style.display = "none";
  e.preventDefault();
};

// =================================================================
// 4. LOGIKA SHOPPING CART (DINAMIS)
// =================================================================

// --- A. Fungsi Utama Menambah Item ---
function addToCart(name, price, imgSrc) {
  // Harga diubah ke integer
  price = parseInt(price);
  // cek apakah produk sudah ada di keranjang
  if (cartItems[name]) {
    // Jika item sudah ada, kuantitas ditambah
    cartItems[name].quantity += 1;
    // Jika item belum ada, buat item baru
    updateSingleCartItem(name); //update teks saja
  } 
  else {
    cartItems[name] = {
      price,
      quantity: 1,
      imgSrc,
    };
    renderNewCartItem(name); //hanya render item baru
  }
  // 🧮 update subtotal & badge
  updateSubtotalAndBadge();
  ShopCart.classList.add("active");
}

// --- B. Fungsi Mengupdate Tampilan Keranjang ---
function updateSingleCartItem(name) {
  const item = cartItems[name];
  const cartItem = document.querySelector(`.cart-item[data-name="${name}"]`);
  if (!cartItem) return;

  cartItem.querySelector("h3").innerText = `${name} (${item.quantity}x)`;
  cartItem.querySelector(".item-price").innerText = 
  `IDR ${formatRupiah(item.price * item.quantity)}`;
}

function updateSubtotalAndBadge() {
  let subtotal = 0;
  let itemCount = 0;

  // Loop melalui semua item di cartItems
  for (const name in cartItems) {
    // ✅ BUG FIX: Typo cartItemsi → cartItems
    subtotal += cartItems[name].price * cartItems[name].quantity;
    itemCount += cartItems[name].quantity;
  }
  // UPDATE SUBTOTAL
  subtotalDisplay.innerText = 
  `Subtotal (${itemCount} item): IDR ${formatRupiah(subtotal)}`;
  // BADGE
  updateBadgeCount(itemCount);

  requestAnimationFrame(() => {
    feather.replace();
  });
}

// ==================================================================
// --- C. Fungsi Menghapus Item ---
function removeItemFromCart(name) {
  const cartItemEl = document.querySelector(`.cart-item[data-name="${name}"]`);
  if (!cartItemEl) return;

  // aktifkan animasi keluar
  cartItemEl.classList.add("removing");

  // Tunggu animasi selesai
  setTimeout(() => {
    delete cartItems[name]; // hapus data
    cartItemEl.remove(); // hapus dari DOM
    updateSubtotalAndBadge(); // update subtotal & badge
  }, 300); // sama transition dgn CSS
}

// Event Delegation: Hapus Item Dari Cart
cartItemsContainer.addEventListener("click", function (e) {
  // cek ulang apakah yang diklik adalah icon trash
  const trashBtn = e.target.closest(".remove-item");
  if (!trashBtn) return;

  // Ambil cart-item terdekat
  const cartItem = trashBtn.closest(".cart-item");
  if (!cartItem) return;

  // Ambil nama produk dari data-name
  const itemName = cartItem.dataset.name;

  // Hapus item dari cart
  removeItemFromCart(itemName);
});

// ---Fungsi Mengupdate Badge Penghitung Item ---
function updateBadgeCount(itemCount) {
  if (itemCount > 0) {
    cartItemBadge.textContent = itemCount;
    cartItemBadge.style.display = "block"; // Tampilkan Badge
  } else {
    cartItemBadge.textContent = "0";
    cartItemBadge.style.display = "none"; // Sembunyikan Badge
  }
}

// --- D. Event Listener untuk Tombol Add to Cart di Product Card ---
productAddToCartButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Ambil data produk di tempat tombol ini berada
    const dataset = btn
      .closest(".product-card") // naik ke card terdekat
      .querySelector(".item-detail-button").dataset; // ambil data
    
    // ✅ BUG FIX: dataSource → dataset (konsistensi nama variabel)
    const name = dataset.name;
    const price = parseInt(dataset.price);
    const imgSrc = dataset.img;

    // Validasi(anti bug)
    if (!name || !price || !imgSrc) {
      console.error("Data produk tidak lengkap", dataset);
      return;
    }
    // Tambahkan ke keranjang
    addToCart(name, price, imgSrc);
  });
});

// Masukkan item ke DOM
function renderNewCartItem(name) {
  const item = cartItems[name];

  cartItemsContainer.insertAdjacentHTML(
    "beforeend",
    `
    <div class="cart-item" data-name="${name}">
        <img src="${item.imgSrc}" alt="${name}">
        <div class="detail-item">
            <h3>${name} (${item.quantity}x)</h3>
            <div class="item-price">IDR ${formatRupiah(item.price * item.quantity)}</div>
        </div>
        <i data-feather="trash-2" class="remove-item"></i>
    </div>
    `
  );
  
  // Trigger animasi masuk
  requestAnimationFrame(() => {
    const newItem = document.querySelector(`.cart-item[data-name="${name}"]`);
    if (newItem) {
      newItem.classList.add("show");
    }
    feather.replace();
  });
}

// --- E. Event Listener untuk Tombol Add to Cart di Modal ---
if (modalAddToCartButton) {
  modalAddToCartButton.onclick = (e) => {
    e.preventDefault();
    const name =
      e.target.getAttribute("data-name") ||
      e.target.closest(".cart-button").getAttribute("data-name");
    const price =
      e.target.getAttribute("data-price") ||
      e.target.closest(".cart-button").getAttribute("data-price");
    const imgSrc =
      e.target.getAttribute("data-img") ||
      e.target.closest(".cart-button").getAttribute("data-img");

    // Pastikan data ada sebelum menambahkan
    if (name && price && imgSrc) {
      addToCart(name, price, imgSrc);
      itemDetailModal.style.display = "none"; // Tutup modal setelah menambah
    } else {
      console.error("Data produk tidak lengkap pada tombol modal.");
    }
  };
}

// =================================================================
// 5. CLOSING GLOBAL (Menutup Elemen saat Klik di Luar)
// =================================================================

document.addEventListener("click", function (e) {
  // Menutup Navbar Menu, Shopchart, dan search
  if (
    !navbar.contains(e.target) &&
    !searchForm.contains(e.target) &&
    !ShopCart.contains(e.target)
  ) {
    closeAllOverlay();
  }

  // Menutup Modal (saat mengklik background gelap di luar modal-container)
  if (e.target === itemDetailModal) {
    itemDetailModal.style.display = "none";
  }
});

// AAUTO CLOSE SAAT SCROLL
// Menutup hamburger menu
// Menutup search
// Menutup shopping cart
window.addEventListener("scroll", () => {
  closeAllOverlay();
});

// =================================================================
// 6. SCROLL REVEAL (Animasi Saat Gulir)
// =================================================================

// Inisialisasi Scroll Reveal
ScrollReveal({
  // Reset akan memuat ulang animasi setiap kali elemen terlihat
  reset: false,
  // Jarak pergeseran elemen saat muncul
  distance: "60px",
  // Durasi animasi dalam milidetik (misalnya 1 detik)
  duration: 1200,
  // Jeda sebelum animasi dimulai
  delay: 100,
});

// =================================================================
// 7. TARGETING ELEMEN
// =================================================================

// 1. Hero Section (Konten Utama)
// Animasi konten Hero (h1 dan p) muncul dari kiri
ScrollReveal().reveal(".hero .content h1, .hero .content p", {
  origin: "left",
});

// Animasi tombol CTA (Beli Sekarang) muncul dari bawah
ScrollReveal().reveal(".hero .content .cta", { origin: "bottom", delay: 300 });

// 2. About Section
// Animasi gambar muncul dari kiri, konten dari kanan
ScrollReveal().reveal(".about .row .about-img", { origin: "left" });
ScrollReveal().reveal(".about .row .content", { origin: "right", delay: 200 });

// 3. Menu dan Product Section (Kartu Muncul Secara Berurutan)
// Menu Card muncul dari atas
ScrollReveal().reveal(".menu-card", { origin: "top", interval: 100 });
// Product Card muncul dari bawah
ScrollReveal().reveal(".products .product-card", {
  origin: "bottom",
  interval: 150,
});

// 4. Contact Section
// Animasi peta muncul dari kiri, form dari kanan
ScrollReveal().reveal(".contact .row .map", { origin: "left" });
ScrollReveal().reveal(".contact .row form", { origin: "right", delay: 200 });