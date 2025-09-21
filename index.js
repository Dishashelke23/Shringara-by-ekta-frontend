// Mobile Menu Functionality with smooth animations
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const menuOverlay = document.querySelector(".menu-overlay");
let menuClose = document.querySelector(".menu-close");

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

// Draggable sliding
const slider = document.querySelector('.product-grid');
let isDown = false;
let startX;
let scrollLeft;

if (slider) {
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    slider.style.cursor = "pointer";
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.style.cursor = "pointer";
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.cursor = "pointer";
  });

  slider.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // adjust multiplier for speed
    slider.scrollLeft = scrollLeft - walk;
  });
}

// Slide Buttons chevrons
const productGrid = document.querySelector('.product-grid');
const leftBtn = document.querySelector('.slide-btn.left');
const rightBtn = document.querySelector('.slide-btn.right');

if (productGrid && leftBtn && rightBtn) {
  const scrollAmount = document.querySelector('.product-card').offsetWidth + 20;

  rightBtn.addEventListener('click', () => {
    productGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  leftBtn.addEventListener('click', () => {
    productGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
}