// Scroll reveal animation for product cards and sections
function revealOnScroll() {
    const reveals = document.querySelectorAll(".product-card, .about, .impact, section h2, section h3");

    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const revealPoint = 50; // smaller = earlier animation

        if (elementTop < windowHeight - revealPoint) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll); // Run on page load too

// Navbar shadow effect when scrolling
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// Animate hero text on page load
document.addEventListener("DOMContentLoaded", () => {
    const heroText = document.querySelectorAll(".hero h2, .hero p, .hero a");
    heroText.forEach((el, index) => {
        el.style.opacity = 0;
        el.style.transform = "translateY(30px)";
        setTimeout(() => {
            el.style.transition = "all 0.8s ease";
            el.style.opacity = 1;
            el.style.transform = "translateY(0)";
        }, index * 200); // Stagger animation
    });
});

// Handle click on product image or name → go to product page
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



