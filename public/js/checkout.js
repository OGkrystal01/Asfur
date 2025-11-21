// Stripe Payment Element Integration
let stripe;
let elements;
let paymentElement;
let expressCheckoutElement;
let clientSecret;
let currentStep = 1;

// Section Navigation Functions
window.toggleSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
    }
};

// Validation functions
window.validateAndContinueContact = function() {
    const email = document.getElementById('email').value;
    
    if (!email || !email.includes('@')) {
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        updateSectionValidation('section-contact', false);
        return;
    }
    
    // Mark section as completed
    const contactSection = document.getElementById('section-contact');
    contactSection.classList.add('collapsed', 'completed');
    contactSection.querySelector('.edit-btn').style.display = 'inline';
    updateSectionValidation('section-contact', true);
    
    // Show shipping section
    const shippingSection = document.getElementById('section-shipping');
    shippingSection.style.display = 'block';
    shippingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    updateProgressStep(1, 'completed');
    updateProgressStep(2, 'active');
    currentStep = 2;
};

window.validateAndContinueShipping = function() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const postalCode = document.getElementById('postalCode').value;
    const country = document.getElementById('country').value;
    
    if (!firstName || !lastName || !address || !city || !postalCode || !country) {
        alert('Bitte füllen Sie alle erforderlichen Felder aus.');
        updateSectionValidation('section-shipping', false);
        return;
    }
    
    // Mark shipping section as completed
    const shippingSection = document.getElementById('section-shipping');
    shippingSection.classList.add('collapsed', 'completed');
    shippingSection.querySelector('.edit-btn').style.display = 'inline';
    updateSectionValidation('section-shipping', true);
    
    // Show shipping method section
    const shippingMethodSection = document.getElementById('section-shipping-method');
    shippingMethodSection.style.display = 'block';
    updateSectionValidation('section-shipping-method', true);
    shippingMethodSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.continueToPayment = function() {
    // Mark step 2 as completed
    updateProgressStep(2, 'completed');
    updateProgressStep(3, 'active');
    
    // Collapse shipping sections and show payment
    const shippingMethodSection = document.getElementById('section-shipping-method');
    const paymentSection = document.getElementById('section-payment');
    
    shippingMethodSection.style.display = 'none';
    paymentSection.style.display = 'block';
    
    // Scroll to payment section
    paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // On mobile, make order summary sticky
    if (window.innerWidth <= 768) {
        document.getElementById('order-summary').parentElement.classList.add('sticky-mobile');
    }
    
    currentStep = 3;
};

function updateProgressStep(stepNumber, status) {
    const step = document.querySelector(`.progress-step[data-step="${stepNumber}"]`);
    if (step) {
        step.classList.remove('active', 'completed');
        if (status) {
            step.classList.add(status);
        }
    }
}

