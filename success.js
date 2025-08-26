document.addEventListener("DOMContentLoaded", () => {
  // Read query params from Razorpay redirect
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get("payment_id") || "N/A";
  const orderId = params.get("order_id") || "N/A";

  // Load order summary from localStorage (saved in cart.js / checkout.js)
  const summary = JSON.parse(localStorage.getItem("ekta_order_summary")) || {
    subtotal: 0,
    shipping: 0,
    grand: 0
  };

  // Update UI
  document.getElementById("payment-id").textContent = paymentId;
  document.getElementById("order-id").textContent = orderId;
  document.getElementById("subtotal").textContent = "₹" + summary.subtotal.toFixed(2);
  document.getElementById("shipping").textContent = "₹" + summary.shipping.toFixed(2);
  document.getElementById("grand-total").textContent = "₹" + summary.grand.toFixed(2);

  // (Optional) Clear cart after success
  localStorage.removeItem("ekta_cart_v1");
});
