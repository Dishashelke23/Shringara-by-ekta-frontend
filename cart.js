document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'ekta_cart_v1';
  let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  const invoiceBody = document.getElementById('invoice-body');
  const subtotalEl = document.getElementById('subtotal');
  const shippingEl = document.getElementById('shipping');
  const grandTotalEl = document.getElementById('grand-total');
  const invoiceIdEl = document.getElementById('invoice-id');
  const invoiceDateEl = document.getElementById('invoice-date');

  function render() {
    invoiceBody.innerHTML = '';
    let subtotal = 0;
    cart.forEach((item, idx) => {
      const lineTotal = item.price * (item.qty || 1);
      subtotal += lineTotal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
  <td>
    <div style="display:flex;gap:10px;align-items:center">
      <img src="${item.image ? item.image : "images/placeholder.jpg"}" style="height:50px;width:50px;object-fit:cover;border-radius:6px"/>
      <div>
        <div style="font-weight:600">${escapeHtml(item.name)}</div>
        <div style="color:var(--muted);font-size:13px">Size: ${item.size || "-"}</div>
      </div>
    </div>
  </td>
  <td>${item.qty || 1}</td>
  <td>₹${item.price.toFixed(2)}</td>
  <td>₹${lineTotal.toFixed(2)}</td>
  <td><button class="remove-btn" data-index="${idx}">Remove</button></td>
`;

      invoiceBody.appendChild(tr);
    });
    

    // Shipping logic
    const shipping = subtotal > 0 ? (subtotal >= 999 ? 0 : 99) : 0;
    const grand = subtotal + shipping;

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    shippingEl.textContent = `₹${shipping.toFixed(2)}`;
    grandTotalEl.textContent = `₹${grand.toFixed(2)}`;

    // Free shipping message
    const messageContainer = document.getElementById("free-shipping-message");
    if (messageContainer) {
      if (subtotal < 999 && subtotal > 0) {
        messageContainer.textContent = `You’re ₹${(999 - subtotal).toFixed(2)} away from FREE shipping!`;
        messageContainer.style.color = "red";
      } else if (subtotal >= 999) {
        messageContainer.textContent = "You’ve unlocked FREE shipping! 🎉";
        messageContainer.style.color = "green";
      } else {
        messageContainer.textContent = "";
      }
    }

    invoiceIdEl.textContent = 'EK' + (Date.now().toString().slice(-6));
    invoiceDateEl.textContent = new Date().toLocaleString();

    localStorage.setItem('ekta_order_summary', JSON.stringify({ subtotal, shipping, grand }));
  }

  // Clear all
  document.getElementById('clear-cart').addEventListener('click', () => {
    if (!confirm('Clear cart?')) return;
    cart = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    render();
  });

  // Proceed
  document.getElementById('proceed-to-checkout').addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.location.href = 'checkout.html';
  });

  // Remove individual item
  invoiceBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      const index = parseInt(e.target.getAttribute('data-index'));
      cart.splice(index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      render();
    }
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"'`=\/]/g, s => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;', '/':'&#x2F;', '`':'&#96;', '=':'&#61;'
    })[s]);
  }

  render();
});