function updateSectionValidation(sectionId, isValid) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const indicator = section.querySelector('.validation-indicator');
    if (!indicator) return;
    
    if (isValid) {
        indicator.innerHTML = '<i class="fas fa-check-circle" style="color: #4CAF50;"></i>';
    } else {
        indicator.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #f44336;"></i>';
    }
}

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
        paymentMessage.style.backgroundColor = isError ? '#fee' : '#d4edda';
        paymentMessage.style.color = isError ? '#d32f2f' : '#155724';
        paymentMessage.style.padding = '14px 16px';
        paymentMessage.style.borderRadius = '6px';
        paymentMessage.style.border = isError ? '1px solid #f5c6cb' : '1px solid #c3e6cb';
        paymentMessage.style.marginTop = '1rem';
        paymentMessage.style.fontWeight = '500';
        paymentMessage.style.fontSize = '0.95rem';
        
        // Auto-hide success messages after 5 seconds
        if (!isError) {
            setTimeout(() => {
                paymentMessage.style.display = 'none';
            }, 5000);
        }
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

    // Discount code state
    let appliedDiscount = null;

    // Valid discount codes
    const DISCOUNT_CODES = {
        'TEST95': { type: 'percentage', value: 95, description: '95% Off (Testing)' },
        'SAVE10': { type: 'percentage', value: 10, description: '10% Off' },
        'SAVE20': { type: 'percentage', value: 20, description: '20% Off' }
    };

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
        
        // Calculate discount if applied
        let discountAmount = 0;
        if (appliedDiscount) {
            if (appliedDiscount.type === 'percentage') {
                discountAmount = subtotal * (appliedDiscount.value / 100);
            } else if (appliedDiscount.type === 'fixed') {
                discountAmount = appliedDiscount.value;
            }
        }
        
        // Update discount display
        const discountLine = document.getElementById('discount-line');
        const discountAmountElement = document.getElementById('discount-amount');
        if (appliedDiscount && discountAmount > 0) {
            discountLine.style.display = 'flex';
            discountAmountElement.textContent = `-€${discountAmount.toFixed(2)}`;
        } else {
            discountLine.style.display = 'none';
        }
        
        // Update shipping to KOSTENLOS
        const shippingElement = document.getElementById('shipping');
        if (shippingElement) {
            shippingElement.textContent = 'KOSTENLOS';
            shippingElement.style.color = '#080046';
            shippingElement.style.fontWeight = '600';
        }
        
        // Calculate final total
        const finalTotal = Math.max(0, subtotal - discountAmount);
        totalElement.textContent = `€${finalTotal.toFixed(2)}`;

        return finalTotal;
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
    
    // Handle discount code application
    const discountInput = document.getElementById('discount-code');
    const applyDiscountBtn = document.getElementById('apply-discount');
    const discountMessage = document.getElementById('discount-message');
    const discountCodeLabel = document.getElementById('discount-code-label');
    
    applyDiscountBtn.addEventListener('click', function() {
        const code = discountInput.value.trim().toUpperCase();
        
        if (!code) {
            discountMessage.textContent = 'Please enter a discount code';
            discountMessage.className = 'discount-message error';
            return;
        }
        
        if (DISCOUNT_CODES[code]) {
            appliedDiscount = {
                code: code,
                ...DISCOUNT_CODES[code]
            };
            
            discountCodeLabel.textContent = code;
            discountMessage.textContent = `✓ ${DISCOUNT_CODES[code].description} applied!`;
            discountMessage.className = 'discount-message success';
            
            // Disable input and button
            discountInput.disabled = true;
            applyDiscountBtn.disabled = true;
            applyDiscountBtn.textContent = 'Applied';
            
            // Reload cart to recalculate totals
            loadCartItems();
            
            // Re-initialize payment with new amount
            initializeStripePayment();
            
            console.log('✅ Discount applied:', code);
        } else {
            discountMessage.textContent = 'Invalid discount code';
            discountMessage.className = 'discount-message error';
        }
    });
    
    // Allow Enter key to apply discount
    discountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyDiscountBtn.click();
        }
    });
    
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
            
            // Calculate total with discount
            let subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            let discountAmount = 0;
            
            if (appliedDiscount) {
                if (appliedDiscount.type === 'percentage') {
                    discountAmount = subtotal * (appliedDiscount.value / 100);
                } else if (appliedDiscount.type === 'fixed') {
                    discountAmount = appliedDiscount.value;
                }
            }
            
            const finalTotal = Math.max(0, subtotal - discountAmount);
            
            console.log('💰 Subtotal:', subtotal);
            console.log('💸 Discount:', discountAmount);
            console.log('💵 Final Total:', finalTotal);
            
            // Create PaymentIntent on the server
            const response = await fetch('/api/payment-intents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems: cart,
                    customerName: `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() || 'Customer',
                    customerEmail: customerData.email || 'customer@example.com',
                    discountCode: appliedDiscount ? appliedDiscount.code : null,
                    discountAmount: discountAmount,
                    finalTotal: finalTotal
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

            // Create Express Checkout Element first (for Apple Pay, Google Pay, etc.)
            console.log('🔄 Creating express checkout element...');
            try {
                expressCheckoutElement = elements.create('expressCheckout', {
                    wallets: {
                        applePay: 'auto',
                        googlePay: 'auto'
                    }
                });
                expressCheckoutElement.mount('#express-checkout-element');
                console.log('✅ Express checkout element mounted');
                
                // Listen for express checkout events
                expressCheckoutElement.on('confirm', async (event) => {
                    console.log('🎯 Express checkout confirmed');
                    // Express checkout handles payment automatically
                });
            } catch (error) {
                console.log('ℹ️ Express checkout not available:', error.message);
                // Hide express checkout section if not available
                const expressSection = document.querySelector('.express-checkout-section');
                if (expressSection) {
                    expressSection.style.display = 'none';
                }
            }

            // Create and mount the Payment Element with accordion layout for better mobile support
            paymentElement = elements.create('payment', {
                layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: true
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

        // Validate form with custom messages
        const formData = new FormData(checkoutForm);
        const customerData = Object.fromEntries(formData.entries());
        
        // Check required fields
        const requiredFields = [
            { name: 'email', label: 'Email' },
            { name: 'firstName', label: 'First name' },
            { name: 'lastName', label: 'Last name' },
            { name: 'address', label: 'Address' },
            { name: 'city', label: 'City' },
            { name: 'postalCode', label: 'Postal code' },
            { name: 'country', label: 'Country' }
        ];
        
        for (const field of requiredFields) {
            if (!customerData[field.name] || customerData[field.name].trim() === '') {
                showMessage(`Please fill out: ${field.label}`, true);
                document.getElementById(field.name)?.focus();
                return;
            }
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerData.email)) {
            showMessage('Please enter a valid email address', true);
            document.getElementById('email')?.focus();
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

        // Store customer data for order confirmation (already extracted above)
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
