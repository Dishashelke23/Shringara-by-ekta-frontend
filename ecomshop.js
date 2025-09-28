// Mobile Menu Functionality with smooth animations
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const menuOverlay = document.querySelector(".menu-overlay");
let menuClose = document.querySelector(".menu-close");

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "ekta_cart_v1";
  const cartCount = document.getElementById("cart-count");
  const cartIcon = document.getElementById("cart-link");

  let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  updateCartCount();

  

// Create close button if it doesn't exist
if (!menuClose && navLinks) {
  const closeBtn = document.createElement("div");
  closeBtn.className = "menu-close";
  closeBtn.innerHTML = "✕";
  navLinks.prepend(closeBtn);
  menuClose = closeBtn;
  
  closeBtn.addEventListener("click", closeMenu);
}

if (hamburger && navLinks && menuOverlay) {
  hamburger.addEventListener("click", toggleMenu);
  
  // Close menu when clicking on overlay
  menuOverlay.addEventListener("click", closeMenu);
  
  // Close menu when clicking on a link
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });
  
  // Close menu when pressing Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("show")) {
      closeMenu();
    }
  });
}

function toggleMenu() {
  if (navLinks.classList.contains("show")) {
    closeMenu();
  } else {
    openMenu();
  }
}

function openMenu() {
  navLinks.classList.add("show");
  menuOverlay.classList.add("active");
  document.body.classList.add("menu-open");
  hamburger.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  navLinks.classList.remove("show");
  menuOverlay.classList.remove("active");
  document.body.classList.remove("menu-open");
  hamburger.classList.remove("active");
  
  setTimeout(() => {
    document.body.style.overflow = "";
  }, 500);
}



  // Add-to-cart buttons (if you add them later)
  document.querySelectorAll(".product-card button").forEach(btn => {
    btn.addEventListener("click", e => {
      const card = e.currentTarget.closest(".product-card");
      const name = (card.dataset.name || card.querySelector("h3")?.textContent || "").trim();
      const price = parseFloat(
        (card.dataset.price || card.querySelector("p")?.textContent || "0").replace(/[₹$,]/g, "")
      );
      const image = card.querySelector("img")?.src;

      cart.push({ name, price, image, qty: 1 });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      updateCartCount();
    });
  });

  function updateCartCount() {
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  cartCount.textContent = totalQty;
}

  if (cartIcon) {
    cartIcon.addEventListener("click", () => (window.location.href = "ecomcart.html"));
  }

  // Save product to localStorage before going to product.html
  document.querySelectorAll(".product-card img, .product-card h3, .product-card a")
    .forEach(el => {
      el.addEventListener("click", (e) => {
        const card = e.currentTarget.closest(".product-card");

        const name = (card.dataset.name || card.querySelector("h3")?.textContent || "").trim();
        const price = parseFloat(
          (card.dataset.price || card.querySelector("p")?.textContent || "0").replace(/[₹$,]/g, "")
        );
        const description = card.dataset.description || name;

        // Be forgiving if data-images is missing or malformed
        let images = [card.querySelector("img")?.src].filter(Boolean);
        if (card.dataset.images) {
          try { images = JSON.parse(card.dataset.images); }
          catch { /* fallback already set */ }
        }

        const productData = { name, price, description, images };
        localStorage.setItem("selectedProduct", JSON.stringify(productData));

        // If it was a link, stop default navigation so save completes, then navigate.
        if (e.currentTarget.tagName === "A") {
          e.preventDefault();
          window.location.href = "product.html";
        }
      });
    });

  // Add login check for checkout button if it exists
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        e.preventDefault();
        alert("Please login to proceed to checkout");
        window.location.href = "login.html?redirect=ecomcart.html";
      }
    });
  }
    
});