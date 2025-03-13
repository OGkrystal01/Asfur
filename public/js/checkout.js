document.addEventListener('DOMContentLoaded', function() {
    const checkoutItems = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutForm = document.getElementById('checkout-form');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');

    // Handle direct product checkout
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

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

        // Store cart items for checkout
        localStorage.setItem('checkoutItems', JSON.stringify(cart));

        return subtotal;
    }

    // Initialize the checkout
    initializeCheckout();

    // Handle form submission and continue to payment
    continueToPaymentBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // Validate form
        if (!checkoutForm.checkValidity()) {
            checkoutForm.reportValidity();
            return;
        }

        // Get cart data
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        try {
            // Show loading state
            continueToPaymentBtn.disabled = true;
            continueToPaymentBtn.textContent = 'Processing...';
            continueToPaymentBtn.style.backgroundColor = '#333333';

            // Create Mollie payment - use exact same structure as cart page
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartItems: cart
                })
            });

            if (!response.ok) {
                throw new Error('Payment creation failed');
            }

            const { checkoutUrl } = await response.json();
            
            // Store form data for order confirmation
            const formData = new FormData(checkoutForm);
            const customerData = Object.fromEntries(formData.entries());
            localStorage.setItem('customerData', JSON.stringify(customerData));
            
            // Redirect to Mollie checkout
            window.location.href = checkoutUrl;

        } catch (error) {
            console.error('Checkout error:', error);
            
            // Reset button state
            continueToPaymentBtn.disabled = false;
            continueToPaymentBtn.textContent = 'Continue to Payment';
            continueToPaymentBtn.style.backgroundColor = '#000000';
            
            alert('There was an error processing your payment. Please try again.');
        }
    });
});
