document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('ekta_cart_v1')) || [];
    const orderItemsContainer = document.getElementById('order-items');
    const grandTotalEl = document.getElementById('grand-total');
    const form = document.getElementById('checkout-form');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // ✅ Change this to your deployed backend (Railway/Render) when live
    const SERVER_URL = 'https://shringara-by-ekta-backend-production.up.railway.app';
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        setTimeout(() => {
            window.location.href = 'ecomcart.html';
        }, 1500);
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
            console.log('Attempting to connect to:', `${SERVER_URL}/create-order`);
            const response = await fetch(`${SERVER_URL}/create-order`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    amount: grandTotal,
                    currency: "INR",
                    products: cart,
                    customer
                })
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Server response not OK:', response.status, errorData);
                throw new Error(`Server responded with ${response.status}: ${errorData}`);
            }
            
            const orderData = await response.json();
            console.log('Order created:', orderData);
            
            if (!orderData.id || !orderData.key) {
                throw new Error('Order creation failed - missing order ID or key');
            }
            
            // ✅ Use key from backend instead of hardcoding
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'The Ekta Project',
                description: 'Order Payment',
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        loadingOverlay.style.display = 'flex';
                        console.log('Payment successful, verifying:', response);
                        
                        const verifyResponse = await fetch(`${SERVER_URL}/verify-payment`, {
                            method: "POST",
                            headers: { 
                                "Content-Type": "application/json",
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                            }),
                        });
                        
                        if (!verifyResponse.ok) {
                            throw new Error(`Verification failed with status ${verifyResponse.status}`);
                        }
                        
                        const verifyData = await verifyResponse.json();
                        console.log('Verification result:', verifyData);
                        
                        if (verifyData.success) {
                            localStorage.removeItem("ekta_cart_v1");
                            window.location.href = "order-success.html";
                        } else {
                            alert(verifyData.message || "Payment verification failed");
                            window.location.href = "order-failure.html";
                        }
                    } catch (err) {
                        console.error("Payment verification error:", err);
                        alert("Payment verification failed. Please contact support with your order details.");
                        window.location.href = "order-failure.html";
                    } finally {
                        loadingOverlay.style.display = 'none';
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
            
            rzp.on('payment.failed', function(response) {
                console.error('Payment failed:', response.error);
                alert(`Payment failed: ${response.error.description}. Please try again.`);
                loadingOverlay.style.display = 'none';
            });
            
            rzp.open();
            
        } catch (err) {
            console.error('Checkout error:', err);
            
            if (err.message.includes('Failed to fetch')) {
                alert('Cannot connect to the payment server. Please check that your server is running and try again.');
            } else if (err.message.includes('Server responded')) {
                alert('Server error occurred. Please try again later or contact support.');
            } else {
                alert('Payment initiation failed. Please try again.');
            }
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });
    
    function validateForm() {
        let isValid = true;
        const fields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
        
        fields.forEach(field => {
            const error = document.getElementById(`${field}-error`);
            if (error) error.style.display = 'none';
        });
        
        fields.forEach(field => {
            const input = document.getElementById(field);
            const error = document.getElementById(`${field}-error`);
            if (!input.value.trim()) {
                error.style.display = 'block';
                isValid = false;
            }
        });
        
        const email = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value && !emailRegex.test(email.value)) {
            emailError.style.display = 'block';
            emailError.textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        const phone = document.getElementById('phone');
        const phoneError = document.getElementById('phone-error');
        const phoneRegex = /^[6-9]\d{9}$/;
        if (phone.value && !phoneRegex.test(phone.value)) {
            phoneError.style.display = 'block';
            phoneError.textContent = 'Please enter a valid 10-digit phone number';
            isValid = false;
        }
        
        const pincode = document.getElementById('pincode');
        const pincodeError = document.getElementById('pincode-error');
        const pincodeRegex = /^\d{6}$/;
        if (pincode.value && !pincodeRegex.test(pincode.value)) {
            pincodeError.style.display = 'block';
            pincodeError.textContent = 'Please enter a valid 6-digit PIN code';
            isValid = false;
        }
        
        return isValid;
    }
});