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

    try {
        // Initialize Stripe (publishable key should be loaded from server or env)
        console.log('🔄 Initializing checkout...');
        const STRIPE_PUBLISHABLE_KEY = await getStripePublishableKey();
        
        if (!STRIPE_PUBLISHABLE_KEY) {
            throw new Error('Payment system is not configured');
        }
        
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        console.log('✅ Stripe initialized');
    } catch (error) {
        console.error('❌ Fatal checkout initialization error:', error);
        showMessage('Unable to initialize payment system. Please try again later or contact support.', true);
        if (continueToPaymentBtn) {
            continueToPaymentBtn.disabled = true;
            continueToPaymentBtn.textContent = 'Payment Unavailable';
        }
        return;
    }

    // Function to get Stripe publishable key from server or environment
    async function getStripePublishableKey() {
        // In production, you should fetch this from your server
        try {
            console.log('Fetching Stripe configuration...');
            const response = await fetch('/api/stripe-config');
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Stripe config error:', errorData);
                throw new Error(errorData.error || 'Failed to fetch Stripe configuration');
            }
            const { publishableKey } = await response.json();
            
            if (!publishableKey) {
                throw new Error('No Stripe publishable key received from server');
            }
            
            console.log('✅ Stripe configuration loaded successfully');
            return publishableKey;
        } catch (error) {
            console.error('❌ Error fetching Stripe publishable key:', error);
            showMessage('Payment system configuration error: ' + error.message, true);
            throw error;
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
        
        // Update shipping to FREE
        const shippingElement = document.getElementById('shipping');
        if (shippingElement) {
            shippingElement.textContent = 'FREE';
            shippingElement.style.color = '#080046';
            shippingElement.style.fontWeight = '600';
        }
        
        totalElement.textContent = `€${subtotal.toFixed(2)}`;

        return subtotal;
    }

    // Initialize the checkout
    const cart = loadCartItems();
    
    // Only proceed if cart has items
    if (cart === 0) {
        showMessage('Your cart is empty. Please add items before checking out.', true);
        setTimeout(() => {
            window.location.href = '/pages/products.html';
        }, 2000);
        return;
    }
    
    // Track InitiateCheckout event with Meta Pixel
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    if (window.metaPixel && typeof window.metaPixel.trackInitiateCheckout === 'function') {
        window.metaPixel.trackInitiateCheckout(cartData);
    }
    
    // Show loading state immediately
    console.log('🔄 Loading payment methods...');
    showMessage('Loading payment methods...', false);
    
    await initializeStripePayment();

    // Initialize Stripe Payment Element
    async function initializeStripePayment() {
        // Get cart and customer data
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            showMessage('Your cart is empty', true);
            return;
        }

        // Get form data if available, otherwise use defaults
        const formData = new FormData(checkoutForm);
        const customerData = Object.fromEntries(formData.entries());

        try {
            console.log('Creating payment intent...');
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
            console.log('✅ Payment intent created successfully');

            // Store order number for confirmation page
            localStorage.setItem('orderNumber', orderNumber);

            // Create Stripe Elements instance
            console.log('🔄 Creating payment element...');
            const appearance = {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#080046',
                    colorBackground: '#ffffff',
                    colorText: '#000000',
                    colorDanger: '#c62828',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '4px',
                    spacingUnit: '4px'
                },
                rules: {
                    '.Tab': {
                        border: '1px solid #E0E6EB',
                        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
                    },
                    '.Tab:hover': {
                        color: '#080046',
                    },
                    '.Tab--selected': {
                        borderColor: '#080046',
                        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px #080046',
                    }
                }
            };

            elements = stripe.elements({ appearance, clientSecret });

            // Create and mount the Payment Element with all methods visible as a vertical list
            paymentElement = elements.create('payment', {
                layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                    radios: false,
                    spacedAccordionItems: false
                },
                wallets: {
                    applePay: 'auto',
                    googlePay: 'auto'
                }
            });
            paymentElement.mount('#payment-element');

            console.log('✅ Stripe Payment Element mounted successfully');
            console.log('✅ Payment methods loaded - user can now select payment method');
            
            // Hide the initializing message
            paymentMessage.style.display = 'none';
            console.log('✅ Initializing message hidden');

        } catch (error) {
            console.error('Error initializing payment:', error);
            showMessage('Failed to initialize payment: ' + error.message, true);
            
            // Provide fallback instruction
            setTimeout(() => {
                showMessage('Please try refreshing the page or contact support if the issue persists.', true);
            }, 3000);
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
            setLoading(true);
            try {
                await initializeStripePayment();
                showMessage('Please complete the payment information below');
            } catch (error) {
                showMessage('Failed to initialize payment. Please try again.', true);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);

        // Store customer data for order confirmation
        const formData = new FormData(checkoutForm);
        const customerData = Object.fromEntries(formData.entries());
        localStorage.setItem('customerData', JSON.stringify(customerData));

        try {
            console.log('🔄 Confirming payment with Stripe...');
            
            // Confirm payment with Stripe - let Stripe handle billing details from payment element
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/pages/order-confirmation.html`,
                    receipt_email: customerData.email,
                    payment_method_data: {
                        billing_details: {
                            name: `${customerData.firstName} ${customerData.lastName}`,
                            email: customerData.email,
                            phone: customerData.phone,
                            address: {
                                line1: customerData.address,
                                line2: customerData.apartment || '',
                                city: customerData.city,
                                postal_code: customerData.postalCode,
                                country: customerData.country
                            }
                        }
                    },
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
                console.error('❌ Payment error:', error);
                console.error('Error type:', error.type);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                
                if (error.type === 'card_error' || error.type === 'validation_error') {
                    showMessage(error.message, true);
                } else {
                    showMessage('Payment error: ' + error.message, true);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('❌ Payment exception:', error);
            showMessage('Payment failed: ' + error.message, true);
            setLoading(false);
        }
    });

    // Payment element is now initialized immediately on page load
    // No need to wait for form to be filled

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
