document.addEventListener('DOMContentLoaded', function() {
    const checkoutItems = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutForm = document.getElementById('checkout-form');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');
    
    // Flag to track if we've redirected to Mollie
    let redirectedToMollie = false;

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

    // Function to reset button state to default
    function resetButtonState() {
        continueToPaymentBtn.disabled = false;
        continueToPaymentBtn.textContent = 'Continue to Payment';
        continueToPaymentBtn.style.backgroundColor = '#000000';
        debugLog('Button state reset to default', {});
    }

    // Initialize checkout
    function initializeCheckout() {
        loadCartItems();
        resetButtonState(); // Reset button on initial load
    }

    // Reset the button state when the page is shown (including when navigating back)
    window.addEventListener('pageshow', function(event) {
        // This will fire when navigating back to the page
        debugLog('pageshow event fired', { persisted: event.persisted });
        
        // Reset button state regardless of how the page was loaded
        resetButtonState();
        
        // Reset the redirect flag
        redirectedToMollie = false;
    });
    
    // Also listen for visibility changes (tab becomes visible again)
    document.addEventListener('visibilitychange', function() {
        debugLog('visibility changed', { hidden: document.hidden, redirectedToMollie: redirectedToMollie });
        
        // If the page becomes visible again and we previously redirected to Mollie
        if (!document.hidden && redirectedToMollie) {
            resetButtonState();
            redirectedToMollie = false;
        }
    });

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

        // Send request to the current server
        fetch('/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            cache: 'no-cache'
        })
        .then(function(response) {
            debugLog('Server response received', { 
                status: response.status, 
                ok: response.ok,
                statusText: response.statusText
            });
            
            if (!response.ok) {
                return response.text().then(function(text) {
                    try {
                        const errorData = JSON.parse(text);
                        debugLog('Error response body', errorData);
                        throw new Error(errorData.error || 'Payment creation failed');
                    } catch (e) {
                        debugLog('Error response is not JSON', text);
                        throw new Error('Payment creation failed: ' + text);
                    }
                });
            }
            
            return response.json();
        })
        .then(function(data) {
            debugLog('Payment created successfully', data);
            
            // Store payment ID for verification
            if (data.paymentId) {
                localStorage.setItem('currentPaymentId', data.paymentId);
                debugLog('Payment ID stored', data.paymentId);
            } else {
                debugLog('No payment ID in response', data);
                throw new Error('No payment ID received from server');
            }
            
            // Redirect to Mollie checkout
            if (data.checkoutUrl) {
                debugLog('Redirecting to checkout URL', data.checkoutUrl);
                // Use a small timeout to ensure the debug logs are visible
                setTimeout(function() {
                    redirectedToMollie = true;
                    window.location.href = data.checkoutUrl;
                }, 100);
            } else {
                debugLog('No checkout URL in response', data);
                throw new Error('No checkout URL received from server');
            }
        })
        .catch(function(error) {
            debugLog('Checkout error', { message: error.message, stack: error.stack });
            console.error('Checkout error:', error);
            
            // Reset button state
            resetButtonState();
            
            alert('There was an error processing your payment. Please try again.');
        });
    });
});
