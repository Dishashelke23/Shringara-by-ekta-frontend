document.addEventListener("DOMContentLoaded", () => {
  // Read query params from Razorpay redirect
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get("payment_id") || "N/A";
  const orderId = params.get("order_id") || "N/A";

  // Update UI
  document.getElementById("payment-id").textContent = paymentId;
  document.getElementById("order-id").textContent = orderId;
});
