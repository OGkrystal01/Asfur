// Stripe Payment Element Integration
let stripe;
let elements;
let paymentElement;
let clientSecret;

document.addEventListener('DOMContentLoaded', async function() {
    const checkoutItems = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutForm = document.getElementById('checkout-form');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');
    const paymentMessage = document.getElementById('payment-message');

    // Initialize Stripe (publishable key should be loaded from server or env)
    // For now, we'll fetch it from the server or use a placeholder
    // You need to replace this with your actual Stripe publishable key
    const STRIPE_PUBLISHABLE_KEY = await getStripePublishableKey();
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

    // Function to get Stripe publishable key from server or environment
    async function getStripePublishableKey() {
        // In production, you should fetch this from your server
        try {
            const response = await fetch('/api/stripe-publishable-key');
            if (!response.ok) {
                throw new Error('Failed to fetch Stripe publishable key');
            }
            const { publishableKey } = await response.json();
            return publishableKey;
        } catch (error) {
            console.error('Error fetching Stripe publishable key:', error);
            return 'pk_test_YOUR_PUBLISHABLE_KEY_HERE'; // Fallback to placeholder if fetch fails
        }
    }

    // Show message to user
    function showMessage(messageText, isError = false) {
        paymentMessage.textContent = messageText;
        paymentMessage.style.display = 'block';
        paymentMessage.style.color = isError ? '#c62828' : '#2e7d32';
        paymentMessage.style.padding = '10px';
        paymentMessage.style.marginTop = '10px';
        paymentMessage.style.borderRadius = '4px';
        paymentMessage.style.backgroundColor = isError ? '#ffebee' : '#e8f5e9';
    }

    // Set loading state
    function setLoading(isLoading) {
        if (isLoading) {
            continueToPaymentBtn.disabled = true;
            continueToPaymentBtn.textContent = 'Processing...';
        } else {
            continueToPaymentBtn.disabled = false;
            continueToPaymentBtn.textContent = 'Complete Payment';
        }
    }

    // Load cart items from localStorage
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('Cart loaded from localStorage', cart);
        
        let subtotal = 0;

        checkoutItems.innerHTML = '';

        cart.forEach(item => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            subtotal += itemTotal;

            // Display variant information if available
            let variantDisplay = '';
            if (item.variant && item.variant !== 'Default') {
                variantDisplay = `<p class="checkout-item-variant">${item.variant}</p>`;
            }

            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="checkout-item-details">
                    <h3>${item.title}</h3>
                    ${variantDisplay}
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
    loadCartItems();
    await initializeStripePayment();

    // Initialize Stripe Payment Element
    async function initializeStripePayment() {
        // Validate form first
        if (!checkoutForm.checkValidity()) {
            console.log('Form not valid yet, waiting for user input');
            return;
        }

        // Get cart and customer data
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const formData = new FormData(checkoutForm);
        const customerData = Object.fromEntries(formData.entries());

        if (cart.length === 0) {
            showMessage('Your cart is empty', true);
            return;
        }

        try {
            // Create PaymentIntent on the server
            const response = await fetch('/api/payment-intents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems: cart,
                    customerName: `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() || 'Customer',
                    customerEmail: customerData.email || 'customer@example.com'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to initialize payment');
            }

            const { clientSecret: secret, orderNumber } = await response.json();
            clientSecret = secret;

            // Store order number for confirmation page
            localStorage.setItem('orderNumber', orderNumber);

            // Create Stripe Elements instance
            const appearance = {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#000000',
                    colorBackground: '#ffffff',
                    colorText: '#000000',
                    colorDanger: '#c62828',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '4px'
                }
            };

            elements = stripe.elements({ appearance, clientSecret });

            // Create and mount the Payment Element
            paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');

            console.log('Stripe Payment Element initialized successfully');

        } catch (error) {
            console.error('Error initializing payment:', error);
            showMessage(error.message, true);
        }
    }

    // Handle payment form submission
    continueToPaymentBtn.addEventListener('click', async function(e) {
        e.preventDefault();

        // Validate form
        if (!checkoutForm.checkValidity()) {
            checkoutForm.reportValidity();
            return;
        }

        // If payment element not initialized, initialize it first
        if (!elements || !clientSecret) {
            await initializeStripePayment();
            showMessage('Please complete the payment information below');
            return;
        }

        setLoading(true);

        // Store customer data for order confirmation
        const formData = new FormData(checkoutForm);
        const customerData = Object.fromEntries(formData.entries());
        localStorage.setItem('customerData', JSON.stringify(customerData));

        // Confirm payment with Stripe
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/pages/order-confirmation.html`,
                receipt_email: customerData.email,
                shipping: {
                    name: `${customerData.firstName} ${customerData.lastName}`,
                    phone: customerData.phone,
                    address: {
                        line1: customerData.address,
                        line2: customerData.apartment || '',
                        city: customerData.city,
                        postal_code: customerData.postalCode,
                        country: customerData.country
                    }
                }
            }
        });

        // This point will only be reached if there is an immediate error
        // Otherwise, customer will be redirected to return_url
        if (error) {
            if (error.type === 'card_error' || error.type === 'validation_error') {
                showMessage(error.message, true);
            } else {
                showMessage('An unexpected error occurred. Please try again.', true);
            }
            setLoading(false);
        }
    });

    // Re-initialize payment when form is filled
    checkoutForm.addEventListener('change', async function() {
        if (checkoutForm.checkValidity() && !clientSecret) {
            await initializeStripePayment();
        }
    });

    // Add styles for Stripe Payment Element and messages
    const style = document.createElement('style');
    style.textContent = `
        .checkout-item-variant {
            font-size: 14px;
            color: #666;
            margin: 4px 0;
        }
        .payment-element-container {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .payment-message {
            display: none;
            margin-top: 15px;
            font-size: 14px;
        }
        #payment-element {
            margin-bottom: 20px;
        }
    `;
    document.head.appendChild(style);
});
