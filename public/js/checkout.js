document.addEventListener('DOMContentLoaded', function() {
    const checkoutItems = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutForm = document.getElementById('checkout-form');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');

    // Initialize checkout
    function initializeCheckout() {
        loadCartItems();
    }

    // Load cart items from localStorage
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
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

        // Validate form
        if (!checkoutForm.checkValidity()) {
            checkoutForm.reportValidity();
            return;
        }

        // Get cart data directly from localStorage without reformatting
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if cart is empty
        if (!cart || cart.length === 0) {
            alert('Your cart is empty. Please add items to your cart before checkout.');
            window.location.href = '/pages/cart.html';
            return;
        }
        
        // Show loading state
        continueToPaymentBtn.disabled = true;
        continueToPaymentBtn.textContent = 'Processing...';
        continueToPaymentBtn.style.backgroundColor = '#333333';

        // Store form data for order confirmation
        const formData = new FormData(checkoutForm);
        const customerData = Object.fromEntries(formData.entries());
        localStorage.setItem('customerData', JSON.stringify(customerData));

        // Send only cartItems to the server as per the working implementation
        fetch('https://resell-depot.onrender.com/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cartItems: cart })
        })
        .then(function(response) {
            if (!response.ok) {
                return response.json().then(function(errorData) {
                    throw new Error(errorData.error || 'Payment creation failed');
                });
            }
            return response.json();
        })
        .then(function(data) {
            console.log('Payment created successfully:', data);
            
            // Store payment ID for verification
            if (data.paymentId) {
                localStorage.setItem('currentPaymentId', data.paymentId);
            }
            
            // Redirect to Mollie checkout
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('No checkout URL received');
            }
        })
        .catch(function(error) {
            console.error('Checkout error:', error);
            
            // Reset button state
            continueToPaymentBtn.disabled = false;
            continueToPaymentBtn.textContent = 'Continue to Payment';
            continueToPaymentBtn.style.backgroundColor = '#000000';
            
            alert('There was an error processing your payment. Please try again.');
        });
    });
});
