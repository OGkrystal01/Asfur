// Shopify-style Checkout - Full Functionality
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51QP1AvP5oV0KyDJtaMLHSRTmLiIQN6VDM5Z3DFtKzgkXTlqZNP9O7OXAVHoRhRPSlxHc5bwMxAIMWdK8Xj4qcG6I00fHUyfcxE';

let stripe, elements, paymentElement, expressCheckoutElement;
let clientSecret;

// Discount codes
const DISCOUNT_CODES = {
    'WELCOME10': { type: 'percentage', value: 10 },
    'SAVE20': { type: 'percentage', value: 20 },
    'FREESHIP': { type: 'fixed', value: 0 }
};

let appliedDiscount = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Stripe
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    
    // Load cart and populate
    loadCartItems();
    
    // Setup event listeners
    setupEventListeners();
    
    // Track InitiateCheckout
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (window.metaPixel && typeof window.metaPixel.trackInitiateCheckout === 'function') {
        window.metaPixel.trackInitiateCheckout(cart);
    }
    
    // Initialize Stripe payment
    await initializeStripePayment();
});

function setupEventListeners() {
    // Mobile summary toggle
    const summaryToggle = document.getElementById('summary-toggle-btn');
    const summaryContent = document.getElementById('summary-content');
    const cartSummaryToggle = document.getElementById('cart-summary-toggle');
    
    // Both buttons toggle the summary
    summaryToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        summaryContent.style.display = isExpanded ? 'none' : 'block';
    });
    
    // Cart icon in header also toggles summary
    cartSummaryToggle.addEventListener('click', function() {
        const isExpanded = summaryToggle.getAttribute('aria-expanded') === 'true';
        summaryToggle.setAttribute('aria-expanded', !isExpanded);
        summaryContent.style.display = isExpanded ? 'none' : 'block';
    });
    
    // Discount code - Mobile
    document.getElementById('mobile-apply-btn').addEventListener('click', function() {
        applyDiscount('mobile');
    });
    
    document.getElementById('mobile-discount-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyDiscount('mobile');
        }
    });
    
    // Discount code - Desktop
    document.getElementById('desktop-apply-btn').addEventListener('click', function() {
        applyDiscount('desktop');
    });
    
    document.getElementById('desktop-discount-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyDiscount('desktop');
        }
    });
    
    // Form submission
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', handleSubmit);
}

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        window.location.href = '/pages/products.html';
        return;
    }
    
    // Populate mobile summary
    const mobileItems = document.getElementById('mobile-summary-items');
    mobileItems.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
    
    // Populate desktop summary
    const desktopItems = document.getElementById('desktop-summary-items');
    desktopItems.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
    
    // Calculate and display totals
    updateTotals();
}

function createCartItemHTML(item) {
    return `
        <div class="summary-item">
            <div class="item-image-wrapper">
                <img src="${item.image}" alt="${item.title}" class="item-image">
                <span class="item-quantity-badge">${item.quantity}</span>
            </div>
            <div class="item-details">
                <span class="item-name">${item.title}</span>
                <span class="item-price">€${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
        </div>
    `;
}

function updateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    let discountAmount = 0;
    
    if (appliedDiscount) {
        if (appliedDiscount.type === 'percentage') {
            discountAmount = subtotal * (appliedDiscount.value / 100);
        } else if (appliedDiscount.type === 'fixed') {
            discountAmount = appliedDiscount.value;
        }
    }
    
    const total = Math.max(0, subtotal - discountAmount);
    
    // Update mobile
    document.getElementById('mobile-subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('mobile-total').textContent = `€${total.toFixed(2)}`;
    document.getElementById('mobile-total-price').textContent = `€${total.toFixed(2)}`;
    
    // Update desktop
    document.getElementById('desktop-subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('desktop-total').textContent = `€${total.toFixed(2)}`;
}

function applyDiscount(source) {
    const input = document.getElementById(`${source}-discount-input`);
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        showMessage('Bitte geben Sie einen Rabattcode ein', true);
        return;
    }
    
    if (DISCOUNT_CODES[code]) {
        appliedDiscount = DISCOUNT_CODES[code];
        updateTotals();
        showMessage(`Rabattcode "${code}" angewendet!`, false);
        input.value = '';
    } else {
        showMessage('Ungültiger Rabattcode', true);
    }
}

