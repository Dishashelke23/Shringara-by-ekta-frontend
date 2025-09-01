const BASE_URL = "https://api.theektaproject.org";
const form = document.getElementById("checkout-form");

// Get cart from localStorage or empty array
let cart = JSON.parse(localStorage.getItem("ekta_cart_v1")) || [];

// Force numbers and calculate totals
let itemsTotal = cart.reduce((sum, item) => 
  sum + Number(item.price || 0) * Number(item.qty || 1), 0
);
let shipping = itemsTotal > 999 ? 0 : 99;
let grandTotal = itemsTotal + shipping;

// Update checkout summary on page
document.getElementById("items-total").innerText = `₹${itemsTotal.toFixed(2)}`;
document.getElementById("shipping").innerText = `₹${shipping.toFixed(2)}`;
document.getElementById("grand-total").innerText = `₹${grandTotal.toFixed(2)}`;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect customer info
  const customer = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    pincode: document.getElementById("pincode").value,
  };

  const summary = { subtotal: itemsTotal, shipping, grand: grandTotal };

  try {
    // 1️⃣ Create order in backend (cache-busting added)
    const createRes = await fetch(`${BASE_URL}/api/orders/create?cb=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
      body: JSON.stringify({ cart, summary, customer }),
    });

    const data = await createRes.json();
    if (!data.orderId) throw new Error("Order creation failed");

    // 2️⃣ Razorpay checkout
    const options = {
      key: data.key,
      amount: Math.round(Number(summary.grand) * 100), // paise
      currency: "INR",
      name: "Shriṅgāra by Ekta",
      description: "Purchase from Shriṅgāra",
      order_id: data.orderId,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: "#F37254" },
      handler: async function (response) {
        try {
          // 3️⃣ Verify payment in backend
          const verifyRes = await fetch(`${BASE_URL}/api/orders/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            // ✅ Clear cart after successful payment
            localStorage.removeItem("ekta_cart_v1");

            // Redirect to success page
            window.location.href = `successful.html?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
          } else {
            alert("Payment verification failed.");
          }
        } catch (err) {
          console.error(err);
          alert("Payment verification error.");
        }
      },
      modal: {
        escape: true,
        ondismiss: function () {
          alert("Payment cancelled.");
        },
      },
    };

    // Initialize Razorpay
    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert("Payment initiation failed. Please try again.");
  }
});
