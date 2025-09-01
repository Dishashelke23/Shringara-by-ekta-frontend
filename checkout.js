
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

    // ✅ 2. Open Razorpay checkout with created order
    const options = {
      key: "rzp_test_RA3DWLskgIPbV1", // keep ONLY key_id here (safe for frontend)
      amount: orderData.amount,       // comes from backend (already in paise)
      currency: orderData.currency,
      name: "The Ekta Project",
      description: "Order Payment",
      order_id: orderData.id,         // critical: backend-generated Razorpay order_id
      handler: async function (res) {
        // ✅ 3. Verify payment on backend
        const verifyRes = await fetch("https://www.theektaproject.org/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.id,
            paymentId: res.razorpay_payment_id,
            signature: res.razorpay_signature, // add signature too for proper validation
          }),
        });

        if (verifyRes.ok) {
          // Clear cart after success
          localStorage.removeItem("ekta_cart_v1");
          localStorage.removeItem("order-summary");

          window.location.href = "order-success.html";
        } else {
          window.location.href = "order-failure.html";
        }
      },
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      notes: {
        address: `${customer.address}, ${customer.city}, ${customer.state}, ${customer.pincode}`,
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Payment initiation failed. Please try again.");
  }
});
