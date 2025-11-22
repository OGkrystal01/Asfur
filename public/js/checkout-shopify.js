// Shopify-style Checkout - Full Functionality
// Stripe Configuration - Use environment variable from server
// DO NOT hardcode keys here - they expire and change
let STRIPE_PUBLISHABLE_KEY = null;

// Fetch the publishable key from server
async function getStripePublishableKey() {
    try {
        const response = await fetch('/api/stripe-config');
        const data = await response.json();
        return data.publishableKey;
    } catch (error) {
        console.error('❌ Failed to fetch Stripe config:', error);
        // Fallback to hardcoded key (replace with your current valid key)
        return 'pk_live_51QP1AvP5oV0KyDJtaMLHSRTmLiIQN6VDM5Z3DFtKzgkXTlqZNP9O7OXAVHoRhRPSlxHc5bwMxAIMWdK8Xj4qcG6I00fHUyfcxE';
    }
}

let stripe, elements, paymentElement, expressCheckoutElement;
let clientSecret;

// Discount codes
const DISCOUNT_CODES = {
    'WELCOME10': { type: 'percentage', value: 10 },
    'SAVE20': { type: 'percentage', value: 20 },
    'FREESHIP': { type: 'fixed', value: 0 }
};

let appliedDiscount = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Checkout page loaded');
    
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('🛒 Cart items:', cart.length);
    
    if (cart.length === 0) {
        showMessage('Ihr Warenkorb ist leer', true);
        setTimeout(() => {
            window.location.href = '/pages/products.html';
        }, 2000);
        return;
    }
    
    // Get Stripe publishable key from server
    console.log('🔑 Fetching Stripe publishable key from server...');
    STRIPE_PUBLISHABLE_KEY = await getStripePublishableKey();
    
    if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.length < 20) {
        console.error('❌ Invalid Stripe publishable key received');
        showMessage('Fehler: Stripe-Konfiguration fehlt. Bitte Support kontaktieren.', true);
        return;
    }
    
    console.log('🔑 Using Stripe key:', STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...');
    
    // Initialize Stripe
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    console.log('✅ Stripe initialized');
    
    // Load cart and populate
    loadCartItems();
    
    // Setup event listeners
    setupEventListeners();
    
    // Track InitiateCheckout
    if (window.metaPixel && typeof window.metaPixel.trackInitiateCheckout === 'function') {
        window.metaPixel.trackInitiateCheckout(cart);
    }
    
    // Initialize Stripe payment
    console.log('💳 Starting Stripe payment initialization...');
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
    
    // Populate mini summary (above checkout button)
    const miniItems = document.getElementById('mini-summary-items');
    if (miniItems) {
        miniItems.innerHTML = cart.map(item => createMiniCartItemHTML(item)).join('');
    }
    
    // Calculate and display totals
    updateTotals();
}

