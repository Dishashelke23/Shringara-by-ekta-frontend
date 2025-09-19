document.addEventListener('DOMContentLoaded', function() {
  const authToken = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  // Redirect to login if not authenticated
  if (!authToken || !user) {
    window.location.href = "login.html?redirect=profile.html";
    return;
  }
  
  // Display user info
  document.getElementById("user-avatar").src = user.picture || "https://via.placeholder.com/150";
  document.getElementById("user-name").textContent = user.name;
  document.getElementById("user-email").textContent = user.email;
  
  // Load orders
  loadOrders();
  
  // Tab navigation
  document.querySelectorAll('.profile-nav a').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update active tab
      document.querySelectorAll('.profile-nav a').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding content
      const targetId = this.getAttribute('href').substring(1);
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(targetId).classList.add('active');
    });
  });
  
  // Logout functionality
  document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });
  
  // Function to load orders
  async function loadOrders() {
    try {
      const response = await fetch('http://localhost:3000/api/user/orders', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      
      if (data.success && data.orders.length > 0) {
        displayOrders(data.orders);
      } else {
        document.getElementById('orders-list').innerHTML = `
          <div class="empty-state">
            <p>You haven't placed any orders yet.</p>
            <a href="ecomshop.html" class="btn btn-primary">Start Shopping</a>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      document.getElementById('orders-list').innerHTML = `
        <div class="error-state">
          <p>Failed to load orders. Please try again later.</p>
        </div>
      `;
    }
  }
  
  // Function to display orders
  function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div class="order-id">Order #${order.orderId || order.razorpay_order_id}</div>
          <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
          <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
        </div>
        <div class="order-details">
          <div class="order-items">
            ${order.products.map(product => `
              <div class="order-item">
                <div class="item-name">${product.name} ${product.size ? `(${product.size})` : ''}</div>
                <div class="item-qty">Qty: ${product.qty || 1}</div>
                <div class="item-price">₹${(product.price * (product.qty || 1)).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
          <div class="order-total">
            Total: ₹${order.amount ? (order.amount / 100).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>
    `).join('');
  }
});