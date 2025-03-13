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
        
        // Get checkout items data
        const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems')) || [];
        const total = parseFloat(totalElement.textContent.replace('€', ''));

        try {
            const paymentData = {
                cartItems: checkoutItems,
                total: total,
                customer: {
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                    email: customerData.email,
                    phone: customerData.phone,
                    address: {
                        street: customerData.address,
                        apartment: customerData.apartment,
                        city: customerData.city,
                        postalCode: customerData.postalCode,
                        country: customerData.country
                    }
                }
            };

            console.log('Sending payment request:', paymentData);

            const response = await fetch('https://resell-depot.onrender.com/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.error || 'Payment creation failed');
            }

            const session = await response.json();
            console.log('Payment session:', session);
            
            // Store customer data for order confirmation
            localStorage.setItem('customerData', JSON.stringify(customerData));

            // Redirect to Mollie payment page
            if (session.checkoutUrl) {
                window.location.href = session.checkoutUrl;
            } else {
                throw new Error('No checkout URL received from server');
            }

        } catch (error) {
            console.error('Detailed error:', error);
            alert('Error: ' + error.message);
        }
    });


});
