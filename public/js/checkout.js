document.addEventListener('DOMContentLoaded', function() {
    const checkoutItems = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutForm = document.getElementById('checkout-form');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');

    // Debug function to log detailed information
    function debugLog(message, data) {
        console.log('DEBUG: ' + message, data);
        // Create a hidden debug element if it doesn't exist
        let debugElement = document.getElementById('debug-log');
        if (!debugElement) {
            debugElement = document.createElement('div');
            debugElement.id = 'debug-log';
            debugElement.style.display = 'none';
            document.body.appendChild(debugElement);
        }
        // Add the debug message
        const debugItem = document.createElement('div');
        debugItem.textContent = 'DEBUG: ' + message + ' ' + JSON.stringify(data);
        debugElement.appendChild(debugItem);
    }

    // Initialize checkout
    function initializeCheckout() {
        loadCartItems();
    }

    // Load cart items from localStorage
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        debugLog('Cart loaded from localStorage', cart);
        
        let subtotal = 0;

        checkoutItems.innerHTML = '';

        cart.forEach(item => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            subtotal += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="checkout-item-details">
                    <h3>${item.title}</h3>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="checkout-item-price">
                    €${itemTotal.toFixed(2)}
                </div>
            `;
            checkoutItems.appendChild(itemElement);
        });

        // Update totals
        subtotalElement.textContent = `€${subtotal.toFixed(2)}`;
        totalElement.textContent = `€${subtotal.toFixed(2)}`;

        return subtotal;
    }

    // Initialize the checkout
    initializeCheckout();

    // Handle form submission and continue to payment
    continueToPaymentBtn.addEventListener('click', function(e) {
        e.preventDefault();
        debugLog('Checkout button clicked', {});

        // Validate form
        if (!checkoutForm.checkValidity()) {
            debugLog('Form validation failed', {});
            checkoutForm.reportValidity();
            return;
        }

        // Get cart data directly from localStorage without reformatting
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        debugLog('Cart data for checkout', cart);
        
        // Check if cart is empty
        if (!cart || cart.length === 0) {
            debugLog('Cart is empty', {});
            alert('Your cart is empty. Please add items to your cart before checkout.');
            window.location.href = '/pages/cart.html';
            return;
        }
        
        // Show loading state
        continueToPaymentBtn.disabled = true;
        continueToPaymentBtn.textContent = 'Processing...';
        continueToPaymentBtn.style.backgroundColor = '#333333';
        debugLog('Button state changed to processing', {});

        // Store form data for order confirmation
        const formData = new FormData(checkoutForm);
        const customerData = Object.fromEntries(formData.entries());
        localStorage.setItem('customerData', JSON.stringify(customerData));
        debugLog('Customer data stored', customerData);

        // Create the request payload
        const payload = { cartItems: cart };
        debugLog('Sending payload to server', payload);

        // Send only cartItems to the server as per the working implementation
        fetch('https://resell-depot.onrender.com/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(function(response) {
            debugLog('Server response received', { 
                status: response.status, 
                ok: response.ok,
                statusText: response.statusText
            });
            
            // Clone the response so we can log it and still use it
            return response.clone().text().then(function(text) {
                try {
                    const data = JSON.parse(text);
                    debugLog('Response body', data);
                } catch (e) {
                    debugLog('Response is not JSON', text);
                }
                
                if (!response.ok) {
                    return response.json().then(function(errorData) {
                        throw new Error(errorData.error || 'Payment creation failed');
                    });
                }
                
                return response.json();
            });
        })
        .then(function(data) {
            debugLog('Payment created successfully', data);
            
            // Store payment ID for verification
            if (data.paymentId) {
                localStorage.setItem('currentPaymentId', data.paymentId);
                debugLog('Payment ID stored', data.paymentId);
            } else {
                debugLog('No payment ID in response', data);
            }
            
            // Redirect to Mollie checkout
            if (data.checkoutUrl) {
                debugLog('Redirecting to checkout URL', data.checkoutUrl);
                window.location.href = data.checkoutUrl;
            } else {
                debugLog('No checkout URL in response', data);
                throw new Error('No checkout URL received');
            }
        })
        .catch(function(error) {
            debugLog('Checkout error', { message: error.message, stack: error.stack });
            console.error('Checkout error:', error);
            
            // Reset button state
            continueToPaymentBtn.disabled = false;
            continueToPaymentBtn.textContent = 'Continue to Payment';
            continueToPaymentBtn.style.backgroundColor = '#000000';
            debugLog('Button state reset after error', {});
            
            alert('There was an error processing your payment. Please try again.');
        });
    });
});
