document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "ekta_cart_v1";

  const productData = JSON.parse(localStorage.getItem("selectedProduct"));
  const cartCount = document.getElementById("cart-count");
  const qtyInput = document.getElementById("quantity");
  const buyNowBtn = document.getElementById("buy-now-btn"); // ✅ match product.html
  const sizeBoxes = document.querySelectorAll(".size-box");
  let selectedSize = null;

  // Update cart count
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (cartCount) cartCount.textContent = totalQty;
  };
  updateCartCount();

  // If no product selected
  if (!productData) {
    document.querySelector(".product-page").innerHTML = "<p>No product selected.</p>";
    return;
  }

  // Fill product details
  document.getElementById("product-name").textContent = productData.name;
  document.getElementById("product-price").textContent = `₹${productData.price}`;
  document.getElementById("product-description").textContent = productData.description || "";

  const imagesWrapper = document.getElementById("product-images");
  if (productData.images && productData.images.length) {
    productData.images.forEach(img => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `<img src="${img}" alt="${productData.name}">`;
      imagesWrapper.appendChild(slide);
    });
  }

  // Swiper init
  new Swiper(".swiper-container", {
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    }
  });

  // Quantity selector
  document.getElementById("increase-qty").addEventListener("click", () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  });
  document.getElementById("decrease-qty").addEventListener("click", () => {
    if (qtyInput.value > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
  });

  // ✅ Size selection toggle (fix: use "active" for consistency)
  sizeBoxes.forEach(box => {
    box.addEventListener("click", () => {
      sizeBoxes.forEach(b => b.classList.remove("active"));
      box.classList.add("active");
      selectedSize = box.dataset.size;
    });
  });

  // ✅ Add to Cart handler
  buyNowBtn.addEventListener("click", () => {
    if (!selectedSize) {
      alert("⚠️ Please select a size before adding to cart.");
      return;
    }

    let finalPrice = productData.price;
    if (selectedSize === "XL") finalPrice += 100;
    if (selectedSize === "XXL") finalPrice += 200;

    const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const cartItem = {
      name: productData.name,
      price: finalPrice,
      qty: parseInt(qtyInput.value),
      size: selectedSize,
      image: productData.images ? productData.images[0] : "images/placeholder.jpg"
    };

    cart.push(cartItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();

    alert(`✅ ${productData.name} (${selectedSize}) added to cart!`);
  });
});
