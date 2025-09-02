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