async function initializeStripePayment() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        return;
    }
    
    try {
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
        
        const total = Math.max(0, subtotal - discountAmount);
        const amountInCents = Math.round(total * 100);
        
        // Create PaymentIntent
        const response = await fetch('/api/payment-intents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amountInCents,
                cartItems: cart,
                discountCode: appliedDiscount ? Object.keys(DISCOUNT_CODES).find(key => DISCOUNT_CODES[key] === appliedDiscount) : null,
                discountAmount: discountAmount
            })
        });
        
        const data = await response.json();
        clientSecret = data.clientSecret;
        
        // Initialize Stripe Elements with Shopify-like appearance
        const appearance = {
            theme: 'stripe',
            variables: {
                colorPrimary: '#5A3518',
                colorBackground: '#ffffff',
                colorText: '#202223',
                colorDanger: '#d72c0d',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
                fontSizeBase: '16px'
            },
            rules: {
                '.Input': {
                    border: '2px solid #d1d5db',
                    padding: '13px 16px',
                    fontSize: '16px'
                },
                '.Input:focus': {
                    border: '3px solid #202223',
                    boxShadow: 'none'
                },
                '.Label': {
                    fontSize: '12px',
                    color: '#6d7175',
                    marginBottom: '6px'
                }
            }
        };
        
        elements = stripe.elements({
            clientSecret,
            appearance
        });
        
        // Create Express Checkout Element (Apple Pay, Google Pay)
        console.log('🚀 Creating Express Checkout Element...');
        expressCheckoutElement = elements.create('expressCheckout', {
            buttonType: {
                applePay: 'buy',
                googlePay: 'buy'
            },
            buttonHeight: 48,
            layout: {
                maxColumns: 2,
                maxRows: 1
            }
        });
        
        expressCheckoutElement.mount('#express-checkout-element');
        console.log('✅ Express Checkout Element mounted');
        
        // Handle express checkout confirm
        expressCheckoutElement.on('confirm', async (event) => {
            const formData = new FormData(document.getElementById('checkout-form'));
            const customerData = Object.fromEntries(formData.entries());
            
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/pages/order-confirmation.html`,
                    receipt_email: customerData.email || event.billingDetails?.email
                },
                redirect: 'if_required'
            });
            
            if (error) {
                showMessage(error.message, true);
                event.complete('fail');
            } else {
                event.complete('success');
            }
        });
        
        // Create Payment Element  
        console.log('🚀 Creating Payment Element...');
        paymentElement = elements.create('payment', {
            layout: {
                type: 'accordion',
                defaultCollapsed: false,
                radios: true,
                spacedAccordionItems: false
            },
            wallets: {
                applePay: 'never',  // Already in express checkout
                googlePay: 'never'  // Already in express checkout
            }
        });
        
        const paymentContainer = document.getElementById('payment-element');
        if (!paymentContainer) {
            console.error('❌ Payment element container not found!');
            return;
        }
        
        paymentElement.mount('#payment-element');
        console.log('✅ Payment Element mounted to:', paymentContainer);
        
        // Track AddPaymentInfo when ready
        paymentElement.on('ready', function() {
            console.log('✅ Payment methods loaded and ready');
            const cartData = JSON.parse(localStorage.getItem('cart')) || [];
            if (window.metaPixel && typeof window.metaPixel.trackAddPaymentInfo === 'function') {
                window.metaPixel.trackAddPaymentInfo(cartData);
            }
        });
        
        // Log when express checkout is ready
        expressCheckoutElement.on('ready', function() {
            console.log('✅ Express checkout buttons loaded');
        });
        
    } catch (error) {
        console.error('Error initializing payment:', error);
        showMessage('Zahlung konnte nicht initialisiert werden. Bitte versuchen Sie es erneut.', true);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const submitButton = document.getElementById('submit-btn');
    submitButton.disabled = true;
    submitButton.textContent = 'Wird bearbeitet...';
    
    // Get form data
    const formData = new FormData(e.target);
    const customerData = Object.fromEntries(formData.entries());
    
    // Save customer data for confirmation page
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderNumber = 'DP' + Date.now().toString().slice(-6);
    
    localStorage.setItem('orderNumber', orderNumber);
    localStorage.setItem('customerData', JSON.stringify(customerData));
    
    try {
        // Confirm payment with Stripe
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/pages/order-confirmation.html`,
                receipt_email: customerData.email,
                shipping: {
                    name: `${customerData.firstName || ''} ${customerData.lastName}`.trim(),
                    address: {
                        line1: customerData.address,
                        line2: customerData.apartment || undefined,
                        city: customerData.city,
                        postal_code: customerData.postalCode,
                        country: customerData.country
                    }
                },
                payment_method_data: {
                    billing_details: {
                        name: `${customerData.firstName || ''} ${customerData.lastName}`.trim(),
                        email: customerData.email,
                        address: {
                            line1: customerData.address,
                            line2: customerData.apartment || undefined,
                            city: customerData.city,
                            postal_code: customerData.postalCode,
                            country: customerData.country
                        }
                    }
                }
            }
        });
        
        if (error) {
            console.error('Payment error:', error);
            showMessage(error.message, true);
            submitButton.disabled = false;
            submitButton.textContent = 'Bestellung überprüfen';
        }
        // If no error, Stripe redirects automatically
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', true);
        submitButton.disabled = false;
        submitButton.textContent = 'Bestellung überprüfen';
    }
}

function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('payment-message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.style.color = isError ? '#d72c0d' : '#5A3518';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// German error messages
function getGermanMessage(englishMessage) {
    const translations = {
        'Please enter a discount code': 'Bitte geben Sie einen Rabattcode ein',
        'Invalid discount code': 'Ungültiger Rabattcode',
        'Discount code': 'Rabattcode',
        'applied!': 'angewendet!',
        'Failed to initialize payment. Please try again.': 'Zahlung konnte nicht initialisiert werden. Bitte versuchen Sie es erneut.',
        'An error occurred. Please try again.': 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        'Processing...': 'Wird bearbeitet...',
        'Review order': 'Bestellung überprüfen'
    };
    return translations[englishMessage] || englishMessage;
}
