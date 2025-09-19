document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "ekta_cart_v1";
  const cartCount = document.getElementById("cart-count");
  const cartIcon = document.getElementById("cart-link");

  let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  updateCartCount();

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