document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "ekta_cart_v1";
  const cartCount = document.getElementById("cart-count");
  const cartIcon = document.getElementById("cart-link");

  let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  updateCartCount();

  document.querySelectorAll(".product-card button").forEach(btn => {
    btn.addEventListener("click", e => {
      const card = e.target.closest(".product-card");
      const name = card.querySelector("h3").textContent;
      const price = parseFloat(card.querySelector("p").textContent.replace("₹", "").replace("$", ""));
      const image = card.querySelector("img").src;

      cart.push({ name, price, image, qty: 1 });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      updateCartCount();

      flyToCart(e.target, image);
    });
  });

  function updateCartCount() {
    cartCount.textContent = cart.length;
  }

  function flyToCart(button, imageSrc) {
    const img = document.createElement("img");
    img.src = imageSrc;
    img.classList.add("fly-img");
    document.body.appendChild(img);

    const rect = button.closest(".product-card").querySelector("img").getBoundingClientRect();
    img.style.left = rect.left + "px";
    img.style.top = rect.top + "px";
    img.offsetWidth;

    const cartRect = cartIcon.getBoundingClientRect();
    img.style.transform = `translate(${cartRect.left - rect.left}px, ${cartRect.top - rect.top}px) scale(0.2)`;
    img.style.opacity = "0.5";

    setTimeout(() => img.remove(), 1000);
  }

  cartIcon.addEventListener("click", () => {
    window.location.href = "ecomcart.html";
  });
});

// Open product details when clicking image or name
document.querySelectorAll(".product-card img, .product-card h3").forEach(item => {
    item.addEventListener("click", function () {
        const card = this.closest(".product-card");
        const productData = {
            name: card.dataset.name,
            price: parseFloat(card.dataset.price),
            description: card.dataset.description,
            images: JSON.parse(card.dataset.images)
        };
        localStorage.setItem("selectedProduct", JSON.stringify(productData));
        window.location.href = "product.html";
    });
});

// Handle click on product image or name → go to product page
document.querySelectorAll(".product-card img, .product-card h3").forEach(item => {
    item.addEventListener("click", function () {
        const card = this.closest(".product-card");

        // Get product data from data attributes
        const productData = {
            name: card.dataset.name,
            price: parseFloat(card.dataset.price),
            description: card.dataset.description,
            images: JSON.parse(card.dataset.images) 
        };

        // Save in localStorage
        localStorage.setItem("selectedProduct", JSON.stringify(productData));

        // Redirect to product page
        window.location.href = "product.html";
    });
});

