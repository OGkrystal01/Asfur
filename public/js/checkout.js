document.addEventListener('DOMContentLoaded', function() {
    const checkoutItems = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutForm = document.getElementById('checkout-form');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');

    // Load cart items from localStorage
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = 0;

        checkoutItems.innerHTML = '';

        cart.forEach(item => {
            const product = window.products.find(p => p.id === item.id);
            if (product) {
                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;

                const itemElement = document.createElement('div');
                itemElement.className = 'checkout-item';
                itemElement.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="checkout-item-details">
                        <h3>${product.name}</h3>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    <div class="checkout-item-price">
                        €${itemTotal.toFixed(2)}
                    </div>
                `;
                checkoutItems.appendChild(itemElement);
            }
        });

        // Update totals
        subtotalElement.textContent = `€${subtotal.toFixed(2)}`;
        totalElement.textContent = `€${subtotal.toFixed(2)}`;

        return subtotal;
    }

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
        const total = loadCartItems();

        try {
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cartItems: cart,
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
                })
            });

            if (!response.ok) {
                throw new Error('Payment creation failed');
            }

            const session = await response.json();
            
            // Store customer data for order confirmation
            localStorage.setItem('customerData', JSON.stringify(customerData));

            // Redirect to Mollie payment page
            window.location.href = session.checkoutUrl;

        } catch (error) {
            console.error('Error creating payment:', error);
            alert('There was an error processing your payment. Please try again.');
        }
    });

    // Load cart items on page load
    loadCartItems();
});
