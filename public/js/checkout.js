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

        // Get form data
        const formData = new FormData(checkoutForm);
        const customerData = Object.fromEntries(formData.entries());
        
        // Get cart data
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        try {
            // Disable button and show processing state
            continueToPaymentBtn.disabled = true;
            continueToPaymentBtn.textContent = 'Processing...';
            continueToPaymentBtn.style.backgroundColor = '#333333';

            // Format cart items like it was in the cart page
            const formattedCartItems = cart.map(item => ({
                handle: item.handle,
                title: item.title,
                price: parseFloat(item.price).toFixed(2),
                quantity: item.quantity,
                image: item.image
            }));

            // Calculate total amount
            const total = formattedCartItems.reduce((sum, item) => {
                return sum + (parseFloat(item.price) * parseInt(item.quantity));
            }, 0).toFixed(2);

            const paymentData = {
                cartItems: formattedCartItems,
                total: total,
                customer: {
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                    email: customerData.email,
                    phone: customerData.phone,
                    address: {
                        street: customerData.address,
                        apartment: customerData.apartment || '',
                        city: customerData.city,
                        postalCode: customerData.postalCode,
                        country: customerData.country
                    }
                }
            };

            console.log('Sending payment data:', paymentData);

            const response = await fetch('https://resell-depot.onrender.com/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            const responseData = await response.json();
            console.log('Server response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || 'Payment creation failed');
            }

            // Store customer data for order confirmation
            localStorage.setItem('customerData', JSON.stringify(customerData));

            // Redirect to Mollie checkout
            if (responseData.checkoutUrl) {
                window.location.href = responseData.checkoutUrl;
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error) {
            console.error('Full error details:', error);
            
            // Reset button state
            continueToPaymentBtn.disabled = false;
            continueToPaymentBtn.textContent = 'Continue to Payment';
            continueToPaymentBtn.style.backgroundColor = '#000000';
            
            alert('There was an error processing your payment. Please try again.');
        }
    });
});
