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

    // Initialize cart or single product
    function initializeCheckout() {
        const productId = getQueryParam('productId');
        const quantity = parseInt(getQueryParam('quantity')) || 1;

        if (productId) {
            // Direct product checkout
            const product = window.shopifyProducts.find(p => p.handle === productId);
            if (product) {
                displaySingleProduct(product, quantity);
            }
        } else {
            // Cart checkout
            loadCartItems();
        }
    }

    function displaySingleProduct(product, quantity) {
        const itemTotal = product.variants[0].price * quantity;

        checkoutItems.innerHTML = `
            <div class="checkout-item">
                <img src="${product.image.src}" alt="${product.title}">
                <div class="checkout-item-details">
                    <h3>${product.title}</h3>
                    <p>Quantity: ${quantity}</p>
                </div>
                <div class="checkout-item-price">
                    €${itemTotal.toFixed(2)}
                </div>
            </div>
        `;

        // Update totals
        subtotalElement.textContent = `€${itemTotal.toFixed(2)}`;
        totalElement.textContent = `€${itemTotal.toFixed(2)}`;

        // Store single product data
        localStorage.setItem('checkoutItems', JSON.stringify([{
            handle: product.handle,
            quantity: quantity,
            price: product.variants[0].price
        }]));
    }

    // Load cart items from localStorage
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = 0;

        checkoutItems.innerHTML = '';

        cart.forEach(item => {
            const product = window.shopifyProducts.find(p => p.handle === item.handle);
            if (product) {
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
            }
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
