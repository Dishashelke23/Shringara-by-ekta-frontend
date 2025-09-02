document.addEventListener('DOMContentLoaded', function() {
  const cart = JSON.parse(localStorage.getItem('ekta_cart_v1')) || [];
  const orderItemsContainer = document.getElementById('order-items');
  const grandTotalEl = document.getElementById('grand-total');
  const form = document.getElementById('checkout-form');
  const loadingOverlay = document.getElementById('loading-overlay');

  if (cart.length === 0) {
    orderItemsContainer.innerHTML = '<p>Your cart is empty</p>';
    window.location.href = 'ecomcart.html';
    return;
  }

  let itemsTotal = 0;
  cart.forEach(item => {
    const itemTotal = item.price * (item.qty || 1);
    itemsTotal += itemTotal;

    const itemEl = document.createElement('div');
    itemEl.className = 'order-item';
    itemEl.innerHTML = `<div>${item.name} ${item.size ? `(${item.size})` : ''} x${item.qty || 1}</div>
                        <div>₹${itemTotal.toFixed(2)}</div>`;
    orderItemsContainer.appendChild(itemEl);
  });

  const shipping = itemsTotal > 999 ? 0 : 99;
  const grandTotal = itemsTotal + shipping;

  const shippingEl = document.createElement('div');
  shippingEl.className = 'order-item';
  shippingEl.innerHTML = `<div>Shipping</div><div>₹${shipping.toFixed(2)}</div>`;
  orderItemsContainer.appendChild(shippingEl);

  grandTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;

  localStorage.setItem('ekta_order_summary', JSON.stringify({
    subtotal: itemsTotal,
    shipping,
    grand: grandTotal
  }));

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validateForm()) return;
    loadingOverlay.style.display = 'flex';

    const customer = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      pincode: document.getElementById('pincode').value,
    };

    try {
      const response = await fetch('http://localhost:5000/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal, // in rupees
          currency: "INR",
          products: cart,
          customer
        })
      });

      const orderData = await response.json();
      if (!orderData.id) throw new Error('Order creation failed');

      const options = {
        key: 'rzp_test_RCNHoAlt5xHIJu', // test key_id
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'The Ekta Project',
        description: 'Order Payment',
        order_id: orderData.id,

     handler: async function (response) {
  try {
    const verifyResponse = await fetch("http://localhost:5000/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
      }),
    });

    const verifyData = await verifyResponse.json();
    if (verifyResponse.ok && verifyData.success) {
      localStorage.removeItem("ekta_cart_v1");
      window.location.href = "order-success.html";
    } else {
      alert(verifyData.message || "Payment verification failed");
      window.location.href = "order-failure.html";
    }
  } catch (err) {
    console.error(err);
    alert("Payment verification failed. Try again.");
    window.location.href = "order-failure.html";
  }
},


        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone
        },
        notes: {
          address: `${customer.address}, ${customer.city}, ${customer.state}, ${customer.pincode}`
        },
        theme: { color: '#F37254' }
      };

      const rzp = new Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function(response) {
        alert('Payment failed. Please try again.');
        console.error(response.error);
      });

    } catch (err) {
      console.error('Checkout error:', err);
      alert('Payment initiation failed. Please try again.');
    } finally {
      loadingOverlay.style.display = 'none';
    }
  });

  function validateForm() {
    let isValid = true;
    const fields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    fields.forEach(field => {
      const input = document.getElementById(field);
      const error = document.getElementById(`${field}-error`);
      if (!input.value.trim()) {
        error.style.display = 'block';
        isValid = false;
      } else {
        error.style.display = 'none';
      }
    });

    const email = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      emailError.style.display = 'block';
      emailError.textContent = 'Please enter a valid email address';
      isValid = false;
    }

    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.value)) {
      phoneError.style.display = 'block';
      phoneError.textContent = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    return isValid;
  }
});