function createMiniCartItemHTML(item) {
    return `
        <div class="mini-summary-item">
            <div style="position: relative;">
                <img src="${item.image}" alt="${item.title}" class="mini-item-image">
                <span class="mini-item-badge">${item.quantity}</span>
            </div>
            <div class="mini-item-details">
                <span class="mini-item-name">${item.title}</span>
                <span class="mini-item-price">€${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
        </div>
    `;
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
    
    // Update mini summary
    const miniSubtotal = document.getElementById('mini-subtotal');
    const miniTotal = document.getElementById('mini-total');
    if (miniSubtotal) miniSubtotal.textContent = `€${subtotal.toFixed(2)}`;
    if (miniTotal) miniTotal.textContent = `€${total.toFixed(2)}`;
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
    
    console.log('💳 initializeStripePayment called, cart length:', cart.length);
    
    if (cart.length === 0) {
        console.warn('⚠️ Cart is empty in initializeStripePayment');
        showMessage('Ihr Warenkorb ist leer', true);
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
        
        console.log('💰 Total amount:', total, 'EUR (', amountInCents, 'cents)');
        
        // Create PaymentIntent
        console.log('📡 Creating PaymentIntent...');
        console.log('📦 Request data:', {
            finalTotal: total,
            cartItems: cart,
            discountCode: appliedDiscount ? Object.keys(DISCOUNT_CODES).find(key => DISCOUNT_CODES[key] === appliedDiscount) : null,
            discountAmount: discountAmount
        });
        
        const response = await fetch('/api/payment-intents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cartItems: cart,
                customerName: '',
                customerEmail: '',
                discountCode: appliedDiscount ? Object.keys(DISCOUNT_CODES).find(key => DISCOUNT_CODES[key] === appliedDiscount) : null,
                discountAmount: discountAmount,
                finalTotal: total
            })
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', errorText);
            throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📦 PaymentIntent data received:', data);
        console.log('📦 Full response:', JSON.stringify(data, null, 2));
        
        clientSecret = data.clientSecret;
        
        if (!clientSecret) {
            console.error('❌ No clientSecret in response');
            console.error('❌ Response data:', data);
            const errorContainer = document.getElementById('payment-element');
            if (errorContainer) {
                errorContainer.innerHTML = `
                    <div style="padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; color: #856404;">
                        <p style="margin: 0; font-weight: 600;">⚠️ Server-Fehler</p>
                        <p style="margin: 8px 0 0 0; font-size: 13px;">Kein clientSecret vom Server erhalten.</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px;">Bitte Support kontaktieren.</p>
                    </div>
                `;
            }
            throw new Error('No clientSecret received from server');
        }
        
        console.log('🔑 ClientSecret received:', clientSecret.substring(0, 20) + '...');
        console.log('🔑 ClientSecret length:', clientSecret.length);
        
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
        
        console.log('🎨 Creating Stripe Elements with appearance...');
        console.log('🔑 ClientSecret value:', clientSecret);
        console.log('🔑 ClientSecret type:', typeof clientSecret);
        
        if (!clientSecret || clientSecret === 'undefined' || clientSecret === 'null') {
            console.error('❌ Invalid clientSecret:', clientSecret);
            showMessage('Fehler: Ungültiger clientSecret vom Server erhalten', true);
            throw new Error('Invalid clientSecret received from API');
        }
        
        try {
            elements = stripe.elements({
                clientSecret,
                appearance,
                loader: 'always'
            });
            console.log('✅ Elements instance created:', elements);
            
            // Verify elements object
            if (!elements || typeof elements.create !== 'function') {
                console.error('❌ Elements object is invalid!', elements);
                throw new Error('Stripe Elements failed to initialize');
            }
        } catch (elementsError) {
            console.error('❌ Error creating Stripe Elements:', elementsError);
            showMessage('Fehler beim Erstellen der Stripe Elements: ' + elementsError.message, true);
            throw elementsError;
        }
        
        // Setup custom express buttons
        setupCustomExpressButtons();
        
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
                applePay: 'auto',
                googlePay: 'auto'
            },
            paymentMethodOrder: ['card', 'klarna', 'paypal', 'sepa_debit'],
            fields: {
                billingDetails: {
                    email: 'never'
                }
            },
            terms: {
                card: 'never'
            }
        });
        
        const paymentContainer = document.getElementById('payment-element');
        if (!paymentContainer) {
            console.error('❌ Payment element container nicht gefunden!');
            showMessage('Fehler: Zahlungscontainer nicht gefunden', true);
            return;
        }
        
        console.log('🔧 Mounting payment element...');
        try {
            await paymentElement.mount('#payment-element');
            console.log('✅ Payment Element mounted to:', paymentContainer);
        } catch (mountError) {
            console.error('❌ MOUNT ERROR:', mountError);
            console.error('❌ Mount error message:', mountError.message);
            console.error('❌ Mount error type:', mountError.type);
            throw mountError;
        }
        
        // Track when payment element is ready
        paymentElement.on('ready', function() {
            console.log('✅ Payment Element ready - payment methods loaded');
            console.log('💳 User can now select payment method');
            
            // Check if iframe loaded
            setTimeout(() => {
                const paymentIframe = paymentContainer.querySelector('iframe');
                if (paymentIframe) {
                    console.log('✅ Payment iframe found');
                    console.log('   Height:', paymentIframe.offsetHeight);
                } else {
                    console.error('❌ Payment iframe NOT found!');
                }
            }, 1000);
        });
        
        paymentElement.on('loaderror', function(event) {
            console.error('❌ Payment Element load error:', event);
            console.error('❌ Error type:', event.error?.type);
            console.error('❌ Error code:', event.error?.code);
            console.error('❌ Error message:', event.error?.message);
            console.error('❌ Full event:', JSON.stringify(event, null, 2));
            
            const errorMsg = event.error?.message || 'Unbekannter Fehler';
            const errorType = event.error?.type || 'unknown';
            
            const errorContainer = document.getElementById('payment-element');
            if (errorContainer) {
                errorContainer.innerHTML = `
                    <div style="padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; color: #856404;">
                        <p style="margin: 0; font-weight: 600;">⚠️ Fehler beim Laden der Zahlungsmethoden</p>
                        <p style="margin: 8px 0 0 0; font-size: 13px;"><strong>Fehlertyp:</strong> ${errorType}</p>
                        <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Details:</strong> ${errorMsg}</p>
                        <p style="margin: 8px 0 0 0; font-size: 12px;">Bitte Screenshot an Support senden.</p>
                    </div>
                `;
            }
        });
        
        // Monitor payment method selection
        paymentElement.on('change', function(event) {
            handlePaymentMethodChange(event);
        });
        
    } catch (error) {
        console.error('❌ Error initializing payment:', error);
        console.error('❌ Error stack:', error.stack);
        showMessage('Zahlung konnte nicht initialisiert werden. Bitte versuchen Sie es erneut. Fehler: ' + error.message, true);
        
        // Show error in payment element area
        const paymentContainer = document.getElementById('payment-element');
        if (paymentContainer) {
            paymentContainer.innerHTML = `
                <div style="padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; color: #856404;">
                    <p style="margin: 0; font-weight: 600;">⚠️ Fehler beim Laden der Zahlungsmethoden</p>
                    <p style="margin: 8px 0 0 0; font-size: 14px;">${error.message}</p>
                    <p style="margin: 8px 0 0 0; font-size: 12px;">Bitte aktualisieren Sie die Seite oder kontaktieren Sie den Support.</p>
                </div>
            `;
        }
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    
    // Collect form data
    const customerData = {
        email: document.getElementById('email').value,
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        address: document.getElementById('address').value,
        apartment: document.getElementById('apartment')?.value || '',
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postal-code').value,
        country: document.getElementById('country').value
    };
    
    // Generate order number
    const orderNumber = 'ORD-' + Date.now();
    
    // Disable submit button
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.innerHTML || submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verarbeitung...';
    
    // Save to localStorage
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
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            showMessage(error.message, true);
        }
        // If no error, Stripe redirects automatically
        
    } catch (error) {
        console.error('Submit error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.", true);
    }
}

function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('payment-message');
    if (!messageDiv) {
        console.error('❌ payment-message element not found');
        return;
    }
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.style.color = isError ? '#d72c0d' : '#5A3518';
    messageDiv.style.padding = '16px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.background = isError ? '#fff3cd' : '#d4edda';
    messageDiv.style.border = isError ? '2px solid #ffc107' : '2px solid #28a745';
    
    // Don't auto-hide errors
    if (!isError) {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
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
